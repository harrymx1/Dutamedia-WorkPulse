import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  CanonicalRole,
  NotificationChannel,
  PolicyCategory,
  UserStatus,
} from '@prisma/client';
import { CreatePolicyVersionDto } from '../dto/create-policy-version.dto';
import { AssignPolicyOwnerDto } from '../dto/assign-policy-owner.dto';
import { UpdatePolicyOwnerDto } from '../dto/update-policy-owner.dto';
import { CANONICAL_POLICY_FALLBACKS } from '../policy.constants';
import { ensurePolicyOwnersBaselineSynced } from '../policy-owner-sync.util';

@Injectable()
export class PolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Mengambil satu kebijakan aktif untuk kategori dan tanggal tertentu (default: hari ini).
   * Bila belum ada kebijakan di DB, mengembalikan nilai fallback kanonikal (DEC-011).
   */
  async getActivePolicy(category: PolicyCategory, targetDate?: Date) {
    const evalDate = targetDate || this.clockService.now();
    // Format YYYY-MM-DD
    const dateStr = evalDate.toISOString().split('T')[0];

    const policy = await this.prisma.policy.findFirst({
      where: {
        category,
        effectiveDate: { lte: new Date(dateStr) },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date(dateStr) } },
        ],
      },
      orderBy: [
        { effectiveDate: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (policy) {
      return {
        id: policy.id,
        category: policy.category,
        configurationValues: policy.configurationValues as Record<string, any>,
        isIllustrative: policy.isIllustrative,
        isFallback: false,
        effectiveDate: policy.effectiveDate,
        endDate: policy.endDate,
        createdBy: policy.createdBy,
        createdAt: policy.createdAt,
      };
    }

    // Fallback kanonikal bertanda ilustratif (DEC-011)
    return {
      id: `fallback-${category.toLowerCase()}`,
      category,
      configurationValues: CANONICAL_POLICY_FALLBACKS[category],
      isIllustrative: true,
      isFallback: true,
      effectiveDate: new Date('2026-01-01'),
      endDate: null,
      createdBy: {
        id: 'system',
        fullName: 'System Default (Kanonikal)',
        email: 'system@dutamedia.test',
      },
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
  }

  /**
   * Mengambil seluruh kebijakan aktif untuk ke-5 kategori kanonikal,
   * daftar penugasan pemilik kebijakan (Policy Owners), dan daftar pengguna aktif.
   */
  async getAllActivePolicies(targetDate?: Date) {
    const categories = Object.values(PolicyCategory);
    const results = await Promise.all(
      categories.map((cat) => this.getActivePolicy(cat, targetDate)),
    );

    // Ambil penugasan pemilik kebijakan aktif saat ini
    const owners = await this.getPolicyOwners();

    // Sertakan daftar pengguna aktif beserta jabatan/peran untuk dropdown CRUD Policy Owners
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const today = new Date(todayStr);
    let availableUsers: Array<{
      id: string;
      fullName: string;
      email: string;
      role: string | null;
      jobTitle: string | null;
      function: string | null;
    }> = [];

    if (this.prisma.user?.findMany) {
      try {
        const rawUsers = await this.prisma.user.findMany({
          where: { status: UserStatus.ACTIVE },
          select: {
            id: true,
            fullName: true,
            email: true,
            orgAssignments: {
              where: {
                OR: [{ endDate: null }, { endDate: { gte: today } }],
              },
              orderBy: { effectiveDate: 'desc' },
              select: {
                role: true,
                jobTitle: true,
                function: true,
              },
            },
          },
          orderBy: { fullName: 'asc' },
        });
        if (Array.isArray(rawUsers)) {
          availableUsers = rawUsers
            .filter((u: any) => u && u.email && u.fullName)
            .map((u: any) => {
              const activeOrg = u.orgAssignments?.[0];
              return {
                id: u.id,
                fullName: u.fullName,
                email: u.email,
                role: activeOrg?.role || null,
                jobTitle: activeOrg?.jobTitle || null,
                function: activeOrg?.function || null,
              };
            });
        }
      } catch {
        // Abaikan bila mock pada unit test tidak menyertakan relasi orgAssignments
      }
    }

    return {
      evaluatedAt: (targetDate || this.clockService.now()).toISOString(),
      policies: results,
      owners,
      availableUsers,
    };
  }

  /**
   * Membuat versi kebijakan baru dengan penegakan DEC-008 (Anti-Backdating).
   */
  async createPolicyVersion(
    actorUserId: string,
    dto: CreatePolicyVersionDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const inputEffectiveStr = dto.effectiveDate.split('T')[0];

    // Penegakan DEC-008: Dilarang backdating
    if (inputEffectiveStr < todayStr) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_BACKDATING_FORBIDDEN,
        message: `Tanggal mulai berlaku kebijakan tidak boleh di masa lampau (${inputEffectiveStr} < ${todayStr}) sesuai DEC-008.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const effectiveDate = new Date(inputEffectiveStr);
    const endDate = dto.endDate ? new Date(dto.endDate.split('T')[0]) : null;

    if (endDate && endDate < effectiveDate) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tanggal berakhir kebijakan tidak boleh mendahului tanggal mulai berlaku.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Penegakan BR-15 & FR-34: Sinkronisasi Wewenang Pemilik Kebijakan (Authorized Policy Owner)
    // Hanya pengguna yang terdaftar aktif pada tabel Penugasan Pemilik Kebijakan untuk kategori ini yang berwenang menerbitkan versi baru.
    const isAuthorized = await this.isUserAuthorizedPolicyOwner(actorUserId, dto.category, effectiveDate);
    if (!isAuthorized) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_ROLE,
        message: `Akses ditolak: Anda tidak terdaftar sebagai Pemilik Kebijakan aktif untuk kategori ${dto.category}. Wewenang penerbitan versi kebijakan hanya dimiliki oleh personil yang tercatat pada tabel Penugasan Pemilik Kebijakan.`,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const { created, previousValues } = await this.prisma.$transaction(async (tx) => {
      // 1. Cari kebijakan aktif sebelumnya untuk menutup masa berlakunya
      const currentActive = await tx.policy.findFirst({
        where: {
          category: dto.category,
          effectiveDate: { lte: effectiveDate },
          OR: [
            { endDate: null },
            { endDate: { gte: effectiveDate } },
          ],
        },
        orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
      });

      if (currentActive && !currentActive.isIllustrative) {
        const prevCfg = (currentActive.configurationValues as Record<string, any>) || {};
        const nextCfg = (dto.configurationValues as Record<string, any>) || {};
        const nextKeys = Object.keys(nextCfg);
        const isIdentical =
          nextKeys.length > 0 &&
          nextKeys.every((k) => String(prevCfg[k]) === String(nextCfg[k]));

        if (isIdentical) {
          throw new AppException({
            code: ErrorCode.VALIDATION_FAILED,
            message:
              'Tidak ada perubahan nilai parameter dibandingkan kebijakan yang sedang berlaku saat ini.',
            statusCode: HttpStatus.BAD_REQUEST,
          });
        }
      }

      if (currentActive && currentActive.effectiveDate < effectiveDate) {
        // Tutup kebijakan sebelumnya pada hari sebelum tanggal efektif baru
        const previousEndDate = new Date(effectiveDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);

        await tx.policy.update({
          where: { id: currentActive.id },
          data: { endDate: previousEndDate },
        });
      }

      // 2. Buat versi kebijakan baru
      const createdPolicy = await tx.policy.create({
        data: {
          category: dto.category,
          configurationValues: dto.configurationValues,
          isIllustrative: dto.isIllustrative ?? false,
          effectiveDate,
          endDate,
          createdByUserId: actorUserId,
        },
        include: {
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      const prevVals = currentActive
        ? (currentActive.configurationValues as Record<string, any>)
        : undefined;

      // 3. Catat di AuditLog
      await tx.auditLog.create({
        data: {
          actorUserId,
          actionCode: 'POLICY_VERSION_CREATED',
          relatedEntityType: 'policies',
          relatedEntityId: createdPolicy.id,
          valueBefore: prevVals as any,
          valueAfter: {
            category: createdPolicy.category,
            configurationValues: createdPolicy.configurationValues,
            isIllustrative: createdPolicy.isIllustrative,
            effectiveDate: createdPolicy.effectiveDate,
            changeJustification: dto.changeJustification,
          },
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        },
      });

      return { created: createdPolicy, previousValues: prevVals };
    });

    // 4. Kirim notifikasi siaran ke seluruh pengguna aktif (IMP-063)
    await this.broadcastPolicyChangeNotification({
      created,
      previousValues: previousValues || CANONICAL_POLICY_FALLBACKS[dto.category],
      changeJustification: dto.changeJustification,
      actorUserId,
      todayStr,
      inputEffectiveStr,
    });

    return created;
  }

  /**
   * Menyusun dan mengirimkan notifikasi perubahan kebijakan ke seluruh pengguna aktif
   * kecuali pembuat kebijakan dan akun System Administrator (IMP-063).
   */
  private async broadcastPolicyChangeNotification(params: {
    created: {
      id: string;
      category: PolicyCategory;
      configurationValues: any;
      effectiveDate: Date;
      createdBy?: { id: string; fullName: string; email: string } | null;
    };
    previousValues?: Record<string, any>;
    changeJustification: string;
    actorUserId: string;
    todayStr: string;
    inputEffectiveStr: string;
  }): Promise<void> {
    try {
      if (!this.prisma.user?.findMany || !this.prisma.notification?.createMany) {
        return;
      }

      const { created, previousValues, changeJustification, actorUserId, todayStr, inputEffectiveStr } = params;
      const effectiveDate = created.effectiveDate;

      const recipients = await this.prisma.user.findMany({
        where: {
          status: UserStatus.ACTIVE,
          id: { not: actorUserId },
          email: { not: 'admin@dutamedia.com' },
          NOT: {
            orgAssignments: {
              some: {
                role: CanonicalRole.SYSTEM_ADMIN,
                OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
              },
            },
          },
        },
        select: { id: true },
      });

      // Sertakan juga pemilik kebijakan aktif yang bukan pelaku perubahan
      let ownerRecipients: Array<{ userId: string }> = [];
      if (this.prisma.policyOwnerAssignment?.findMany) {
        ownerRecipients = await this.prisma.policyOwnerAssignment.findMany({
          where: {
            policyCategory: created.category,
            effectiveDate: { lte: effectiveDate },
            OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
            userId: { not: actorUserId },
          },
          select: { userId: true },
        });
      }

      const allRecipientIds = Array.from(
        new Set([
          ...recipients.map((r: { id: string }) => r.id),
          ...ownerRecipients.map((o) => o.userId),
        ]),
      );

      if (allRecipientIds.length === 0) return;

      const issuerName = created.createdBy?.fullName || 'Sistem Administrator';
      const payload = this.buildPolicyNotificationPayload({
        category: created.category,
        before: previousValues || {},
        after: (created.configurationValues as Record<string, any>) || {},
        effectiveDate,
        isEffectiveToday: inputEffectiveStr <= todayStr,
        changeJustification: changeJustification.trim(),
        issuerName,
      });

      await this.prisma.notification.createMany({
        data: allRecipientIds.map((userId: string) => ({
          recipientUserId: userId,
          triggerType: 'POLICY_UPDATED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: payload.title,
          message: payload.message,
          actionUrl: payload.actionUrl,
          relatedEntityType: 'policies',
          relatedEntityId: created.id,
        })),
      });
    } catch (err) {
      console.error('Gagal mengirim notifikasi perubahan kebijakan:', err);
    }
  }

  private buildPolicyNotificationPayload(params: {
    category: PolicyCategory;
    before: Record<string, any>;
    after: Record<string, any>;
    effectiveDate: Date;
    isEffectiveToday: boolean;
    changeJustification: string;
    issuerName: string;
  }): { title: string; message: string; actionUrl: string | null } {
    const { category, before, after, effectiveDate, isEffectiveToday, changeJustification, issuerName } = params;

    const effDateLabel = effectiveDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const effectiveDisplay = isEffectiveToday
      ? `${effDateLabel} (Berlaku Mulai Sekarang)`
      : `Mulai ${effDateLabel}`;

    const buildChangedLines = (
      fields: Array<{ label: string; oldVal: any; newVal: any; unit?: string }>,
    ): string[] => {
      const changed = fields
        .filter((f) => f.oldVal !== undefined && f.oldVal !== null && String(f.oldVal) !== String(f.newVal))
        .map((f) => {
          const sfx = f.unit ? ` ${f.unit}` : '';
          return `${f.label}: ${f.oldVal} → ${f.newVal}${sfx}`;
        });

      if (changed.length > 0) {
        return changed;
      }

      // Fallback bila konfirmasi perdana dari nilai awal: tampilkan nilai aktif tanpa kata "Tetap"
      return fields.map((f) => {
        const sfx = f.unit ? ` ${f.unit}` : '';
        return `${f.label}: ${f.newVal}${sfx}`;
      });
    };

    if (category === PolicyCategory.CHECKIN_TIMING) {
      const mOnTime = after.morningOnTimeCutoff || '09:00';
      const mCutoff = after.morningLockCutoff || '09:30';
      const eOnTime = after.eodOnTimeCutoff || '17:00';
      const eCutoff = after.eodLockCutoff || '21:00';

      const intro = isEffectiveToday
        ? `Mulai hari ini (${effDateLabel}, berlaku mulai sekarang), jam batas pengisian komitmen pagi dan evaluasi sore telah diperbarui.`
        : `Mulai ${effDateLabel}, jam batas pengisian komitmen pagi dan evaluasi sore akan disesuaikan dengan jadwal baru.`;

      const paramLines = buildChangedLines([
        { label: 'Batas Tepat Waktu Pagi', oldVal: before.morningOnTimeCutoff, newVal: mOnTime, unit: 'WIB' },
        { label: 'Batas Kunci Formulir Pagi (Cut-Off)', oldVal: before.morningLockCutoff, newVal: mCutoff, unit: 'WIB' },
        { label: 'Batas Tepat Waktu Sore (EOD)', oldVal: before.eodOnTimeCutoff, newVal: eOnTime, unit: 'WIB' },
        { label: 'Batas Kunci Formulir Sore (EOD Cut-Off)', oldVal: before.eodLockCutoff, newVal: eCutoff, unit: 'WIB' },
      ]);

      const message = [
        intro,
        'Kategori Kebijakan: Jam Kerja & Batas Pengiriman (Cut-Off)',
        `Mulai Berlaku: ${effectiveDisplay}`,
        ...paramLines,
        `Artinya bagi Anda: Isi Morning Commitment sebelum pukul ${mOnTime} WIB agar tercatat tepat waktu (formulir terkunci pukul ${mCutoff} WIB), serta EOD Outcome sebelum pukul ${eOnTime} WIB.`,
        `Alasan Perubahan: "${changeJustification}"`,
        `Diubah Oleh: ${issuerName}`,
      ].join('\n');

      return {
        title: 'Perubahan Kebijakan Jam Batas Pengisian (Cut-Off)',
        message,
        actionUrl: '/daily/morning',
      };
    }

    if (category === PolicyCategory.BLOCKER_SLA) {
      const l1 = after.level1Hours ?? 4;
      const l2 = after.level2Hours ?? 8;
      const esc = after.autoEscalateAfterHours ?? 4;

      const intro = isEffectiveToday
        ? `Mulai hari ini (${effDateLabel}, berlaku mulai sekarang), aturan Target Waktu Respon & Eskalasi Berjenjang Kendala (Blocker) telah diperbarui.`
        : `Mulai ${effDateLabel}, aturan Target Waktu Respon & Eskalasi Berjenjang Kendala (Blocker) akan disesuaikan.`;

      const paramLines = buildChangedLines([
        { label: 'Batas Respon Jenjang Pertama', oldVal: before.level1Hours, newVal: l1, unit: 'Jam Kerja' },
        { label: 'Batas Penanganan Jenjang Lanjutan', oldVal: before.level2Hours, newVal: l2, unit: 'Jam Kerja' },
        { label: 'Batas Waktu Naik ke Atasan Berikutnya', oldVal: before.autoEscalateAfterHours, newVal: esc, unit: 'Jam Kerja tanpa ditanggapi' },
      ]);

      const message = [
        intro,
        'Kategori Kebijakan: Target Waktu Penanganan Kendala',
        `Mulai Berlaku: ${effectiveDisplay}`,
        ...paramLines,
        `Artinya bagi Anda: Kendala yang dilaporkan wajib mulai ditanggapi penanggung jawab pertama dalam ${l1} jam kerja (jika tidak ditanggapi dalam ${esc} jam kerja otomatis naik ke atasan di atasnya), dengan batas penanganan jenjang lanjutan ${l2} jam kerja (dihitung Senin–Jumat pukul 09:00–17:00 WIB).`,
        `Alasan Perubahan: "${changeJustification}"`,
        `Diubah Oleh: ${issuerName}`,
      ].join('\n');

      return {
        title: 'Perubahan Kebijakan Target Waktu Penanganan Kendala',
        message,
        actionUrl: null,
      };
    }

    if (category === PolicyCategory.COMPLIANCE_THRESHOLD) {
      const days = after.carryOverAmberDays ?? 3;
      const intro = isEffectiveToday
        ? `Mulai hari ini (${effDateLabel}, berlaku mulai sekarang), aturan Ambang Batas Tugas Berlanjut (Carry-Over) telah diperbarui.`
        : `Mulai ${effDateLabel}, aturan Ambang Batas Tugas Berlanjut (Carry-Over) akan disesuaikan.`;

      const paramLines = buildChangedLines([
        { label: 'Ambang Peringatan Saran AMBER', oldVal: before.carryOverAmberDays, newVal: days, unit: 'Hari Berturut-turut' },
      ]);

      const message = [
        intro,
        'Kategori Kebijakan: Ambang Batas Carry-Over Berulang',
        `Mulai Berlaku: ${effectiveDisplay}`,
        ...paramLines,
        'Proteksi Hak Opsi GREEN: Bebas Dipilih (Tidak Terkunci)',
        `Artinya bagi Anda: Tugas yang berlanjut (Continue) selama ${days} hari berturut-turut akan memunculkan saran status AMBER sebagai bahan refleksi mandiri.`,
        `Alasan Perubahan: "${changeJustification}"`,
        `Diubah Oleh: ${issuerName}`,
      ].join('\n');

      return {
        title: 'Perubahan Kebijakan Ambang Batas Tugas Berlanjut',
        message,
        actionUrl: null,
      };
    }

    if (category === PolicyCategory.CORRECTION_WINDOW) {
      const maxDays = after.maxCorrectionDays ?? 7;
      const intro = isEffectiveToday
        ? `Mulai hari ini (${effDateLabel}, berlaku mulai sekarang), batas waktu pengajuan koreksi komitmen dan evaluasi telah diperbarui.`
        : `Mulai ${effDateLabel}, batas waktu pengajuan koreksi komitmen dan evaluasi akan disesuaikan.`;

      const paramLines = buildChangedLines([
        { label: 'Batas Maksimal Pengajuan Koreksi', oldVal: before.maxCorrectionDays, newVal: maxDays, unit: 'Hari Kerja' },
      ]);

      const message = [
        intro,
        'Kategori Kebijakan: Jendela Pengajuan Koreksi',
        `Mulai Berlaku: ${effectiveDisplay}`,
        ...paramLines,
        `Artinya bagi Anda: Permohonan koreksi komitmen pagi atau evaluasi sore dapat diajukan maksimal ${maxDays} hari sejak tanggal kerja terkait.`,
        `Alasan Perubahan: "${changeJustification}"`,
        `Diubah Oleh: ${issuerName}`,
      ].join('\n');

      return {
        title: 'Perubahan Kebijakan Jendela Pengajuan Koreksi',
        message,
        actionUrl: null,
      };
    }

    const intro = isEffectiveToday
      ? `Mulai hari ini (${effDateLabel}, berlaku mulai sekarang), pengaturan pengingat otomatis sistem telah diperbarui.`
      : `Mulai ${effDateLabel}, pengaturan pengingat otomatis sistem akan disesuaikan.`;

    return {
      title: 'Perubahan Kebijakan Pengingat Otomatis',
      message: [
        intro,
        'Kategori Kebijakan: Ambang Notifikasi & Pengingat',
        `Mulai Berlaku: ${effectiveDisplay}`,
        `Waktu Pengingat: ${after.morningReminderMinutesBefore ?? 60} menit sebelum batas waktu`,
        `Artinya bagi Anda: Sistem akan mengirimkan pengingat sebelum batas waktu pengisian komitmen harian berakhir.`,
        `Alasan Perubahan: "${changeJustification}"`,
        `Diubah Oleh: ${issuerName}`,
      ].join('\n'),
      actionUrl: null,
    };
  }

  /**
   * Mengambil seluruh penugasan pemilik kebijakan aktif (Policy Owners).
   * Mendukung multiple owners per kategori (Multi-PIC) sesuai tata kelola operasional perusahaan.
   */
  async getPolicyOwners() {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const today = new Date(todayStr);

    // Pastikan sinkronisasi satu kali (one-time baseline sync) untuk Direktur, Admin, dan HRGA telah dijalankan
    await ensurePolicyOwnersBaselineSynced(this.prisma, today);

    const assignments = await this.prisma.policyOwnerAssignment.findMany({
      where: {
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            orgAssignments: {
              where: {
                OR: [{ endDate: null }, { endDate: { gte: today } }],
              },
              select: {
                role: true,
                jobTitle: true,
                function: true,
              },
            },
          },
        },
      },
      orderBy: [{ policyCategory: 'asc' }, { effectiveDate: 'asc' }],
    });

    return assignments;
  }

  /**
   * Memperbarui penugasan pemilik kebijakan yang sudah ada (Update dalam CRUD Policy Owners).
   */
  async updatePolicyOwner(
    actorUserId: string,
    assignmentId: string,
    dto: UpdatePolicyOwnerDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');

    const txResult = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.policyOwnerAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      });

      if (!existing) {
        throw new AppException({
          code: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'Penugasan pemilik kebijakan tidak ditemukan.',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      const existingEffectiveStr = existing.effectiveDate
        .toISOString()
        .split('T')[0];
      const nextEffectiveStr = dto.effectiveDate
        ? dto.effectiveDate.split('T')[0]
        : existingEffectiveStr;

      if (
        dto.effectiveDate &&
        nextEffectiveStr < todayStr &&
        nextEffectiveStr !== existingEffectiveStr
      ) {
        throw new AppException({
          code: ErrorCode.BUSINESS_RULE_BACKDATING_FORBIDDEN,
          message: `Tanggal penugasan pemilik kebijakan tidak boleh diubah surut ke masa lampau (${nextEffectiveStr} < ${todayStr}) sesuai DEC-008.`,
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }

      const nextEffectiveDate = new Date(nextEffectiveStr);
      const nextEndDate =
        dto.endDate === undefined
          ? existing.endDate
          : dto.endDate === null || dto.endDate === ''
            ? null
            : new Date(dto.endDate.split('T')[0]);

      if (nextEndDate && nextEndDate < nextEffectiveDate) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message:
            'Tanggal berakhir penugasan tidak boleh mendahului tanggal mulai berlaku.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      const nextUserId = dto.userId || existing.userId;
      const nextCategory = dto.policyCategory || existing.policyCategory;

      if (nextCategory !== existing.policyCategory) {
        const today = new Date(todayStr);
        const remainingInOriginCategory = await tx.policyOwnerAssignment.count({
          where: {
            id: { not: assignmentId },
            policyCategory: existing.policyCategory,
            effectiveDate: { lte: today },
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
        });

        if (remainingInOriginCategory < 1) {
          throw new AppException({
            code: ErrorCode.VALIDATION_FAILED,
            message:
              'Kategori kebijakan asal tidak boleh kosong tanpa penanggung jawab. Tetapkan pemilik kebijakan pengganti terlebih dahulu sebelum memindahkan pemilik terakhir ke kategori lain.',
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          });
        }
      }

      // Periksa konflik duplikasi pemilik aktif pada kategori yang sama
      const duplicate = await tx.policyOwnerAssignment.findFirst({
        where: {
          id: { not: assignmentId },
          userId: nextUserId,
          policyCategory: nextCategory,
          effectiveDate: { lte: nextEffectiveDate },
          OR: [{ endDate: null }, { endDate: { gte: nextEffectiveDate } }],
        },
      });

      if (duplicate) {
        throw new AppException({
          code: ErrorCode.RESOURCE_CONFLICT,
          message:
            'Pengguna ini sudah terdaftar sebagai Pemilik Kebijakan aktif untuk kategori yang dipilih.',
          statusCode: HttpStatus.CONFLICT,
        });
      }

      const updated = await tx.policyOwnerAssignment.update({
        where: { id: assignmentId },
        data: {
          userId: nextUserId,
          policyCategory: nextCategory,
          effectiveDate: nextEffectiveDate,
          endDate: nextEndDate,
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          actionCode: 'POLICY_OWNER_UPDATED',
          relatedEntityType: 'policy_owner_assignments',
          relatedEntityId: updated.id,
          valueBefore: {
            userId: existing.userId,
            userName: existing.user?.fullName,
            category: existing.policyCategory,
            effectiveDate: existingEffectiveStr,
          },
          valueAfter: {
            userId: updated.userId,
            userName: updated.user?.fullName,
            category: updated.policyCategory,
            effectiveDate: nextEffectiveStr,
          },
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        },
      });

      return { updated, previous: existing, effectiveDate: nextEffectiveDate };
    });

    await this.notifyPolicyOwnerMutation({
      action: 'UPDATED',
      actorUserId,
      assignmentId: txResult.updated.id,
      category: txResult.updated.policyCategory,
      previousCategory: txResult.previous.policyCategory,
      targetUserId: txResult.updated.userId,
      targetUserName: txResult.updated.user?.fullName,
      previousUserId: txResult.previous.userId,
      previousUserName: txResult.previous.user?.fullName,
      effectiveDate: txResult.effectiveDate,
    });

    return txResult.updated;
  }

  /**
   * Menugaskan pemilik kebijakan untuk suatu kategori (misal: Direktur/Head/HRGA).
   * Mendukung Multi-Owner (banyak penanggung jawab per kategori tanpa saling menimpa).
   */
  async assignPolicyOwner(
    actorUserId: string,
    dto: AssignPolicyOwnerDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const inputEffectiveStr = dto.effectiveDate.split('T')[0];

    if (inputEffectiveStr < todayStr) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_BACKDATING_FORBIDDEN,
        message: `Tanggal penugasan pemilik kebijakan tidak boleh di masa lampau (${inputEffectiveStr} < ${todayStr}) sesuai DEC-008.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const effectiveDate = new Date(inputEffectiveStr);
    const endDate = dto.endDate ? new Date(dto.endDate.split('T')[0]) : null;

    if (endDate && endDate < effectiveDate) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tanggal berakhir penugasan tidak boleh mendahului tanggal mulai berlaku.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const created = await this.prisma.$transaction(async (tx) => {
      // Periksa apakah personil ini sudah aktif ditugaskan pada kategori yang sama
      const existingSameUser = await tx.policyOwnerAssignment.findFirst({
        where: {
          userId: dto.userId,
          policyCategory: dto.policyCategory,
          effectiveDate: { lte: effectiveDate },
          OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
        },
      });

      if (existingSameUser) {
        throw new AppException({
          code: ErrorCode.RESOURCE_CONFLICT,
          message: 'Pengguna ini sudah terdaftar sebagai Pemilik Kebijakan aktif untuk kategori yang dipilih.',
          statusCode: HttpStatus.CONFLICT,
        });
      }

      const createdRecord = await tx.policyOwnerAssignment.create({
        data: {
          userId: dto.userId,
          policyCategory: dto.policyCategory,
          effectiveDate,
          endDate,
          createdByUserId: actorUserId,
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          actionCode: 'POLICY_OWNER_ASSIGNED',
          relatedEntityType: 'policy_owner_assignments',
          relatedEntityId: createdRecord.id,
          valueAfter: {
            userId: createdRecord.userId,
            userName: createdRecord.user.fullName,
            category: createdRecord.policyCategory,
            effectiveDate: inputEffectiveStr,
          },
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        },
      });

      return createdRecord;
    });

    await this.notifyPolicyOwnerMutation({
      action: 'ASSIGNED',
      actorUserId,
      assignmentId: created.id,
      category: created.policyCategory,
      targetUserId: created.userId,
      targetUserName: created.user?.fullName,
      effectiveDate,
    });

    return created;
  }

  /**
   * Mencabut penugasan pemilik kebijakan (Policy Owner).
   */
  async revokePolicyOwner(
    actorUserId: string,
    assignmentId: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const today = new Date(todayStr);

    const txResult = await this.prisma.$transaction(async (tx) => {
      const assignment = await tx.policyOwnerAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      });

      if (!assignment) {
        throw new AppException({
          code: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'Penugasan pemilik kebijakan tidak ditemukan.',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      const remainingActiveOwners = await tx.policyOwnerAssignment.count({
        where: {
          id: { not: assignmentId },
          policyCategory: assignment.policyCategory,
          effectiveDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }],
        },
      });

      if (remainingActiveOwners < 1) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message:
            'Kategori kebijakan tidak boleh kosong tanpa penanggung jawab. Tetapkan pemilik kebijakan pengganti terlebih dahulu sebelum mencabut pemilik terakhir pada kategori ini.',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }

      // Jika assignment dimulai hari ini atau masa depan, hapus record langsung.
      // Jika sudah berlaku sebelumnya, tutup masa berlakunya kemarin (anti-backdating log historis).
      if (assignment.effectiveDate >= today) {
        await tx.policyOwnerAssignment.delete({
          where: { id: assignmentId },
        });
      } else {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        await tx.policyOwnerAssignment.update({
          where: { id: assignmentId },
          data: { endDate: yesterday },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId,
          actionCode: 'POLICY_OWNER_REVOKED',
          relatedEntityType: 'policy_owner_assignments',
          relatedEntityId: assignmentId,
          valueBefore: {
            userId: assignment.userId,
            userName: assignment.user.fullName,
            category: assignment.policyCategory,
          },
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        },
      });

      return { success: true, revokedId: assignmentId, assignment };
    });

    await this.notifyPolicyOwnerMutation({
      action: 'REVOKED',
      actorUserId,
      assignmentId,
      category: txResult.assignment.policyCategory,
      targetUserId: txResult.assignment.userId,
      targetUserName: txResult.assignment.user?.fullName,
      effectiveDate: today,
    });

    return { success: txResult.success, revokedId: txResult.revokedId };
  }

  private formatPolicyCategoryLabel(category: PolicyCategory): string {
    switch (category) {
      case PolicyCategory.CHECKIN_TIMING:
        return 'Jam Kerja & Waktu Komitmen (Check-in Timing)';
      case PolicyCategory.BLOCKER_SLA:
        return 'Target Waktu Respon & Penanganan Kendala (Blocker SLA)';
      case PolicyCategory.COMPLIANCE_THRESHOLD:
        return 'Ambang Batas Kepatuhan & Disiplin Kerja (Compliance Threshold)';
      case PolicyCategory.CORRECTION_WINDOW:
        return 'Jendela Waktu Koreksi Mandiri (Correction Window)';
      case PolicyCategory.NOTIFICATION_REMINDER_THRESHOLD:
        return 'Ambang Batas Pengingat & Notifikasi (Notification Reminder)';
      default:
        return String(category);
    }
  }

  /**
   * Mengirimkan notifikasi spesifik per peran (personal ke pihak terdampak dan pemberitahuan tata kelola
   * wajib ke Direktur, Admin, serta HRGA) setiap kali terjadi perubahan pada tabel Penugasan Pemilik Kebijakan.
   */
  private async notifyPolicyOwnerMutation(params: {
    action: 'ASSIGNED' | 'UPDATED' | 'REVOKED';
    actorUserId: string;
    assignmentId: string;
    category: PolicyCategory;
    previousCategory?: PolicyCategory;
    targetUserId: string;
    targetUserName?: string | null;
    previousUserId?: string;
    previousUserName?: string | null;
    effectiveDate: Date;
  }): Promise<void> {
    try {
      if (!this.prisma.notification?.createMany) {
        return;
      }

      const todayStr = this.clockService.todayString('Asia/Jakarta');
      const today = new Date(todayStr);

      const userIdsToLookup = Array.from(
        new Set(
          [params.actorUserId, params.targetUserId, params.previousUserId].filter(
            (id): id is string => Boolean(id),
          ),
        ),
      );

      const userDetailMap = new Map<
        string,
        { fullName: string; jobTitle?: string | null }
      >();

      const resolveDisplay = (userId: string, fallbackName?: string | null) => {
        const info = userDetailMap.get(userId);
        const name = info?.fullName || fallbackName || 'Pengguna';
        return info?.jobTitle ? `${name} (${info.jobTitle})` : name;
      };

      const resolveName = (userId: string, fallbackName?: string | null) => {
        return userDetailMap.get(userId)?.fullName || fallbackName || 'Pengguna';
      };

      // 1. Kumpulkan 3 akun tata kelola wajib (Direktur, Admin, HRGA) + detail nama pengguna terlibat
      const governanceIds = new Set<string>();

      if (this.prisma.organizationalAssignment?.findMany) {
        try {
          const orgRows = await this.prisma.organizationalAssignment.findMany({
            where: {
              role: {
                in: [
                  CanonicalRole.CEO_MANAGEMENT,
                  CanonicalRole.SYSTEM_ADMIN,
                  CanonicalRole.HRGA,
                ],
              },
              effectiveDate: { lte: today },
              OR: [{ endDate: null }, { endDate: { gte: today } }],
              user: { status: UserStatus.ACTIVE },
            },
            select: {
              userId: true,
              jobTitle: true,
              user: { select: { id: true, fullName: true } },
            },
          });
          if (Array.isArray(orgRows)) {
            for (const row of orgRows as any[]) {
              if (row?.userId && typeof row.userId === 'string') {
                governanceIds.add(row.userId);
                if (row.user?.fullName) {
                  userDetailMap.set(row.userId, {
                    fullName: row.user.fullName,
                    jobTitle: row.jobTitle || null,
                  });
                }
              }
            }
          }
        } catch {
          // Abaikan jika mock tidak menyertakan relasi lengkap
        }
      }

      if (this.prisma.user?.findMany) {
        try {
          const users = await this.prisma.user.findMany({
            where: {
              status: UserStatus.ACTIVE,
              OR: [
                { id: { in: userIdsToLookup } },
                {
                  email: {
                    in: [
                      'direktur@dutamedia.com',
                      'admin@dutamedia.com',
                      'hrga@dutamedia.com',
                    ],
                  },
                },
              ],
            },
            select: {
              id: true,
              fullName: true,
              email: true,
              orgAssignments: {
                where: {
                  OR: [{ endDate: null }, { endDate: { gte: today } }],
                },
                orderBy: { effectiveDate: 'desc' },
                select: { jobTitle: true },
              },
            },
          });

          if (Array.isArray(users)) {
            for (const u of users as any[]) {
              if (!u?.id) continue;
              if (
                u.email === 'direktur@dutamedia.com' ||
                u.email === 'admin@dutamedia.com' ||
                u.email === 'hrga@dutamedia.com'
              ) {
                governanceIds.add(u.id);
              }
              if (u.fullName) {
                userDetailMap.set(u.id, {
                  fullName: u.fullName,
                  jobTitle: u.orgAssignments?.[0]?.jobTitle || null,
                });
              }
            }
          }
        } catch {
          // Fallback query tanpa relasi orgAssignments bila mock sederhana
        }
      }

      const actorName = resolveName(params.actorUserId, 'Sistem Administrator');
      const targetDisplay = resolveDisplay(
        params.targetUserId,
        params.targetUserName,
      );
      const prevDisplay = params.previousUserId
        ? resolveDisplay(params.previousUserId, params.previousUserName)
        : '';
      const prevName = params.previousUserId
        ? resolveName(params.previousUserId, params.previousUserName)
        : '';

      const categoryLabel = this.formatPolicyCategoryLabel(params.category);
      const prevCategoryLabel = params.previousCategory
        ? this.formatPolicyCategoryLabel(params.previousCategory)
        : categoryLabel;

      const effDateLabel = params.effectiveDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const notificationsToCreate: Array<{
        recipientUserId: string;
        triggerType: string;
        channel: NotificationChannel;
        title: string;
        message: string;
        actionUrl: string | null;
        relatedEntityType: string;
        relatedEntityId: string;
      }> = [];

      const notifiedUserIds = new Set<string>();
      const pushNotif = (
        recipientUserId: string,
        triggerType: string,
        title: string,
        lines: string[],
        actionUrl: string | null,
      ) => {
        if (!recipientUserId || notifiedUserIds.has(recipientUserId)) return;
        notifiedUserIds.add(recipientUserId);
        notificationsToCreate.push({
          recipientUserId,
          triggerType,
          channel: NotificationChannel.IN_APP_CENTER,
          title,
          message: lines.join('\n'),
          actionUrl,
          relatedEntityType: 'policy_owner_assignments',
          relatedEntityId: params.assignmentId,
        });
      };

      if (params.action === 'ASSIGNED') {
        pushNotif(
          params.targetUserId,
          'POLICY_OWNER_ASSIGNED',
          'Penugasan Baru sebagai Pemilik Kebijakan',
          [
            'Anda telah ditetapkan sebagai Pemilik Kebijakan (Policy Owner) baru.',
            `Kategori Kebijakan: ${categoryLabel}`,
            'Status Wewenang Anda: Aktif (Dapat menerbitkan versi kebijakan baru pada kategori ini)',
            `Mulai Berlaku: ${effDateLabel}`,
            `Ditetapkan Oleh: ${actorName}`,
          ],
          '/admin/policies',
        );

        for (const govId of governanceIds) {
          pushNotif(
            govId,
            'POLICY_OWNER_ASSIGNED',
            'Penambahan Pemilik Kebijakan Baru',
            [
              'Penugasan Pemilik Kebijakan baru telah ditambahkan pada sistem tata kelola.',
              `Kategori Kebijakan: ${categoryLabel}`,
              `Pemilik Kebijakan Baru: ${targetDisplay}`,
              'Status Wewenang: Aktif',
              `Mulai Berlaku: ${effDateLabel}`,
              `Ditetapkan Oleh: ${actorName}`,
            ],
            '/admin/policies',
          );
        }
      } else if (params.action === 'UPDATED') {
        const isReassigned =
          Boolean(params.previousUserId) &&
          params.previousUserId !== params.targetUserId;

        if (isReassigned && params.previousUserId) {
          pushNotif(
            params.previousUserId,
            'POLICY_OWNER_UPDATED',
            'Pengalihan Wewenang Pemilik Kebijakan',
            [
              'Wewenang Anda sebagai Pemilik Kebijakan untuk kategori berikut telah dialihkan kepada pejabat lain.',
              `Kategori Kebijakan: ${prevCategoryLabel}`,
              `Pemilik Sebelumnya: ${prevName} (Anda)`,
              `Dialihkan Kepada: ${targetDisplay}`,
              'Status Wewenang Anda: Nonaktif pada kategori ini',
              `Mulai Berlaku: ${effDateLabel}`,
              `Diubah Oleh: ${actorName}`,
            ],
            null,
          );

          pushNotif(
            params.targetUserId,
            'POLICY_OWNER_UPDATED',
            'Penugasan Baru sebagai Pemilik Kebijakan',
            [
              'Anda kini ditetapkan sebagai Pemilik Kebijakan menggantikan pejabat sebelumnya.',
              `Kategori Kebijakan: ${categoryLabel}`,
              `Pejabat Sebelumnya: ${prevDisplay}`,
              'Status Wewenang Anda: Aktif (Dapat menerbitkan versi kebijakan baru pada kategori ini)',
              `Mulai Berlaku: ${effDateLabel}`,
              `Diubah Oleh: ${actorName}`,
            ],
            '/admin/policies',
          );

          for (const govId of governanceIds) {
            pushNotif(
              govId,
              'POLICY_OWNER_UPDATED',
              'Perubahan Penugasan Pemilik Kebijakan',
              [
                'Data penugasan Pemilik Kebijakan telah diperbarui pada sistem tata kelola.',
                `Kategori Kebijakan: ${categoryLabel}`,
                `Pemilik Sebelumnya: ${prevDisplay}`,
                `Pemilik Baru: ${targetDisplay}`,
                `Mulai Berlaku: ${effDateLabel}`,
                `Diubah Oleh: ${actorName}`,
              ],
              '/admin/policies',
            );
          }
        } else {
          pushNotif(
            params.targetUserId,
            'POLICY_OWNER_UPDATED',
            'Pembaruan Penugasan Pemilik Kebijakan Anda',
            [
              'Ketentuan penugasan Anda sebagai Pemilik Kebijakan telah diperbarui.',
              `Kategori Kebijakan: ${categoryLabel}`,
              'Status Wewenang Anda: Aktif (Dapat menerbitkan versi kebijakan baru pada kategori ini)',
              `Mulai Berlaku: ${effDateLabel}`,
              `Diubah Oleh: ${actorName}`,
            ],
            '/admin/policies',
          );

          for (const govId of governanceIds) {
            pushNotif(
              govId,
              'POLICY_OWNER_UPDATED',
              'Perubahan Penugasan Pemilik Kebijakan',
              [
                'Data penugasan Pemilik Kebijakan telah diperbarui pada sistem tata kelola.',
                `Kategori Kebijakan: ${categoryLabel}`,
                `Pemilik Kebijakan: ${targetDisplay}`,
                `Mulai Berlaku: ${effDateLabel}`,
                `Diubah Oleh: ${actorName}`,
              ],
              '/admin/policies',
            );
          }
        }
      } else if (params.action === 'REVOKED') {
        pushNotif(
          params.targetUserId,
          'POLICY_OWNER_REVOKED',
          'Pencabutan Wewenang Pemilik Kebijakan',
          [
            'Wewenang Anda sebagai Pemilik Kebijakan untuk kategori berikut telah dicabut.',
            `Kategori Kebijakan: ${categoryLabel}`,
            'Status Wewenang Anda: Nonaktif (Tidak lagi dapat menerbitkan versi kebijakan pada kategori ini)',
            `Tanggal Pencabutan: ${effDateLabel}`,
            `Dicabut Oleh: ${actorName}`,
          ],
          null,
        );

        for (const govId of governanceIds) {
          pushNotif(
            govId,
            'POLICY_OWNER_REVOKED',
            'Pencabutan Penugasan Pemilik Kebijakan',
            [
              'Wewenang salah satu Pemilik Kebijakan telah dicabut dari sistem tata kelola.',
              `Kategori Kebijakan: ${categoryLabel}`,
              `Personil yang Dicabut: ${targetDisplay}`,
              'Status Wewenang: Nonaktif pada kategori ini',
              `Tanggal Pencabutan: ${effDateLabel}`,
              `Dicabut Oleh: ${actorName}`,
            ],
            '/admin/policies',
          );
        }
      }

      if (notificationsToCreate.length > 0) {
        await this.prisma.notification.createMany({
          data: notificationsToCreate,
        });
      }
    } catch (err) {
      console.error('Gagal mengirim notifikasi perubahan pemilik kebijakan:', err);
    }
  }

  /**
   * Memvalidasi apakah seorang pengguna memiliki wewenang aktif sebagai Pemilik Kebijakan
   * (Authorized Policy Owner) untuk kategori tertentu (BR-15, FR-34).
   *
   * Sumber kebenaran tunggal (Single Source of Truth) adalah tabel policy_owner_assignments.
   * Tidak ada jalur belakang (fallback) berdasarkan jabatan jika akun tidak tercatat di tabel.
   */
  async isUserAuthorizedPolicyOwner(
    userId: string,
    category: PolicyCategory,
    targetDate?: Date,
  ): Promise<boolean> {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const today = targetDate || new Date(todayStr);

    await ensurePolicyOwnersBaselineSynced(this.prisma, new Date(todayStr));

    const activeAssignment = await this.prisma.policyOwnerAssignment.findFirst({
      where: {
        userId,
        policyCategory: category,
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
    });

    return Boolean(activeAssignment);
  }

  /**
   * Mengambil riwayat jejak audit (Audit Trail) kebijakan dan penugasan pemiliknya.
   */
  async getAuditTrail(category?: PolicyCategory) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        relatedEntityType: { in: ['policies', 'policy_owner_assignments'] },
        actionCode: { not: 'POLICY_OWNERS_BASELINE_SYNCED_V1' },
      },
      include: {
        actor: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return logs.map((log) => {
      const valAfter = log.valueAfter as any;
      const valBefore = log.valueBefore as any;
      return {
        id: log.id,
        timestamp: log.timestamp,
        actor: log.actor || { fullName: 'System', email: 'system@workpulse' },
        actionCode: log.actionCode,
        category: valAfter?.category || valBefore?.category || category || 'GENERAL',
        effectiveDate: valAfter?.effectiveDate || null,
        changeJustification:
          valAfter?.changeJustification ||
          (log.actionCode === 'POLICY_OWNER_ASSIGNED'
            ? `Penetapan pemilik: ${valAfter?.userName || 'PIC'}`
            : log.actionCode === 'POLICY_OWNER_UPDATED'
              ? `Perubahan pemilik: ${valBefore?.userName || 'PIC'} → ${valAfter?.userName || 'PIC'}`
              : log.actionCode === 'POLICY_OWNER_REVOKED'
                ? `Pencabutan wewenang pemilik: ${valBefore?.userName || 'PIC'}`
                : 'Inisialisasi sistem'),
        valueBefore: valBefore,
        valueAfter: valAfter?.configurationValues || valAfter,
      };
    });
  }

  /**
   * Melakukan seed parameter ilustratif bertanda is_illustrative = true (DEC-011)
   * bila database masih kosong.
   */
  async seedIllustrativePolicies(creatorUserId: string) {
    const existingCount = await this.prisma.policy.count();
    if (existingCount > 0) {
      return { seeded: false, count: existingCount };
    }

    const today = new Date(this.clockService.todayString('Asia/Jakarta'));
    const categories = Object.values(PolicyCategory);
    const createdPolicies = [];

    for (const category of categories) {
      const p = await this.prisma.policy.create({
        data: {
          category,
          configurationValues: CANONICAL_POLICY_FALLBACKS[category],
          isIllustrative: true,
          effectiveDate: today,
          createdByUserId: creatorUserId,
        },
      });
      createdPolicies.push(p);
    }

    await ensurePolicyOwnersBaselineSynced(this.prisma, today);

    return { seeded: true, count: createdPolicies.length };
  }
}
