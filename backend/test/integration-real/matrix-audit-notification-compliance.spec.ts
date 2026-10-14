import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import {
  PrismaClient,
  ComplianceEventType,
  NotificationChannel,
  NotificationStatus,
  DailyStatus,
  BlockerSeverity,
  OwnerNeededType,
  BlockerStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { NotificationService } from '../../src/modules/notification/notification.service.js';
import { StatusSuggestionService } from '../../src/modules/daily-accountability/services/status-suggestion.service.js';
import { SystemNotificationTrigger } from '../../src/modules/notification/constants/notification-trigger.constants.js';

describe('Real PostgreSQL Integration Matrix: Audit, Notification & Compliance', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let pgClient: pg.Client;
  let prisma: PrismaClient;
  let auditService: AuditService;
  let notificationService: NotificationService;
  let statusSuggestionService: StatusSuggestionService;

  beforeAll(async () => {
    pgClient = new pg.Client({ connectionString: databaseUrl });
    await pgClient.connect();

    const cleanUrl = databaseUrl.replace(/[?&]sslmode=require/g, '');
    const adapter = new PrismaPg({ connectionString: cleanUrl, ssl: false });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();

    auditService = new AuditService(prisma as any);
    notificationService = new NotificationService(prisma as any, { sendEmail: async () => ({ success: true }) } as any, {} as any);
    statusSuggestionService = new StatusSuggestionService(prisma as any);
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (pgClient) await pgClient.end();
  });

  it('P2A-ANC-01: AuditLog Persistence — should persist human actor and system-null actor in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });

    // 1. Human-triggered AuditLog
    const humanLog = await auditService.record({
      actorUserId: alice!.id,
      action: 'COMMITMENT_SUBMITTED',
      relatedEntityType: 'DailyAccountabilityRecord',
      relatedEntityId: '00000000-0000-4000-e000-000000000001',
      valueAfter: { commitmentsCount: 2, status: 'GREEN' },
    });

    expect(humanLog.id).toBeDefined();
    expect(humanLog.actorUserId).toBe(alice!.id);

    // Raw PostgreSQL verification for human audit
    const rawHuman = await pgClient.query<{ actor_user_id: string | null; action: string }>(
      'SELECT "actorUserId" as actor_user_id, action FROM audit_logs WHERE id = $1',
      [humanLog.id]
    );
    expect(rawHuman.rows[0].actor_user_id).toBe(alice!.id);
    expect(rawHuman.rows[0].action).toBe('COMMITMENT_SUBMITTED');

    // 2. System-triggered AuditLog (SAD §15.2: actorUserId = NULL)
    const systemLog = await auditService.record({
      actorUserId: undefined, // System
      action: 'AUTO_ESCALATION_TRIGGERED',
      relatedEntityType: 'Blocker',
      relatedEntityId: '00000000-0000-4000-b000-000000000001',
      valueAfter: { escalationLevel: 'Head' },
    });

    expect(systemLog.id).toBeDefined();
    expect(systemLog.actorUserId).toBeNull();

    // Raw PostgreSQL verification for system audit
    const rawSystem = await pgClient.query<{ actor_user_id: string | null; action: string }>(
      'SELECT "actorUserId" as actor_user_id, action FROM audit_logs WHERE id = $1',
      [systemLog.id]
    );
    expect(rawSystem.rows[0].actor_user_id).toBeNull();
    expect(rawSystem.rows[0].action).toBe('AUTO_ESCALATION_TRIGGERED');

    // Cleanup
    await prisma.auditLog.deleteMany({ where: { id: { in: [humanLog.id, systemLog.id] } } });
  });

  it('P2A-ANC-02: Notification Persistence — should persist notifications with recipient and channel in real PostgreSQL', async () => {
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });

    const notifications = await notificationService.dispatch({
      recipientUserId: bob!.id,
      triggerType: SystemNotificationTrigger.CRITICAL_INSTANT_BLOCKER,
      relatedEntityType: 'Blocker',
      relatedEntityId: '00000000-0000-4000-b000-000000000001',
      payload: {
        title: 'New Blocker Requires Attention',
        body: 'A critical blocker has been raised and assigned to you.',
        linkPath: '/blockers/00000000-0000-4000-b000-000000000001',
        iconType: 'blocker',
      },
    });

    expect(notifications.length).toBeGreaterThanOrEqual(1);

    // Verify raw PostgreSQL: Notification exists
    const rawNotif = await pgClient.query<{ id: string; recipient_user_id: string; trigger_type: string; channel: string; status: string }>(
      'SELECT id, "recipientUserId" as recipient_user_id, "triggerType" as trigger_type, channel, status FROM notifications WHERE id = $1',
      [notifications[0].id]
    );
    expect(rawNotif.rows.length).toBe(1);
    expect(rawNotif.rows[0].recipient_user_id).toBe(bob!.id);
    expect(rawNotif.rows[0].trigger_type).toBe(SystemNotificationTrigger.CRITICAL_INSTANT_BLOCKER);
    expect(rawNotif.rows[0].channel).toBe('WebNotificationCenter');
    expect(rawNotif.rows[0].status).toBe('Sent');

    // Cleanup
    await prisma.notification.delete({ where: { id: notifications[0].id } });
  });

  it('P2A-ANC-03: ComplianceEvent & PatternFlag Persistence — should create and query PatternFlag event in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });

    const event = await prisma.complianceEvent.create({
      data: {
        userId: alice!.id,
        eventType: ComplianceEventType.PatternFlag,
        eventDate: new Date('2026-10-07T00:00:00Z'),
        policySnapshot: { consecutiveDaysCount: 3, threshold: 3 },
        followUpStatus: 'PendingSupervisorReview',
      },
    });

    expect(event.id).toBeDefined();
    expect(event.eventType).toBe(ComplianceEventType.PatternFlag);

    // Raw PostgreSQL verification
    const rawEvent = await pgClient.query<{ event_type: string; follow_up_status: string }>(
      'SELECT "eventType" as event_type, "followUpStatus" as follow_up_status FROM compliance_events WHERE id = $1',
      [event.id]
    );
    expect(rawEvent.rows.length).toBe(1);
    expect(rawEvent.rows[0].event_type).toBe('PatternFlag');
    expect(rawEvent.rows[0].follow_up_status).toBe('PendingSupervisorReview');

    // Cleanup
    await prisma.complianceEvent.delete({ where: { id: event.id } });
  });

  it('P2A-ANC-04: Status Suggestion Engine — should evaluate suggestion without mutating user record in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });

    // 1. Create a Critical Open blocker for Alice to trigger RED status suggestion
    const blocker = await prisma.blocker.create({
      data: {
        raisedByUserId: alice!.id,
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        ownerNeededUserId: alice!.id,
        type: 'Infrastructure',
        impact: 'High severity outage',
        severity: BlockerSeverity.Critical,
        status: BlockerStatus.Open,
      },
    });

    // 2. Evaluate suggested status
    const suggestion = await statusSuggestionService.evaluateSuggestedStatus(
      alice!.id,
      [],
      new Date('2026-10-07T00:00:00Z')
    );

    expect(suggestion.suggestedStatus).toBe(DailyStatus.RED);
    expect(suggestion.reasons.length).toBeGreaterThan(0);
    expect(suggestion.reasons[0]).toContain('Critical');

    // 3. Verify user status in PostgreSQL remains unchanged (Active)
    const userAfter = await prisma.user.findUnique({ where: { id: alice!.id } });
    expect(userAfter?.status).toBe('Active');

    // Cleanup
    await prisma.blocker.delete({ where: { id: blocker.id } });
  });
});
