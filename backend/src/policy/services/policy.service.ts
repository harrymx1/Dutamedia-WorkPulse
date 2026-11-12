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
import { CANONICAL_POLICY_FALLBACKS } from '../policy.constants';

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
   * Mengambil seluruh kebijakan aktif untuk ke-5 kategori kanonikal.
   */
  async getAllActivePolicies(targetDate?: Date) {
    const categories = Object.values(PolicyCategory);
    const results = await Promise.all(
      categories.map((cat) => this.getActivePolicy(cat, targetDate)),
    );

    // Ambil penugasan pemilik kebijakan aktif saat ini
    const owners = await this.getPolicyOwners();

    return {
      evaluatedAt: (targetDate || this.clockService.now()).toISOString(),
      policies: results,
      owners,
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

      if (!recipients || recipients.length === 0) return;

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
        data: recipients.map((r: { id: string }) => ({
          recipientUserId: r.id,
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
   * Mengambil penugasan pemilik kebijakan (Policy Owner).
   */
  async getPolicyOwners() {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const today = new Date(todayStr);

    const assignments = await this.prisma.policyOwnerAssignment.findMany({
      where: {
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return assignments;
  }

  /**
   * Menugaskan pemilik kebijakan untuk suatu kategori (misal: Direktur/Head).
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

    return this.prisma.$transaction(async (tx) => {
      // Tutup penugasan pemilik aktif sebelumnya
      const currentActive = await tx.policyOwnerAssignment.findFirst({
        where: {
          policyCategory: dto.policyCategory,
          effectiveDate: { lte: effectiveDate },
          OR: [{ endDate: null }, { endDate: { gte: effectiveDate } }],
        },
        orderBy: [{ effectiveDate: 'desc' }],
      });

      if (currentActive) {
        if (currentActive.effectiveDate < effectiveDate) {
          const previousEndDate = new Date(effectiveDate);
          previousEndDate.setDate(previousEndDate.getDate() - 1);

          await tx.policyOwnerAssignment.update({
            where: { id: currentActive.id },
            data: { endDate: previousEndDate },
          });
        } else {
          await tx.policyOwnerAssignment.delete({
            where: { id: currentActive.id },
          });
        }
      }

      const created = await tx.policyOwnerAssignment.create({
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
          relatedEntityId: created.id,
          valueBefore: currentActive ? { userId: currentActive.userId } : undefined,
          valueAfter: { userId: created.userId, category: created.policyCategory },
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        },
      });

      return created;
    });
  }

  /**
   * Mengambil riwayat jejak audit (Audit Trail) kebijakan.
   */
  async getAuditTrail(category?: PolicyCategory) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        relatedEntityType: 'policies',
      },
      include: {
        actor: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return logs.map((log) => {
      const valAfter = log.valueAfter as any;
      const valBefore = log.valueBefore as any;
      return {
        id: log.id,
        timestamp: log.timestamp,
        actor: log.actor || { fullName: 'System', email: 'system@workpulse' },
        actionCode: log.actionCode,
        category: valAfter?.category || category || 'GENERAL',
        effectiveDate: valAfter?.effectiveDate || null,
        changeJustification: valAfter?.changeJustification || 'Inisialisasi sistem',
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

    const categories = Object.values(PolicyCategory);
    const createdPolicies = [];

    for (const category of categories) {
      const p = await this.prisma.policy.create({
        data: {
          category,
          configurationValues: CANONICAL_POLICY_FALLBACKS[category],
          isIllustrative: true,
          effectiveDate: new Date('2026-01-01'),
          createdByUserId: creatorUserId,
        },
      });
      createdPolicies.push(p);

      // Default owner assignment
      await this.prisma.policyOwnerAssignment.create({
        data: {
          userId: creatorUserId,
          policyCategory: category,
          effectiveDate: new Date('2026-01-01'),
          createdByUserId: creatorUserId,
        },
      });
    }

    return { seeded: true, count: createdPolicies.length };
  }
}
