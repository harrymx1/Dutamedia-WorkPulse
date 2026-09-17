import { Injectable, Logger } from '@nestjs/common';
import {
  ComplianceEventType,
  ExceptionStatus,
  ExceptionType,
  ManagerNoteType,
  ManagerNoteVisibility,
  NotificationChannel,
  PolicyCategory,
  Prisma,
  Role,
  SubmissionTiming,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../../audit/audit.service.js';
import { ScopeFilterService } from '../../authorization/services/scope-filter.service.js';
import { NotificationService } from '../../notification/notification.service.js';
import { PolicyService } from '../../policy/policy.service.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../shared/exceptions/api.exception.js';
import type { CoachComplianceEventDto } from '../dto/coach-compliance-event.dto.js';
import type { RecordWarningDto } from '../dto/record-warning.dto.js';
import type { EscalateFormalDto } from '../dto/escalate-formal.dto.js';
import type { QueryComplianceEventsDto } from '../dto/query-compliance-events.dto.js';

export function normalizeDate(dateInput: Date | string): Date {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly scopeFilterService: ScopeFilterService,
    private readonly notificationService: NotificationService,
    private readonly policyService: PolicyService,
  ) {}

  /**
   * Helper internal mengecek apakah waktu saat ini telah melewati batas cutoff (SAD §9.2).
   */
  private isPastCutoff(
    now: Date,
    deadlineStr: string = '09:00',
    graceMinutes: number = 30,
  ): boolean {
    const [dHours, dMinutes] = deadlineStr.split(':').map(Number);
    const deadline = new Date(now);
    deadline.setHours(dHours, dMinutes, 0, 0);
    const cutoff = new Date(deadline.getTime() + graceMinutes * 60 * 1000);
    return now > cutoff;
  }

  /**
   * Menghitung daftar aksi yang valid untuk state compliance event saat ini (SAD §9.7, §10.8).
   * Nilai: ["coach"] | ["record_warning"] | ["escalate_formal"] | []
   */
  computeAvailableActions(
    event: { eventType: ComplianceEventType; followUpStatus?: string | null },
    user: CurrentUserPayload,
  ): string[] {
    const actions: string[] = [];
    if (!event) return actions;

    // 1. Tahap Pattern Flag -> Coaching (Supervisor / Head)
    if (
      event.eventType === ComplianceEventType.PatternFlag &&
      event.followUpStatus !== 'Coached'
    ) {
      if (
        user.role === Role.Supervisor_TL ||
        user.role === Role.Head
      ) {
        actions.push('coach');
      }
    }

    // 2. Tahap Coaching -> Recorded Warning (HRGA)
    if (
      event.eventType === ComplianceEventType.Coaching &&
      event.followUpStatus !== 'WarningRecorded'
    ) {
      if (user.role === Role.HRGA) {
        actions.push('record_warning');
      }
    }

    // 3. Tahap Recorded Warning -> Escalate Formal (HRGA)
    if (
      event.eventType === ComplianceEventType.RecordedWarning &&
      event.followUpStatus !== 'Escalated'
    ) {
      if (user.role === Role.HRGA) {
        actions.push('escalate_formal');
      }
    }

    return actions;
  }

  /**
   * EPIC-12-T1: Service evaluateNoSubmission() (SAD §9.7, §11.2 #3, FR-27, FR-48, FR-49, BR-17).
   * Mengevaluasi seluruh karyawan aktif untuk mendeteksi ketiadaan submission setelah cutoff.
   * Hari libur atau tanggal dengan izin/cuti/exemption valid otomatis dikecualikan (AC-09, AC-19).
   */
  async evaluateNoSubmission(
    targetDate: Date = new Date(),
    evaluationTime: Date = new Date(),
  ) {
    const workDate = normalizeDate(targetDate);
    const now = evaluationTime;

    // 1. Ambil snapshot kebijakan aktif (FR-33)
    const policySnapshot = await this.policyService.getActivePolicySnapshot(
      [
        PolicyCategory.Cutoff,
        PolicyCategory.GracePeriod,
        PolicyCategory.WorkdayCalendar,
      ],
      now,
    );

    const workdayConfig = policySnapshot[PolicyCategory.WorkdayCalendar] || {};
    const cutoffConfig = policySnapshot[PolicyCategory.Cutoff] || {};
    const graceConfig = policySnapshot[PolicyCategory.GracePeriod] || {};

    const workDays: number[] = workdayConfig.workDays || [1, 2, 3, 4, 5];
    const dayOfWeek = workDate.getUTCDay(); // 0: Minggu, 1: Senin, ..., 6: Sabtu

    // Jika bukan hari kerja sesuai kalender kerja (FR-27), skip evaluasi
    if (!workDays.includes(dayOfWeek)) {
      this.logger.log(
        `Evaluasi NoSubmission dilewati untuk tanggal ${workDate.toISOString().split('T')[0]}: bukan hari kerja.`,
      );
      return {
        evaluatedUsers: 0,
        newNoSubmissions: 0,
        skippedExempt: 0,
        reason: 'NON_WORKING_DAY',
      };
    }

    // 2. Periksa apakah hari ini adalah Libur Nasional / Holiday company-wide (FR-48, BR-18)
    const holiday = await this.prisma.exception.findFirst({
      where: {
        type: ExceptionType.Holiday,
        status: ExceptionStatus.Approved,
        dateStart: { lte: workDate },
        dateEnd: { gte: workDate },
      },
    });

    if (holiday) {
      this.logger.log(
        `Evaluasi NoSubmission dilewati untuk tanggal ${workDate.toISOString().split('T')[0]}: Holiday company-wide (${holiday.reason}).`,
      );
      return {
        evaluatedUsers: 0,
        newNoSubmissions: 0,
        skippedExempt: 0,
        reason: 'COMPANY_HOLIDAY',
      };
    }

    // 3. Evaluasi apakah cutoff telah terlewati
    const isPastToday = normalizeDate(now).getTime() > workDate.getTime();
    const morningPassed =
      isPastToday ||
      this.isPastCutoff(
        now,
        cutoffConfig.morningOnTimeDeadline || '09:00',
        graceConfig.morningGraceMinutes || 30,
      );
    const eodPassed =
      isPastToday ||
      this.isPastCutoff(
        now,
        cutoffConfig.eodOnTimeDeadline || '18:00',
        graceConfig.eodGraceMinutes || 30,
      );

    if (!morningPassed && !eodPassed) {
      return {
        evaluatedUsers: 0,
        newNoSubmissions: 0,
        skippedExempt: 0,
        reason: 'CUTOFF_NOT_REACHED',
      };
    }

    // 4. Ambil seluruh penugasan organisasi aktif dengan peran Employee pada workDate
    const activeAssignments =
      await this.prisma.organizationalAssignment.findMany({
        where: {
          effectiveDate: { lte: workDate },
          OR: [{ endDate: null }, { endDate: { gte: workDate } }],
          role: Role.Employee,
          user: { status: UserStatus.Active },
        },
        include: { user: true },
      });

    let evaluatedUsers = 0;
    let newNoSubmissions = 0;
    let skippedExempt = 0;

    for (const assignment of activeAssignments) {
      evaluatedUsers++;
      const userId = assignment.userId;

      // Cek apakah user memiliki Exception valid (Leave berstatus Approved atau Exemption aktif) (AC-09, AC-19, FR-48)
      const validException = await this.prisma.exception.findFirst({
        where: {
          employeeUserId: userId,
          status: ExceptionStatus.Approved, // Leave berstatus Pending TIDAK mengecualikan (AC-19)
          type: { in: [ExceptionType.Leave, ExceptionType.Exemption] },
          dateStart: { lte: workDate },
          dateEnd: { gte: workDate },
        },
      });

      if (validException) {
        skippedExempt++;
        continue;
      }

      // Periksa apakah ComplianceEvent(NoSubmission) sudah tercatat untuk user & workDate ini (Idempotensi & FR-49)
      const existingComplianceEvent =
        await this.prisma.complianceEvent.findFirst({
          where: {
            userId,
            eventType: ComplianceEventType.NoSubmission,
            eventDate: workDate,
          },
        });

      if (existingComplianceEvent) {
        // Sudah tercatat, jangan duplikasi (FR-49, BR-17)
        continue;
      }

      // Ambil DailyAccountabilityRecord user pada workDate
      const dailyRecord =
        await this.prisma.dailyAccountabilityRecord.findUnique({
          where: {
            employeeUserId_workDate: {
              employeeUserId: userId,
              workDate,
            },
          },
        });

      // Deteksi ketiadaan submission:
      // - Tidak pernah submit Morning padahal morning cutoff telah lewat
      // - ATAU tidak pernah submit EOD padahal EOD cutoff telah lewat
      const missedMorning =
        morningPassed &&
        (!dailyRecord ||
          dailyRecord.morningSubmittedAt === null ||
          dailyRecord.morningTiming === SubmissionTiming.NoSubmission);

      const missedEod =
        eodPassed &&
        (!dailyRecord ||
          dailyRecord.eodSubmittedAt === null ||
          dailyRecord.eodTiming === SubmissionTiming.NoSubmission);

      if (missedMorning || missedEod) {
        await this.prisma.complianceEvent.create({
          data: {
            userId,
            eventType: ComplianceEventType.NoSubmission,
            eventDate: workDate,
            relatedDailyRecordId: dailyRecord?.id ?? null,
            policySnapshot: policySnapshot as Prisma.InputJsonValue,
            followUpStatus: 'Pending',
          },
        });
        newNoSubmissions++;
      }
    }

    this.logger.log(
      `evaluateNoSubmission selesai untuk tanggal ${workDate.toISOString().split('T')[0]}: ` +
        `${evaluatedUsers} user dievaluasi, ${newNoSubmissions} NoSubmission baru dibuat, ${skippedExempt} user dikecualikan karena Exception valid.`,
    );

    return {
      evaluatedUsers,
      newNoSubmissions,
      skippedExempt,
    };
  }

  /**
   * EPIC-12-T2: Service evaluatePatternFlag() (SAD §9.7, §11.4 #8, FR-29, FR-30, BR-05, BR-06).
   * Mengevaluasi agregat NoSubmission per karyawan dalam periode threshold.
   * Bersifat idempoten per episode: row baru hanya dibuat jika tidak ada PatternFlag aktif yang belum dicoaching.
   */
  async evaluatePatternFlag(asOfDate: Date = new Date()) {
    const asOf = normalizeDate(asOfDate);

    // 1. Ambil kebijakan CoachingFollowUpPeriod & threshold
    const policySnapshot = await this.policyService.getActivePolicySnapshot(
      [
        PolicyCategory.CoachingFollowUpPeriod,
        PolicyCategory.EscalationThreshold,
      ],
      asOf,
    );

    const coachingConfig =
      policySnapshot[PolicyCategory.CoachingFollowUpPeriod] || {};
    const windowDays: number = coachingConfig.coachingWindowDays || 14;
    const thresholdCount: number = coachingConfig.patternThresholdCount || 3;

    const windowStart = new Date(
      asOf.getTime() - windowDays * 24 * 60 * 60 * 1000,
    );

    // 2. Ambil seluruh user aktif
    const activeUsers = await this.prisma.user.findMany({
      where: { status: UserStatus.Active },
      select: { id: true, fullName: true, email: true },
    });

    let evaluatedUsers = 0;
    let newPatternFlags = 0;

    for (const targetUser of activeUsers) {
      evaluatedUsers++;

      // Cek apakah user sudah memiliki PatternFlag aktif yang belum dicoaching (SAD §9.7: idempoten per episode)
      const uncoachedPatternFlag = await this.prisma.complianceEvent.findFirst({
        where: {
          userId: targetUser.id,
          eventType: ComplianceEventType.PatternFlag,
          followUpStatus: { not: 'Coached' },
        },
      });

      if (uncoachedPatternFlag) {
        // Episode pola saat ini masih aktif menunggu tindakan coaching, jangan buat row baru
        continue;
      }

      // Ambil tanggal coaching terakhir (jika ada) agar NoSubmission sebelum coaching tidak dihitung ulang
      const latestCoaching = await this.prisma.complianceEvent.findFirst({
        where: {
          userId: targetUser.id,
          eventType: ComplianceEventType.Coaching,
        },
        orderBy: { eventDate: 'desc' },
      });

      const effectiveWindowStart =
        latestCoaching && latestCoaching.eventDate > windowStart
          ? latestCoaching.eventDate
          : windowStart;

      // Hitung jumlah event NoSubmission dalam jendela waktu
      const noSubCount = await this.prisma.complianceEvent.count({
        where: {
          userId: targetUser.id,
          eventType: ComplianceEventType.NoSubmission,
          eventDate: {
            gte: effectiveWindowStart,
            lte: asOf,
          },
        },
      });

      if (noSubCount >= thresholdCount) {
        // Buat row PatternFlag baru
        const newFlag = await this.prisma.complianceEvent.create({
          data: {
            userId: targetUser.id,
            eventType: ComplianceEventType.PatternFlag,
            eventDate: asOf,
            relatedDailyRecordId: null,
            policySnapshot: {
              thresholdCount,
              windowDays,
              actualCount: noSubCount,
            } as Prisma.InputJsonValue,
            followUpStatus: 'Active',
          },
        });

        newPatternFlags++;

        // Kirim notifikasi ke manajer langsung (Supervisor/Head) (SAD §9.7, §12.1)
        const orgAssignment =
          await this.prisma.organizationalAssignment.findFirst({
            where: {
              userId: targetUser.id,
              effectiveDate: { lte: asOf },
              OR: [{ endDate: null }, { endDate: { gte: asOf } }],
            },
            orderBy: { effectiveDate: 'desc' },
          });

        if (orgAssignment?.directManagerId) {
          await this.notificationService.dispatch({
            triggerType: 'PATTERN_FLAG_DETECTED',
            recipientUserId: orgAssignment.directManagerId,
            payload: {
              title: 'Pola Non-Submission Terdeteksi (Perlu Pembinaan)',
              body: `Karyawan ${targetUser.fullName} telah melewati batas ${noSubCount} kali No Submission dalam ${windowDays} hari terakhir. Mohon jadwalkan sesi pembinaan (Coaching).`,
              linkPath: `/compliance-events/${newFlag.id}`,
            },
            relatedEntityType: 'ComplianceEvent',
            relatedEntityId: newFlag.id,
            channels: [
              NotificationChannel.Email,
              NotificationChannel.WebNotificationCenter,
            ],
          });
        }
      }
    }

    this.logger.log(
      `evaluatePatternFlag selesai: ${evaluatedUsers} user diperiksa, ${newPatternFlags} PatternFlag baru diterbitkan.`,
    );

    return {
      evaluatedUsers,
      newPatternFlags,
    };
  }

  /**
   * EPIC-12-T3: Endpoint GET /api/v1/compliance-events (SAD §8.11, §10.8).
   * Filter daftar compliance event sesuai cakupan wewenang organisasi.
   */
  async findAll(user: CurrentUserPayload, query: QueryComplianceEventsDto) {
    const asOfDate = new Date();

    // Validasi wewenang peran (SAD §10.8)
    const allowedRoles: (string | null)[] = [
      Role.Supervisor_TL,
      Role.Head,
      Role.HRGA,
      Role.CEO_Management,
    ];
    if (!user.role || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Anda tidak memiliki wewenang untuk melihat riwayat compliance event (SAD §10.8)',
      );
    }

    const where: Prisma.ComplianceEventWhereInput = {};

    // 1. Penerapan Scope Filtering (SAD §8.11)
    if (user.role === Role.HRGA || user.role === Role.CEO_Management) {
      if (query.userId) {
        where.userId = query.userId;
      }
    } else if (user.role === Role.Supervisor_TL) {
      // Supervisor hanya melihat bawahan langsungnya
      const directReports = await this.prisma.organizationalAssignment.findMany({
        where: {
          directManagerId: user.userId,
          effectiveDate: { lte: asOfDate },
          OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
        },
        select: { userId: true },
      });
      const subordinateIds = directReports.map((r) => r.userId);

      if (query.userId) {
        if (!subordinateIds.includes(query.userId)) {
          // Permintaan di luar scope menghasilkan list kosong
          where.userId = '00000000-0000-0000-0000-000000000000';
        } else {
          where.userId = query.userId;
        }
      } else {
        where.userId = { in: subordinateIds };
      }
    } else if (user.role === Role.Head) {
      // Head melihat karyawan dalam fungsinya
      const functionUsers = await this.prisma.organizationalAssignment.findMany({
        where: {
          function: user.function ?? undefined,
          effectiveDate: { lte: asOfDate },
          OR: [{ endDate: null }, { endDate: { gte: asOfDate } }],
        },
        select: { userId: true },
      });
      const functionUserIds = functionUsers.map((r) => r.userId);

      if (query.userId) {
        if (!functionUserIds.includes(query.userId)) {
          where.userId = '00000000-0000-0000-0000-000000000000';
        } else {
          where.userId = query.userId;
        }
      } else {
        where.userId = { in: functionUserIds };
      }
    }

    // 2. Filter parameter opsional
    if (query.eventType) {
      where.eventType = query.eventType;
    }

    if (query.followUpStatus) {
      where.followUpStatus = query.followUpStatus;
    }

    if (query.startDate || query.endDate) {
      where.eventDate = {};
      if (query.startDate) {
        where.eventDate.gte = normalizeDate(query.startDate);
      }
      if (query.endDate) {
        where.eventDate.lte = normalizeDate(query.endDate);
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [total, events] = await this.prisma.$transaction([
      this.prisma.complianceEvent.count({ where }),
      this.prisma.complianceEvent.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
          relatedDailyRecord: {
            select: { id: true, workDate: true },
          },
        },
        orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    const dataWithActions = events.map((ev) => ({
      ...ev,
      availableActions: this.computeAvailableActions(ev, user),
    }));

    return {
      data: dataWithActions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * EPIC-12-T3: Endpoint GET /api/v1/compliance-events/:id (SAD §9.7, §10.8).
   * Menampilkan detail compliance event beserta availableActions.
   */
  async findById(user: CurrentUserPayload, id: string) {
    const asOfDate = new Date();

    const allowedRoles: (string | null)[] = [
      Role.Supervisor_TL,
      Role.Head,
      Role.HRGA,
      Role.CEO_Management,
    ];
    if (!user.role || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Anda tidak memiliki wewenang untuk melihat detail compliance event (SAD §10.8)',
      );
    }

    const event = await this.prisma.complianceEvent.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        relatedDailyRecord: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Compliance event tidak ditemukan');
    }

    // Validasi Scope: jika user bukan HRGA/CEO, pastikan target event dalam scope (SAD §19.4 #3)
    if (user.role === Role.Supervisor_TL || user.role === Role.Head) {
      const inScope = await this.scopeFilterService.isUserInScope(
        user,
        event.userId,
        asOfDate,
      );

      if (!inScope) {
        throw new NotFoundException('Compliance event tidak ditemukan');
      }
    }

    return {
      ...event,
      availableActions: this.computeAvailableActions(event, user),
    };
  }

  /**
   * EPIC-12-T4: Endpoint POST /api/v1/compliance-events/:id/coach (SAD §9.7, §10.8, §15.1).
   * Dilakukan oleh Supervisor atau Head atas event PatternFlag.
   * Dalam satu transaksi atomik:
   * 1. Buat ManagerNote(type=Coaching, relatedEntityType='ComplianceEvent', relatedEntityId=id)
   * 2. Buat ComplianceEvent(type=Coaching)
   * 3. Update followUpStatus PatternFlag asal menjadi 'Coached'
   * 4. Tulis AuditLog(action=MANAGER_NOTE_CREATED)
   */
  async coach(
    user: CurrentUserPayload,
    id: string,
    dto: CoachComplianceEventDto,
  ) {
    const asOfDate = new Date();

    // 1. Validasi peran pembuat pembinaan (SAD §10.8)
    const allowedRoles: (string | null)[] = [Role.Supervisor_TL, Role.Head];
    if (!user.role || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Hanya Supervisor atau Head yang memiliki kewenangan melakukan pembinaan (coaching) (SAD §10.8)',
      );
    }

    // 2. Ambil event target
    const targetEvent = await this.prisma.complianceEvent.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!targetEvent) {
      throw new NotFoundException('Compliance event tidak ditemukan');
    }

    // 3. Validasi cakupan wewenang organisasi (Scope check)
    const inScope = await this.scopeFilterService.isUserInScope(
      user,
      targetEvent.userId,
      asOfDate,
    );

    if (!inScope) {
      throw new NotFoundException('Compliance event tidak ditemukan');
    }

    // 4. Validasi tipe event dan status tindak lanjut (SAD §9.7)
    if (targetEvent.eventType !== ComplianceEventType.PatternFlag) {
      throw new ConflictException(
        'Tindakan pembinaan (coaching) hanya dapat dilakukan terhadap event bertipe PatternFlag',
      );
    }

    if (targetEvent.followUpStatus === 'Coached') {
      throw new ConflictException(
        'Event PatternFlag ini sudah ditindaklanjuti dengan pembinaan (Coaching) sebelumnya',
      );
    }

    // 5. Eksekusi atomik dalam single transaction (SAD §10.8, §15.1)
    return this.prisma.$transaction(async (tx) => {
      const visibility =
        dto.visibility ?? ManagerNoteVisibility.VisibleToEmployee;

      // 5a. Buat Manager Note
      const managerNote = await tx.managerNote.create({
        data: {
          aboutUserId: targetEvent.userId,
          createdByUserId: user.userId,
          type: ManagerNoteType.Coaching,
          note: dto.note.trim(),
          visibility,
          relatedEntityType: 'ComplianceEvent',
          relatedEntityId: targetEvent.id,
        },
      });

      // 5b. Buat ComplianceEvent(Coaching)
      const coachingEvent = await tx.complianceEvent.create({
        data: {
          userId: targetEvent.userId,
          eventType: ComplianceEventType.Coaching,
          eventDate: asOfDate,
          relatedDailyRecordId: targetEvent.relatedDailyRecordId,
          policySnapshot: targetEvent.policySnapshot ?? undefined,
          followUpStatus: 'Coached',
        },
      });

      // 5c. Perbarui status follow-up pada PatternFlag asal
      await tx.complianceEvent.update({
        where: { id: targetEvent.id },
        data: { followUpStatus: 'Coached' },
      });

      // 5d. Tulis AuditLog (SAD §15.1 baris 1440)
      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'MANAGER_NOTE_CREATED',
          relatedEntityType: 'ManagerNote',
          relatedEntityId: managerNote.id,
          valueAfter: managerNote,
        },
        tx,
      );

      // 5e. Dispatch notifikasi ke karyawan
      await this.notificationService.dispatch(
        {
          triggerType: 'MANAGER_NOTE_CREATED',
          recipientUserId: targetEvent.userId,
          payload: {
            title: 'Catatan Pembinaan (Coaching) Baru',
            body: `${user.email} telah mendokumentasikan sesi pembinaan (Coaching) untuk Anda.`,
            linkPath: `/history`,
          },
          relatedEntityType: 'ManagerNote',
          relatedEntityId: managerNote.id,
          channels: [
            NotificationChannel.Email,
            NotificationChannel.WebNotificationCenter,
          ],
        },
        tx,
      );

      this.logger.log(
        `Coaching berhasil didokumentasikan untuk user ${targetEvent.userId} atas PatternFlag ${id} oleh ${user.userId}`,
      );

      return {
        complianceEvent: {
          ...coachingEvent,
          availableActions: this.computeAvailableActions(coachingEvent, user),
        },
        managerNote,
      };
    });
  }

  /**
   * EPIC-12-T5: Endpoint POST /api/v1/compliance-events/:id/record-warning (SAD §9.7, §10.8, BR-05, BR-06).
   * Dilakukan secara manual oleh HRGA jika terjadi pelanggaran berulang pasca Coaching.
   */
  async recordWarning(
    user: CurrentUserPayload,
    id: string,
    dto: RecordWarningDto,
  ) {
    const asOfDate = new Date();

    // 1. Validasi peran: hanya HRGA (SAD §10.8)
    if (user.role !== Role.HRGA) {
      throw new ForbiddenException(
        'Hanya HRGA yang memiliki kewenangan mencatat peringatan formal (Recorded Warning) (SAD §10.8)',
      );
    }

    // 2. Ambil event target
    const targetEvent = await this.prisma.complianceEvent.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!targetEvent) {
      throw new NotFoundException('Compliance event tidak ditemukan');
    }

    // 3. Validasi transisi status progression (SAD §9.7)
    if (targetEvent.eventType !== ComplianceEventType.Coaching) {
      throw new ConflictException(
        'Peringatan tercatat (Recorded Warning) hanya dapat diterbitkan setelah tahap Coaching',
      );
    }

    if (targetEvent.followUpStatus === 'WarningRecorded') {
      throw new ConflictException(
        'Peringatan tercatat (Recorded Warning) sudah pernah diterbitkan untuk episode ini',
      );
    }

    // 4. Eksekusi atomik
    return this.prisma.$transaction(async (tx) => {
      const warningEvent = await tx.complianceEvent.create({
        data: {
          userId: targetEvent.userId,
          eventType: ComplianceEventType.RecordedWarning,
          eventDate: asOfDate,
          relatedDailyRecordId: targetEvent.relatedDailyRecordId,
          policySnapshot: { note: dto.note.trim() } as Prisma.InputJsonValue,
          followUpStatus: 'Recorded',
        },
      });

      await tx.complianceEvent.update({
        where: { id: targetEvent.id },
        data: { followUpStatus: 'WarningRecorded' },
      });

      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'COMPLIANCE_WARNING_RECORDED',
          relatedEntityType: 'ComplianceEvent',
          relatedEntityId: warningEvent.id,
          valueAfter: { note: dto.note.trim(), status: 'Recorded' },
        },
        tx,
      );

      this.logger.log(
        `Recorded Warning ${warningEvent.id} berhasil diterbitkan untuk user ${targetEvent.userId} oleh HRGA ${user.userId}`,
      );

      return {
        ...warningEvent,
        availableActions: this.computeAvailableActions(warningEvent, user),
      };
    });
  }

  /**
   * EPIC-12-T5: Endpoint POST /api/v1/compliance-events/:id/escalate-formal (SAD §9.7, §10.8, BR-05, BR-06).
   * Dilakukan secara manual oleh HRGA jika terjadi pelanggaran berulang pasca Recorded Warning.
   * Ini adalah titik akhir sistem WorkPulse, proses lanjut dilaksanakan di luar sistem.
   */
  async escalateFormal(
    user: CurrentUserPayload,
    id: string,
    dto: EscalateFormalDto,
  ) {
    const asOfDate = new Date();

    // 1. Validasi peran: hanya HRGA (SAD §10.8)
    if (user.role !== Role.HRGA) {
      throw new ForbiddenException(
        'Hanya HRGA yang memiliki kewenangan melakukan eskalasi proses formal (SAD §10.8)',
      );
    }

    // 2. Ambil event target
    const targetEvent = await this.prisma.complianceEvent.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!targetEvent) {
      throw new NotFoundException('Compliance event tidak ditemukan');
    }

    // 3. Validasi transisi status progression (SAD §9.7)
    if (targetEvent.eventType !== ComplianceEventType.RecordedWarning) {
      throw new ConflictException(
        'Eskalasi proses formal hanya dapat dilakukan setelah tahap Recorded Warning',
      );
    }

    if (targetEvent.followUpStatus === 'Escalated') {
      throw new ConflictException(
        'Eskalasi proses formal sudah pernah diproses untuk event ini',
      );
    }

    // 4. Eksekusi atomik
    return this.prisma.$transaction(async (tx) => {
      const escalatedEvent = await tx.complianceEvent.create({
        data: {
          userId: targetEvent.userId,
          eventType: ComplianceEventType.EscalatedFormalProcess,
          eventDate: asOfDate,
          relatedDailyRecordId: targetEvent.relatedDailyRecordId,
          policySnapshot: { note: dto.note.trim() } as Prisma.InputJsonValue,
          followUpStatus: 'Escalated',
        },
      });

      await tx.complianceEvent.update({
        where: { id: targetEvent.id },
        data: { followUpStatus: 'Escalated' },
      });

      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'COMPLIANCE_FORMAL_ESCALATED',
          relatedEntityType: 'ComplianceEvent',
          relatedEntityId: escalatedEvent.id,
          valueAfter: { note: dto.note.trim(), status: 'Escalated' },
        },
        tx,
      );

      this.logger.log(
        `Escalated Formal Process ${escalatedEvent.id} berhasil dicatat untuk user ${targetEvent.userId} oleh HRGA ${user.userId}`,
      );

      return {
        ...escalatedEvent,
        availableActions: this.computeAvailableActions(escalatedEvent, user),
      };
    });
  }
}
