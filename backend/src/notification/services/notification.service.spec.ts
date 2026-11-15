import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from './notification.service';
import { NotificationChannel } from '@prisma/client';

describe('NotificationService (WP-EP11 / Notification Center & Multi-Channel Delivery)', () => {
  let service: NotificationService;
  let mockPrisma: any;
  let mockClock: any;

  beforeEach(() => {
    mockPrisma = {
      notification: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T10:00:00.000Z')),
    };

    service = new NotificationService(mockPrisma, mockClock);
  });

  it('fetches user notifications and unread counter', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([
      { id: 'n-1', title: 'Tiket Baru', readAt: null },
    ]);
    mockPrisma.notification.count.mockResolvedValue(1);

    const res = await service.getUserNotifications('usr-1');
    expect(res.notifications).toHaveLength(1);
    expect(res.unreadCount).toBe(1);
  });

  it('marks single notification as read', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({
      id: 'n-1',
      recipientUserId: 'usr-1',
      readAt: null,
    });
    mockPrisma.notification.update.mockResolvedValue({
      id: 'n-1',
      readAt: new Date('2026-10-28T10:00:00.000Z'),
    });

    const res = await service.markAsRead('usr-1', 'n-1');
    expect(res.readAt).toBeDefined();
    expect(mockPrisma.notification.update).toHaveBeenCalled();
  });

  it('provides channel configuration matrix and triggers test delivery', async () => {
    const config = await service.getChannelConfigurations();
    expect(config.channels).toHaveLength(3);
    expect(config.triggerMatrix.length).toBeGreaterThan(0);

    const testRes = await service.testChannelDelivery(
      NotificationChannel.IN_APP_CENTER,
      'admin@dutamedia.com',
    );
    expect(testRes.success).toBe(true);
    expect(testRes.latencyMs).toBeDefined();
  });

  it('enriches and persists legacy truncated BLOCKER_RAISED notification from linked BlockerTicket', async () => {
    const fullBody =
      'Integrasi halaman komitmen pagi di frontend gagal menyimpan data karena endpoint POST /daily/commitments merespons HTTP 500 akibat deadlock query transaksi database.';
    const expectedHelp = 'Perbaikan query transaksi di endpoint backend';
    mockPrisma.notification.findMany.mockResolvedValue([
      {
        id: 'notif-legacy-1',
        recipientUserId: 'owner-ab',
        triggerType: 'BLOCKER_RAISED',
        title: 'Kendala Baru Dialokasikan: HIGH Impact MILESTONE',
        message:
          'Kendala "[Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form] Integrasi halaman komitmen p" telah dialokasikan kepada Anda dengan target respon 4 jam.',
        relatedEntityType: 'blocker_tickets',
        relatedEntityId: 'blk-legacy-1',
        readAt: null,
      },
    ]);
    mockPrisma.notification.count.mockResolvedValue(1);
    mockPrisma.blockerTicket = {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'blk-legacy-1',
          type: 'TECHNICAL',
          severity: 'HIGH',
          impact: 'MILESTONE',
          description: `[Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form] ${fullBody} (Ekspektasi: ${expectedHelp})`,
          raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho' },
          assignedOwner: { id: 'owner-ab', fullName: 'Arif Budiman' },
        },
      ]),
    };

    const res = await service.getUserNotifications('owner-ab');

    expect(res.notifications).toHaveLength(1);
    const enriched = res.notifications[0];
    expect(enriched.title).toBe(
      'Kendala Baru Dialokasikan: Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form',
    );
    expect(enriched.message).toContain('Pelapor: Aditya Nugroho');
    expect(enriched.message).toContain(`Deskripsi Kendala: ${fullBody}`);
    expect(enriched.message).toContain(`Ekspektasi Bantuan: ${expectedHelp}`);
    expect(mockPrisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif-legacy-1' },
      data: {
        title: enriched.title,
        message: enriched.message,
      },
    });
  });
});

