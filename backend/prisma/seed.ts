import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.production') });
}

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
 * WorkPulse Master Database Seeder (Selaras Bagan Resmi PT Dutamedia Mandiri Pratama — CR-013)
 *
 * Menginisialisasi dan menyinkronkan data fondasi perusahaan Dutamedia secara deterministik & idempoten:
 * 1. Akun Pimpinan, Head Divisi, Project Manager, Technical Lead, dan Staf Operasional
 * 2. Struktur Organisasi & Hierarki Pelaporan (Tech Lead & Developer sejajar di bawah Head of Engineering)
 * 3. Pemetaan Kewenangan Tim Proyek (ProjectAuthorityMapping: WP-CORE, PRJ-CORE, PRJ-PORTAL, PRJ-MOBILE)
 * 4. Master Kebijakan Operasional & Kalender Libur Nasional 2026
 * 5. Data Uji Coba Simulasi (Komitmen berproyek, Blocker Aktif, Pengajuan Cuti Lintas Divisi)
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
  console.log('🌱 [WorkPulse Seed] Memulai sinkronisasi basis data PT Dutamedia Mandiri Pratama...');

  // Tanggal kerja hari ini dalam zona waktu Asia/Jakarta (memenuhi trigger trg_no_backdating)
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const todayDate = new Date(todayStr);

  // Kata sandi standar untuk seluruh akun pengujian
  const defaultPasswordHash = await hashPassword('Password123!');

  // =========================================================================
  // 1. SEED USERS (Akun Resmi Sesuai Bagan Organisasi PT Dutamedia Mandiri Pratama)
  // =========================================================================
  console.log('👤 [1/6] Seeding & Sinkronisasi Akun Pengguna...');

  const usersData = [
    // Pucuk Pimpinan & System Admin
    {
      email: 'admin@dutamedia.com',
      fullName: 'Sistem Administrator',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'direktur@dutamedia.com',
      fullName: 'Hendra Wijaya',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    // Divisi Engineering
    {
      email: 'head.eng@dutamedia.com',
      fullName: 'Arif Budiman',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'lead.tech@dutamedia.com',
      fullName: 'Bambang Pratama',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'dev.frontend@dutamedia.com',
      fullName: 'Aditya Nugroho',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'dev.backend@dutamedia.com',
      fullName: 'Siti Rahma',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'calon.karyawan@dutamedia.com',
      fullName: 'Fajar Ramadhan',
      status: UserStatus.INVITED,
      passwordHash: null,
      preserveStatusOnUpdate: true, // Pertahankan status jika sudah diaktivasi saat UAT TC-AUTH-003
    },
    // Divisi Delivery
    {
      email: 'head.delivery@dutamedia.com',
      fullName: 'Dharma Putra',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'pm@dutamedia.com',
      fullName: 'Dimas Prakoso',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'qa@dutamedia.com',
      fullName: 'Nadia Kusuma',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    // Divisi Operations & Infrastructure
    {
      email: 'head.ops@dutamedia.com',
      fullName: 'Gunawan Setiawan',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'lead.creative@dutamedia.com',
      fullName: 'Rian Kurniawan',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    // Divisi R&D & Technical Advisory
    {
      email: 'designer@dutamedia.com',
      fullName: 'Maya Putri',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    // Divisi Commercial (Sales Enablement & Presales)
    {
      email: 'head.sales@dutamedia.com',
      fullName: 'Lukman Hakim',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    // Divisi Finance
    {
      email: 'finance@dutamedia.com',
      fullName: 'Ratna Sari',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    // Divisi HRGA & Corporate Legal Administration
    {
      email: 'hrga@dutamedia.com',
      fullName: 'Dewi Lestari',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
  ];

  const userMap: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        ...(!u.preserveStatusOnUpdate && { status: u.status }),
        ...(u.passwordHash && { passwordHash: u.passwordHash }),
      },
      create: {
        email: u.email,
        fullName: u.fullName,
        status: u.status,
        passwordHash: u.passwordHash,
      },
    });
    userMap[u.email] = user;
  }

  const adminUser = userMap['admin@dutamedia.com'];
  const direkturUser = userMap['direktur@dutamedia.com'];
  const headEngUser = userMap['head.eng@dutamedia.com'];
  const techLeadUser = userMap['lead.tech@dutamedia.com'];
  const frontendUser = userMap['dev.frontend@dutamedia.com'];
  const backendUser = userMap['dev.backend@dutamedia.com'];
  const newHireUser = userMap['calon.karyawan@dutamedia.com'];
  const headDeliveryUser = userMap['head.delivery@dutamedia.com'];
  const pmUser = userMap['pm@dutamedia.com'];
  const qaUser = userMap['qa@dutamedia.com'];
  const headOpsUser = userMap['head.ops@dutamedia.com'];
  const opsSupvUser = userMap['lead.creative@dutamedia.com'];
  const rndPrincipalUser = userMap['designer@dutamedia.com'];
  const headSalesUser = userMap['head.sales@dutamedia.com'];
  const financeUser = userMap['finance@dutamedia.com'];
  const hrgaUser = userMap['hrga@dutamedia.com'];

  // =========================================================================
  // 2. SEED ORGANIZATIONAL ASSIGNMENTS (Pohon Hierarki Resmi PT Dutamedia)
  // =========================================================================
  console.log('🏢 [2/6] Menyinkronkan Struktur Organisasi & Hierarki Pelaporan...');

  const orgAssignments = [
    // Pucuk Pimpinan & System Admin
    {
      userId: direkturUser.id,
      jobTitle: 'Chief Executive Officer (CEO)',
      role: CanonicalRole.CEO_MANAGEMENT,
      function: CanonicalFunction.Management,
      directManagerId: null,
      effectiveDate: todayDate,
      assignmentReason: 'Executive Leadership governance PT Dutamedia Mandiri Pratama',
      createdByUserId: adminUser.id,
    },
    {
      userId: adminUser.id,
      jobTitle: 'Infrastructure & System Administrator',
      role: CanonicalRole.SYSTEM_ADMIN,
      function: CanonicalFunction.OperationsInfrastructure,
      directManagerId: null,
      effectiveDate: todayDate,
      assignmentReason: 'System Administration & SecOps governance (IMP-026)',
      createdByUserId: adminUser.id,
    },
    // 1. Divisi Engineering: Head of Engineering membawahi sejajar Tech Lead 1 & para Developer
    {
      userId: headEngUser.id,
      jobTitle: 'Head of Engineering',
      role: CanonicalRole.HEAD,
      function: CanonicalFunction.Engineering,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penetapan Kepala Divisi Engineering PT Dutamedia Mandiri Pratama',
      createdByUserId: adminUser.id,
    },
    {
      userId: techLeadUser.id,
      jobTitle: 'Technical Lead 1',
      role: CanonicalRole.SUPERVISOR,
      function: CanonicalFunction.Engineering,
      directManagerId: headEngUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Technical Lead 1 (sejajar di bawah Head of Engineering)',
      createdByUserId: adminUser.id,
    },
    {
      userId: frontendUser.id,
      jobTitle: 'Frontend Developer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Engineering,
      directManagerId: headEngUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Frontend Developer (sejajar di bawah Head of Engineering)',
      createdByUserId: hrgaUser.id,
    },
    {
      userId: backendUser.id,
      jobTitle: 'Backend Developer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Engineering,
      directManagerId: headEngUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Backend Developer (sejajar di bawah Head of Engineering)',
      createdByUserId: hrgaUser.id,
    },
    {
      userId: newHireUser.id,
      jobTitle: 'Junior Developer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Engineering,
      directManagerId: headEngUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Onboarding Junior Developer di bawah Head of Engineering',
      createdByUserId: hrgaUser.id,
    },
    // 2. Divisi Delivery: Head of Delivery membawahi sejajar Project Manager 1 & QA Specialist
    {
      userId: headDeliveryUser.id,
      jobTitle: 'Head of Delivery',
      role: CanonicalRole.HEAD,
      function: CanonicalFunction.Delivery,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penetapan Kepala Divisi Delivery PT Dutamedia Mandiri Pratama',
      createdByUserId: adminUser.id,
    },
    {
      userId: pmUser.id,
      jobTitle: 'Project Manager 1',
      role: CanonicalRole.PROJECT_MANAGER,
      function: CanonicalFunction.Delivery,
      directManagerId: headDeliveryUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Project Manager 1 di bawah Head of Delivery',
      createdByUserId: adminUser.id,
    },
    {
      userId: qaUser.id,
      jobTitle: 'Software Quality Assurance Specialist',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Delivery,
      directManagerId: headDeliveryUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Software QA Specialist di bawah Head of Delivery',
      createdByUserId: hrgaUser.id,
    },
    // 3. Divisi Operations & Infrastructure: Head of Ops membawahi Operations Supervisor
    {
      userId: headOpsUser.id,
      jobTitle: 'Head of Operations & Infrastructure',
      role: CanonicalRole.HEAD,
      function: CanonicalFunction.OperationsInfrastructure,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penetapan Kepala Divisi Operations & Infrastructure',
      createdByUserId: adminUser.id,
    },
    {
      userId: opsSupvUser.id,
      jobTitle: 'Operations Supervisor',
      role: CanonicalRole.SUPERVISOR,
      function: CanonicalFunction.OperationsInfrastructure,
      directManagerId: headOpsUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Operations Supervisor di bawah Head of Operations & Infrastructure',
      createdByUserId: adminUser.id,
    },
    // 4. Divisi R&D & Technical Advisory: Principal Engineer melapor ke CEO
    {
      userId: rndPrincipalUser.id,
      jobTitle: 'Principal Engineer (R&D & Technical Advisory)',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.RnD,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Principal Engineer — R&D & Technical Advisory',
      createdByUserId: hrgaUser.id,
    },
    // 5. Divisi Commercial: Head of Sales Enablement & Presales melapor ke CEO
    {
      userId: headSalesUser.id,
      jobTitle: 'Head of Sales Enablement & Presales',
      role: CanonicalRole.HEAD,
      function: CanonicalFunction.SalesEnablementPresales,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penetapan Head of Sales Enablement & Presales (Commercial)',
      createdByUserId: adminUser.id,
    },
    // 6. Divisi Finance: Senior Finance Staff melapor ke CEO
    {
      userId: financeUser.id,
      jobTitle: 'Senior Finance Staff',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Finance,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Senior Finance Staff',
      createdByUserId: hrgaUser.id,
    },
    // 7. Divisi HRGA & Corporate Legal Administration
    {
      userId: hrgaUser.id,
      jobTitle: 'HRGA & Corporate Legal Administration',
      role: CanonicalRole.HRGA,
      function: CanonicalFunction.HRGA,
      directManagerId: direkturUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penetapan HRGA & Corporate Legal Administration',
      createdByUserId: adminUser.id,
    },
  ];

  for (const assignment of orgAssignments) {
    const allRows = await prisma.organizationalAssignment.findMany({
      where: { userId: assignment.userId },
      orderBy: [{ endDate: 'asc' }, { effectiveDate: 'desc' }],
    });

    if (allRows.length === 0) {
      await prisma.organizationalAssignment.create({ data: assignment });
    } else {
      const [primaryRow, ...extraRows] = allRows;
      await prisma.organizationalAssignment.update({
        where: { id: primaryRow.id },
        data: {
          jobTitle: assignment.jobTitle,
          role: assignment.role,
          function: assignment.function,
          directManagerId: assignment.directManagerId,
          endDate: null,
          assignmentReason: assignment.assignmentReason,
        },
      });
      if (extraRows.length > 0) {
        await prisma.organizationalAssignment.deleteMany({
          where: { id: { in: extraRows.map((r) => r.id) } },
        });
      }
    }
  }

  // Rapikan akun uji tambahan (misal karyawan.baru@dutamedia.com jika ada di DB) agar memiliki atasan Head of Engineering
  const extraTestUser = await prisma.user.findUnique({
    where: { email: 'karyawan.baru@dutamedia.com' },
  });
  if (extraTestUser) {
    await prisma.organizationalAssignment.updateMany({
      where: { userId: extraTestUser.id, endDate: null, directManagerId: null },
      data: { directManagerId: headEngUser.id },
    });
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
        l1AcknowledgeTargetMinutes: 120,
        l2AutoEscalateMinutes: 240,
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
    {
      category: PolicyCategory.NOTIFICATION_REMINDER_THRESHOLD,
      configurationValues: {
        morningReminderMinutesBefore: 60,
        eodReminderMinutesBefore: 60,
        slaWarningPercent: 75,
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
  // 3b. SEED POLICY OWNER ASSIGNMENTS (Baseline Authorized Policy Owners BR-15 & FR-34)
  // =========================================================================
  console.log('🛡️ [3b/6] Menugaskan Pemilik Kebijakan Resmi (Direktur, Admin, HRGA untuk 5 Kategori)...');
  const allPolicyCategories = [
    PolicyCategory.CHECKIN_TIMING,
    PolicyCategory.BLOCKER_SLA,
    PolicyCategory.COMPLIANCE_THRESHOLD,
    PolicyCategory.CORRECTION_WINDOW,
    PolicyCategory.NOTIFICATION_REMINDER_THRESHOLD,
  ];
  const initialOwnerIds = [direkturUser.id, adminUser.id, hrgaUser.id];

  for (const category of allPolicyCategories) {
    for (const ownerUserId of initialOwnerIds) {
      const existing = await prisma.policyOwnerAssignment.findFirst({
        where: {
          userId: ownerUserId,
          policyCategory: category,
          OR: [{ endDate: null }, { endDate: { gte: todayDate } }],
        },
      });
      if (!existing) {
        await prisma.policyOwnerAssignment.create({
          data: {
            userId: ownerUserId,
            policyCategory: category,
            effectiveDate: todayDate,
            createdByUserId: direkturUser.id,
          },
        });
      }
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
  // 5. SEED PROJECT AUTHORITIES & INVITATION SIMULASI
  // =========================================================================
  console.log('🚀 [5/6] Seeding Pemetaan Kewenangan Proyek (Project Authority) & Token Undangan...');

  const projectsCatalog = [
    {
      projectCode: 'WP-CORE',
      projectName: 'WorkPulse Platform Core 2026',
      projectManagerId: techLeadUser.id,
      escalationReviewerId: headEngUser.id,
      involvedFunction: CanonicalFunction.Engineering,
      assignmentReason: 'Kepemimpinan teknis proyek WorkPulse Core oleh Technical Lead 1 (Bambang Pratama)',
    },
    {
      projectCode: 'PRJ-CORE',
      projectName: 'Core Banking Settlement Engine',
      projectManagerId: techLeadUser.id,
      escalationReviewerId: headEngUser.id,
      involvedFunction: CanonicalFunction.Engineering,
      assignmentReason: 'Kepemimpinan teknis proyek Core Banking oleh Technical Lead 1 (Bambang Pratama)',
    },
    {
      projectCode: 'PRJ-PORTAL',
      projectName: 'Dutamedia Client Portal v2.4',
      projectManagerId: pmUser.id,
      escalationReviewerId: headDeliveryUser.id,
      involvedFunction: CanonicalFunction.Delivery,
      assignmentReason: 'Kepemimpinan manajemen proyek Client Portal oleh Project Manager 1 (Dimas Prakoso)',
    },
    {
      projectCode: 'PRJ-MOBILE',
      projectName: 'Customer SuperApp Mobile',
      projectManagerId: pmUser.id,
      escalationReviewerId: headDeliveryUser.id,
      involvedFunction: CanonicalFunction.Delivery,
      assignmentReason: 'Kepemimpinan manajemen proyek SuperApp Mobile oleh Project Manager 1 (Dimas Prakoso)',
    },
  ];

  for (const prj of projectsCatalog) {
    const existingPa = await prisma.projectAuthorityMapping.findFirst({
      where: { projectCode: prj.projectCode, endDate: null },
    });
    if (!existingPa) {
      await prisma.projectAuthorityMapping.create({
        data: {
          ...prj,
          effectiveDate: todayDate,
          createdByUserId: adminUser.id,
        },
      });
    } else {
      await prisma.projectAuthorityMapping.update({
        where: { id: existingPa.id },
        data: {
          projectName: prj.projectName,
          projectManagerId: prj.projectManagerId,
          escalationReviewerId: prj.escalationReviewerId,
          involvedFunction: prj.involvedFunction,
          assignmentReason: prj.assignmentReason,
        },
      });
    }
  }

  // 5b. Token Undangan 72 Jam untuk Calon Karyawan
  const existingInvitation = await prisma.userInvitation.findFirst({
    where: { userId: newHireUser.id, status: 'PENDING' },
  });
  if (!existingInvitation && newHireUser.status === UserStatus.INVITED) {
    const rawActivationToken = 'wp_seed_invite_token_72h_demo_secret';
    const tokenHash = crypto.createHash('sha256').update(rawActivationToken).digest('hex');

    await prisma.userInvitation.create({
      data: {
        userId: newHireUser.id,
        tokenHash,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        createdByUserId: hrgaUser.id,
      },
    });
  }

  // =========================================================================
  // 6. SEED REKOR AKTIVITAS HARI INI (Sample Records untuk UI & E2E)
  // =========================================================================
  console.log('📊 [6/6] Menyinkronkan Rekor Harian, Blocker Proyek & Pengajuan Cuti...');

  const workDate = todayDate;

  // 6a. Daily Accountability Record untuk Frontend Dev (Aditya Nugroho)
  const existingDaily = await prisma.dailyAccountabilityRecord.findUnique({
    where: {
      userId_workDate: {
        userId: frontendUser.id,
        workDate,
      },
    },
    include: { commitments: true },
  });

  if (!existingDaily) {
    const daily = await prisma.dailyAccountabilityRecord.create({
      data: {
        userId: frontendUser.id,
        workDate,
        orgContextSnapshot: {
          department: 'Engineering',
          jobTitle: 'Frontend Developer',
          managerName: 'Arif Budiman',
          commitmentMeta: {
            1: { projectCode: 'WP-CORE', linkedBlockerId: null },
            2: { projectCode: 'WP-CORE', linkedBlockerId: null },
          },
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

    const targetCommitment = daily.commitments.find((c) => c.sequenceNo === 2);
    await prisma.blockerTicket.create({
      data: {
        raisedByUserId: frontendUser.id,
        linkedCommitmentId: targetCommitment?.id,
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.TASK,
        description: 'CI runner mengalami Out Of Memory (OOM) saat proses bundle minification',
        ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
        assignedOwnerId: techLeadUser.id,
        projectCodeReference: 'WP-CORE',
        status: 'OPEN',
        targetResolutionAt: new Date(Date.now() + 4 * 3600 * 1000),
      },
    });
  } else {
    // Pastikan orgContextSnapshot pada rekaman hari ini selaras dengan proyek WP-CORE & Head of Engineering
    const currentSnap = (existingDaily.orgContextSnapshot as Record<string, any>) || {};
    const existingMeta = currentSnap.commitmentMeta || {};
    const updatedMeta: Record<number, any> = { ...existingMeta };
    for (const c of existingDaily.commitments) {
      if (!updatedMeta[c.sequenceNo]?.projectCode) {
        updatedMeta[c.sequenceNo] = {
          ...(updatedMeta[c.sequenceNo] || {}),
          projectCode: 'WP-CORE',
        };
      }
    }
    await prisma.dailyAccountabilityRecord.update({
      where: { id: existingDaily.id },
      data: {
        orgContextSnapshot: {
          ...currentSnap,
          department: 'Engineering',
          jobTitle: 'Frontend Developer',
          managerName: 'Arif Budiman',
          commitmentMeta: updatedMeta,
        },
      },
    });
  }

  // 6b. Pengajuan Cuti PENDING untuk Backend Dev (Siti Rahma - Divisi Engineering)
  const existingLeaveSiti = await prisma.leaveRequest.findFirst({
    where: { userId: backendUser.id, status: 'PENDING' },
  });
  if (!existingLeaveSiti) {
    const tomorrow = new Date(workDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(workDate);
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

  // 6c. Pengajuan Cuti PENDING untuk Principal Engineer R&D (Maya Putri - Divisi RnD)
  const existingLeaveMaya = await prisma.leaveRequest.findFirst({
    where: { userId: rndPrincipalUser.id, status: 'PENDING' },
  });
  if (!existingLeaveMaya) {
    const startLeave = new Date(workDate);
    startLeave.setDate(startLeave.getDate() + 3);
    const endLeave = new Date(workDate);
    endLeave.setDate(endLeave.getDate() + 4);

    await prisma.leaveRequest.create({
      data: {
        userId: rndPrincipalUser.id,
        startDate: startLeave,
        endDate: endLeave,
        leaveType: 'ANNUAL',
        reason: 'Keperluan riset arsitektur sistem luar kota (UAT Test Data TD-SUPV-01)',
        status: 'PENDING',
      },
    });
  }

  // 6d. Notifikasi In-App untuk Technical Lead 1 & Head of Engineering
  const existingNotif = await prisma.notification.findFirst({
    where: { recipientUserId: techLeadUser.id, triggerType: 'BLOCKER_RAISED' },
  });
  if (!existingNotif) {
    await prisma.notification.create({
      data: {
        recipientUserId: techLeadUser.id,
        triggerType: 'BLOCKER_RAISED',
        channel: NotificationChannel.IN_APP_CENTER,
        title: 'Kendala Proyek [WP-CORE] Dilaporkan',
        message: 'Aditya Nugroho melaporkan kendala teknis pada proyek WP-CORE: CI runner mengalami Out Of Memory.',
        actionUrl: '/blockers',
        status: NotificationStatus.SENT,
      },
    });
  }

  console.log('✅ [WorkPulse Seed] Sukses! Seluruh data struktur organisasi PT Dutamedia Mandiri Pratama telah sinkron.');
  console.log(`
  ════════════════════════════════════════════════════════════════════════════
  DAFTAR AKUN RESMI PT DUTAMEDIA MANDIRI PRATAMA (Password: Password123!)
  ════════════════════════════════════════════════════════════════════════════
  • CEO (Management)         : direktur@dutamedia.com       (Hendra Wijaya)
  • System Admin             : admin@dutamedia.com          (Sistem Administrator)
  • Head of Engineering      : head.eng@dutamedia.com       (Arif Budiman)     [HEAD]
  • Technical Lead 1 (Eng)   : lead.tech@dutamedia.com      (Bambang Pratama)  [SUPERVISOR / Project Lead WP-CORE & PRJ-CORE]
  • Frontend Developer (Eng) : dev.frontend@dutamedia.com   (Aditya Nugroho)   [EMPLOYEE]
  • Backend Developer (Eng)  : dev.backend@dutamedia.com    (Siti Rahma)       [EMPLOYEE]
  • Head of Delivery         : head.delivery@dutamedia.com  (Dharma Putra)     [HEAD]
  • Project Manager 1 (Del)  : pm@dutamedia.com             (Dimas Prakoso)    [PROJECT_MANAGER / Project Lead PRJ-PORTAL & PRJ-MOBILE]
  • Software QA (Del)        : qa@dutamedia.com             (Nadia Kusuma)     [EMPLOYEE]
  • Head of Ops & Infra      : head.ops@dutamedia.com       (Gunawan Setiawan) [HEAD]
  • Operations Supervisor    : lead.creative@dutamedia.com  (Rian Kurniawan)   [SUPERVISOR]
  • Principal Engineer (R&D) : designer@dutamedia.com       (Maya Putri)       [EMPLOYEE]
  • Head of Sales & Presales : head.sales@dutamedia.com     (Lukman Hakim)     [HEAD]
  • Senior Finance Staff     : finance@dutamedia.com        (Ratna Sari)       [EMPLOYEE]
  • HRGA & Legal Admin       : hrga@dutamedia.com           (Dewi Lestari)     [HRGA]
  ════════════════════════════════════════════════════════════════════════════
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
