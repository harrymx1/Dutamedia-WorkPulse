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

  it('upgrades existing multi-line BLOCKER_SUPPORT_REJECTED notification by replacing Tindak Lanjut Anda with Pelapor name', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([
      {
        id: 'notif-sup-rej-1',
        recipientUserId: 'owner-ab',
        triggerType: 'BLOCKER_SUPPORT_REJECTED',
        title: 'Bantuan Ditolak Pelapor: Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form',
        message: [
          'Pelapor menolak kontribusi bantuan "Cek null-check" karena dinilai belum membantu: "Masih error 500".',
          'Judul Kendala: Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form',
          'Status Tiket: Sedang Ditangani (Bantuan Ditolak Pelapor)',
          'Aksi Bantuan yang Ditolak: Cek null-check',
          'Alasan Penolakan Pelapor: Masih error 500',
          'Tindak Lanjut Anda: Tinjau alasan penolakan pelapor dan lanjutkan penanganan atau berikan bantuan alternatif.',
        ].join('\n'),
        relatedEntityType: 'blocker_tickets',
        relatedEntityId: 'blk-1',
        readAt: null,
      },
    ]);
    mockPrisma.notification.count.mockResolvedValue(1);
    mockPrisma.blockerTicket = {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'blk-1',
          type: 'TECHNICAL',
          severity: 'HIGH',
          impact: 'MILESTONE',
          description: '[Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form] Gagal submit.',
          raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho' },
          assignedOwner: { id: 'owner-ab', fullName: 'Arif Budiman' },
        },
      ]),
    };

    const res = await service.getUserNotifications('owner-ab');

    expect(res.notifications).toHaveLength(1);
    const updatedTitle = res.notifications[0].title;
    const updatedMsg = res.notifications[0].message;
    expect(updatedTitle).toBe(
      'Bantuan Belum Membantu: Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form',
    );
    expect(updatedMsg).toContain(
      'Aditya Nugroho menginformasikan bahwa bantuan yang diberikan belum membantu mengatasi kendala.',
    );
    expect(updatedMsg.split('\n')[0]).not.toContain('"');
    expect(updatedMsg).toContain('Pelapor: Aditya Nugroho');
    expect(updatedMsg).toContain('Status Tiket: Sedang Ditangani');
    expect(updatedMsg).not.toContain('Bantuan Ditolak Pelapor');
    expect(updatedMsg).toContain('Bantuan yang Dicoba: Cek null-check');
    expect(updatedMsg).toContain('Catatan / Kendala yang Masih Terjadi: Masih error 500');
    expect(updatedMsg).not.toContain('Tindak Lanjut Anda:');
    expect(mockPrisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif-sup-rej-1' },
      data: {
        title: updatedTitle,
        message: updatedMsg,
      },
    });
  });

  it('auto-upgrades legacy Tiket Dikembalikan Pelapor notifications contextually to Solusi Belum Memadai or Mitigasi Belum Memadai', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([
      {
        id: 'notif-reopen-res',
        recipientUserId: 'owner-ab',
        triggerType: 'BLOCKER_REOPENED_BY_REPORTER',
        title: 'Tiket Dikembalikan Pelapor: Endpoint API Error 500',
        message: [
          'Aditya Nugroho menyatakan bahwa solusi atau arahan mitigasi belum memadai sehingga status tiket dikembalikan ke Sedang Ditangani.',
          'Judul Kendala: Endpoint API Error 500',
          'Pelapor: Aditya Nugroho',
          'Status Tiket: Sedang Ditangani',
          'Alasan Pengembalian: Cache API lama masih muncul saat reload.',
        ].join('\n'),
        relatedEntityType: 'blocker_tickets',
        relatedEntityId: 'blk-res-1',
        createdAt: new Date('2026-11-17T04:46:00.000Z'),
        readAt: null,
      },
      {
        id: 'notif-reopen-risk',
        recipientUserId: 'owner-ab',
        triggerType: 'BLOCKER_REOPENED_BY_REPORTER',
        title: 'Tiket Dikembalikan Pelapor: Vendor API Sandbox Limit',
        message: [
          'Aditya Nugroho menyatakan bahwa solusi atau arahan mitigasi belum memadai sehingga status tiket dikembalikan ke Sedang Ditangani.',
          'Judul Kendala: Vendor API Sandbox Limit',
          'Pelapor: Aditya Nugroho',
          'Status Tiket: Sedang Ditangani',
          'Alasan Pengembalian: Mock endpoint tidak memiliki field terbaru.',
        ].join('\n'),
        relatedEntityType: 'blocker_tickets',
        relatedEntityId: 'blk-risk-1',
        createdAt: new Date('2026-11-17T05:00:00.000Z'),
        readAt: null,
      },
    ]);
    mockPrisma.notification.count.mockResolvedValue(2);
    mockPrisma.blockerTicket = {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'blk-res-1',
          type: 'TECHNICAL',
          severity: 'HIGH',
          impact: 'MILESTONE',
          description: '[Endpoint API Error 500] Gagal submit.',
          raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho' },
          assignedOwner: { id: 'owner-ab', fullName: 'Arif Budiman' },
          supportContributions: [
            {
              actionTaken: 'Solusi Diberikan oleh Penanggung Jawab',
              createdAt: new Date('2026-11-17T04:40:00.000Z'),
            },
          ],
        },
        {
          id: 'blk-risk-1',
          type: 'VENDOR',
          severity: 'HIGH',
          impact: 'PROJECT',
          description: '[Vendor API Sandbox Limit] Kuota habis.',
          raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho' },
          assignedOwner: { id: 'owner-ab', fullName: 'Arif Budiman' },
          supportContributions: [
            {
              actionTaken: '[PIC_ACCEPTED_RISK] Tunggu perpanjangan kuartal depan',
              createdAt: new Date('2026-11-17T04:50:00.000Z'),
            },
          ],
        },
      ]),
    };

    const res = await service.getUserNotifications('owner-ab');

    expect(res.notifications).toHaveLength(2);
    expect(res.notifications[0].title).toBe('Solusi Belum Memadai: Endpoint API Error 500');
    expect(res.notifications[0].message).toContain(
      'Aditya Nugroho menyatakan bahwa solusi yang diberikan belum memadai untuk mengatasi kendala, sehingga tiket kembali berstatus Sedang Ditangani.',
    );
    expect(res.notifications[0].message).toContain(
      'Catatan / Alasan Belum Memadai: Cache API lama masih muncul saat reload.',
    );

    expect(res.notifications[1].title).toBe('Mitigasi Belum Memadai: Vendor API Sandbox Limit');
    expect(res.notifications[1].message).toContain(
      'Aditya Nugroho menyatakan bahwa arahan mitigasi risiko belum memadai untuk dijalankan, sehingga tiket kembali berstatus Sedang Ditangani.',
    );
    expect(res.notifications[1].message).toContain(
      'Catatan / Alasan Belum Memadai: Mock endpoint tidak memiliki field terbaru.',
    );
  });
});

