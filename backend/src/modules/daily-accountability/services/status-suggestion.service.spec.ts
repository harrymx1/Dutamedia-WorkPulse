import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BlockerSeverity,
  BlockerStatus,
  CommitmentOutcome,
  DailyStatus,
} from '@prisma/client';
import { StatusSuggestionService } from './status-suggestion.service.js';

describe('StatusSuggestionService (ADR-013 Fixed Product Heuristic)', () => {
  let service: StatusSuggestionService;
  let prismaMock: {
    blocker: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  const userId = 'user-test-uuid-1';
  const asOfDate = new Date('2026-10-02T17:00:00.000Z');

  beforeEach(() => {
    prismaMock = {
      blocker: {
        findMany: vi.fn(),
      },
    };

    service = new StatusSuggestionService(prismaMock as any);
  });

  describe('1. Active Blocker Evaluation (FR-14 & ADR-013)', () => {
    it('1.1 harus menyarankan status RED jika terdapat blocker aktif dengan severity Critical', async () => {
      prismaMock.blocker.findMany.mockResolvedValue([
        {
          id: 'blocker-crit-1',
          severity: BlockerSeverity.Critical,
          type: 'Technical',
          impact: 'Sistem payment gateway tidak merespons',
        },
      ]);

      const items = [{ outcome: CommitmentOutcome.Completed }];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.RED);
      expect(result.reasons).toContain(
        'Terdapat blocker dengan tingkat keparahan Critical yang masih aktif.',
      );
      expect(prismaMock.blocker.findMany).toHaveBeenCalledWith({
        where: {
          raisedByUserId: userId,
          status: {
            in: [
              BlockerStatus.Open,
              BlockerStatus.Acknowledged,
              BlockerStatus.InProgress,
            ],
          },
        },
        select: {
          id: true,
          severity: true,
          type: true,
          impact: true,
        },
      });
    });

    it('1.2 harus menyarankan status AMBER jika terdapat blocker aktif dengan severity High (tanpa Critical)', async () => {
      prismaMock.blocker.findMany.mockResolvedValue([
        {
          id: 'blocker-high-1',
          severity: BlockerSeverity.High,
          type: 'InterTeamDependency',
          impact: 'Menunggu schema API dari tim backend auth',
        },
      ]);

      const items = [{ outcome: CommitmentOutcome.Completed }];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.AMBER);
      expect(result.reasons).toContain(
        'Terdapat blocker dengan tingkat keparahan High yang masih aktif.',
      );
    });

    it('1.3 blocker berstatus non-aktif (Resolved, Closed, AcceptedRisk) tidak dianggap sebagai active blocker', async () => {
      // Query Prisma memfilter status in [Open, Acknowledged, InProgress].
      // Jika blocker berstatus Resolved/Closed/AcceptedRisk, findMany mengembalikan array kosong.
      prismaMock.blocker.findMany.mockResolvedValue([]);

      const items = [{ outcome: CommitmentOutcome.Completed }];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.GREEN);
      expect(result.reasons).not.toContain(
        'Terdapat blocker dengan tingkat keparahan Critical yang masih aktif.',
      );
      expect(result.reasons).not.toContain(
        'Terdapat blocker dengan tingkat keparahan High yang masih aktif.',
      );
      expect(result.reasons).toContain(
        'Seluruh komitmen dan pekerjaan selesai (Completed).',
      );
    });

    it('1.4 blocker dengan severity Low atau Medium tidak menaikkan severityRank secara otomatis', async () => {
      prismaMock.blocker.findMany.mockResolvedValue([
        {
          id: 'blocker-low-1',
          severity: BlockerSeverity.Low,
          type: 'ResourceOrAccess',
          impact: 'Mouse baterai habis',
        },
        {
          id: 'blocker-med-1',
          severity: BlockerSeverity.Medium,
          type: 'Technical',
          impact: 'Akses staging lambat',
        },
      ]);

      const items = [{ outcome: CommitmentOutcome.Completed }];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      // Low/Medium tidak memicu Critical atau High branch
      expect(result.suggestedStatus).toBe(DailyStatus.GREEN);
      expect(result.reasons).toEqual([
        'Berdasarkan evaluasi seluruh parameter capaian hari ini.',
      ]);
    });
  });

  describe('2. Outcome Evaluation (Commitment & AdditionalWork)', () => {
    beforeEach(() => {
      prismaMock.blocker.findMany.mockResolvedValue([]);
    });

    it('2.1 harus menyarankan status RED jika >= 50% pekerjaan berstatus NotCompleted atau Cancelled', async () => {
      // Skenario A: 2 dari 3 NotCompleted (66.7% >= 50%)
      const itemsA = [
        { outcome: CommitmentOutcome.NotCompleted },
        { outcome: CommitmentOutcome.NotCompleted },
        { outcome: CommitmentOutcome.Completed },
      ];
      const resultA = await service.evaluateSuggestedStatus(userId, itemsA, asOfDate);

      expect(resultA.suggestedStatus).toBe(DailyStatus.RED);
      expect(resultA.reasons).toContain(
        '2 dari 3 pekerjaan berstatus NotCompleted atau Cancelled.',
      );

      // Skenario B: 1 dari 2 Cancelled (50% >= 50%)
      const itemsB = [
        { outcome: CommitmentOutcome.Cancelled },
        { outcome: CommitmentOutcome.Completed },
      ];
      const resultB = await service.evaluateSuggestedStatus(userId, itemsB, asOfDate);

      expect(resultB.suggestedStatus).toBe(DailyStatus.RED);
      expect(resultB.reasons).toContain(
        '1 dari 2 pekerjaan berstatus NotCompleted atau Cancelled.',
      );

      // Skenario C: 1 dari 1 NotCompleted (100% >= 50%)
      const itemsC = [{ outcome: CommitmentOutcome.NotCompleted }];
      const resultC = await service.evaluateSuggestedStatus(userId, itemsC, asOfDate);

      expect(resultC.suggestedStatus).toBe(DailyStatus.RED);
      expect(resultC.reasons).toContain(
        '1 dari 1 pekerjaan berstatus NotCompleted atau Cancelled.',
      );
    });

    it('2.2 harus menyarankan status AMBER jika < 50% pekerjaan berstatus NotCompleted atau Cancelled', async () => {
      // 1 dari 3 NotCompleted (33.3% < 50%)
      const items = [
        { outcome: CommitmentOutcome.NotCompleted },
        { outcome: CommitmentOutcome.Completed },
        { outcome: CommitmentOutcome.Completed },
      ];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.AMBER);
      expect(result.reasons).toContain(
        'Sebagian pekerjaan berstatus NotCompleted atau Cancelled.',
      );
    });

    it('2.3 harus menyarankan status AMBER jika terdapat pekerjaan berstatus PartiallyCompleted', async () => {
      const items = [
        { outcome: CommitmentOutcome.PartiallyCompleted },
        { outcome: CommitmentOutcome.Completed },
      ];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.AMBER);
      expect(result.reasons).toContain(
        '1 pekerjaan berstatus PartiallyCompleted.',
      );
    });

    it('2.4 harus menyarankan status GREEN jika seluruh pekerjaan Completed dan tidak ada blocker aktif', async () => {
      const items = [
        { outcome: CommitmentOutcome.Completed },
        { outcome: CommitmentOutcome.Completed },
        { outcome: CommitmentOutcome.Completed },
      ];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.GREEN);
      expect(result.reasons).toContain(
        'Seluruh komitmen dan pekerjaan selesai (Completed).',
      );
    });
  });

  describe('3. Combined Evaluation & Severity Precedence', () => {
    it('3.1 severityRank 2 (RED) memiliki preseden di atas severityRank 1 (AMBER)', async () => {
      // Blocker High (AMBER) + >= 50% NotCompleted (RED)
      prismaMock.blocker.findMany.mockResolvedValue([
        {
          id: 'b-high',
          severity: BlockerSeverity.High,
          type: 'Technical',
          impact: 'Testing delay',
        },
      ]);

      const items = [
        { outcome: CommitmentOutcome.NotCompleted },
        { outcome: CommitmentOutcome.NotCompleted },
        { outcome: CommitmentOutcome.Completed },
      ];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.RED);
      expect(result.reasons).toContain(
        'Terdapat blocker dengan tingkat keparahan High yang masih aktif.',
      );
      expect(result.reasons).toContain(
        '2 dari 3 pekerjaan berstatus NotCompleted atau Cancelled.',
      );
    });

    it('3.2 Critical Blocker (RED) tetap menghasilkan status RED meskipun seluruh komitmen Completed', async () => {
      prismaMock.blocker.findMany.mockResolvedValue([
        {
          id: 'b-crit',
          severity: BlockerSeverity.Critical,
          type: 'Database',
          impact: 'Cluster dead',
        },
      ]);

      const items = [
        { outcome: CommitmentOutcome.Completed },
        { outcome: CommitmentOutcome.Completed },
      ];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.RED);
      expect(result.reasons).toContain(
        'Terdapat blocker dengan tingkat keparahan Critical yang masih aktif.',
      );
      // "Seluruh komitmen dan pekerjaan selesai" tidak muncul karena activeBlockers.length > 0
      expect(result.reasons).not.toContain(
        'Seluruh komitmen dan pekerjaan selesai (Completed).',
      );
    });

    it('3.3 jika terdapat Critical dan High blocker sekaligus, severity Critical mendominasi', async () => {
      prismaMock.blocker.findMany.mockResolvedValue([
        { id: 'b1', severity: BlockerSeverity.Critical, type: 'A', impact: 'A' },
        { id: 'b2', severity: BlockerSeverity.High, type: 'B', impact: 'B' },
      ]);

      const items = [{ outcome: CommitmentOutcome.Completed }];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.RED);
      expect(result.reasons).toContain(
        'Terdapat blocker dengan tingkat keparahan Critical yang masih aktif.',
      );
      // hasHighBlocker berada di branch else-if dari hasCriticalBlocker
      expect(result.reasons).not.toContain(
        'Terdapat blocker dengan tingkat keparahan High yang masih aktif.',
      );
    });

    it('3.4 PartiallyCompleted tidak mengubah severityRank jika sudah bernilai 2 (RED)', async () => {
      // Critical blocker sudah set severityRank = 2
      prismaMock.blocker.findMany.mockResolvedValue([
        { id: 'b1', severity: BlockerSeverity.Critical, type: 'A', impact: 'A' },
      ]);

      const items = [
        { outcome: CommitmentOutcome.PartiallyCompleted },
        { outcome: CommitmentOutcome.Completed },
      ];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.RED);
      // Karena severityRank < 2 bernilai false saat evaluasi PartiallyCompleted:
      expect(result.reasons).not.toContain(
        '1 pekerjaan berstatus PartiallyCompleted.',
      );
    });
  });

  describe('4. Empty / Edge Cases & Fallback', () => {
    it('4.1 daftar items kosong dan tidak ada blocker aktif menghasilkan status GREEN dengan alasan default', async () => {
      prismaMock.blocker.findMany.mockResolvedValue([]);

      const result = await service.evaluateSuggestedStatus(userId, [], asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.GREEN);
      expect(result.reasons).toEqual([
        'Berdasarkan evaluasi seluruh parameter capaian hari ini.',
      ]);
    });

    it('4.2 menangani item dengan outcome null atau undefined dengan aman', async () => {
      prismaMock.blocker.findMany.mockResolvedValue([]);

      const items = [
        { outcome: null },
        { outcome: undefined },
      ];
      const result = await service.evaluateSuggestedStatus(userId, items, asOfDate);

      expect(result.suggestedStatus).toBe(DailyStatus.GREEN);
      expect(result.reasons).toEqual([
        'Berdasarkan evaluasi seluruh parameter capaian hari ini.',
      ]);
    });

    it('4.3 menggunakan default asOfDate (new Date()) jika parameter tidak disediakan', async () => {
      prismaMock.blocker.findMany.mockResolvedValue([]);

      const result = await service.evaluateSuggestedStatus(userId, []);

      expect(result.suggestedStatus).toBe(DailyStatus.GREEN);
      expect(result.reasons).toEqual([
        'Berdasarkan evaluasi seluruh parameter capaian hari ini.',
      ]);
    });
  });
});

