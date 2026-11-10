import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  CanonicalRole,
  NotificationChannel,
  NoteVisibility,
} from '@prisma/client';
import { CreateManagerNoteDto } from '../dto/create-manager-note.dto';
import { toJakartaDateOnly } from '../../common/time/date-only.util';

@Injectable()
export class CoachingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Membuat catatan manajerial baru (Coaching, Recognition, Corrective — Prototipe 10).
   */
  async createManagerNote(authorUserId: string, dto: CreateManagerNoteDto) {
    if (authorUserId === dto.subjectUserId) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Atasan tidak dapat membuat catatan pembinaan/manajerial untuk dirinya sendiri.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const subjectUser = await this.prisma.user.findUnique({
      where: { id: dto.subjectUserId },
    });

    if (!subjectUser) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Karyawan yang dituju tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.verifyManagerialCoachingAccess(authorUserId, dto.subjectUserId);

    return this.prisma.$transaction(async (tx) => {
      const note = await tx.managerNote.create({
        data: {
          authorUserId,
          subjectUserId: dto.subjectUserId,
          noteType: dto.noteType,
          visibility: dto.visibility,
          content: dto.content.trim(),
          relatedEntityType: dto.relatedEntityType || null,
          relatedEntityId: dto.relatedEntityId || null,
        },
        include: {
          authorUser: { select: { id: true, fullName: true, email: true } },
          subjectUser: { select: { id: true, fullName: true, email: true } },
        },
      });

      // Jika dibagikan ke karyawan, kirimkan notifikasi
      if (dto.visibility === NoteVisibility.SHARED_WITH_EMPLOYEE) {
        let typeLabel = 'Bimbingan';
        if (dto.noteType === 'RECOGNITION') typeLabel = 'Apresiasi';
        if (dto.noteType === 'CORRECTIVE') typeLabel = 'Tindakan Korektif';

        const authorName = note.authorUser?.fullName || 'Atasan Langsung';

        await tx.notification.create({
          data: {
            recipientUserId: dto.subjectUserId,
            triggerType: 'MANAGER_NOTE_SHARED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: `Catatan ${typeLabel} Baru dari Atasan`,
            message: `${authorName} membagikan catatan ${typeLabel.toLowerCase()}: "${dto.content.trim()}"`,
            actionUrl: '/notifications',
            relatedEntityType: 'manager_notes',
            relatedEntityId: note.id,
          },
        });
      }

      return note;
    });
  }

  /**
   * Mengambil riwayat catatan untuk suatu subjek dengan penegakan visibilitas privasi.
   */
  async getNotesForSubject(actorUserId: string, subjectUserId: string) {
    const isSelf = actorUserId === subjectUserId;

    if (!isSelf) {
      await this.verifyManagerialCoachingAccess(actorUserId, subjectUserId);
    }

    return this.prisma.managerNote.findMany({
      where: {
        subjectUserId,
        ...(isSelf && { visibility: NoteVisibility.SHARED_WITH_EMPLOYEE }),
      },
      include: {
        authorUser: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Memastikan hanya atasan langsung/berjenjang struktural, Kepala Divisi terkait, HRGA, CEO, atau System Admin
   * yang dapat membuat catatan coaching atau membaca catatan rahasia (CONFIDENTIAL_MANAGER_ONLY).
   * Reviewer Sementara TIDAK memiliki hak akses ke Catatan Coaching.
   */
  private async verifyManagerialCoachingAccess(
    actorUserId: string,
    subjectUserId: string,
  ): Promise<void> {
    if (!this.prisma.organizationalAssignment?.findFirst) {
      return;
    }

    const today = toJakartaDateOnly(this.clockService.now());

    const actorAssignment = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId: actorUserId,
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    const actorRole = actorAssignment?.role;
    if (
      actorRole === CanonicalRole.SYSTEM_ADMIN ||
      actorRole === CanonicalRole.CEO_MANAGEMENT ||
      actorRole === CanonicalRole.HRGA
    ) {
      return;
    }

    const subjectAssignment = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId: subjectUserId,
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    if (
      actorRole === CanonicalRole.HEAD &&
      actorAssignment?.function &&
      actorAssignment.function === subjectAssignment?.function
    ) {
      return;
    }

    // Periksa rantai atasan langsung/berjenjang (directManagerId)
    let currentAssignment = subjectAssignment;
    const visited = new Set<string>();
    let depth = 0;

    while (currentAssignment?.directManagerId && depth < 15) {
      if (currentAssignment.directManagerId === actorUserId) {
        return;
      }
      if (visited.has(currentAssignment.directManagerId)) {
        break;
      }
      visited.add(currentAssignment.directManagerId);
      currentAssignment = await this.prisma.organizationalAssignment.findFirst({
        where: {
          userId: currentAssignment.directManagerId,
          effectiveDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }],
        },
        orderBy: { effectiveDate: 'desc' },
      });
      depth++;
    }

    throw new AppException({
      code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
      message:
        'Anda tidak memiliki wewenang struktural sebagai atasan langsung untuk membuat atau mengakses catatan pembinaan (coaching) karyawan ini.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }

  /**
   * Mengambil ringkasan pembinaan tim bagi atasan langsung / Head.
   */
  async getTeamOverview(managerUserId: string) {
    // Ambil karyawan yang dibawahi oleh manager ini
    const subordinates = await this.prisma.organizationalAssignment.findMany({
      where: {
        directManagerId: managerUserId,
        endDate: null,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, status: true } },
      },
    });

    const results = [];
    for (const sub of subordinates) {
      const notes = await this.prisma.managerNote.findMany({
        where: { subjectUserId: sub.userId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      const complianceEvents = await this.prisma.complianceEvent.findMany({
        where: { userId: sub.userId },
        orderBy: { eventDate: 'desc' },
        take: 1,
      });

      const totalNotes = await this.prisma.managerNote.count({
        where: { subjectUserId: sub.userId },
      });

      results.push({
        user: sub.user,
        jobTitle: sub.jobTitle,
        function: sub.function,
        totalNotes,
        lastNote: notes[0] || null,
        lastComplianceStage: complianceEvents[0]?.stage || 'CLEAN',
      });
    }

    return results;
  }
}

