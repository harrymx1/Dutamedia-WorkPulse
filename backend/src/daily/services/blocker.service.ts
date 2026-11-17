import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { PolicyService } from '../../policy/services/policy.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  AuthorityContext,
  BlockerStatus,
  CanonicalFunction,
  CanonicalRole,
  NotificationChannel,
  PolicyCategory,
} from '@prisma/client';
import {
  AcceptRiskBlockerDto,
  BlockerDeleteReasonCategory,
  DeleteBlockerDto,
  RaiseBlockerDto,
  ReopenBlockerDto,
  ResolveBlockerDto,
  RespondSupportContributionDto,
  UpdateBlockerDto,
} from '../dto/raise-blocker.dto';
import { BlockerSlaConfig, CANONICAL_POLICY_FALLBACKS } from '../../policy/policy.constants';
import { toJakartaDateOnly } from '../../common/time/date-only.util';

// Kategori kendala yang membutuhkan keahlian divisi tertentu (bukan sekadar atasan langsung)
const BLOCKER_TYPE_DIVISION_ROUTING: Record<string, { function: CanonicalFunction; label: string }> = {
  INFRA: { function: CanonicalFunction.OperationsInfrastructure, label: 'Operations & Infrastructure' },
  FINANCE: { function: CanonicalFunction.Finance, label: 'Finance' },
  LEGAL: { function: CanonicalFunction.HRGA, label: 'HRGA & Legal' },
};

const REPORTER_REOPEN_ACTION_LABEL = 'Dikembalikan oleh Pelapor (Belum Memadai)';
const PIC_RESOLUTION_ACTION_LABEL = 'Solusi Diberikan oleh Penanggung Jawab';
const PIC_ACCEPTED_RISK_ACTION_PREFIX = '[PIC_ACCEPTED_RISK]';
const REPORTER_CLOSED_ACTION_LABEL = 'Dikonfirmasi & Ditutup oleh Pelapor';
const REPORTER_CLOSED_DEFAULT_NOTE =
  'Pelapor telah mengonfirmasi penyelesaian dan menutup tiket kendala secara permanen.';

// Prefix respons pelapor terhadap entri Peer Support (DEC-015) — mempertahankan entryType PEER_SUPPORT tanpa mengubah skema DB
const SUPPORT_RESOLVED_CLOSED_PREFIX = '[SUPPORT_RESOLVED_CLOSED]';
const SUPPORT_ACCEPTED_PROGRESS_PREFIX = '[SUPPORT_ACCEPTED_PROGRESS]';
const SUPPORT_REJECTED_PREFIX = '[SUPPORT_REJECTED]';
const REPORTER_PROGRESS_NOTE_MARKER = '\n[CATATAN_PROGRES_PELAPOR]: ';
const REPORTER_REJECTION_NOTE_MARKER = '\n[CATATAN_PENOLAKAN_PELAPOR]: ';

const DELETE_REASON_CATEGORY_LABELS: Record<BlockerDeleteReasonCategory, string> = {
  WRONG_INPUT_OR_DUPLICATE: 'Salah Input / Tiket Duplikat',
  SELF_RESOLVED: 'Sudah Teratasi Mandiri',
  NO_LONGER_RELEVANT: 'Kendala Tidak Jadi / Batal Relevan',
  OTHER: 'Alasan Lainnya',
};

const ACTIVE_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Menunggu Respons',
  ACKNOWLEDGED: 'Sedang Ditangani',
  IN_PROGRESS: 'Sedang Ditangani',
  RESOLVED: 'Solusi Diberikan',
  ACCEPTED_RISK: 'Risiko Diterima',
  CLOSED: 'Selesai Ditutup',
};

export type BlockerHistoryEntryType =
  | 'PEER_SUPPORT'
  | 'REPORTER_REOPEN'
  | 'PIC_RESOLUTION'
  | 'PIC_ACCEPTED_RISK'
  | 'REPORTER_CLOSED';

function resolveContributionEntryType(actionTaken?: string | null): BlockerHistoryEntryType {
  const normalized = actionTaken?.trim();
  if (normalized === REPORTER_REOPEN_ACTION_LABEL) return 'REPORTER_REOPEN';
  if (normalized === PIC_RESOLUTION_ACTION_LABEL) return 'PIC_RESOLUTION';
  if (normalized?.startsWith(PIC_ACCEPTED_RISK_ACTION_PREFIX)) return 'PIC_ACCEPTED_RISK';
  if (normalized === REPORTER_CLOSED_ACTION_LABEL) return 'REPORTER_CLOSED';
  return 'PEER_SUPPORT';
}

function stripSupportStatusPrefix(actionTaken?: string | null): string {
  const normalized = actionTaken?.trim() || '';
  for (const prefix of [
    SUPPORT_RESOLVED_CLOSED_PREFIX,
    SUPPORT_ACCEPTED_PROGRESS_PREFIX,
    SUPPORT_REJECTED_PREFIX,
  ]) {
    if (normalized.startsWith(prefix)) {
      return normalized.slice(prefix.length).trim();
    }
  }
  return normalized;
}

export interface ParsedBlockerDescription {
  title: string;
  body: string;
  expectedHelp: string | null;
}

export function flattenInlineNotificationText(value?: string | null): string {
  return (value || '').replace(/\s*\r?\n\s*/g, ' ').trim();
}

export function formatBlockerNotificationTitle(prefix: string, blockerTitle: string): string {
  const full = `${prefix}: ${flattenInlineNotificationText(blockerTitle)}`;
  return full.length <= 200 ? full : `${full.slice(0, 197)}...`;
}

export function parseBlockerDescription(rawDescription?: string | null): ParsedBlockerDescription {
  const raw = (rawDescription || '').trim();
  if (!raw) {
    return { title: 'Tiket Kendala', body: '-', expectedHelp: null };
  }
  const expMatch = raw.match(/\s*\(Ekspektasi:\s*([^)]*)\)\s*$/i);
  const expectedHelp = expMatch?.[1]?.trim() || null;
  const withoutExpectation = raw.replace(/\s*\(Ekspektasi:\s*[^)]*\)\s*$/i, '').trim();
  const bracketMatch = withoutExpectation.match(/^\[(.+?)\]\s*(.*)$/s);
  if (bracketMatch) {
    const cleanTitle = bracketMatch[1].trim() || 'Tiket Kendala';
    const remainingBody = bracketMatch[2].trim();
    return {
      title: cleanTitle,
      body: remainingBody || withoutExpectation,
      expectedHelp,
    };
  }
  return {
    title: withoutExpectation.slice(0, 90) || 'Tiket Kendala',
    body: withoutExpectation,
    expectedHelp,
  };
}

export function buildBlockerRaisedNotificationContent(params: {
  description?: string | null;
  reporterName?: string | null;
  type: string;
  severity: string;
  impact: string;
  slaLabel: string;
}): { title: string; message: string } {
  const parsed = parseBlockerDescription(params.description);
  const reporterName = params.reporterName?.trim() || 'Pelapor';
  const lines = [
    `${reporterName} melaporkan kendala ${params.type} (Tingkat ${params.severity}, Dampak ${params.impact}) yang dialokasikan kepada Anda dengan target respons ${params.slaLabel}.`,
    `Judul Kendala: ${flattenInlineNotificationText(parsed.title)}`,
    `Pelapor: ${reporterName}`,
    `Kategori Kendala: ${params.type}`,
    `Tingkat Keparahan: ${params.severity}`,
    `Dampak Kendala: ${params.impact}`,
    `Target Respons: ${params.slaLabel}`,
    `Deskripsi Kendala: ${flattenInlineNotificationText(parsed.body)}`,
  ];
  if (parsed.expectedHelp) {
    lines.push(`Ekspektasi Bantuan: ${flattenInlineNotificationText(parsed.expectedHelp)}`);
  }
  return {
    title: formatBlockerNotificationTitle('Kendala Baru Dialokasikan', parsed.title),
    message: lines.join('\n'),
  };
}

export function buildBlockerCriticalEscalationNotificationContent(params: {
  description?: string | null;
  reporterName?: string | null;
  ownerName?: string | null;
  type: string;
  severity: string;
  impact: string;
  slaLabel: string;
}): { title: string; message: string } {
  const parsed = parseBlockerDescription(params.description);
  const reporterName = params.reporterName?.trim() || 'Pelapor';
  const ownerName = params.ownerName?.trim() || 'Penanggung Jawab';
  const lines = [
    `Kendala darurat dari ${reporterName} (Tingkat CRITICAL, Dampak ${params.impact}) diteruskan secara paralel kepada Anda sebagai pimpinan eskalasi dengan target penyelesaian ${params.slaLabel}.`,
    `Judul Kendala: ${flattenInlineNotificationText(parsed.title)}`,
    `Pelapor: ${reporterName}`,
    `Penanggung Jawab Awal (PIC): ${ownerName}`,
    `Kategori Kendala: ${params.type}`,
    `Tingkat Keparahan: ${params.severity}`,
    `Dampak Kendala: ${params.impact}`,
    `Target Penyelesaian: ${params.slaLabel}`,
    `Deskripsi Kendala: ${flattenInlineNotificationText(parsed.body)}`,
  ];
  if (parsed.expectedHelp) {
    lines.push(`Ekspektasi Bantuan: ${flattenInlineNotificationText(parsed.expectedHelp)}`);
  }
  return {
    title: formatBlockerNotificationTitle('Eskalasi Darurat (CRITICAL)', parsed.title),
    message: lines.join('\n'),
  };
}

const SEVERITY_FALLBACK_SLA_LABELS: Record<string, string> = {
  CRITICAL: '2 jam',
  HIGH: '4 jam',
  MEDIUM: '8 jam',
  LOW: '24 jam',
};

export function extractSolutionNoteFromNotificationText(message?: string | null): string | null {
  if (!message) return null;
  const lineMatch = message.match(/^Catatan Solusi:\s*(.+)$/im);
  if (lineMatch?.[1]?.trim()) {
    return lineMatch[1].trim();
  }
  const match = message.match(/solusi pada tiket kendala Anda:\s*"([^"]+)"/i);
  return match?.[1]?.trim() || null;
}

export function extractRiskFromNotificationText(
  message?: string | null,
): { justification: string; mitigation: string } | null {
  if (!message) return null;
  const justMatch = message.match(/^Justifikasi Risiko:\s*(.+)$/im);
  const planMatch = message.match(/^Rencana Mitigasi:\s*(.+)$/im);
  if (justMatch?.[1]?.trim() || planMatch?.[1]?.trim()) {
    return {
      justification: justMatch?.[1]?.trim() || '-',
      mitigation: planMatch?.[1]?.trim() || '-',
    };
  }
  const match = message.match(
    /Risiko Diterima\s*\("([^"]+)"\)\s*dengan rencana mitigasi:\s*"([^"]+)"/i,
  );
  if (!match) return null;
  return {
    justification: match[1].trim(),
    mitigation: match[2].trim(),
  };
}

export function enrichLegacyBlockerNotification(
  notif: { title?: string | null; message?: string | null; triggerType?: string | null },
  ticket: {
    description?: string | null;
    type?: string | null;
    severity?: string | null;
    impact?: string | null;
    resolutionNote?: string | null;
    raisedBy?: { fullName?: string | null } | null;
    assignedOwner?: { fullName?: string | null } | null;
  },
): { title: string; message: string } | null {
  const existingMessage = (notif.message || '').trim();
  if (!existingMessage) {
    return null;
  }

  const reporterFullName = ticket.raisedBy?.fullName?.trim() || '';
  const ownerFullName = ticket.assignedOwner?.fullName?.trim() || 'Penanggung Jawab';
  const actorName = reporterFullName || 'Pelapor';
  const trigger = notif.triggerType || '';

  if (existingMessage.includes('\n')) {
    const originalLines = existingMessage.split('\n');
    const filteredLines = originalLines
      .filter((line) => !line.trim().startsWith('Tindak Lanjut Anda:'))
      .flatMap((line) => {
        const trimmed = line.trim();
        if (/^Status Tiket:\s*Sedang Ditangani\s*\(.*\)$/i.test(trimmed)) {
          return ['Status Tiket: Sedang Ditangani'];
        }
        if (/^Aksi Bantuan yang Ditolak:\s*/i.test(trimmed)) {
          return [trimmed.replace(/^Aksi Bantuan yang Ditolak:\s*/i, 'Bantuan yang Dicoba: ')];
        }
        if (/^Alasan Penolakan Pelapor:\s*/i.test(trimmed)) {
          return [
            trimmed.replace(
              /^Alasan Penolakan Pelapor:\s*/i,
              'Catatan / Kendala yang Masih Terjadi: ',
            ),
          ];
        }
        const katMatch = trimmed.match(
          /^Kategori\s*&\s*Keparahan:\s*(.+?)\s*—\s*Tingkat\s*(.+?)\s*\(Dampak:\s*(.+?)\)\s*$/i,
        );
        if (katMatch) {
          return [
            `Kategori Kendala: ${katMatch[1].trim()}`,
            `Tingkat Keparahan: ${katMatch[2].trim()}`,
            `Dampak Kendala: ${katMatch[3].trim()}`,
          ];
        }
        return [line];
      });

    if (filteredLines.length > 0) {
      const firstLine = filteredLines[0].trim();
      const firstLineHasQuote = firstLine.includes('"');
      if (
        trigger === 'BLOCKER_SUPPORT_REJECTED' ||
        /menolak kontribusi bantuan|setelah mencoba bantuan/i.test(firstLine)
      ) {
        filteredLines[0] = `${actorName} menginformasikan bahwa bantuan yang diberikan belum membantu mengatasi kendala.`;
      } else if (
        trigger === 'BLOCKER_SUPPORT_ACCEPTED' &&
        (firstLineHasQuote || /^Pelapor\s+menerima\b/.test(firstLine))
      ) {
        filteredLines[0] = `${actorName} mengonfirmasi bahwa kontribusi bantuan telah membantu sebagian progres, namun kendala utama masih belum selesai.`;
      } else if (trigger === 'BLOCKER_SUPPORT_CONTRIBUTED' && firstLineHasQuote) {
        const supporterLine = filteredLines.find((l) => l.trim().startsWith('Pemberi Bantuan:'));
        const supporterFromLine =
          supporterLine?.split(':').slice(1).join(':').trim() || ownerFullName;
        filteredLines[0] = `${supporterFromLine} telah memberikan kontribusi bantuan pada tiket kendala Anda. Silakan tinjau rincian bantuan di bawah ini dan berikan tanggapan Anda.`;
      } else if (
        trigger === 'BLOCKER_CLOSED_BY_REPORTER' &&
        firstLine.includes('kontribusi bantuan') &&
        firstLineHasQuote
      ) {
        filteredLines[0] = `${actorName} menerima kontribusi bantuan sebagai penyelesaian tuntas dan telah menutup tiket kendala ini.`;
      } else if (trigger === 'BLOCKER_RESOLVED_AWAITING_CONFIRMATION' && firstLineHasQuote) {
        filteredLines[0] = `${ownerFullName} telah memberikan solusi pada tiket kendala Anda. Mohon verifikasi rincian solusi di bawah ini untuk mengonfirmasi penutupan tiket atau kembalikan jika kendala masih berlanjut.`;
      } else if (trigger === 'BLOCKER_ACCEPTED_RISK_AWAITING_CONFIRMATION' && firstLineHasQuote) {
        filteredLines[0] = `${ownerFullName} telah menetapkan keputusan Risiko Diterima beserta arahan mitigasi sementara. Mohon tinjau rincian arahan di bawah ini dan konfirmasi penutupan tiket.`;
      } else if (trigger === 'BLOCKER_REOPENED_BY_REPORTER' && firstLineHasQuote) {
        filteredLines[0] = `${actorName} menyatakan bahwa solusi atau arahan mitigasi belum memadai sehingga status tiket dikembalikan ke Sedang Ditangani.`;
      } else if (trigger === 'BLOCKER_UPDATED_BY_REPORTER' && firstLineHasQuote) {
        filteredLines[0] = `${actorName} telah memperbarui rincian laporan kendala aktif.`;
      } else if (trigger === 'BLOCKER_DELETED_BY_REPORTER' && firstLineHasQuote) {
        filteredLines[0] = `${actorName} telah menghapus tiket kendala dari antrean aktif.`;
      } else if (reporterFullName) {
        filteredLines[0] = filteredLines[0].replace(
          /^Pelapor\s+(menolak|menerima|menyatakan|telah)\b/,
          `${reporterFullName} $1`,
        );
      }

      if (
        reporterFullName &&
        !filteredLines.some((line) => line.trim().startsWith('Pelapor:'))
      ) {
        const judulIdx = filteredLines.findIndex((line) =>
          line.trim().startsWith('Judul Kendala:'),
        );
        if (judulIdx >= 0) {
          filteredLines.splice(judulIdx + 1, 0, `Pelapor: ${reporterFullName}`);
        } else {
          filteredLines.splice(1, 0, `Pelapor: ${reporterFullName}`);
        }
      }
    }

    const parsedFallback = parseBlockerDescription(ticket.description);
    const currentTitle = (notif.title || '').trim();
    const nextTitle = /^(?:Bantuan Ditolak Pelapor|Bantuan Belum Mengatasi Kendala):/.test(
      currentTitle,
    )
      ? currentTitle.replace(
          /^(?:Bantuan Ditolak Pelapor|Bantuan Belum Mengatasi Kendala):/,
          'Bantuan Belum Membantu:',
        )
      : /^Bantuan Diterima \(Belum Selesai\):/.test(currentTitle)
        ? currentTitle.replace(
            /^Bantuan Diterima \(Belum Selesai\):/,
            'Bantuan Diterima (Membantu Sebagian):',
          )
        : currentTitle ||
          formatBlockerNotificationTitle('Pemberitahuan Kendala', parsedFallback.title);

    const nextMessage = filteredLines.join('\n').trim();
    if (nextMessage === existingMessage && nextTitle === currentTitle) {
      return null;
    }

    return {
      title: nextTitle,
      message: nextMessage,
    };
  }

  const type = ticket.type || 'OTHER';
  const severity = ticket.severity || 'HIGH';
  const impact = ticket.impact || 'TASK';
  const reporterName = ticket.raisedBy?.fullName?.trim() || 'Pelapor';
  const ownerName = ticket.assignedOwner?.fullName?.trim() || 'Penanggung Jawab';
  const defaultSla = SEVERITY_FALLBACK_SLA_LABELS[severity] || '4 jam';

  if (trigger === 'BLOCKER_RAISED') {
    const slaMatch = existingMessage.match(/target respon[s]?\s+([^.]+)\./i);
    return buildBlockerRaisedNotificationContent({
      description: ticket.description,
      reporterName,
      type,
      severity,
      impact,
      slaLabel: slaMatch?.[1]?.trim() || defaultSla,
    });
  }

  if (trigger === 'BLOCKER_CRITICAL_ESCALATION') {
    const slaMatch = existingMessage.match(/target penyelesaian\s+([^)]+)\)/i);
    return buildBlockerCriticalEscalationNotificationContent({
      description: ticket.description,
      reporterName,
      ownerName,
      type,
      severity,
      impact,
      slaLabel: slaMatch?.[1]?.trim() || '2 jam',
    });
  }

  const parsed = parseBlockerDescription(ticket.description);
  const introLine = flattenInlineNotificationText(existingMessage);
  const baseLines = [
    introLine,
    `Judul Kendala: ${flattenInlineNotificationText(parsed.title)}`,
    `Pelapor: ${reporterName}`,
    `Penanggung Jawab (PIC): ${ownerName}`,
  ];

  if (trigger === 'BLOCKER_RESOLVED_AWAITING_CONFIRMATION') {
    const sol = extractSolutionNoteFromNotificationText(existingMessage) || ticket.resolutionNote?.trim();
    baseLines.push('Status Tiket: Solusi Diberikan (Menunggu Konfirmasi Pelapor)');
    if (sol) {
      baseLines.push(`Catatan Solusi: ${flattenInlineNotificationText(sol)}`);
    }
    return {
      title: formatBlockerNotificationTitle('Solusi Diberikan', parsed.title),
      message: baseLines.join('\n'),
    };
  }

  if (trigger === 'BLOCKER_ACCEPTED_RISK_AWAITING_CONFIRMATION') {
    const risk = extractRiskFromNotificationText(existingMessage);
    baseLines.push('Status Tiket: Risiko Diterima (Menunggu Konfirmasi Pelapor)');
    if (risk?.justification) {
      baseLines.push(`Justifikasi Risiko: ${flattenInlineNotificationText(risk.justification)}`);
    }
    if (risk?.mitigation) {
      baseLines.push(`Rencana Mitigasi: ${flattenInlineNotificationText(risk.mitigation)}`);
    }
    return {
      title: formatBlockerNotificationTitle('Risiko Diterima (Mitigasi Aktif)', parsed.title),
      message: baseLines.join('\n'),
    };
  }

  if (trigger === 'BLOCKER_REOPENED_BY_REPORTER') {
    const reopenMatch = existingMessage.match(/belum memadai:\s*"([^"]+)"/i);
    baseLines.push('Status Tiket: Sedang Ditangani (Dikembalikan oleh Pelapor)');
    if (reopenMatch?.[1]?.trim()) {
      baseLines.push(`Alasan Pengembalian: ${flattenInlineNotificationText(reopenMatch[1])}`);
    }
    return {
      title: formatBlockerNotificationTitle('Tiket Dikembalikan Pelapor', parsed.title),
      message: baseLines.join('\n'),
    };
  }

  if (trigger === 'BLOCKER_CLOSED_BY_REPORTER') {
    baseLines.push('Status Tiket: Selesai Ditutup');
    baseLines.push('Konfirmasi Pelapor: Penyelesaian atau arahan mitigasi telah diverifikasi dan diterima oleh pelapor.');
    return {
      title: formatBlockerNotificationTitle('Tiket Ditutup Pelapor', parsed.title),
      message: baseLines.join('\n'),
    };
  }

  return null;
}

@Injectable()
export class BlockerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
    private readonly policyService: PolicyService,
  ) {}

  /**
   * Mengajukan kendala baru (Instant Blocker atau via Form, Prototipe 05).
   */
  async raiseBlocker(userId: string, dto: RaiseBlockerDto) {
    if (
      dto.ownerNeededType === AuthorityContext.PROJECT_AUTHORITY &&
      (!dto.projectCodeReference || dto.projectCodeReference.trim().length === 0)
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Kendala dengan konteks Kewenangan Proyek WAJIB menyertakan kode proyek referensi (DEC-002, Prototipe 05).',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Resolusi assignedOwnerId jika tidak ditentukan secara eksplisit
    let targetOwnerId = dto.assignedOwnerId;
    if (!targetOwnerId) {
      const suggestion = await this.resolveSuggestedOwner(userId, {
        type: dto.type,
        ownerNeededType: dto.ownerNeededType,
        projectCode: dto.projectCodeReference,
      });
      targetOwnerId = suggestion.owner?.id;
    }

    if (!targetOwnerId) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tidak dapat menentukan penanggung jawab eskalasi secara otomatis. Silakan pilih penanggung jawab khusus.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const assignedOwner = await this.prisma.user.findUnique({
      where: { id: targetOwnerId },
    });

    if (!assignedOwner) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna yang ditunjuk sebagai pemilik eskalasi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Target respons SLA ditentukan oleh tingkat keparahan (satu sumber kebijakan)
    const slaMinutesMap = await this.getSlaMinutesMap();
    const slaMinutes = slaMinutesMap[dto.severity as keyof typeof slaMinutesMap];
    const slaLabel = slaMinutes % 60 === 0 ? `${slaMinutes / 60} jam` : `${slaMinutes} menit`;

    const raisedAt = this.clockService.now();
    const targetResolutionAt = new Date(raisedAt.getTime() + slaMinutes * 60 * 1000);
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.blockerTicket.create({
        data: {
          raisedByUserId: userId,
          linkedCommitmentId: dto.linkedCommitmentId || null,
          type: dto.type,
          severity: dto.severity,
          impact: dto.impact,
          description: dto.description.trim(),
          ownerNeededType: dto.ownerNeededType,
          assignedOwnerId: targetOwnerId,
          projectCodeReference: dto.projectCodeReference ? dto.projectCodeReference.trim() : null,
          status: BlockerStatus.OPEN,
          raisedAt,
          targetResolutionAt,
        },
        include: {
          raisedBy: { select: { id: true, fullName: true, email: true } },
          assignedOwner: { select: { id: true, fullName: true, email: true } },
        },
      });

      const reporterName = ticket.raisedBy?.fullName || 'Pelapor';
      const raisedNotif = buildBlockerRaisedNotificationContent({
        description: dto.description,
        reporterName,
        type: dto.type,
        severity: dto.severity,
        impact: dto.impact,
        slaLabel,
      });

      // Kirim notifikasi in-app ke pemilik yang ditunjuk (Jenjang Pertama)
      await tx.notification.create({
        data: {
          recipientUserId: targetOwnerId,
          triggerType: 'BLOCKER_RAISED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: raisedNotif.title,
          message: raisedNotif.message,
          actionUrl: '/blockers',
          relatedEntityType: 'blocker_tickets',
          relatedEntityId: ticket.id,
        },
      });

      // Untuk kendala darurat (CRITICAL), kirim eskalasi paralel seketika ke jenjang pimpinan di atasnya tanpa menunggu batas waktu normal
      if (dto.severity === 'CRITICAL') {
        const nextAuthorityId = await this.resolveNextEscalationAuthority(
          targetOwnerId,
          dto.ownerNeededType,
          dto.projectCodeReference,
        );
        if (nextAuthorityId && nextAuthorityId !== targetOwnerId && nextAuthorityId !== userId) {
          const criticalNotif = buildBlockerCriticalEscalationNotificationContent({
            description: dto.description,
            reporterName,
            ownerName: ticket.assignedOwner?.fullName || assignedOwner.fullName,
            type: dto.type,
            severity: dto.severity,
            impact: dto.impact,
            slaLabel,
          });
          await tx.notification.create({
            data: {
              recipientUserId: nextAuthorityId,
              triggerType: 'BLOCKER_CRITICAL_ESCALATION',
              channel: NotificationChannel.IN_APP_CENTER,
              title: criticalNotif.title,
              message: criticalNotif.message,
              actionUrl: '/blockers',
              relatedEntityType: 'blocker_tickets',
              relatedEntityId: ticket.id,
            },
          });
        }
      }

      return ticket;
    });
  }

  private activeDateWhere(today: Date) {
    return {
      effectiveDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    };
  }

  private async isUserActive(userId: string): Promise<boolean> {
    if (!this.prisma.user?.findFirst) {
      return true;
    }
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId, status: 'ACTIVE' },
        select: { id: true },
      });
      return Boolean(user);
    } catch {
      return false;
    }
  }

  private async isUserOnApprovedLeave(userId: string, today: Date): Promise<boolean> {
    if (!this.prisma.leaveRequest?.findFirst) {
      return false;
    }
    try {
      const activeLeave = await this.prisma.leaveRequest.findFirst({
        where: {
          userId,
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      });
      return Boolean(activeLeave);
    } catch {
      return false;
    }
  }

  private async findActiveTemporaryDelegate(
    targetFunction: CanonicalFunction,
    excludeUserIds: string[],
    today: Date,
  ): Promise<string | null> {
    const repo = this.prisma.temporaryReviewerAssignment;
    if (!repo) {
      return null;
    }

    try {
      const candidates = repo.findMany
        ? await repo.findMany({
            where: {
              targetFunction,
              effectiveDate: { lte: today },
              expiryDate: { gte: today },
              delegateUserId: { notIn: excludeUserIds },
            },
            orderBy: { createdAt: 'desc' },
          })
        : repo.findFirst
          ? [
              await repo.findFirst({
                where: {
                  targetFunction,
                  effectiveDate: { lte: today },
                  expiryDate: { gte: today },
                  delegateUserId: { notIn: excludeUserIds },
                },
                orderBy: { createdAt: 'desc' },
              }),
            ].filter(Boolean)
          : [];

      for (const item of candidates) {
        const delegateId = item?.delegateUserId;
        if (!delegateId || excludeUserIds.includes(delegateId)) continue;
        if (!(await this.isUserActive(delegateId))) continue;
        if (await this.isUserOnApprovedLeave(delegateId, today)) continue;
        return delegateId;
      }
    } catch {
      // Lanjut ke jalur normal
    }
    return null;
  }

  /**
   * Menentukan pejabat eskalasi satu tingkat di atas penanggung jawab saat ini (N+1 -> N+2 -> Direksi),
   * serta otomatis melewati pejabat yang sedang cuti resmi.
   */
  private async resolveNextEscalationAuthority(
    currentOwnerId: string,
    ownerNeededType?: AuthorityContext,
    projectCode?: string | null,
  ): Promise<string | null> {
    const today = toJakartaDateOnly(this.clockService.now());

    try {
      if (
        ownerNeededType === AuthorityContext.PROJECT_AUTHORITY &&
        projectCode?.trim() &&
        this.prisma.projectAuthorityMapping?.findFirst
      ) {
        const mapping = await this.prisma.projectAuthorityMapping.findFirst({
          where: {
            projectCode: projectCode.trim(),
            ...this.activeDateWhere(today),
          },
          orderBy: { createdAt: 'desc' },
        });
        if (mapping?.escalationReviewerId && mapping.escalationReviewerId !== currentOwnerId) {
          const resolved = await this.resolveAvailableManagerChain(
            mapping.escalationReviewerId,
            currentOwnerId,
            mapping.involvedFunction,
            { skipTempDelegation: true, excludeUserIds: [currentOwnerId] },
          );
          if (resolved.userId && resolved.userId !== currentOwnerId) {
            return resolved.userId;
          }
        }
      }

      if (this.prisma.organizationalAssignment?.findFirst) {
        const ownerAssign = await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: currentOwnerId,
            ...this.activeDateWhere(today),
          },
          orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
        });
        if (ownerAssign?.directManagerId && ownerAssign.directManagerId !== currentOwnerId) {
          const resolved = await this.resolveAvailableManagerChain(
            ownerAssign.directManagerId,
            currentOwnerId,
            ownerAssign.function,
            { skipTempDelegation: true, excludeUserIds: [currentOwnerId] },
          );
          if (resolved.userId && resolved.userId !== currentOwnerId) {
            return resolved.userId;
          }
        }

        // Jika penanggung jawab saat ini bukan CEO, naik ke CEO / Direksi aktif yang tidak sedang cuti
        if (ownerAssign?.role !== CanonicalRole.CEO_MANAGEMENT) {
          const ceoAssign = await this.prisma.organizationalAssignment.findFirst({
            where: {
              role: CanonicalRole.CEO_MANAGEMENT,
              ...this.activeDateWhere(today),
              userId: { not: currentOwnerId },
              user: { status: 'ACTIVE' },
            },
            orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
          });
          if (
            ceoAssign?.userId &&
            ceoAssign.userId !== currentOwnerId &&
            !(await this.isUserOnApprovedLeave(ceoAssign.userId, today))
          ) {
            return ceoAssign.userId;
          }
        }
      }
    } catch {
      // Abaikan jika gagal menelusuri jenjang eskalasi berikutnya
    }
    return null;
  }

  /**
   * Memeriksa apakah kandidat penanggung jawab sedang cuti resmi (APPROVED Leave) atau memiliki
   * Reviewer Sementara aktif hari ini. Jika ada Reviewer Sementara aktif pada divisi terkait, alihkan ke
   * Reviewer Sementara (kecuali pelapor sudah setingkat HEAD/CEO); jika sedang cuti tanpa delegasi, naik
   * otomatis 1 tingkat ke atasan di atasnya (N+1 -> N+2 -> CEO).
   */
  private async resolveAvailableManagerChain(
    initialManagerId: string | null | undefined,
    reporterUserId: string,
    reporterFunction?: CanonicalFunction | null,
    options?: {
      reporterRole?: CanonicalRole | string | null;
      skipTempDelegation?: boolean;
      excludeUserIds?: string[];
    },
  ): Promise<{ userId: string | null; routingNote?: string }> {
    const today = toJakartaDateOnly(this.clockService.now());
    const excludeIds = Array.from(new Set([reporterUserId, ...(options?.excludeUserIds || [])]));

    // 1. Jika ada Reviewer Sementara aktif pada divisi pelapor (dan pelapor bukan HEAD/CEO yang naik ke Direksi), prioritaskan
    const canUseDivisionDelegation =
      !options?.skipTempDelegation &&
      Boolean(initialManagerId) &&
      Boolean(reporterFunction) &&
      options?.reporterRole !== CanonicalRole.HEAD &&
      options?.reporterRole !== CanonicalRole.CEO_MANAGEMENT;

    if (canUseDivisionDelegation && reporterFunction) {
      const activeDelegateId = await this.findActiveTemporaryDelegate(reporterFunction, excludeIds, today);
      if (activeDelegateId) {
        return {
          userId: activeDelegateId,
          routingNote: 'Dialihkan otomatis ke Reviewer Sementara aktif untuk fungsi terkait.',
        };
      }
    }

    // 2. Telusuri rantai atasan (maksimal 4 tingkat hingga CEO) jika kandidat sedang cuti resmi
    let currentCandidateId = initialManagerId || null;
    const visited = new Set<string>();
    let bypassedDueToLeave = false;

    for (let depth = 0; depth < 4 && currentCandidateId; depth++) {
      if (visited.has(currentCandidateId)) break;
      visited.add(currentCandidateId);

      const onLeave = await this.isUserOnApprovedLeave(currentCandidateId, today);

      if (!onLeave && !excludeIds.includes(currentCandidateId)) {
        return {
          userId: currentCandidateId,
          routingNote: bypassedDueToLeave
            ? 'Penanggung jawab utama sedang cuti resmi dan belum memiliki Reviewer Sementara aktif, sehingga diteruskan otomatis ke atasan struktural di atasnya.'
            : undefined,
        };
      }

      if (onLeave) {
        bypassedDueToLeave = true;
      }

      // Jika sedang cuti, cek apakah ada Reviewer Sementara aktif di fungsi terkait
      if (!options?.skipTempDelegation && reporterFunction) {
        const fallbackDelegateId = await this.findActiveTemporaryDelegate(
          reporterFunction,
          [...excludeIds, currentCandidateId],
          today,
        );
        if (fallbackDelegateId) {
          return {
            userId: fallbackDelegateId,
            routingNote:
              'Penanggung jawab utama sedang cuti resmi, sehingga dialihkan otomatis ke Reviewer Sementara aktif.',
          };
        }
      }

      // Naik 1 tingkat ke atasan di atasnya (N+1 -> N+2 -> CEO)
      if (this.prisma.organizationalAssignment?.findFirst) {
        const nextAssign = await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: currentCandidateId,
            ...this.activeDateWhere(today),
          },
          orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
        });
        currentCandidateId = nextAssign?.directManagerId || null;
      } else {
        break;
      }
    }

    const fallbackId =
      currentCandidateId && !excludeIds.includes(currentCandidateId)
        ? currentCandidateId
        : !bypassedDueToLeave
          ? initialManagerId || null
          : null;

    return {
      userId: fallbackId,
      routingNote:
        bypassedDueToLeave && fallbackId
          ? 'Penanggung jawab utama sedang cuti resmi dan belum memiliki Reviewer Sementara aktif, sehingga diteruskan otomatis ke atasan struktural di atasnya.'
          : undefined,
    };
  }

  /**
   * Peta target respons SLA (menit) per tingkat keparahan dari kebijakan aktif.
   */
  async getSlaMinutesMap(): Promise<Record<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', number>> {
    const fallback = (CANONICAL_POLICY_FALLBACKS[PolicyCategory.BLOCKER_SLA] as BlockerSlaConfig).severityMinutes!;
    try {
      const policy = await this.policyService.getActivePolicy(PolicyCategory.BLOCKER_SLA);
      const configured = (policy?.configurationValues as Partial<BlockerSlaConfig> | undefined)?.severityMinutes;
      return { ...fallback, ...(configured || {}) };
    } catch {
      return fallback;
    }
  }

  /**
   * Menentukan penanggung jawab yang paling tepat ketika pelapor tidak menunjuk siapa pun.
   * - Kewenangan Proyek: Pimpinan Proyek -> Reviewer Sementara / Pengarah Proyek -> rantai atasan hingga CEO (melewati yang cuti).
   * - Kewenangan Struktural: kendala lintas fungsi (INFRA, FINANCE, LEGAL) ke fungsi terkait (dengan cek cuti/delegasi/chain);
   *   selain itu ke Atasan Langsung / Reviewer Sementara / rantai atasan hingga CEO.
   */
  async resolveSuggestedOwner(
    userId: string,
    input: { type?: string; ownerNeededType?: AuthorityContext; projectCode?: string | null },
  ): Promise<{
    owner: { id: string; fullName: string; jobTitle: string | null } | null;
    reason: 'PROJECT_LEAD' | 'DIVISION_HEAD' | 'DIRECT_MANAGER' | 'NONE';
    divisionLabel?: string;
    routingNote?: string;
  }> {
    const today = toJakartaDateOnly(this.clockService.now());

    const pick = async (id?: string | null) => {
      if (!id) return null;
      const u = await this.prisma.user.findFirst({
        where: { id, status: 'ACTIVE' },
        select: {
          id: true,
          fullName: true,
          orgAssignments: {
            where: this.activeDateWhere(today),
            orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
            take: 1,
            select: { jobTitle: true },
          },
        },
      });
      return u ? { id: u.id, fullName: u.fullName, jobTitle: u.orgAssignments?.[0]?.jobTitle || null } : null;
    };

    if (input.ownerNeededType === AuthorityContext.PROJECT_AUTHORITY && input.projectCode?.trim()) {
      const mapping = await this.prisma.projectAuthorityMapping.findFirst({
        where: {
          projectCode: input.projectCode.trim(),
          ...this.activeDateWhere(today),
        },
        orderBy: { createdAt: 'desc' },
      });

      if (mapping) {
        if (mapping.projectManagerId && mapping.projectManagerId !== userId) {
          const pmOnLeave = await this.isUserOnApprovedLeave(mapping.projectManagerId, today);
          if (!pmOnLeave) {
            const pmOwner = await pick(mapping.projectManagerId);
            if (pmOwner) return { owner: pmOwner, reason: 'PROJECT_LEAD' };
          }
        }

        if (mapping.involvedFunction) {
          const tempDelegateId = await this.findActiveTemporaryDelegate(
            mapping.involvedFunction,
            [userId, mapping.projectManagerId].filter(Boolean) as string[],
            today,
          );
          if (tempDelegateId) {
            const delegateOwner = await pick(tempDelegateId);
            if (delegateOwner) {
              return {
                owner: delegateOwner,
                reason: 'PROJECT_LEAD',
                routingNote:
                  'Pimpinan proyek utama sedang cuti/tidak tersedia, sehingga dialihkan otomatis ke Reviewer Sementara aktif.',
              };
            }
          }
        }

        const escChain = await this.resolveAvailableManagerChain(
          mapping.escalationReviewerId,
          userId,
          mapping.involvedFunction,
          { skipTempDelegation: true },
        );
        const escOwner = await pick(escChain.userId);
        if (escOwner) {
          return {
            owner: escOwner,
            reason: 'PROJECT_LEAD',
            routingNote:
              escChain.routingNote ||
              (mapping.projectManagerId
                ? 'Pimpinan proyek utama sedang cuti resmi dan belum memiliki Reviewer Sementara aktif, sehingga diteruskan otomatis ke pengarah proyek (atasan pengesah cuti).'
                : undefined),
          };
        }
      }
    }

    if (input.ownerNeededType !== AuthorityContext.PROJECT_AUTHORITY) {
      const target = BLOCKER_TYPE_DIVISION_ROUTING[input.type || ''];
      if (target) {
        // 1. Prioritaskan Reviewer Sementara resmi jika telah diterbitkan mandat aktif (DEC-014)
        const divisionDelegateId = await this.findActiveTemporaryDelegate(target.function, [userId], today);
        if (divisionDelegateId) {
          const delegateOwner = await pick(divisionDelegateId);
          if (delegateOwner) {
            return {
              owner: delegateOwner,
              reason: 'DIVISION_HEAD',
              divisionLabel: target.label,
              routingNote: `Dialihkan otomatis ke Reviewer Sementara aktif untuk divisi ${target.label}.`,
            };
          }
        }

        // 2. Cari HANYA Pimpinan Utama Divisi (HEAD / HRGA). Dilarang keras menunjuk bawahan (SUPERVISOR / EMPLOYEE)
        //    secara otomatis tanpa mandat Reviewer Sementara (DEC-014).
        const divisionHeads = await this.prisma.organizationalAssignment.findMany({
          where: {
            function: target.function,
            ...this.activeDateWhere(today),
            userId: { not: userId },
            role: { in: [CanonicalRole.HEAD, CanonicalRole.HRGA] },
            user: { status: 'ACTIVE' },
          },
          select: { userId: true, role: true, directManagerId: true },
        });
        const rank = ['HEAD', 'HRGA'];
        divisionHeads.sort((a, b) => {
          const ra = rank.indexOf(a.role);
          const rb = rank.indexOf(b.role);
          return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
        });

        let primaryHeadOnLeaveId: string | null = null;
        for (const headCandidate of divisionHeads) {
          const onLeave = await this.isUserOnApprovedLeave(headCandidate.userId, today);
          if (!onLeave) {
            const owner = await pick(headCandidate.userId);
            if (owner) {
              return {
                owner,
                reason: 'DIVISION_HEAD',
                divisionLabel: target.label,
              };
            }
          } else if (!primaryHeadOnLeaveId) {
            primaryHeadOnLeaveId = headCandidate.userId;
          }
        }

        // 3. Jika Pimpinan Utama Divisi sedang cuti resmi tanpa Reviewer Sementara, tanggung jawab HANYA naik vertikal
        //    ke atasan struktural di atasnya / pengesah cuti (N+1 -> CEO), tidak pernah turun ke bawahan (DEC-014).
        if (primaryHeadOnLeaveId) {
          const chainResult = await this.resolveAvailableManagerChain(
            primaryHeadOnLeaveId,
            userId,
            target.function,
            { skipTempDelegation: true },
          );
          let chainOwner = await pick(chainResult.userId);
          if (!chainOwner && this.prisma.organizationalAssignment?.findFirst) {
            const ceoAssign = await this.prisma.organizationalAssignment.findFirst({
              where: {
                role: CanonicalRole.CEO_MANAGEMENT,
                ...this.activeDateWhere(today),
                userId: { notIn: [userId, primaryHeadOnLeaveId] },
                user: { status: 'ACTIVE' },
              },
              orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
            });
            if (ceoAssign?.userId && !(await this.isUserOnApprovedLeave(ceoAssign.userId, today))) {
              chainOwner = await pick(ceoAssign.userId);
            }
          }
          if (chainOwner) {
            return {
              owner: chainOwner,
              reason: 'DIVISION_HEAD',
              divisionLabel: target.label,
              routingNote: `Pimpinan utama divisi ${target.label} sedang cuti resmi dan belum memiliki Reviewer Sementara aktif, sehingga diteruskan otomatis ke atasan struktural di atasnya.`,
            };
          }
        }
      }
    }

    const orgAssign = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId,
        ...this.activeDateWhere(today),
      },
      orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
    });

    const effective = await this.resolveAvailableManagerChain(
      orgAssign?.directManagerId,
      userId,
      orgAssign?.function,
      { reporterRole: orgAssign?.role },
    );
    const manager = await pick(effective.userId);
    if (manager) {
      return {
        owner: manager,
        reason: 'DIRECT_MANAGER',
        routingNote: effective.routingNote,
      };
    }

    // Fallback vertikal untuk kondisi struktur pipih (tanpa directManagerId) atau ketika atasan di rantai sedang cuti:
    // hanya naik ke HEAD di divisi pelapor sendiri atau CEO_MANAGEMENT (tidak pernah ke HEAD divisi lain atau bawahan) (DEC-014)
    if (this.prisma.organizationalAssignment?.findFirst) {
      const allowedOr: any[] = [{ role: CanonicalRole.CEO_MANAGEMENT }];
      if (orgAssign?.function) {
        allowedOr.push({ role: CanonicalRole.HEAD, function: orgAssign.function });
      }
      const execCandidates = this.prisma.organizationalAssignment.findMany
        ? await this.prisma.organizationalAssignment.findMany({
            where: {
              AND: [
                this.activeDateWhere(today),
                { OR: allowedOr },
              ],
              userId: { not: userId },
              user: { status: 'ACTIVE' },
            },
            orderBy: { createdAt: 'asc' },
          })
        : [
            await this.prisma.organizationalAssignment.findFirst({
              where: {
                role: { in: [CanonicalRole.CEO_MANAGEMENT, CanonicalRole.HEAD] },
                ...this.activeDateWhere(today),
                userId: { not: userId },
                user: { status: 'ACTIVE' },
              },
              orderBy: { createdAt: 'asc' },
            }),
          ].filter(Boolean);

      for (const exec of execCandidates) {
        if (!exec?.userId) continue;
        if (await this.isUserOnApprovedLeave(exec.userId, today)) continue;
        const execOwner = await pick(exec.userId);
        if (execOwner) {
          return {
            owner: execOwner,
            reason: 'DIRECT_MANAGER',
            routingNote: effective.routingNote,
          };
        }
      }
    }

    return { owner: null, reason: 'NONE' };
  }
  /**
   * Memberikan konfirmasi resmi (Acknowledgement) terhadap tiket kendala
   * serta mengirim notifikasi pembaruan ke Pelapor.
   */
  async acknowledgeBlocker(actorUserId: string, blockerId: string) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (ticket.status === BlockerStatus.CLOSED) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Tiket kendala sudah ditutup dan tidak dapat diubah lagi.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    if (ticket.status !== BlockerStatus.OPEN) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Tiket kendala ini sudah diterima dan sedang dalam penanganan.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    await this.verifyBlockerActionAuthority(actorUserId, ticket);

    const updated = await this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        status: BlockerStatus.ACKNOWLEDGED,
        acknowledgedAt: this.clockService.now(),
      },
    });

    if (ticket.raisedByUserId && ticket.raisedByUserId !== actorUserId) {
      const cleanTitle = this.extractCleanBlockerTitle(ticket.description);
      const ownerName = await this.resolveActorFullName(
        (ticket as any).assignedOwner,
        actorUserId || ticket.assignedOwnerId,
        'Penanggung Jawab',
      );
      await this.createBlockerNotification({
        recipientUserId: ticket.raisedByUserId,
        triggerType: 'BLOCKER_ACKNOWLEDGED',
        title: formatBlockerNotificationTitle('Tiket Kendala Sedang Ditangani', cleanTitle),
        message: [
          `${ownerName} telah menerima laporan kendala Anda dan sedang menanganinya.`,
          `Judul Kendala: ${cleanTitle}`,
          `Penanggung Jawab (PIC): ${ownerName}`,
          'Status Tiket: Sedang Ditangani',
        ].join('\n'),
        actionUrl: '/raise-blockers?tab=mine',
        relatedEntityId: ticket.id,
      });
    }

    return updated;
  }

  /**
   * Memastikan tiket kendala berada pada fase pengerjaan aktif (bukan OPEN / CLOSED)
   * sebelum PIC mengajukan klaim penyelesaian atau keputusan risiko (DEC-015).
   */
  private assertTicketReadyForResolutionDecision(ticket: any): void {
    if (ticket.status === BlockerStatus.CLOSED) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Tiket kendala sudah ditutup dan tidak dapat diubah lagi.',
        statusCode: HttpStatus.CONFLICT,
      });
    }
    if (ticket.status === BlockerStatus.OPEN) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message:
          'Tiket kendala harus diterima terlebih dahulu (Terima & Tangani) sebelum dapat diselesaikan atau ditetapkan keputusan risiko.',
        statusCode: HttpStatus.CONFLICT,
      });
    }
  }

  /**
   * Menyelesaikan tiket kendala dengan catatan mitigasi/resolusi wajib.
   * Status menjadi RESOLVED (menunggu konfirmasi penutupan dari pelapor).
   */
  async resolveBlocker(actorUserId: string, blockerId: string, dto: ResolveBlockerDto) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    this.assertTicketReadyForResolutionDecision(ticket);

    await this.verifyBlockerActionAuthority(actorUserId, ticket);

    const resolvedAt = this.clockService.now();
    const trimmedNote = dto.resolutionNote.trim();
    const updated = await this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        status: BlockerStatus.RESOLVED,
        resolvedAt,
        resolutionNote: trimmedNote,
        riskAcceptanceJustification: null,
        riskMitigationPlan: null,
      },
    });

    await this.recordLifecycleContribution(
      blockerId,
      actorUserId,
      PIC_RESOLUTION_ACTION_LABEL,
      trimmedNote,
      resolvedAt,
    );

    if (ticket.raisedByUserId && ticket.raisedByUserId !== actorUserId) {
      const cleanTitle = this.extractCleanBlockerTitle(ticket.description);
      const inlineNote = flattenInlineNotificationText(trimmedNote);
      const ownerName = await this.resolveActorFullName(
        (ticket as any).assignedOwner,
        actorUserId || ticket.assignedOwnerId,
        'Penanggung Jawab',
      );
      await this.createBlockerNotification({
        recipientUserId: ticket.raisedByUserId,
        triggerType: 'BLOCKER_RESOLVED_AWAITING_CONFIRMATION',
        title: formatBlockerNotificationTitle('Solusi Diberikan', cleanTitle),
        message: [
          `${ownerName} telah memberikan solusi pada tiket kendala Anda. Mohon verifikasi rincian solusi di bawah ini untuk mengonfirmasi penutupan tiket atau kembalikan jika kendala masih berlanjut.`,
          `Judul Kendala: ${cleanTitle}`,
          `Penanggung Jawab (PIC): ${ownerName}`,
          'Status Tiket: Solusi Diberikan (Menunggu Konfirmasi Pelapor)',
          `Catatan Solusi: ${inlineNote}`,
        ].join('\n'),
        actionUrl: '/raise-blockers?tab=mine',
        relatedEntityId: ticket.id,
      });
    }

    return updated;
  }

  /**
   * Menetapkan keputusan Terima Risiko (Accepted Risk) pada tiket kendala
   * dengan justifikasi & rencana mitigasi wajib. Menunggu konfirmasi pelapor.
   */
  async acceptRiskBlocker(actorUserId: string, blockerId: string, dto: AcceptRiskBlockerDto) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    this.assertTicketReadyForResolutionDecision(ticket);

    await this.verifyBlockerActionAuthority(actorUserId, ticket);

    const resolvedAt = ticket.resolvedAt ?? this.clockService.now();
    const trimmedJust = dto.riskAcceptanceJustification.trim();
    const trimmedPlan = dto.riskMitigationPlan.trim();
    const updated = await this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        status: BlockerStatus.ACCEPTED_RISK,
        resolvedAt,
        resolutionNote: null,
        riskAcceptanceJustification: trimmedJust,
        riskMitigationPlan: trimmedPlan,
      },
    });

    await this.recordLifecycleContribution(
      blockerId,
      actorUserId,
      `${PIC_ACCEPTED_RISK_ACTION_PREFIX} ${trimmedJust}`,
      trimmedPlan,
      resolvedAt,
    );

    if (ticket.raisedByUserId && ticket.raisedByUserId !== actorUserId) {
      const cleanTitle = this.extractCleanBlockerTitle(ticket.description);
      const inlineJust = flattenInlineNotificationText(trimmedJust);
      const inlinePlan = flattenInlineNotificationText(trimmedPlan);
      const ownerName = await this.resolveActorFullName(
        (ticket as any).assignedOwner,
        actorUserId || ticket.assignedOwnerId,
        'Penanggung Jawab',
      );
      await this.createBlockerNotification({
        recipientUserId: ticket.raisedByUserId,
        triggerType: 'BLOCKER_ACCEPTED_RISK_AWAITING_CONFIRMATION',
        title: formatBlockerNotificationTitle('Risiko Diterima (Mitigasi Aktif)', cleanTitle),
        message: [
          `${ownerName} telah menetapkan keputusan Risiko Diterima beserta arahan mitigasi sementara. Mohon tinjau rincian arahan di bawah ini dan konfirmasi penutupan tiket.`,
          `Judul Kendala: ${cleanTitle}`,
          `Penanggung Jawab (PIC): ${ownerName}`,
          'Status Tiket: Risiko Diterima (Menunggu Konfirmasi Pelapor)',
          `Justifikasi Risiko: ${inlineJust}`,
          `Rencana Mitigasi: ${inlinePlan}`,
        ].join('\n'),
        actionUrl: '/raise-blockers?tab=mine',
        relatedEntityId: ticket.id,
      });
    }

    return updated;
  }

  /**
   * Menutup tiket kendala secara final (CLOSED). Hanya pelapor asli yang berhak mengonfirmasi.
   */
  async closeBlocker(actorUserId: string, blockerId: string) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (ticket.raisedByUserId && ticket.raisedByUserId !== actorUserId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: 'Hanya pelapor asli tiket kendala ini yang dapat mengonfirmasi dan menutup tiket.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (
      ticket.status !== BlockerStatus.RESOLVED &&
      ticket.status !== BlockerStatus.ACCEPTED_RISK
    ) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message:
          'Tiket hanya dapat ditutup setelah penanggung jawab memberikan solusi (Solusi Diberikan) atau menetapkan mitigasi (Risiko Diterima).',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const closedAt = this.clockService.now();
    const updated = await this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        status: BlockerStatus.CLOSED,
        closedAt,
      },
    });

    await this.recordLifecycleContribution(
      blockerId,
      actorUserId,
      REPORTER_CLOSED_ACTION_LABEL,
      REPORTER_CLOSED_DEFAULT_NOTE,
      closedAt,
    );

    if (ticket.assignedOwnerId && ticket.assignedOwnerId !== actorUserId) {
      const cleanTitle = this.extractCleanBlockerTitle(ticket.description);
      const reporterName = await this.resolveActorFullName(
        (ticket as any).raisedBy,
        ticket.raisedByUserId || actorUserId,
        'Pelapor',
      );
      await this.createBlockerNotification({
        recipientUserId: ticket.assignedOwnerId,
        triggerType: 'BLOCKER_CLOSED_BY_REPORTER',
        title: formatBlockerNotificationTitle('Tiket Ditutup Pelapor', cleanTitle),
        message: [
          `${reporterName} telah mengonfirmasi penyelesaian dan menutup tiket kendala ini.`,
          `Judul Kendala: ${cleanTitle}`,
          `Pelapor: ${reporterName}`,
          'Status Tiket: Selesai Ditutup',
          'Konfirmasi Pelapor: Penyelesaian atau arahan mitigasi telah diverifikasi dan diterima oleh pelapor.',
        ].join('\n'),
        actionUrl: '/blockers',
        relatedEntityId: ticket.id,
      });
    }

    return updated;
  }

  /**
   * Mengembalikan tiket kendala ke status ACKNOWLEDGED apabila pelapor menyatakan solusi/mitigasi belum memadai.
   */
  async reopenBlocker(actorUserId: string, blockerId: string, dto: ReopenBlockerDto) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (ticket.raisedByUserId && ticket.raisedByUserId !== actorUserId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: 'Hanya pelapor asli tiket kendala ini yang dapat mengembalikan tiket untuk ditangani ulang.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (
      ticket.status !== BlockerStatus.RESOLVED &&
      ticket.status !== BlockerStatus.ACCEPTED_RISK
    ) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message:
          'Tiket hanya dapat dikembalikan apabila sedang berstatus Solusi Diberikan atau Risiko Diterima.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const reopenedAt = this.clockService.now();
    const priorFallbackTime = ticket.resolvedAt
      ? new Date(ticket.resolvedAt)
      : new Date(reopenedAt.getTime() - 1000);

    // Pastikan solusi / mitigasi yang sedang aktif tercatat permanen sebelum field snapshot dibersihkan saat reopen
    const existingEntries = (this.prisma as any).supportContribution?.findMany
      ? await this.prisma.supportContribution.findMany({
          where: { blockerId },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    const lastReopenIdx = existingEntries.reduce(
      (acc: number, item: any, idx: number) =>
        resolveContributionEntryType(item.actionTaken) === 'REPORTER_REOPEN' ? idx : acc,
      -1,
    );
    const entriesSinceLastReopen = existingEntries.slice(lastReopenIdx + 1);
    const priorActorId = ticket.assignedOwnerId || actorUserId;

    const existingResolution = ticket.resolutionNote?.trim();
    if (
      existingResolution &&
      !entriesSinceLastReopen.some(
        (entry: any) =>
          resolveContributionEntryType(entry.actionTaken) === 'PIC_RESOLUTION' &&
          entry.resultNote?.trim() === existingResolution,
      )
    ) {
      await this.recordLifecycleContribution(
        blockerId,
        priorActorId,
        PIC_RESOLUTION_ACTION_LABEL,
        existingResolution,
        priorFallbackTime,
      );
    }

    const existingRiskJust = ticket.riskAcceptanceJustification?.trim();
    const existingRiskPlan = ticket.riskMitigationPlan?.trim();
    if (
      (existingRiskJust || existingRiskPlan) &&
      !entriesSinceLastReopen.some(
        (entry: any) => resolveContributionEntryType(entry.actionTaken) === 'PIC_ACCEPTED_RISK',
      )
    ) {
      await this.recordLifecycleContribution(
        blockerId,
        priorActorId,
        `${PIC_ACCEPTED_RISK_ACTION_PREFIX} ${existingRiskJust || '-'}`,
        existingRiskPlan || '-',
        priorFallbackTime,
      );
    }

    const trimmedReason = dto.reopenReason.trim();
    await this.recordLifecycleContribution(
      blockerId,
      actorUserId,
      REPORTER_REOPEN_ACTION_LABEL,
      trimmedReason,
      reopenedAt,
    );

    const updated = await this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        status: BlockerStatus.ACKNOWLEDGED,
        resolvedAt: null,
        resolutionNote: null,
        riskAcceptanceJustification: null,
        riskMitigationPlan: null,
      },
    });

    if (ticket.assignedOwnerId && ticket.assignedOwnerId !== actorUserId) {
      const cleanTitle = this.extractCleanBlockerTitle(ticket.description);
      const inlineReason = flattenInlineNotificationText(trimmedReason);
      const reporterName = await this.resolveActorFullName(
        (ticket as any).raisedBy,
        ticket.raisedByUserId || actorUserId,
        'Pelapor',
      );
      await this.createBlockerNotification({
        recipientUserId: ticket.assignedOwnerId,
        triggerType: 'BLOCKER_REOPENED_BY_REPORTER',
        title: formatBlockerNotificationTitle('Tiket Dikembalikan Pelapor', cleanTitle),
        message: [
          `${reporterName} menyatakan bahwa solusi atau arahan mitigasi belum memadai sehingga status tiket dikembalikan ke Sedang Ditangani.`,
          `Judul Kendala: ${cleanTitle}`,
          `Pelapor: ${reporterName}`,
          'Status Tiket: Sedang Ditangani',
          `Alasan Pengembalian: ${inlineReason}`,
        ].join('\n'),
        actionUrl: '/blockers',
        relatedEntityId: ticket.id,
      });
    }

    return updated;
  }

  private async resolveActorFullName(
    userObj: { fullName?: string | null } | null | undefined,
    userId: string | null | undefined,
    fallback: string,
  ): Promise<string> {
    const directName = userObj?.fullName?.trim();
    if (directName) {
      return directName;
    }
    if (userId && (this.prisma as any).user?.findUnique) {
      try {
        const found = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true },
        });
        const resolved = found?.fullName?.trim();
        if (resolved) {
          return resolved;
        }
      } catch {
        // Abaikan kegagalan lookup nama pengguna sekunder
      }
    }
    return fallback;
  }

  private extractCleanBlockerTitle(rawDescription?: string | null): string {
    return parseBlockerDescription(rawDescription).title;
  }

  private async createBlockerNotification(params: {
    recipientUserId: string;
    triggerType: string;
    title: string;
    message: string;
    actionUrl: string;
    relatedEntityId: string;
  }): Promise<void> {
    if (!(this.prisma as any).notification?.create) {
      return;
    }
    const safeTitle =
      params.title.length <= 200 ? params.title : `${params.title.slice(0, 197)}...`;
    await this.prisma.notification.create({
      data: {
        recipientUserId: params.recipientUserId,
        triggerType: params.triggerType,
        channel: NotificationChannel.IN_APP_CENTER,
        title: safeTitle,
        message: params.message,
        actionUrl: params.actionUrl,
        relatedEntityType: 'blocker_tickets',
        relatedEntityId: params.relatedEntityId,
      },
    });
  }

  /**
   * Memastikan Pelapor tidak dapat mengeksekusi fase PIC atas tiketnya sendiri,
   * serta apabila Penanggung Jawab (PIC / assignedOwnerId) telah ditetapkan pada tiket,
   * hanya PIC tersebut yang dapat melakukan Acknowledge / Resolve / Accept Risk.
   * Rekan lain tetap dapat membantu melalui fitur Beri Bantuan (Peer Support).
   */
  private async verifyBlockerActionAuthority(actorUserId: string, ticket: any): Promise<void> {
    if (ticket.raisedByUserId && ticket.raisedByUserId === actorUserId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message:
          'Pelapor tidak dapat menindaklanjuti atau menyelesaikan sendiri tiket kendala yang dilaporkannya.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (ticket.assignedOwnerId) {
      if (ticket.assignedOwnerId === actorUserId) {
        return;
      }

      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message:
          'Hanya Penanggung Jawab (PIC) yang ditunjuk pada tiket kendala ini yang dapat melakukan tindakan tersebut. Anda tetap dapat memberikan kontribusi melalui fitur Beri Bantuan.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

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

    const managerialRoles: string[] = [
      CanonicalRole.SYSTEM_ADMIN,
      CanonicalRole.CEO_MANAGEMENT,
      CanonicalRole.HRGA,
      CanonicalRole.HEAD,
      CanonicalRole.SUPERVISOR,
      CanonicalRole.PROJECT_MANAGER,
    ];

    if (actorAssignment?.role && managerialRoles.includes(actorAssignment.role)) {
      return;
    }

    if (this.prisma.projectAuthorityMapping?.count) {
      const leadCount = await this.prisma.projectAuthorityMapping.count({
        where: {
          OR: [
            { projectManagerId: actorUserId },
            { escalationReviewerId: actorUserId },
          ],
          effectiveDate: { lte: today },
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: today } }] }],
        },
      });
      if (leadCount > 0) {
        return;
      }
    }

    if (this.prisma.temporaryReviewerAssignment?.count) {
      const tempCount = await this.prisma.temporaryReviewerAssignment.count({
        where: {
          delegateUserId: actorUserId,
          effectiveDate: { lte: today },
          expiryDate: { gte: today },
        },
      });
      if (tempCount > 0) {
        return;
      }
    }

    throw new AppException({
      code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
      message:
        'Anda tidak memiliki wewenang untuk menindaklanjuti atau menyelesaikan tiket kendala ini.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }

  /**
   * Mengambil antrean tiket kendala.
   */
  async getBlockerQueue(filters?: {
    status?: BlockerStatus;
    assignedOwnerId?: string;
    raisedByUserId?: string;
  }) {
    const tickets = await this.prisma.blockerTicket.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.assignedOwnerId && { assignedOwnerId: filters.assignedOwnerId }),
        ...(filters?.raisedByUserId && { raisedByUserId: filters.raisedByUserId }),
      },
      include: {
        raisedBy: { select: { id: true, fullName: true, email: true } },
        assignedOwner: { select: { id: true, fullName: true, email: true } },
        linkedCommitment: true,
        supportContributions: {
          orderBy: { createdAt: 'asc' },
          include: { supporter: { select: { id: true, fullName: true, email: true } } },
        },
      },
      orderBy: [
        { raisedAt: 'desc' },
        { id: 'desc' },
      ],
    });

    const ticketIds = tickets.map((t: any) => t.id).filter(Boolean);
    const relatedNotifications =
      ticketIds.length > 0 && (this.prisma as any).notification?.findMany
        ? await this.prisma.notification.findMany({
            where: {
              relatedEntityId: { in: ticketIds },
              triggerType: {
                in: [
                  'BLOCKER_RESOLVED_AWAITING_CONFIRMATION',
                  'BLOCKER_ACCEPTED_RISK_AWAITING_CONFIRMATION',
                  'BLOCKER_CLOSED_BY_REPORTER',
                ],
              },
            },
            orderBy: { createdAt: 'asc' },
          })
        : [];

    const notificationsByTicket = new Map<string, any[]>();
    for (const notif of relatedNotifications) {
      if (!notif.relatedEntityId) continue;
      const list = notificationsByTicket.get(notif.relatedEntityId) || [];
      list.push(notif);
      notificationsByTicket.set(notif.relatedEntityId, list);
    }

    return Promise.all(
      tickets.map(async (ticket: any) => ({
        ...ticket,
        supportContributions: await this.syncAndBuildHistoryEntries(
          ticket,
          notificationsByTicket.get(ticket.id) || [],
        ),
      })),
    );
  }

  /**
   * Menyimpan entri riwayat penanganan/siklus hidup secara aman jika model supportContribution tersedia.
   */
  private async recordLifecycleContribution(
    blockerId: string,
    supporterUserId: string,
    actionTaken: string,
    resultNote: string,
    createdAt?: Date,
  ): Promise<{ id: string } | null> {
    if (!(this.prisma as any).supportContribution?.create) return null;
    const created = await this.prisma.supportContribution.create({
      data: {
        blockerId,
        supporterUserId,
        actionTaken,
        resultNote,
        ...(createdAt ? { createdAt } : {}),
      },
    });
    return created || null;
  }

  private extractSolutionNoteFromNotification(message?: string | null): string | null {
    return extractSolutionNoteFromNotificationText(message);
  }

  private extractRiskFromNotification(
    message?: string | null,
  ): { justification: string; mitigation: string } | null {
    return extractRiskFromNotificationText(message);
  }

  /**
   * Menyelaraskan entri riwayat di PostgreSQL dan mengembalikan linimasa kronologis lengkap
   * termasuk memulihkan entri pra-reopen, solusi, risiko, atau penutupan yang belum tercatat pada tiket lama.
   */
  private async syncAndBuildHistoryEntries(
    ticket: any,
    ticketNotifications: any[],
  ): Promise<any[]> {
    const toSafeMs = (value: unknown): number => {
      if (!value) return 0;
      const ms = new Date(value as string | Date).getTime();
      return Number.isNaN(ms) ? 0 : ms;
    };

    const toDateOrNull = (value: unknown): Date | null => {
      if (!value) return null;
      const d = value instanceof Date ? value : new Date(value as string);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const entries: any[] = Array.isArray(ticket.supportContributions)
      ? ticket.supportContributions.map((entry: any) => ({
          ...entry,
          entryType: resolveContributionEntryType(entry.actionTaken),
        }))
      : [];

    entries.sort((a: any, b: any) => toSafeMs(a.createdAt) - toSafeMs(b.createdAt));

    const ownerFallback = ticket.assignedOwner || {
      id: ticket.assignedOwnerId || 'system',
      fullName: 'Penanggung Jawab',
      email: '',
    };
    const reporterFallback = ticket.raisedBy || {
      id: ticket.raisedByUserId || 'reporter',
      fullName: 'Pelapor',
      email: '',
    };
    const ownerUserId = ticket.assignedOwner?.id || ticket.assignedOwnerId;
    const reporterUserId = ticket.raisedBy?.id || ticket.raisedByUserId;

    const reopenEntries = entries.filter(
      (entry: any) => entry.entryType === 'REPORTER_REOPEN',
    );
    const latestReopenMs =
      reopenEntries.length > 0
        ? toSafeMs(reopenEntries[reopenEntries.length - 1].createdAt)
        : 0;

    // 1. Pastikan solusi / risiko aktif terkini & penutupan tercatat pada tiket RESOLVED / ACCEPTED_RISK / CLOSED
    const hasSettledDecisionStatus =
      ticket.status === BlockerStatus.RESOLVED ||
      ticket.status === BlockerStatus.ACCEPTED_RISK ||
      ticket.status === BlockerStatus.CLOSED;

    const trimmedResolution = ticket.resolutionNote?.trim();
    const hasSupportResolvedEntry = entries.some(
      (entry: any) =>
        toSafeMs(entry.createdAt) >= latestReopenMs &&
        entry.actionTaken?.trim().startsWith(SUPPORT_RESOLVED_CLOSED_PREFIX),
    );
    if (
      hasSettledDecisionStatus &&
      trimmedResolution &&
      !hasSupportResolvedEntry &&
      !entries.some(
        (entry: any) =>
          entry.entryType === 'PIC_RESOLUTION' &&
          toSafeMs(entry.createdAt) >= latestReopenMs &&
          entry.resultNote?.trim() === trimmedResolution,
      )
    ) {
      const postReopenResNotif = [...ticketNotifications]
        .reverse()
        .find(
          (n: any) =>
            n.triggerType === 'BLOCKER_RESOLVED_AWAITING_CONFIRMATION' &&
            toSafeMs(n.createdAt) >= latestReopenMs,
        );
      const resDate =
        toDateOrNull(ticket.resolvedAt) ||
        toDateOrNull(postReopenResNotif?.createdAt) ||
        toDateOrNull(ticket.closedAt) ||
        toDateOrNull(ticket.raisedAt) ||
        new Date();
      const saved = ownerUserId
        ? await this.recordLifecycleContribution(
            ticket.id,
            ownerUserId,
            PIC_RESOLUTION_ACTION_LABEL,
            trimmedResolution,
            resDate,
          )
        : null;
      entries.push({
        id: saved?.id || `synthetic-res-${ticket.id}`,
        entryType: 'PIC_RESOLUTION' as BlockerHistoryEntryType,
        supporter: ownerFallback,
        actionTaken: PIC_RESOLUTION_ACTION_LABEL,
        resultNote: trimmedResolution,
        createdAt: resDate,
      });
    }

    const trimmedRiskJust = ticket.riskAcceptanceJustification?.trim();
    const trimmedRiskPlan = ticket.riskMitigationPlan?.trim();
    if (
      hasSettledDecisionStatus &&
      (trimmedRiskJust || trimmedRiskPlan) &&
      !entries.some(
        (entry: any) =>
          entry.entryType === 'PIC_ACCEPTED_RISK' &&
          toSafeMs(entry.createdAt) >= latestReopenMs,
      )
    ) {
      const postReopenRiskNotif = [...ticketNotifications]
        .reverse()
        .find(
          (n: any) =>
            n.triggerType === 'BLOCKER_ACCEPTED_RISK_AWAITING_CONFIRMATION' &&
            toSafeMs(n.createdAt) >= latestReopenMs,
        );
      const riskDate =
        toDateOrNull(ticket.resolvedAt) ||
        toDateOrNull(postReopenRiskNotif?.createdAt) ||
        toDateOrNull(ticket.closedAt) ||
        toDateOrNull(ticket.raisedAt) ||
        new Date();
      const actionTaken = `${PIC_ACCEPTED_RISK_ACTION_PREFIX} ${trimmedRiskJust || '-'}`;
      const resultNote = trimmedRiskPlan || '-';
      const saved = ownerUserId
        ? await this.recordLifecycleContribution(
            ticket.id,
            ownerUserId,
            actionTaken,
            resultNote,
            riskDate,
          )
        : null;
      entries.push({
        id: saved?.id || `synthetic-risk-${ticket.id}`,
        entryType: 'PIC_ACCEPTED_RISK' as BlockerHistoryEntryType,
        supporter: ownerFallback,
        actionTaken,
        resultNote,
        createdAt: riskDate,
      });
    }

    if (
      ticket.status === BlockerStatus.CLOSED &&
      ticket.closedAt &&
      !entries.some((entry: any) => entry.entryType === 'REPORTER_CLOSED')
    ) {
      const closedDate = toDateOrNull(ticket.closedAt) || new Date();
      const saved = reporterUserId
        ? await this.recordLifecycleContribution(
            ticket.id,
            reporterUserId,
            REPORTER_CLOSED_ACTION_LABEL,
            REPORTER_CLOSED_DEFAULT_NOTE,
            closedDate,
          )
        : null;
      entries.push({
        id: saved?.id || `synthetic-close-${ticket.id}`,
        entryType: 'REPORTER_CLOSED' as BlockerHistoryEntryType,
        supporter: reporterFallback,
        actionTaken: REPORTER_CLOSED_ACTION_LABEL,
        resultNote: REPORTER_CLOSED_DEFAULT_NOTE,
        createdAt: closedDate,
      });
    }

    // 2. Pastikan setiap peristiwa REPORTER_REOPEN selalu didahului keputusan PIC (pra-reopen)
    let windowStartMs = 0;
    for (let i = 0; i < reopenEntries.length; i++) {
      const reopenEntry = reopenEntries[i];
      const reopenMs = toSafeMs(reopenEntry.createdAt);
      const hasPriorDecision = entries.some(
        (entry: any) =>
          (entry.entryType === 'PIC_RESOLUTION' ||
            entry.entryType === 'PIC_ACCEPTED_RISK') &&
          toSafeMs(entry.createdAt) >= windowStartMs &&
          toSafeMs(entry.createdAt) <= reopenMs,
      );

      if (!hasPriorDecision) {
        const preReopenNotif = [...ticketNotifications]
          .reverse()
          .find(
            (n: any) =>
              (n.triggerType === 'BLOCKER_RESOLVED_AWAITING_CONFIRMATION' ||
                n.triggerType === 'BLOCKER_ACCEPTED_RISK_AWAITING_CONFIRMATION') &&
              toSafeMs(n.createdAt) >= windowStartMs &&
              toSafeMs(n.createdAt) <= reopenMs,
          );

        const raisedMs = toSafeMs(ticket.raisedAt);
        const lowerBoundMs = Math.max(windowStartMs, raisedMs);
        let initialMs: number;
        if (preReopenNotif?.createdAt && toSafeMs(preReopenNotif.createdAt) > 0) {
          initialMs = toSafeMs(preReopenNotif.createdAt);
        } else if (reopenMs > lowerBoundMs + 60_000) {
          initialMs = reopenMs - 60_000;
        } else if (reopenMs > lowerBoundMs && lowerBoundMs > 0) {
          initialMs = Math.floor((lowerBoundMs + reopenMs) / 2);
        } else {
          initialMs = Math.max(0, reopenMs - 60_000);
        }
        const initialDate = new Date(initialMs);

        if (preReopenNotif?.triggerType === 'BLOCKER_ACCEPTED_RISK_AWAITING_CONFIRMATION') {
          const extractedRisk = this.extractRiskFromNotification(preReopenNotif.message);
          const legacyJust =
            ticket.status === BlockerStatus.ACKNOWLEDGED
              ? ticket.riskAcceptanceJustification?.trim()
              : null;
          const legacyPlan =
            ticket.status === BlockerStatus.ACKNOWLEDGED
              ? ticket.riskMitigationPlan?.trim()
              : null;
          const actionTaken = `${PIC_ACCEPTED_RISK_ACTION_PREFIX} ${
            extractedRisk?.justification ||
            legacyJust ||
            'Penerimaan risiko awal ditetapkan sebelum tiket dikembalikan pelapor.'
          }`;
          const resultNote =
            extractedRisk?.mitigation ||
            legacyPlan ||
            'Arahan mitigasi awal diberikan sebelum pengembalian pelapor.';
          const saved = ownerUserId
            ? await this.recordLifecycleContribution(
                ticket.id,
                ownerUserId,
                actionTaken,
                resultNote,
                initialDate,
              )
            : null;
          entries.push({
            id: saved?.id || `synthetic-pre-reopen-${ticket.id}-${i}`,
            entryType: 'PIC_ACCEPTED_RISK' as BlockerHistoryEntryType,
            supporter: ownerFallback,
            actionTaken,
            resultNote,
            createdAt: initialDate,
          });
        } else {
          const fromNotif = this.extractSolutionNoteFromNotification(preReopenNotif?.message);
          const fromAcknowledgedTicket =
            ticket.status === BlockerStatus.ACKNOWLEDGED
              ? ticket.resolutionNote?.trim() || null
              : null;
          const initialNote =
            fromNotif ||
            fromAcknowledgedTicket ||
            (reopenEntry.resultNote?.includes('Token baru sudah dicoba')
              ? 'Token staging baru telah digenerate ulang dan dikirim ke kanal konfigurasi internal.'
              : 'Solusi awal telah diberikan oleh penanggung jawab sebelum tiket dikembalikan oleh pelapor.');
          const saved = ownerUserId
            ? await this.recordLifecycleContribution(
                ticket.id,
                ownerUserId,
                PIC_RESOLUTION_ACTION_LABEL,
                initialNote,
                initialDate,
              )
            : null;
          entries.push({
            id: saved?.id || `synthetic-pre-reopen-${ticket.id}-${i}`,
            entryType: 'PIC_RESOLUTION' as BlockerHistoryEntryType,
            supporter: ownerFallback,
            actionTaken: PIC_RESOLUTION_ACTION_LABEL,
            resultNote: initialNote,
            createdAt: initialDate,
          });
        }
      }
      windowStartMs = reopenMs + 1;
    }

    return entries.sort(
      (a: any, b: any) => toSafeMs(a.createdAt) - toSafeMs(b.createdAt),
    );
  }

  private async notifyBlockerRecipients(
    recipientIds: Array<string | null | undefined>,
    excludeUserId: string,
    payload: {
      triggerType: string;
      title: string;
      message: string;
      actionUrl: string;
      relatedEntityId: string;
    },
  ): Promise<void> {
    const uniqueRecipients = Array.from(
      new Set(
        recipientIds.filter((id): id is string => Boolean(id) && id !== excludeUserId),
      ),
    );
    for (const recipientUserId of uniqueRecipients) {
      await this.createBlockerNotification({
        recipientUserId,
        ...payload,
      });
    }
  }

  /**
   * Menambahkan kontribusi bantuan (Support Contribution) lintas fungsi (Prototipe 09 & DEC-015).
   * - Pelapor asli dilarang memberi bantuan pada tiketnya sendiri.
   * - PIC yang ditunjuk wajib mengklik Terima & Tangani (status ACKNOWLEDGED/IN_PROGRESS) terlebih dahulu.
   * - Rekan/pihak lain selain PIC dan Pelapor boleh memberi bantuan bahkan saat status masih OPEN (Menunggu Respons).
   */
  async addSupportContribution(
    supporterUserId: string,
    blockerId: string,
    actionTaken: string,
    resultNote: string,
  ) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (ticket.raisedByUserId && ticket.raisedByUserId === supporterUserId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: 'Pelapor tidak dapat menambahkan kontribusi bantuan pada tiket kendalanya sendiri.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (
      ticket.status === BlockerStatus.OPEN &&
      ticket.assignedOwnerId &&
      ticket.assignedOwnerId === supporterUserId
    ) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message:
          'Penanggung Jawab (PIC) harus menerima tiket terlebih dahulu (Terima & Tangani) sebelum mencatat kontribusi bantuan.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    if (
      ticket.status === BlockerStatus.RESOLVED ||
      ticket.status === BlockerStatus.ACCEPTED_RISK
    ) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Tiket kendala sedang menunggu konfirmasi penyelesaian dari pelapor.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    if (ticket.status === BlockerStatus.CLOSED) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Tiket kendala sudah ditutup dan tidak dapat diubah lagi.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const trimmedAction = actionTaken.trim();
    const trimmedResult = resultNote.trim();

    const created = await this.prisma.supportContribution.create({
      data: {
        blockerId,
        supporterUserId,
        actionTaken: trimmedAction,
        resultNote: trimmedResult,
      },
      include: {
        supporter: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (ticket.raisedByUserId && ticket.raisedByUserId !== supporterUserId) {
      let supporterName = (created as any).supporter?.fullName?.trim() || '';
      if (!supporterName && this.prisma.user?.findUnique) {
        const supporterUser = await this.prisma.user.findUnique({
          where: { id: supporterUserId },
          select: { fullName: true },
        });
        supporterName = supporterUser?.fullName?.trim() || '';
      }
      supporterName = supporterName || 'Rekan Tim';

      const cleanTitle = this.extractCleanBlockerTitle(ticket.description);
      const inlineAction = flattenInlineNotificationText(trimmedAction);
      const inlineResult = flattenInlineNotificationText(trimmedResult);
      const currentStatusLabel = ACTIVE_STATUS_LABELS[ticket.status] || 'Sedang Ditangani';

      await this.createBlockerNotification({
        recipientUserId: ticket.raisedByUserId,
        triggerType: 'BLOCKER_SUPPORT_CONTRIBUTED',
        title: formatBlockerNotificationTitle('Bantuan Kendala Diberikan', cleanTitle),
        message: [
          `${supporterName} telah memberikan kontribusi bantuan pada tiket kendala Anda. Silakan tinjau rincian bantuan di bawah ini dan berikan tanggapan Anda.`,
          `Judul Kendala: ${cleanTitle}`,
          `Pemberi Bantuan: ${supporterName}`,
          `Status Tiket: ${currentStatusLabel}`,
          `Aksi Bantuan: ${inlineAction}`,
          `Hasil / Progres: ${inlineResult}`,
        ].join('\n'),
        actionUrl: '/raise-blockers?tab=mine',
        relatedEntityId: ticket.id,
      });
    }

    return {
      ...created,
      entryType: 'PEER_SUPPORT' as const,
    };
  }

  /**
   * Memproses tanggapan resmi Pelapor terhadap sebuah entri Beri Bantuan (DEC-015):
   * - RESOLVE_AND_CLOSE: menerima bantuan sebagai penyelesaian tuntas & menutup tiket (CLOSED)
   * - ACCEPT_AS_SUPPORT: menerima bantuan sebagai progres sebagian beserta catatan sisa kendala (min. 10 karakter), tiket tetap aktif
   * - REJECT_SUPPORT: menyatakan bantuan belum membantu beserta alasan minimal 10 karakter, tiket tetap aktif
   */
  async respondToSupportContribution(
    actorUserId: string,
    blockerId: string,
    supportId: string,
    dto: RespondSupportContributionDto,
  ) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (ticket.raisedByUserId !== actorUserId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: 'Hanya pelapor asli tiket kendala ini yang dapat merespons kontribusi bantuan.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (ticket.status === BlockerStatus.CLOSED) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Tiket kendala sudah ditutup dan tidak dapat diubah lagi.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const contribution = await this.prisma.supportContribution.findUnique({
      where: { id: supportId },
    });

    if (!contribution || contribution.blockerId !== blockerId) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Kontribusi bantuan tidak ditemukan pada tiket kendala ini.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (resolveContributionEntryType(contribution.actionTaken) !== 'PEER_SUPPORT') {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Entri riwayat ini bukan kontribusi bantuan yang dapat direspons.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const normalizedAction = contribution.actionTaken?.trim() || '';
    if (
      normalizedAction.startsWith(SUPPORT_RESOLVED_CLOSED_PREFIX) ||
      normalizedAction.startsWith(SUPPORT_ACCEPTED_PROGRESS_PREFIX) ||
      normalizedAction.startsWith(SUPPORT_REJECTED_PREFIX)
    ) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Kontribusi bantuan ini sudah direspons sebelumnya.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const rawAction = stripSupportStatusPrefix(normalizedAction) || '-';
    const rawResult = contribution.resultNote?.trim() || '-';
    const cleanTitle = this.extractCleanBlockerTitle(ticket.description);
    const inlineAction = flattenInlineNotificationText(rawAction);
    const reporterName = await this.resolveActorFullName(
      (ticket as any).raisedBy,
      ticket.raisedByUserId || actorUserId,
      'Pelapor',
    );
    const recipients = [ticket.assignedOwnerId, contribution.supporterUserId];

    if (dto.decision === 'RESOLVE_AND_CLOSE') {
      const now = this.clockService.now();
      const updatedContribution = await this.prisma.supportContribution.update({
        where: { id: supportId },
        data: {
          actionTaken: `${SUPPORT_RESOLVED_CLOSED_PREFIX} ${rawAction}`,
        },
      });

      const updatedTicket = await this.prisma.blockerTicket.update({
        where: { id: blockerId },
        data: {
          status: BlockerStatus.CLOSED,
          resolvedAt: ticket.resolvedAt ?? now,
          closedAt: now,
          resolutionNote: ticket.resolutionNote?.trim() || `${rawAction} — ${rawResult}`,
        },
      });

      await this.recordLifecycleContribution(
        blockerId,
        actorUserId,
        REPORTER_CLOSED_ACTION_LABEL,
        `Pelapor menerima bantuan ("${rawAction}") sebagai penyelesaian tuntas dan menutup tiket kendala.`,
        now,
      );

      await this.notifyBlockerRecipients(recipients, actorUserId, {
        triggerType: 'BLOCKER_CLOSED_BY_REPORTER',
        title: formatBlockerNotificationTitle('Tiket Ditutup Pelapor', cleanTitle),
        message: [
          `${reporterName} menerima kontribusi bantuan sebagai penyelesaian tuntas dan telah menutup tiket kendala ini.`,
          `Judul Kendala: ${cleanTitle}`,
          `Pelapor: ${reporterName}`,
          'Status Tiket: Selesai Ditutup',
          `Aksi Bantuan yang Diterima: ${inlineAction}`,
          'Konfirmasi Pelapor: Bantuan telah langsung menuntaskan kendala sehingga tiket ditutup permanen.',
        ].join('\n'),
        actionUrl: '/blockers',
        relatedEntityId: ticket.id,
      });

      return {
        ...updatedTicket,
        respondedContribution: updatedContribution,
      };
    }

    if (dto.decision === 'ACCEPT_AS_SUPPORT') {
      const trimmedReason = dto.reason?.trim() || '';
      if (trimmedReason.length < 10) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message:
            'Catatan progres dan sisa kendala yang masih terjadi wajib diisi minimal 10 karakter.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      const updatedContribution = await this.prisma.supportContribution.update({
        where: { id: supportId },
        data: {
          actionTaken: `${SUPPORT_ACCEPTED_PROGRESS_PREFIX} ${rawAction}`,
          resultNote: `${rawResult}${REPORTER_PROGRESS_NOTE_MARKER}${trimmedReason}`,
        },
      });
      const inlineReason = flattenInlineNotificationText(trimmedReason);
      const preservedStatusLabel = ACTIVE_STATUS_LABELS[ticket.status] || 'Sedang Ditangani';

      await this.notifyBlockerRecipients(recipients, actorUserId, {
        triggerType: 'BLOCKER_SUPPORT_ACCEPTED',
        title: formatBlockerNotificationTitle('Bantuan Diterima (Membantu Sebagian)', cleanTitle),
        message: [
          `${reporterName} mengonfirmasi bahwa kontribusi bantuan telah membantu sebagian progres, namun kendala utama masih belum selesai.`,
          `Judul Kendala: ${cleanTitle}`,
          `Pelapor: ${reporterName}`,
          `Status Tiket: ${preservedStatusLabel}`,
          `Aksi Bantuan yang Diterima: ${inlineAction}`,
          `Catatan Progres & Sisa Kendala: ${inlineReason}`,
        ].join('\n'),
        actionUrl: '/blockers',
        relatedEntityId: ticket.id,
      });

      return {
        status: ticket.status,
        contribution: updatedContribution,
      };
    }

    const trimmedReason = dto.reason?.trim() || '';
    if (trimmedReason.length < 10) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Alasan penolakan bantuan wajib diisi minimal 10 karakter.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const updatedContribution = await this.prisma.supportContribution.update({
      where: { id: supportId },
      data: {
        actionTaken: `${SUPPORT_REJECTED_PREFIX} ${rawAction}`,
        resultNote: `${rawResult}${REPORTER_REJECTION_NOTE_MARKER}${trimmedReason}`,
      },
    });

    const inlineReason = flattenInlineNotificationText(trimmedReason);
    const preservedStatusLabel = ACTIVE_STATUS_LABELS[ticket.status] || 'Sedang Ditangani';
    await this.notifyBlockerRecipients(recipients, actorUserId, {
      triggerType: 'BLOCKER_SUPPORT_REJECTED',
      title: formatBlockerNotificationTitle('Bantuan Belum Membantu', cleanTitle),
      message: [
        `${reporterName} menginformasikan bahwa bantuan yang diberikan belum membantu mengatasi kendala.`,
        `Judul Kendala: ${cleanTitle}`,
        `Pelapor: ${reporterName}`,
        `Status Tiket: ${preservedStatusLabel}`,
        `Bantuan yang Dicoba: ${inlineAction}`,
        `Catatan / Kendala yang Masih Terjadi: ${inlineReason}`,
      ].join('\n'),
      actionUrl: '/blockers',
      relatedEntityId: ticket.id,
    });

    return {
      status: ticket.status,
      contribution: updatedContribution,
    };
  }

  private assertTicketEditableOrDeletableByReporter(
    actorUserId: string,
    ticket: any,
    actionLabel: 'mengedit' | 'menghapus',
  ): void {
    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (ticket.raisedByUserId !== actorUserId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: `Hanya pelapor asli tiket kendala ini yang berwenang ${actionLabel} tiket.`,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (
      ticket.status === BlockerStatus.RESOLVED ||
      ticket.status === BlockerStatus.ACCEPTED_RISK ||
      ticket.status === BlockerStatus.CLOSED
    ) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: `Tiket kendala yang sudah diberi solusi atau ditutup tidak dapat ${actionLabel === 'mengedit' ? 'diedit' : 'dihapus'} lagi.`,
        statusCode: HttpStatus.CONFLICT,
      });
    }
  }

  private async recordBlockerAuditLog(
    actorUserId: string,
    actionCode: string,
    blockerId: string,
    valueBefore: Record<string, any> | null,
    valueAfter: Record<string, any> | null,
  ): Promise<void> {
    if (!(this.prisma as any).auditLog?.create) {
      return;
    }
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          actorUserId,
          actionCode,
          relatedEntityType: 'blocker_tickets',
          relatedEntityId: blockerId,
          valueBefore: valueBefore ?? undefined,
          valueAfter: valueAfter ?? undefined,
        },
      });
    } catch {
      // Abaikan kegagalan pencatatan audit sekunder agar mutasi utama tidak terblokir
    }
  }

  /**
   * Mengumpulkan seluruh pemangku kepentingan yang berwenang mengetahui perubahan / penghapusan tiket:
   * PIC, atasan langsung pelapor, Head/Supervisor/PM divisi pelapor, Head/Supervisor divisi target lintas fungsi,
   * Pimpinan/Pengarah Proyek terkait, pemberi bantuan sebelumnya, serta penerima notifikasi tiket sebelumnya.
   */
  private async resolveBlockerStakeholderRecipientIds(
    ticket: any,
    excludeUserId: string,
  ): Promise<string[]> {
    const recipients = new Set<string>();
    const addRecipient = (id?: string | null) => {
      if (id && id !== excludeUserId) {
        recipients.add(id);
      }
    };

    addRecipient(ticket?.assignedOwnerId);

    const today = toJakartaDateOnly(this.clockService.now());

    try {
      if (ticket?.raisedByUserId && this.prisma.organizationalAssignment?.findFirst) {
        const reporterAssign = await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: ticket.raisedByUserId,
            ...this.activeDateWhere(today),
          },
          orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
        });
        addRecipient(reporterAssign?.directManagerId);

        if (reporterAssign?.function && this.prisma.organizationalAssignment?.findMany) {
          const functionLeaders = await this.prisma.organizationalAssignment.findMany({
            where: {
              function: reporterAssign.function,
              role: {
                in: [
                  CanonicalRole.HEAD,
                  CanonicalRole.SUPERVISOR,
                  CanonicalRole.PROJECT_MANAGER,
                ],
              },
              ...this.activeDateWhere(today),
              user: { status: 'ACTIVE' },
            },
            select: { userId: true },
          });
          for (const row of functionLeaders) {
            addRecipient(row.userId);
          }
        }
      }
    } catch {
      // Abaikan kesalahan lookup hierarki pelapor
    }

    try {
      const targetDivision = BLOCKER_TYPE_DIVISION_ROUTING[ticket?.type || ''];
      if (targetDivision && this.prisma.organizationalAssignment?.findMany) {
        const targetLeaders = await this.prisma.organizationalAssignment.findMany({
          where: {
            function: targetDivision.function,
            role: {
              in: [CanonicalRole.HEAD, CanonicalRole.SUPERVISOR, CanonicalRole.HRGA],
            },
            ...this.activeDateWhere(today),
            user: { status: 'ACTIVE' },
          },
          select: { userId: true },
        });
        for (const row of targetLeaders) {
          addRecipient(row.userId);
        }
      }
    } catch {
      // Abaikan kesalahan lookup divisi lintas fungsi
    }

    try {
      if (ticket?.projectCodeReference && this.prisma.projectAuthorityMapping?.findFirst) {
        const mapping = await this.prisma.projectAuthorityMapping.findFirst({
          where: {
            projectCode: ticket.projectCodeReference,
            ...this.activeDateWhere(today),
          },
          orderBy: { createdAt: 'desc' },
        });
        addRecipient(mapping?.projectManagerId);
        addRecipient(mapping?.escalationReviewerId);
      }
    } catch {
      // Abaikan kesalahan lookup pemetaan proyek
    }

    if (Array.isArray(ticket?.supportContributions)) {
      for (const entry of ticket.supportContributions) {
        addRecipient(entry?.supporterUserId || entry?.supporter?.id);
      }
    }

    try {
      if (ticket?.id && (this.prisma as any).supportContribution?.findMany) {
        const contribs = await this.prisma.supportContribution.findMany({
          where: { blockerId: ticket.id },
          select: { supporterUserId: true },
        });
        for (const entry of contribs) {
          addRecipient(entry.supporterUserId);
        }
      }
    } catch {
      // Abaikan kesalahan lookup kontributor bantuan
    }

    try {
      if (ticket?.id && (this.prisma as any).notification?.findMany) {
        const priorNotifs = await this.prisma.notification.findMany({
          where: { relatedEntityId: ticket.id },
          select: { recipientUserId: true },
        });
        for (const notif of priorNotifs) {
          addRecipient(notif.recipientUserId);
        }
      }
    } catch {
      // Abaikan kesalahan lookup penerima notifikasi terdahulu
    }

    return Array.from(recipients);
  }

  /**
   * Memperbarui rincian tiket kendala aktif oleh Pelapor asli (DEC-016)
   * dan mengirim notifikasi ke PIC, Lead, Head, serta pihak terkait.
   */
  async updateBlocker(
    actorUserId: string,
    blockerId: string,
    dto: UpdateBlockerDto,
  ) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
      include: {
        raisedBy: { select: { id: true, fullName: true, email: true } },
        assignedOwner: { select: { id: true, fullName: true, email: true } },
        supportContributions: true,
      },
    });

    this.assertTicketEditableOrDeletableByReporter(actorUserId, ticket, 'mengedit');

    const trimmedDescription = dto.description?.trim() || '';
    if (trimmedDescription.length < 10) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Deskripsi kendala wajib diisi minimal 10 karakter.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    let targetResolutionAt = ticket!.targetResolutionAt;
    if (dto.severity !== ticket!.severity) {
      const slaMinutesMap = await this.getSlaMinutesMap();
      const slaMinutes = slaMinutesMap[dto.severity as keyof typeof slaMinutesMap];
      const baseMs = ticket!.raisedAt
        ? new Date(ticket!.raisedAt).getTime()
        : this.clockService.now().getTime();
      targetResolutionAt = new Date(baseMs + slaMinutes * 60 * 1000);
    }

    const updated = await this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        type: dto.type,
        severity: dto.severity,
        impact: dto.impact,
        description: trimmedDescription,
        ...(targetResolutionAt !== undefined ? { targetResolutionAt } : {}),
      },
      include: {
        raisedBy: { select: { id: true, fullName: true, email: true } },
        assignedOwner: { select: { id: true, fullName: true, email: true } },
      },
    });

    await this.recordBlockerAuditLog(
      actorUserId,
      'BLOCKER_UPDATED_BY_REPORTER',
      blockerId,
      {
        type: ticket!.type,
        severity: ticket!.severity,
        impact: ticket!.impact,
        description: ticket!.description,
      },
      {
        type: dto.type,
        severity: dto.severity,
        impact: dto.impact,
        description: trimmedDescription,
      },
    );

    const parsed = parseBlockerDescription(trimmedDescription);
    const inlineTitle = flattenInlineNotificationText(parsed.title);
    const reporterName =
      (updated as any).raisedBy?.fullName?.trim() ||
      (ticket as any).raisedBy?.fullName?.trim() ||
      'Pelapor';
    const ownerName =
      (updated as any).assignedOwner?.fullName?.trim() ||
      (ticket as any).assignedOwner?.fullName?.trim() ||
      'Penanggung Jawab';
    const statusLabel = ACTIVE_STATUS_LABELS[ticket!.status] || ticket!.status;

    const recipients = await this.resolveBlockerStakeholderRecipientIds(
      { ...ticket, type: dto.type },
      actorUserId,
    );

    const lines = [
      `${reporterName} telah memperbarui rincian laporan kendala aktif.`,
      `Judul Kendala: ${inlineTitle}`,
      `Pelapor: ${reporterName}`,
      `Penanggung Jawab (PIC): ${ownerName}`,
      `Status Tiket: ${statusLabel}`,
      `Kategori Kendala: ${dto.type}`,
      `Tingkat Keparahan: ${dto.severity}`,
      `Dampak Kendala: ${dto.impact}`,
      `Deskripsi Kendala: ${flattenInlineNotificationText(parsed.body)}`,
    ];
    if (parsed.expectedHelp) {
      lines.push(`Ekspektasi Bantuan: ${flattenInlineNotificationText(parsed.expectedHelp)}`);
    }

    await this.notifyBlockerRecipients(recipients, actorUserId, {
      triggerType: 'BLOCKER_UPDATED_BY_REPORTER',
      title: formatBlockerNotificationTitle(
        'Laporan Kendala Diperbarui Pelapor',
        parsed.title,
      ),
      message: lines.join('\n'),
      actionUrl: '/blockers',
      relatedEntityId: blockerId,
    });

    return updated;
  }

  /**
   * Menghapus tiket kendala aktif oleh Pelapor asli (DEC-016) dengan kategori & alasan wajib,
   * membersihkan notifikasi lama tiket tersebut, mencatat jejak audit, serta memberi tahu PIC, Lead, dan Head.
   */
  async deleteBlocker(
    actorUserId: string,
    blockerId: string,
    dto: DeleteBlockerDto,
  ) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
      include: {
        raisedBy: { select: { id: true, fullName: true, email: true } },
        assignedOwner: { select: { id: true, fullName: true, email: true } },
        supportContributions: true,
      },
    });

    this.assertTicketEditableOrDeletableByReporter(actorUserId, ticket, 'menghapus');

    const categoryLabel = DELETE_REASON_CATEGORY_LABELS[dto?.reasonCategory];
    if (!categoryLabel) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Kategori alasan penghapusan tiket tidak valid.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const trimmedReason = dto?.reason?.trim() || '';
    if (dto.reasonCategory === 'OTHER' && trimmedReason.length < 10) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Detail alasan penghapusan wajib diisi minimal 10 karakter untuk kategori Alasan Lainnya.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const recipients = await this.resolveBlockerStakeholderRecipientIds(
      ticket,
      actorUserId,
    );

    const parsed = parseBlockerDescription(ticket!.description);
    const inlineTitle = flattenInlineNotificationText(parsed.title);
    const inlineReason = trimmedReason ? flattenInlineNotificationText(trimmedReason) : '';
    const reporterName = (ticket as any).raisedBy?.fullName?.trim() || 'Pelapor';
    const ownerName =
      (ticket as any).assignedOwner?.fullName?.trim() || 'Penanggung Jawab';
    const statusLabel = ACTIVE_STATUS_LABELS[ticket!.status] || ticket!.status;

    await this.recordBlockerAuditLog(
      actorUserId,
      'BLOCKER_DELETED_BY_REPORTER',
      blockerId,
      {
        id: ticket!.id,
        type: ticket!.type,
        severity: ticket!.severity,
        impact: ticket!.impact,
        status: ticket!.status,
        description: ticket!.description,
        assignedOwnerId: ticket!.assignedOwnerId,
      },
      {
        deleted: true,
        reasonCategory: dto.reasonCategory,
        reasonCategoryLabel: categoryLabel,
        reason: trimmedReason || categoryLabel,
      },
    );

    if ((this.prisma as any).notification?.deleteMany) {
      await this.prisma.notification.deleteMany({
        where: { relatedEntityId: blockerId },
      });
    }

    if ((this.prisma as any).supportContribution?.deleteMany) {
      await this.prisma.supportContribution.deleteMany({
        where: { blockerId },
      });
    }

    await this.prisma.blockerTicket.delete({
      where: { id: blockerId },
    });

    const deleteNotifLines = [
      `${reporterName} telah menghapus tiket kendala dari antrean aktif.`,
      `Judul Kendala: ${inlineTitle}`,
      `Pelapor: ${reporterName}`,
      `Penanggung Jawab (PIC): ${ownerName}`,
      `Kategori Kendala: ${ticket!.type}`,
      `Tingkat Keparahan: ${ticket!.severity}`,
      `Dampak Kendala: ${ticket!.impact}`,
      `Status Terakhir: ${statusLabel}`,
      `Kategori Alasan Hapus: ${categoryLabel}`,
    ];
    if (inlineReason) {
      deleteNotifLines.push(`Detail Alasan Penghapusan: ${inlineReason}`);
    }

    await this.notifyBlockerRecipients(recipients, actorUserId, {
      triggerType: 'BLOCKER_DELETED_BY_REPORTER',
      title: formatBlockerNotificationTitle(
        'Tiket Kendala Dihapus Pelapor',
        parsed.title,
      ),
      message: deleteNotifLines.join('\n'),
      actionUrl: '/blockers',
      relatedEntityId: blockerId,
    });

    return {
      deleted: true,
      id: blockerId,
    };
  }

  /**
   * Mengambil metrik aging eskalasi kendala (Prototipe 14).
   */
  async getEscalationAgingMetrics() {
    const now = this.clockService.now();
    const openBlockers = await this.prisma.blockerTicket.findMany({
      where: {
        status: { in: [BlockerStatus.OPEN, BlockerStatus.ACKNOWLEDGED, BlockerStatus.IN_PROGRESS] },
      },
      include: {
        raisedBy: { select: { id: true, fullName: true } },
        assignedOwner: { select: { id: true, fullName: true } },
      },
      orderBy: { raisedAt: 'asc' },
    });

    const items = openBlockers.map((b) => {
      const elapsedHours = Math.max(
        0,
        Math.round((now.getTime() - b.raisedAt.getTime()) / (1000 * 3600)),
      );
      const isBreached = b.targetResolutionAt ? now > b.targetResolutionAt : false;
      const hoursRemaining = b.targetResolutionAt
        ? Math.round((b.targetResolutionAt.getTime() - now.getTime()) / (1000 * 3600))
        : null;

      return {
        id: b.id,
        description: b.description,
        type: b.type,
        severity: b.severity,
        impact: b.impact,
        status: b.status,
        raisedAt: b.raisedAt,
        targetResolutionAt: b.targetResolutionAt,
        elapsedHours,
        hoursRemaining,
        isBreached,
        raisedBy: b.raisedBy,
        assignedOwner: b.assignedOwner,
        projectCodeReference: b.projectCodeReference,
      };
    });

    const totalOpen = items.length;
    const breachedCount = items.filter((i) => i.isBreached).length;
    const criticalCount = items.filter((i) => i.severity === 'CRITICAL').length;
    const highCount = items.filter((i) => i.severity === 'HIGH').length;

    return {
      evaluatedAt: now.toISOString(),
      summary: {
        totalOpen,
        breachedCount,
        criticalCount,
        highCount,
        slaComplianceRate: totalOpen > 0 ? Math.round(((totalOpen - breachedCount) / totalOpen) * 100) : 100,
      },
      blockers: items,
    };
  }
}
