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
});

