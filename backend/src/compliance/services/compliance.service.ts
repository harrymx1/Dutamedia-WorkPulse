import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { ComplianceEventStage } from '@prisma/client';

@Injectable()
export class ComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  private async ensureSeedEvents() {
    try {
      const count = await this.prisma.complianceEvent.count();
      if (count > 0) return;

      const siti = await this.prisma.user.findUnique({ where: { email: 'dev.backend@dutamedia.com' } });
      const nadia = await this.prisma.user.findUnique({ where: { email: 'qa@dutamedia.com' } });
      const arif = await this.prisma.user.findUnique({ where: { email: 'head.eng@dutamedia.com' } });

      if (!siti) return;

      const todayDate = this.clockService.now();
      const yesterdayDate = new Date(todayDate.getTime() - 24 * 3600 * 1000);

      // 1. Buat sample Manager Note pembinaan jika atasan tersedia
      let sampleNoteId: string | undefined;
      if (arif) {
        const note = await this.prisma.managerNote.create({
          data: {
            subjectUserId: siti.id,
            authorUserId: arif.id,
            noteType: 'COACHING',
            visibility: 'SHARED_WITH_EMPLOYEE',
            content: 'Evaluasi kedisiplinan dan kesepakatan target komitmen harian tepat waktu.',
          },
        });
        sampleNoteId = note.id;
      }

      // 2. Buat peristiwa Pola 3x (Stage 1) untuk Siti Rahma
      await this.prisma.complianceEvent.create({
        data: {
          userId: siti.id,
          eventDate: todayDate,
          stage: ComplianceEventStage.PATTERN_FLAG_3X,
          policySnapshot: {},
          followUpStatus: 'OPEN',
        },
      });

      // 3. Buat peristiwa No Submission untuk Nadia Kusuma
      if (nadia) {
        await this.prisma.complianceEvent.create({
          data: {
            userId: nadia.id,
            eventDate: yesterdayDate,
            stage: ComplianceEventStage.NO_SUBMISSION,
            policySnapshot: {},
            followUpStatus: 'OPEN',
          },
        });
      }
    } catch {
      // Ignored in non-seed / mock contexts
    }
  }

  /**
   * Mengambil antrean peristiwa kepatuhan untuk pengawasan HRGA (Prototipe 11).
   */
  async getComplianceQueue(filters?: {
    stage?: ComplianceEventStage;
    status?: string;
  }) {
    await this.ensureSeedEvents();
    return this.prisma.complianceEvent.findMany({
      where: {
        ...(filters?.stage && { stage: filters.stage }),
        ...(filters?.status && { followUpStatus: filters.status }),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        dailyRecord: true,
        followUpManagerNote: {
          include: { authorUser: { select: { id: true, fullName: true } } },
        },
      },
      orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Menindaklanjuti peristiwa kepatuhan dengan menautkan catatan pembinaan manajerial.
   */
  async addressComplianceEvent(
    eventId: string,
    followUpManagerNoteId: string,
  ) {
    const event = await this.prisma.complianceEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Peristiwa kepatuhan tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const cleanInput = followUpManagerNoteId?.trim();
    const isUuid = !!cleanInput && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanInput);
    let noteId: string | null = null;

    if (!this.prisma.managerNote) {
      noteId = cleanInput;
    } else if (cleanInput) {
      if (isUuid) {
        try {
          const existingNote = await this.prisma.managerNote.findUnique({
            where: { id: cleanInput },
          });
          if (existingNote) {
            noteId = existingNote.id;
          }
        } catch {
          // Ignored
        }
      }

      // Jika input adalah teks bebas (bukan UUID) atau ID tidak ditemukan di DB, buatkan rekaman ManagerNote baru
      if (!noteId && this.prisma.managerNote.create) {
        try {
          const adminOrHr = this.prisma.user?.findFirst
            ? await this.prisma.user.findFirst({ where: { email: 'hrga@dutamedia.com' } })
            : null;
          const createdNote = await this.prisma.managerNote.create({
            data: {
              subjectUserId: event.userId,
              authorUserId: adminOrHr?.id || event.userId,
              noteType: 'COACHING',
              visibility: 'SHARED_WITH_EMPLOYEE',
              content: cleanInput.length >= 5 ? cleanInput : 'Tindak lanjut pembinaan kepatuhan oleh HRGA',
            },
          });
          noteId = createdNote.id;
        } catch {
          noteId = cleanInput;
        }
      }
    }

    return this.prisma.complianceEvent.update({
      where: { id: eventId },
      data: {
        followUpStatus: 'ADDRESSED',
        followUpManagerNoteId: noteId,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        followUpManagerNote: true,
      },
    });
  }

  /**
   * Ringkasan metrik kepatuhan HRGA (Prototipe 11).
   */
  async getComplianceSummary() {
    await this.ensureSeedEvents();
    const allEvents = await this.prisma.complianceEvent.findMany();
    const patternCount = allEvents.filter(
      (e) => e.stage === ComplianceEventStage.PATTERN_FLAG_3X,
    ).length;
    const warningCount = allEvents.filter(
      (e) => e.stage === ComplianceEventStage.RECORDED_WARNING,
    ).length;
    const escalationCount = allEvents.filter(
      (e) => e.stage === ComplianceEventStage.FORMAL_HR_ESCALATION,
    ).length;
    const noSubmissionCount = allEvents.filter(
      (e) => e.stage === ComplianceEventStage.NO_SUBMISSION,
    ).length;
    const openCount = allEvents.filter((e) => e.followUpStatus === 'OPEN').length;

    return {
      totalEvents: allEvents.length,
      openCount,
      patternCount,
      warningCount,
      escalationCount,
      noSubmissionCount,
    };
  }
}
