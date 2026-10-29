import {
  PrismaClient,
  CanonicalRole,
  CanonicalFunction,
  PolicyCategory,
  BlockerSeverity,
  BlockerType,
  BlockerImpact,
  AuthorityContext,
  CommitmentRisk,
  TimingStatus,
  DailyRiskStatus,
  UserStatus,
  NotificationChannel,
  NotificationStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

/**
 * WorkPulse Master Database Seeder (Tahap 1.2)
 *
 * Menginisialisasi data awal perusahaan Dutamedia secara deterministik dan idempoten:
 * 1. Akun Superadmin & Direktur Utama
 * 2. Struktur Tim Inti & Relasi Atasan-Bawahan
 * 3. Master Kebijakan Operasional (Cutoff, Blocker SLA, Compliance, Correction)
 * 4. Kalender Libur Nasional 2026 (Baseline Workday)
 * 5. Data Uji Coba Simulasi (Komitmen, Blocker Aktif, Pengajuan Cuti)
 */
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:test_password_secure@localhost:54332/workpulse_test';

const isSslRequired =
  connectionString.includes('supabase.co') ||
  connectionString.includes('sslmode=require');

const pool = new Pool({
  connectionString,
  ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashPassword(plainText: string): Promise<string> {
  return argon2.hash(plainText, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function main() {
  console.log('🌱 [WorkPulse Seed] Memulai inisialisasi basis data Dutamedia...');

  // Tanggal berlaku resmi per hari ini (memenuhi regulasi trigger anti-backdating database)
  const todayDate = new Date();

  // Kata sandi standar untuk seluruh akun pengujian lokal
  const defaultPasswordHash = await hashPassword('Password123!');

  // =========================================================================
  // 1. SEED USERS (Akun Fondasi Perusahaan)
  // =========================================================================
  console.log('👤 [1/6] Seeding Akun Pengguna...');

  const usersData = [
    {
      email: 'admin@dutamedia.com',
      fullName: 'Sistem Administrator',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'direktur@dutamedia.com',
      fullName: 'Hendra Wijaya (Direktur Utama)',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'hrga@dutamedia.com',
      fullName: 'Dewi Lestari (Lead HRGA)',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'lead.tech@dutamedia.com',
      fullName: 'Bambang Pratama (Tech Lead)',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'lead.creative@dutamedia.com',
      fullName: 'Rian Kurniawan (Creative Lead)',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'dev.frontend@dutamedia.com',
      fullName: 'Aditya Nugroho (Frontend Engineer)',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'dev.backend@dutamedia.com',
      fullName: 'Siti Rahma (Backend Engineer)',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'designer@dutamedia.com',
      fullName: 'Maya Putri (UI/UX Designer)',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'calon.karyawan@dutamedia.com',
      fullName: 'Fajar Ramadhan (New Hire)',
      status: UserStatus.INVITED,
      passwordHash: null,
    },
  ];

  const userMap: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        status: u.status,
        ...(u.passwordHash && { passwordHash: u.passwordHash }),
      },
      create: u,
    });
    userMap[u.email] = user;
  }

  const adminUser = userMap['admin@dutamedia.com'];
  const direkturUser = userMap['direktur@dutamedia.com'];
  const hrgaUser = userMap['hrga@dutamedia.com'];
  const techLeadUser = userMap['lead.tech@dutamedia.com'];
  const creativeLeadUser = userMap['lead.creative@dutamedia.com'];
  const frontendUser = userMap['dev.frontend@dutamedia.com'];
  const backendUser = userMap['dev.backend@dutamedia.com'];
  const designerUser = userMap['designer@dutamedia.com'];
  const newHireUser = userMap['calon.karyawan@dutamedia.com'];

  // =========================================================================
  // 2. SEED ORGANIZATIONAL ASSIGNMENTS (Pohon Hierarki & Jabatan)
  // =========================================================================
  console.log('🏢 [2/6] Seeding Struktur Organisasi & Hierarki Pelaporan...');

  const orgAssignments = [
    {
      userId: adminUser.id,
      jobTitle: 'System Administrator & SecOps',
      role: CanonicalRole.SYSTEM_ADMIN,
      function: CanonicalFunction.OperationsInfrastructure,
      directManagerId: null,
      effectiveDate: todayDate,
      assignmentReason: 'Initial System Admin provisioning',
      createdByUserId: adminUser.id,
    },
    {
      userId: direkturUser.id,
      jobTitle: 'Chief Executive Officer / Managing Director',
      role: CanonicalRole.CEO_MANAGEMENT,
      function: CanonicalFunction.Management,
      directManagerId: null,
      effectiveDate: todayDate,
      assignmentReason: 'Executive Leadership governance',
      createdByUserId: adminUser.id,
    },
    {
      userId: hrgaUser.id,
      jobTitle: 'HRGA & People Operations Lead',
      role: CanonicalRole.HRGA,
      function: CanonicalFunction.HRGA,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'HRGA department authority',
      createdByUserId: adminUser.id,
    },
    {
      userId: techLeadUser.id,
      jobTitle: 'Software Engineering Team Lead',
      role: CanonicalRole.SUPERVISOR,
      function: CanonicalFunction.Engineering,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Engineering department supervision',
      createdByUserId: adminUser.id,
    },
    {
      userId: creativeLeadUser.id,
      jobTitle: 'Creative & Multimedia Team Lead',
      role: CanonicalRole.SUPERVISOR,
      function: CanonicalFunction.RnD,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Creative & UI/UX supervision',
      createdByUserId: adminUser.id,
    },
    {
      userId: frontendUser.id,
      jobTitle: 'Frontend Software Engineer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Engineering,
      directManagerId: techLeadUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Frontend engineering assignment',
      createdByUserId: hrgaUser.id,
    },
    {
      userId: backendUser.id,
      jobTitle: 'Backend Software Engineer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Engineering,
      directManagerId: techLeadUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Backend platform assignment',
      createdByUserId: hrgaUser.id,
    },
    {
      userId: designerUser.id,
      jobTitle: 'UI/UX Product Designer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.RnD,
      directManagerId: creativeLeadUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Product design assignment',
      createdByUserId: hrgaUser.id,
    },
    {
      userId: newHireUser.id,
      jobTitle: 'Junior Software Engineer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Engineering,
      directManagerId: techLeadUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'New hire onboarding assignment',
      createdByUserId: hrgaUser.id,
    },
  ];

  for (const assignment of orgAssignments) {
    const existing = await prisma.organizationalAssignment.findFirst({
      where: { userId: assignment.userId, endDate: null },
    });
    if (!existing) {
      await prisma.organizationalAssignment.create({ data: assignment });
    }
  }

  // =========================================================================
  // 3. SEED POLICIES (Master Kebijakan Resmi Perusahaan)
  // =========================================================================
  console.log('📜 [3/6] Seeding Kebijakan Operasional...');

  const policiesData = [
    {
      category: PolicyCategory.CHECKIN_TIMING,
      configurationValues: {
        morningCutoff: '09:30',
        morningGracePeriodMinutes: 5,
        eodCutoff: '21:00',
        minCommitments: 1,
        maxCommitments: 3,
        timeZone: 'Asia/Jakarta',
      },
      effectiveDate: todayDate,
      createdByUserId: adminUser.id,
    },
    {
      category: PolicyCategory.BLOCKER_SLA,
      configurationValues: {
        l1AcknowledgeTargetMinutes: 120, // 2 Jam
        l2AutoEscalateMinutes: 240,     // 4 Jam
        emergencyChannels: ['EMAIL', 'IN_APP_CENTER'],
      },
      effectiveDate: todayDate,
      createdByUserId: adminUser.id,
    },
    {
      category: PolicyCategory.COMPLIANCE_THRESHOLD,
      configurationValues: {
        consecutiveMissedThresholdDays: 3,
        escalationRecipientRole: 'HRGA',
      },
      effectiveDate: todayDate,
      createdByUserId: adminUser.id,
    },
    {
      category: PolicyCategory.CORRECTION_WINDOW,
      configurationValues: {
        morningCorrectionWindowHours: 24,
        eodCorrectionWindowHours: 48,
        requireManagerApproval: true,
      },
      effectiveDate: todayDate,
      createdByUserId: adminUser.id,
    },
  ];

  for (const pol of policiesData) {
    const existing = await prisma.policy.findFirst({
      where: { category: pol.category, endDate: null },
    });
    if (!existing) {
      await prisma.policy.create({ data: pol });
    }
  }

  // =========================================================================
  // 4. SEED COMPANY HOLIDAYS 2026 (Baseline Hari Libur Nasional)
  // =========================================================================
  console.log('📅 [4/6] Seeding Kalender Libur Nasional 2026...');

  const holidays2026 = [
    { date: new Date('2026-01-01'), name: 'Tahun Baru Masehi 2026' },
    { date: new Date('2026-01-16'), name: 'Isra Mi’raj Nabi Muhammad SAW' },
    { date: new Date('2026-02-17'), name: 'Tahun Baru Imlek 2577 Kongzili' },
    { date: new Date('2026-03-20'), name: 'Hari Raya Idul Fitri 1447 H (Hari Pertama)' },
    { date: new Date('2026-03-21'), name: 'Hari Raya Idul Fitri 1447 H (Hari Kedua)' },
    { date: new Date('2026-03-22'), name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)' },
    { date: new Date('2026-04-03'), name: 'Wafat Yesus Kristus (Jumat Agung)' },
    { date: new Date('2026-05-01'), name: 'Hari Buruh Internasional' },
    { date: new Date('2026-05-14'), name: 'Kenaikan Yesus Kristus' },
    { date: new Date('2026-05-27'), name: 'Hari Raya Idul Adha 1447 H' },
    { date: new Date('2026-05-31'), name: 'Hari Raya Waisak 2570 BE' },
    { date: new Date('2026-06-01'), name: 'Hari Lahir Pancasila' },
    { date: new Date('2026-06-16'), name: 'Tahun Baru Islam 1448 H' },
    { date: new Date('2026-08-17'), name: 'Hari Kemerdekaan Republik Indonesia ke-81' },
    { date: new Date('2026-08-25'), name: 'Maulid Nabi Muhammad SAW' },
    { date: new Date('2026-12-25'), name: 'Hari Raya Natal' },
  ];

  for (const h of holidays2026) {
    await prisma.companyHoliday.upsert({
      where: { holidayDate: h.date },
      update: { holidayName: h.name },
      create: {
        holidayDate: h.date,
        holidayName: h.name,
        createdByUserId: adminUser.id,
      },
    });
  }

  // =========================================================================
  // 5. SEED PROJECT & INVITATION SIMULASI
  // =========================================================================
  console.log('🚀 [5/6] Seeding Proyek & Token Undangan Aktivasi...');

  // 5a. Proyek Resmi
  const existingProject = await prisma.projectAuthorityMapping.findFirst({
    where: { projectCode: 'WP-CORE' },
  });
  if (!existingProject) {
    await prisma.projectAuthorityMapping.create({
      data: {
        projectCode: 'WP-CORE',
        projectName: 'WorkPulse Platform Core 2026',
        projectManagerId: techLeadUser.id,
        escalationReviewerId: direkturUser.id,
        involvedFunction: CanonicalFunction.Engineering,
        effectiveDate: todayDate,
        assignmentReason: 'Core platform development governance',
        createdByUserId: adminUser.id,
      },
    });
  }

  // 5b. Token Undangan 72 Jam untuk Calon Karyawan
  const existingInvitation = await prisma.userInvitation.findFirst({
    where: { userId: newHireUser.id, status: 'PENDING' },
  });
  if (!existingInvitation) {
    const rawActivationToken = 'wp_seed_invite_token_72h_demo_secret';
    const tokenHash = crypto.createHash('sha256').update(rawActivationToken).digest('hex');

    await prisma.userInvitation.create({
      data: {
        userId: newHireUser.id,
        tokenHash,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 jam
        createdByUserId: hrgaUser.id,
      },
    });
  }

  // =========================================================================
  // 6. SEED REKOR AKTIVITAS HARI INI (Sample Records untuk UI & E2E)
  // =========================================================================
  console.log('📊 [6/6] Seeding Rekor Harian, Blocker & Pengajuan Cuti...');

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const workDate = new Date(todayStr);

  // 6a. Daily Accountability Record untuk Frontend Dev
  const existingDaily = await prisma.dailyAccountabilityRecord.findUnique({
    where: {
      userId_workDate: {
        userId: frontendUser.id,
        workDate,
      },
    },
  });

  if (!existingDaily) {
    const daily = await prisma.dailyAccountabilityRecord.create({
      data: {
        userId: frontendUser.id,
        workDate,
        orgContextSnapshot: {
          department: 'Engineering',
          jobTitle: 'Frontend Software Engineer',
          managerName: 'Bambang Pratama',
        },
        policySnapshot: {
          morningCutoff: '09:30',
          maxCommitments: 3,
        },
        morningSubmittedAt: new Date(),
        morningTiming: TimingStatus.ON_TIME,
        initialDailyStatus: DailyRiskStatus.AMBER,
        commitments: {
          create: [
            {
              sequenceNo: 1,
              taskText: 'Menyelesaikan implementasi UI navigasi mobile responsive',
              initialRisk: CommitmentRisk.GREEN,
              isMorningLocked: true,
            },
            {
              sequenceNo: 2,
              taskText: 'Investigasi kegagalan memory build runner pada pipeline frontend',
              initialRisk: CommitmentRisk.AMBER,
              knownBlockerNote: 'Runner pipeline sering OOM saat minify chunk besar',
              supportNeeded: 'Bantuan akses root SSH ke server runner CI',
              isMorningLocked: true,
            },
          ],
        },
      },
      include: { commitments: true },
    });

    // 6b. Blocker Ticket aktif terkait komitmen #2
    const targetCommitment = daily.commitments.find((c) => c.sequenceNo === 2);
    await prisma.blockerTicket.create({
      data: {
        raisedByUserId: frontendUser.id,
        linkedCommitmentId: targetCommitment?.id,
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.TASK,
        description: 'CI runner mengalami Out Of Memory (OOM) saat proses bundle minification',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
        assignedOwnerId: techLeadUser.id,
        projectCodeReference: 'WP-CORE',
        status: 'OPEN',
        targetResolutionAt: new Date(Date.now() + 4 * 3600 * 1000), // SLA 4 Jam
      },
    });
  }

  // 6c. Pengajuan Cuti Mendatang untuk Backend Dev
  const existingLeave = await prisma.leaveRequest.findFirst({
    where: { userId: backendUser.id, status: 'PENDING' },
  });
  if (!existingLeave) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    await prisma.leaveRequest.create({
      data: {
        userId: backendUser.id,
        startDate: tomorrow,
        endDate: dayAfter,
        leaveType: 'ANNUAL',
        reason: 'Cuti tahunan keperluan keluarga',
        status: 'PENDING',
      },
    });
  }

  // 6d. Notifikasi In-App untuk Tech Lead
  const existingNotif = await prisma.notification.findFirst({
    where: { recipientUserId: techLeadUser.id, triggerType: 'BLOCKER_RAISED' },
  });
  if (!existingNotif) {
    await prisma.notification.create({
      data: {
        recipientUserId: techLeadUser.id,
        triggerType: 'BLOCKER_RAISED',
        channel: NotificationChannel.IN_APP_CENTER,
        title: 'Kendala Baru Dilaporkan',
        message: 'Aditya Nugroho melaporkan kendala teknis: CI runner mengalami Out Of Memory.',
        actionUrl: '/blockers',
        status: NotificationStatus.SENT,
      },
    });
  }

  console.log('✅ [WorkPulse Seed] Sukses! Seluruh data fondasi Dutamedia siap digunakan.');
  console.log(`
  ════════════════════════════════════════════════════════════════
  DAFTAR KREDENSIAL PENGUJIAN LOKAL (Password: Password123!)
  ════════════════════════════════════════════════════════════════
  • Superadmin : admin@dutamedia.com
  • Direktur   : direktur@dutamedia.com
  • HRGA       : hrga@dutamedia.com
  • Tech Lead  : lead.tech@dutamedia.com
  • Creative   : lead.creative@dutamedia.com
  • Frontend   : dev.frontend@dutamedia.com
  • Backend    : dev.backend@dutamedia.com
  • Designer   : designer@dutamedia.com
  • Token Demo : wp_seed_invite_token_72h_demo_secret (Untuk calon.karyawan@dutamedia.com)
  ════════════════════════════════════════════════════════════════
  `);
}

main()
  .catch((e) => {
    console.error('❌ [WorkPulse Seed] Error saat seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
