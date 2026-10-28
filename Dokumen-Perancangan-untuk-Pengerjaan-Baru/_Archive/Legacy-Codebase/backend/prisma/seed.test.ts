import { PrismaClient, Role, UserStatus, DailyStatus, SubmissionTiming, BlockerSeverity, OwnerNeededType, BlockerStatus, CorrectionClassification, CorrectionStatus, PolicyCategory, PolicyStatus, NotificationChannel, NotificationStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env.test is loaded
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const rawUrl = process.env.DATABASE_URL || '';
if (!rawUrl || rawUrl.includes('supabase.co')) {
  throw new Error('FATAL SAFETY VIOLATION: Refusing to seed non-test or Supabase database.');
}

const cleanUrl = rawUrl.replace(/[?&]sslmode=require/g, '');
const adapter = new PrismaPg({
  connectionString: cleanUrl,
  ssl: false,
});
const prisma = new PrismaClient({ adapter });

export const TEST_USERS = {
  ALICE: {
    id: '00000000-0000-4000-a000-000000000001',
    email: 'alice@dutamedia.test',
    fullName: 'Alice Employee',
    role: Role.Employee,
    function: 'Engineering',
  },
  BOB: {
    id: '00000000-0000-4000-a000-000000000002',
    email: 'bob@dutamedia.test',
    fullName: 'Bob Supervisor',
    role: Role.Supervisor_TL,
    function: 'Engineering',
  },
  CAROL: {
    id: '00000000-0000-4000-a000-000000000003',
    email: 'carol@dutamedia.test',
    fullName: 'Carol Head Dept',
    role: Role.Head,
    function: 'Engineering',
  },
  DAVE: {
    id: '00000000-0000-4000-a000-000000000004',
    email: 'dave@dutamedia.test',
    fullName: 'Dave HRGA Admin',
    role: Role.HRGA,
    function: 'HRGA',
  },
  EVA: {
    id: '00000000-0000-4000-a000-000000000005',
    email: 'eva@dutamedia.test',
    fullName: 'Eva CEO Director',
    role: Role.CEO_Management,
    function: 'Management',
  },
  ADMIN: {
    id: '00000000-0000-4000-a000-000000000006',
    email: 'admin@dutamedia.test',
    fullName: 'System Administrator',
    role: Role.SystemAdmin,
    function: 'Management',
  },
};

export const TEST_FIXTURES = {
  COMMITMENT_ID: '00000000-0000-4000-a000-000000000011',
  BLOCKER_ID: '00000000-0000-4000-b000-000000000001',
  CORRECTION_ID: '00000000-0000-4000-d000-000000000001',
  DAILY_RECORD_ID: '00000000-0000-4000-e000-000000000001',
  AUDIT_HUMAN_ID: '00000000-0000-4000-f000-000000000001',
  AUDIT_SYSTEM_ID: '00000000-0000-4000-f000-000000000002',
};

export async function seedDeterministicTestData(): Promise<void> {
  console.log('Seeding deterministic test fixtures into PostgreSQL test DB...');

  // 1. Truncate in reverse order for clean slate
  const tables = [
    'audit_logs',
    'notifications',
    'support_contributions',
    'correction_requests',
    'blockers',
    'commitments',
    'additional_works',
    'compliance_events',
    'daily_accountability_records',
    'manager_notes',
    'exceptions',
    'policy_owner_assignments',
    'policies',
    'temporary_reviewer_assignments',
    'project_authority_mappings',
    'organizational_assignments',
    'sessions',
    'users',
  ];

  for (const t of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE;`);
  }

  // 2. Hash standard test password
  const defaultPasswordHash = await argon2.hash('TestPassword123!');

  // 3. Seed Users
  for (const u of Object.values(TEST_USERS)) {
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        passwordHash: defaultPasswordHash,
        status: UserStatus.Active,
        mustResetPassword: false,
      },
    });
  }

  // 4. Seed Organizational Assignments with Effective Dating
  const effectiveDate = new Date('2026-01-01T00:00:00Z');

  // Alice -> supervised by Bob
  await prisma.organizationalAssignment.create({
    data: {
      userId: TEST_USERS.ALICE.id,
      role: Role.Employee,
      function: 'Engineering',
      directManagerId: TEST_USERS.BOB.id,
      effectiveDate,
      createdByUserId: TEST_USERS.ADMIN.id,
    },
  });

  // Bob -> supervised by Carol
  await prisma.organizationalAssignment.create({
    data: {
      userId: TEST_USERS.BOB.id,
      role: Role.Supervisor_TL,
      function: 'Engineering',
      directManagerId: TEST_USERS.CAROL.id,
      effectiveDate,
      createdByUserId: TEST_USERS.ADMIN.id,
    },
  });

  // Carol -> reports to Eva
  await prisma.organizationalAssignment.create({
    data: {
      userId: TEST_USERS.CAROL.id,
      role: Role.Head,
      function: 'Engineering',
      directManagerId: TEST_USERS.EVA.id,
      effectiveDate,
      createdByUserId: TEST_USERS.ADMIN.id,
    },
  });

  // Dave -> HRGA reports to Eva
  await prisma.organizationalAssignment.create({
    data: {
      userId: TEST_USERS.DAVE.id,
      role: Role.HRGA,
      function: 'HRGA',
      directManagerId: TEST_USERS.EVA.id,
      effectiveDate,
      createdByUserId: TEST_USERS.ADMIN.id,
    },
  });

  // Eva -> CEO Director
  await prisma.organizationalAssignment.create({
    data: {
      userId: TEST_USERS.EVA.id,
      role: Role.CEO_Management,
      function: 'Management',
      directManagerId: null,
      effectiveDate,
      createdByUserId: TEST_USERS.ADMIN.id,
    },
  });

  // SysAdmin
  await prisma.organizationalAssignment.create({
    data: {
      userId: TEST_USERS.ADMIN.id,
      role: Role.SystemAdmin,
      function: 'Management',
      directManagerId: null,
      effectiveDate,
      createdByUserId: TEST_USERS.ADMIN.id,
    },
  });

  // 5. Project Authority Mapping (Bob has project authority for 'Billing-Core-Module')
  await prisma.projectAuthorityMapping.create({
    data: {
      userId: TEST_USERS.BOB.id,
      scopeReference: 'Billing-Core-Module',
      effectiveDate,
      createdByUserId: TEST_USERS.ADMIN.id,
    },
  });

  // 6. Active Policies
  const policies = [
    { category: PolicyCategory.Cutoff, value: { morning: '09:30', eod: '17:30' } },
    { category: PolicyCategory.ObjectionWindowDuration, value: { durationHours: 24 } },
    { category: PolicyCategory.EscalationThreshold, value: { hours: 4 } },
    { category: PolicyCategory.RetentionPeriod, value: { days: 90 } },
    { category: PolicyCategory.MinorMaterialThreshold, value: { minorChanges: ['grammar', 'clarification'], materialChanges: ['scope', 'outcome'] } },
  ];

  for (const p of policies) {
    await prisma.policy.create({
      data: {
        category: p.category,
        value: p.value,
        effectiveDate,
        status: PolicyStatus.Active,
        createdByUserId: TEST_USERS.ADMIN.id,
      },
    });
  }

  // 7. Seed Sample Daily Accountability Record for Alice (Work Date: Today WIB per SAD §17.7 Trace A)
  const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const wibYear = nowWib.getUTCFullYear();
  const wibMonth = String(nowWib.getUTCMonth() + 1).padStart(2, '0');
  const wibDay = String(nowWib.getUTCDate()).padStart(2, '0');
  const todayWibStr = `${wibYear}-${wibMonth}-${wibDay}`;
  const workDate = new Date(`${todayWibStr}T00:00:00.000Z`);

  const dailyRecord = await prisma.dailyAccountabilityRecord.create({
    data: {
      id: TEST_FIXTURES.DAILY_RECORD_ID,
      employeeUserId: TEST_USERS.ALICE.id,
      workDate,
      orgContextSnapshot: { department: 'Engineering', managerId: TEST_USERS.BOB.id },
      policySnapshot: { morningCutoff: '09:30', maxCommitments: 3 },
      morningSubmittedAt: new Date(`${todayWibStr}T01:30:00.000Z`), // 08:30 WIB (OnTime)
      cutoffLockedAt: new Date(`${todayWibStr}T02:30:00.000Z`), // 09:30 WIB (Cutoff Locked)
      morningTiming: SubmissionTiming.OnTime,
      initialStatus: DailyStatus.GREEN,
    },
  });

  // Commitment #1 (Baseline locked per SAD §17.7 Trace A)
  const commitment = await prisma.commitment.create({
    data: {
      id: TEST_FIXTURES.COMMITMENT_ID,
      dailyRecordId: dailyRecord.id,
      sequenceNo: 1,
      text: 'Implement and test payment webhook endpoint on isolated PostgreSQL',
      initialRisk: DailyStatus.GREEN,
      isMorningLocked: true,
    },
  });

  // 8. Seed Blocker
  await prisma.blocker.create({
    data: {
      id: TEST_FIXTURES.BLOCKER_ID,
      linkedCommitmentId: commitment.id,
      type: 'Technical',
      impact: 'Blocks payment webhook integration testing',
      severity: BlockerSeverity.Critical,
      ownerNeededType: OwnerNeededType.OrganizationalAuthority,
      ownerNeededUserId: TEST_USERS.BOB.id,
      status: BlockerStatus.Open,
      raisedByUserId: TEST_USERS.ALICE.id,
      raisedAt: new Date(`${todayWibStr}T02:00:00.000Z`),
    },
  });

  // 9. Do not pre-seed CorrectionRequest: Created dynamically via UI in Trace A (SAD §17.7)

  // 10. Seed Notifications
  await prisma.notification.create({
    data: {
      recipientUserId: TEST_USERS.BOB.id,
      triggerType: 'BLOCKER_RAISED',
      relatedEntityType: 'Blocker',
      relatedEntityId: TEST_FIXTURES.BLOCKER_ID,
      channel: NotificationChannel.WebNotificationCenter,
      payload: { title: 'New Critical Blocker Raised', raisedBy: 'Alice Employee' },
      status: NotificationStatus.Sent,
    },
  });

  // 11. Seed Audit Logs (Human + System NULL actor)
  await prisma.auditLog.create({
    data: {
      id: TEST_FIXTURES.AUDIT_HUMAN_ID,
      actorUserId: TEST_USERS.ALICE.id,
      action: 'USER_LOGIN',
      relatedEntityType: 'User',
      relatedEntityId: TEST_USERS.ALICE.id,
      timestamp: new Date(`${todayWibStr}T01:30:00.000Z`),
    },
  });

  await prisma.auditLog.create({
    data: {
      id: TEST_FIXTURES.AUDIT_SYSTEM_ID,
      actorUserId: null,
      action: 'SYSTEM_SCHEDULER_HEARTBEAT',
      relatedEntityType: 'System',
      relatedEntityId: TEST_USERS.ADMIN.id,
      timestamp: new Date(`${todayWibStr}T02:00:00.000Z`),
    },
  });

  console.log('✅ Deterministic test fixtures seeded successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDeterministicTestData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
