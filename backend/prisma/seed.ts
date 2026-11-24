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
  EmploymentStatus,
  PolicyCategory,
  BlockerSeverity,
  BlockerType,
  BlockerImpact,
  AuthorityContext,
  CommitmentRisk,
  CommitmentOutcome,
  ContinuationStatus,
  TimingStatus,
  DailyRiskStatus,
  UserStatus,
  NotificationChannel,
  NotificationStatus,
  ManagerNoteType,
  NoteVisibility,
  ComplianceEventStage,
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
      preserveStatusOnUpdate: false, // Reset kembali ke INVITED saat seed dijalankan agar tautan undangan demo 72 jam selalu siap diuji
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
    {
      email: 'product@dutamedia.com',
      fullName: 'Dio Bayu Bagaskara',
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
    {
      email: 'network.infra@dutamedia.com',
      fullName: 'Fakhrizal Asshiddiq',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'specialist.it@dutamedia.com',
      fullName: 'Achmad Noer Wahid',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'it.support@dutamedia.com',
      fullName: 'Rahian M. Suari',
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
    {
      email: 'sales.bd@dutamedia.com',
      fullName: 'Hari Wibowo',
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
    {
      email: 'staff.finance@dutamedia.com',
      fullName: 'Oivi Deasepta',
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
    {
      email: 'ga@dutamedia.com',
      fullName: 'Sugito Erik Fajar',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    // Karyawan Magang / Intern (Paket #1 — tetap masuk divisi masing-masing, jabatan bersih tanpa kata "Intern")
    {
      email: 'intern.frontend@dutamedia.com',
      fullName: 'Raka Pratama',
      status: UserStatus.ACTIVE,
      passwordHash: defaultPasswordHash,
      preserveStatusOnUpdate: false,
    },
    {
      email: 'intern.finance@dutamedia.com',
      fullName: 'Nisa Amelia',
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
        ...(!u.preserveStatusOnUpdate && {
          status: u.status,
          passwordHash: u.passwordHash,
        }),
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
  const productManagerUser = userMap['product@dutamedia.com'];
  const headOpsUser = userMap['head.ops@dutamedia.com'];
  const opsSupvUser = userMap['lead.creative@dutamedia.com'];
  const networkInfraUser = userMap['network.infra@dutamedia.com'];
  const specialistItUser = userMap['specialist.it@dutamedia.com'];
  const itSupportUser = userMap['it.support@dutamedia.com'];
  const rndPrincipalUser = userMap['designer@dutamedia.com'];
  const headSalesUser = userMap['head.sales@dutamedia.com'];
  const salesBdUser = userMap['sales.bd@dutamedia.com'];
  const financeUser = userMap['finance@dutamedia.com'];
  const staffFinanceUser = userMap['staff.finance@dutamedia.com'];
  const hrgaUser = userMap['hrga@dutamedia.com'];
  const gaUser = userMap['ga@dutamedia.com'];
  const internFrontendUser = userMap['intern.frontend@dutamedia.com'];
  const internFinanceUser = userMap['intern.finance@dutamedia.com'];

  const internEndDate = new Date(todayDate);
  internEndDate.setDate(internEndDate.getDate() + 90);

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
    {
      userId: productManagerUser.id,
      jobTitle: 'Product Manager',
      role: CanonicalRole.PROJECT_MANAGER,
      function: CanonicalFunction.Delivery,
      directManagerId: headDeliveryUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Product Manager di bawah Head of Delivery',
      createdByUserId: adminUser.id,
    },
    // 3. Divisi Operations & Infrastructure: Head of Ops membawahi Ops Supervisor & tim spesialis IT/Jaringan
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
    {
      userId: networkInfraUser.id,
      jobTitle: 'Network & Infrastructure Engineer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.OperationsInfrastructure,
      directManagerId: headOpsUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Network & Infrastructure Engineer di bawah Head of Operations & Infrastructure',
      createdByUserId: hrgaUser.id,
    },
    {
      userId: specialistItUser.id,
      jobTitle: 'IT Systems & Cloud Specialist',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.OperationsInfrastructure,
      directManagerId: headOpsUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan IT Systems & Cloud Specialist di bawah Head of Operations & Infrastructure',
      createdByUserId: hrgaUser.id,
    },
    {
      userId: itSupportUser.id,
      jobTitle: 'IT Technical Support',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.OperationsInfrastructure,
      directManagerId: headOpsUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan IT Technical Support di bawah Head of Operations & Infrastructure',
      createdByUserId: hrgaUser.id,
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
    // 5. Divisi Commercial: Head of Sales Enablement & Presales melapor ke CEO & membawahi Business Development
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
    {
      userId: salesBdUser.id,
      jobTitle: 'Business Development Executive',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.SalesEnablementPresales,
      directManagerId: headSalesUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Business Development Executive di bawah Head of Sales Enablement & Presales',
      createdByUserId: hrgaUser.id,
    },
    // 6. Divisi Finance: Senior Finance Staff melapor ke CEO & membawahi Staff Finance
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
    {
      userId: staffFinanceUser.id,
      jobTitle: 'Finance & Invoicing Staff',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Finance,
      directManagerId: financeUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan Finance & Invoicing Staff di bawah Senior Finance Staff',
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
    {
      userId: gaUser.id,
      jobTitle: 'General Affairs (GA) Officer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.HRGA,
      directManagerId: hrgaUser.id,
      effectiveDate: todayDate,
      assignmentReason: 'Penugasan General Affairs (GA) Officer di bawah HRGA & Corporate Legal',
      createdByUserId: hrgaUser.id,
    },
    // Karyawan Magang (Intern) — nama jabatan bersih tanpa kata "Intern", wajib memiliki endDate
    {
      userId: internFrontendUser.id,
      jobTitle: 'Frontend Developer',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Engineering,
      employmentStatus: EmploymentStatus.INTERN,
      directManagerId: headEngUser.id,
      effectiveDate: todayDate,
      endDate: internEndDate,
      assignmentReason: 'Penempatan program magang Divisi Engineering (berakhir otomatis sesuai jadwal magang)',
      createdByUserId: hrgaUser.id,
    },
    {
      userId: internFinanceUser.id,
      jobTitle: 'Finance Staff',
      role: CanonicalRole.EMPLOYEE,
      function: CanonicalFunction.Finance,
      employmentStatus: EmploymentStatus.INTERN,
      directManagerId: financeUser.id,
      effectiveDate: todayDate,
      endDate: internEndDate,
      assignmentReason: 'Penempatan program magang Divisi Finance (berakhir otomatis sesuai jadwal magang)',
      createdByUserId: hrgaUser.id,
    },
  ];

  for (const assignment of orgAssignments) {
    const targetEmploymentStatus = (assignment as any).employmentStatus || EmploymentStatus.PERMANENT;
    const targetEndDate = (assignment as any).endDate ?? null;
    const allRows = await prisma.organizationalAssignment.findMany({
      where: { userId: assignment.userId },
      orderBy: [{ endDate: 'asc' }, { effectiveDate: 'desc' }],
    });

    if (allRows.length === 0) {
      await prisma.organizationalAssignment.create({
        data: {
          ...assignment,
          employmentStatus: targetEmploymentStatus,
          endDate: targetEndDate,
        },
      });
    } else {
      const [primaryRow, ...extraRows] = allRows;
      await prisma.organizationalAssignment.update({
        where: { id: primaryRow.id },
        data: {
          jobTitle: assignment.jobTitle,
          role: assignment.role,
          function: assignment.function,
          employmentStatus: targetEmploymentStatus,
          directManagerId: assignment.directManagerId,
          endDate: targetEndDate,
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

  // =========================================================================
  // 5c. SEED PENANGGUNG JAWAB KATEGORI KENDALA (DEC-017 / Tahap 2B)
  //     Penunjukan resmi per kategori. Bila cuti, tiket hanya naik ke atasan (DEC-014).
  // =========================================================================
  console.log('🧭 [5c/6] Menetapkan Penanggung Jawab Kategori Kendala Resmi...');

  const categoryOwnerPlan: { type: BlockerType; owner: any; reason: string }[] = [
    { type: BlockerType.TECHNICAL, owner: techLeadUser, reason: 'Technical Lead menjadi penanggung jawab kendala Teknis & Kode Program' },
    { type: BlockerType.INFRA, owner: networkInfraUser, reason: 'Network & Infrastructure menjadi penanggung jawab kendala Server & Rilis Sistem' },
    { type: BlockerType.HOSTING_DOMAIN, owner: specialistItUser, reason: 'Specialist IT memegang akun hosting, cloud, dan domain' },
    { type: BlockerType.ACCESS_SECURITY, owner: itSupportUser, reason: 'IT Support menangani akses dan akun kerja harian' },
    { type: BlockerType.NETWORK, owner: networkInfraUser, reason: 'Network & Infrastructure menjadi penanggung jawab Jaringan & Koneksi' },
    { type: BlockerType.WORK_DEVICE, owner: itSupportUser, reason: 'IT Support menangani Perangkat Kerja' },
    { type: BlockerType.OFFICE_FACILITY, owner: gaUser, reason: 'Tim GA menangani Fasilitas & Sarana Kantor' },
    { type: BlockerType.FINANCE, owner: staffFinanceUser, reason: 'Tim Finance menangani Keuangan & Pembayaran' },
    { type: BlockerType.CLIENT, owner: salesBdUser, reason: 'Sales/Business Development menangani calon klien dan tahap penawaran (kendala proyek berjalan tetap ke pimpinan proyek)' },
  ];

  for (const plan of categoryOwnerPlan) {
    const existingOwner = await prisma.blockerCategoryOwner.findFirst({
      where: { blockerType: plan.type, endDate: null },
    });
    if (!existingOwner) {
      await prisma.blockerCategoryOwner.create({
        data: {
          blockerType: plan.type,
          ownerUserId: plan.owner.id,
          effectiveDate: todayDate,
          assignmentReason: plan.reason,
          createdByUserId: adminUser.id,
        },
      });
    } else if (existingOwner.ownerUserId !== plan.owner.id) {
      await prisma.blockerCategoryOwner.update({
        where: { id: existingOwner.id },
        data: { ownerUserId: plan.owner.id, assignmentReason: plan.reason },
      });
    }
  }

  // 5b. Token Undangan 72 Jam untuk Calon Karyawan
  if (newHireUser.status === UserStatus.INVITED) {
    await prisma.session.deleteMany({ where: { userId: newHireUser.id } });
    const rawActivationToken = 'wp_seed_invite_token_72h_demo_secret';
    const tokenHash = crypto.createHash('sha256').update(rawActivationToken).digest('hex');
    const freshExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await prisma.userInvitation.upsert({
      where: { tokenHash },
      update: {
        userId: newHireUser.id,
        status: 'PENDING',
        expiresAt: freshExpiry,
        usedAt: null,
        revokedAt: null,
        revocationReason: null,
      },
      create: {
        userId: newHireUser.id,
        tokenHash,
        status: 'PENDING',
        expiresAt: freshExpiry,
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
        impacts: [BlockerImpact.TASK, BlockerImpact.MILESTONE],
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

  // =========================================================================
  // 6a-2. SEED REKOR HARI KERJA KEMARIN (H-2 & H-1) UNTUK PENGUJIAN NYATA
  //       Memastikan "Prioritas Kemarin Sore" & "Draf Pekerjaan Berlanjut"
  //       langsung muncul dan bisa diuji nyata di halaman Komitmen Pagi.
  // =========================================================================
  const holidayStrSet = new Set(holidays2026.map((h) => h.date.toISOString().split('T')[0]));
  const getPreviousWorkdayDate = (fromDate: Date): Date => {
    const scan = new Date(fromDate.getTime());
    scan.setUTCDate(scan.getUTCDate() - 1);
    for (let i = 0; i < 30; i++) {
      const day = scan.getUTCDay();
      const ds = scan.toISOString().split('T')[0];
      if (day !== 0 && day !== 6 && !holidayStrSet.has(ds)) {
        return new Date(ds);
      }
      scan.setUTCDate(scan.getUTCDate() - 1);
    }
    const fallback = new Date(fromDate.getTime());
    fallback.setUTCDate(fallback.getUTCDate() - 1);
    return new Date(fallback.toISOString().split('T')[0]);
  };

  interface PastCommitmentSeedSpec {
    sequenceNo: number;
    taskText: string;
    referenceLink?: string | null;
    initialRisk: CommitmentRisk;
    knownBlockerNote?: string | null;
    supportNeeded?: string | null;
    isCarryOver?: boolean;
    carryOverDaysCount?: number;
    originCommitmentId?: string | null;
    outcome: CommitmentOutcome;
    outcomeReason?: string | null;
    continuation: ContinuationStatus;
    continuationReason?: string | null;
  }

  async function upsertPastDailyRecordBypassTrigger(params: {
    userId: string;
    workDate: Date;
    orgContextSnapshot: Record<string, any>;
    initialDailyStatus: DailyRiskStatus;
    finalDailyStatus: DailyRiskStatus;
    morningSubmittedAt: Date;
    eodSubmittedAt: Date;
    commitments: PastCommitmentSeedSpec[];
  }) {
    const { userId, workDate: targetWorkDate } = params;
    let record = await prisma.dailyAccountabilityRecord.findUnique({
      where: { userId_workDate: { userId, workDate: targetWorkDate } },
      include: { commitments: { orderBy: { sequenceNo: 'asc' } } },
    });

    const dummyFutureDate = new Date('2099-12-31');

    if (!record) {
      const orphanDummy = await prisma.dailyAccountabilityRecord.findUnique({
        where: { userId_workDate: { userId, workDate: dummyFutureDate } },
        select: { id: true },
      });
      if (orphanDummy) {
        await prisma.dailyAccountabilityRecord.delete({ where: { id: orphanDummy.id } });
      }

      // Insert sementara pada tanggal masa depan untuk melewati trigger anti-backdating, lalu update ke H-1/H-2
      const created = await prisma.dailyAccountabilityRecord.create({
        data: {
          userId,
          workDate: dummyFutureDate,
          orgContextSnapshot: params.orgContextSnapshot,
          policySnapshot: { morningCutoff: '09:30', maxCommitments: 3 },
          morningSubmittedAt: params.morningSubmittedAt,
          eodSubmittedAt: params.eodSubmittedAt,
          morningTiming: TimingStatus.ON_TIME,
          eodTiming: TimingStatus.ON_TIME,
          initialDailyStatus: params.initialDailyStatus,
          finalDailyStatus: params.finalDailyStatus,
          commitments: {
            create: params.commitments.map((c) => ({
              sequenceNo: c.sequenceNo,
              taskText: c.taskText,
              referenceLink: c.referenceLink ?? null,
              initialRisk: c.initialRisk,
              knownBlockerNote: c.knownBlockerNote ?? null,
              supportNeeded: c.supportNeeded ?? null,
              isCarryOver: Boolean(c.isCarryOver),
              carryOverDaysCount: c.carryOverDaysCount ?? 0,
              originCommitmentId: c.originCommitmentId ?? null,
              outcome: c.outcome,
              outcomeReason: c.outcomeReason ?? null,
              continuation: c.continuation,
              continuationReason: c.continuationReason ?? null,
              isMorningLocked: true,
              isEodLocked: true,
            })),
          },
        },
      });

      await prisma.dailyAccountabilityRecord.update({
        where: { id: created.id },
        data: { workDate: targetWorkDate },
      });

      record = await prisma.dailyAccountabilityRecord.findUniqueOrThrow({
        where: { id: created.id },
        include: { commitments: { orderBy: { sequenceNo: 'asc' } } },
      });
    } else {
      await prisma.dailyAccountabilityRecord.update({
        where: { id: record.id },
        data: {
          orgContextSnapshot: params.orgContextSnapshot,
          morningSubmittedAt: params.morningSubmittedAt,
          eodSubmittedAt: params.eodSubmittedAt,
          morningTiming: TimingStatus.ON_TIME,
          eodTiming: TimingStatus.ON_TIME,
          initialDailyStatus: params.initialDailyStatus,
          finalDailyStatus: params.finalDailyStatus,
        },
      });

      for (const spec of params.commitments) {
        const existingC = record.commitments.find((c) => c.sequenceNo === spec.sequenceNo);
        if (existingC) {
          await prisma.commitment.update({
            where: { id: existingC.id },
            data: {
              taskText: spec.taskText,
              referenceLink: spec.referenceLink ?? null,
              initialRisk: spec.initialRisk,
              knownBlockerNote: spec.knownBlockerNote ?? null,
              supportNeeded: spec.supportNeeded ?? null,
              isCarryOver: Boolean(spec.isCarryOver),
              carryOverDaysCount: spec.carryOverDaysCount ?? 0,
              originCommitmentId: spec.originCommitmentId ?? null,
              outcome: spec.outcome,
              outcomeReason: spec.outcomeReason ?? null,
              continuation: spec.continuation,
              continuationReason: spec.continuationReason ?? null,
              isMorningLocked: true,
              isEodLocked: true,
            },
          });
        } else {
          await prisma.commitment.create({
            data: {
              dailyRecordId: record.id,
              sequenceNo: spec.sequenceNo,
              taskText: spec.taskText,
              referenceLink: spec.referenceLink ?? null,
              initialRisk: spec.initialRisk,
              knownBlockerNote: spec.knownBlockerNote ?? null,
              supportNeeded: spec.supportNeeded ?? null,
              isCarryOver: Boolean(spec.isCarryOver),
              carryOverDaysCount: spec.carryOverDaysCount ?? 0,
              originCommitmentId: spec.originCommitmentId ?? null,
              outcome: spec.outcome,
              outcomeReason: spec.outcomeReason ?? null,
              continuation: spec.continuation,
              continuationReason: spec.continuationReason ?? null,
              isMorningLocked: true,
              isEodLocked: true,
            },
          });
        }
      }

      record = await prisma.dailyAccountabilityRecord.findUniqueOrThrow({
        where: { id: record.id },
        include: { commitments: { orderBy: { sequenceNo: 'asc' } } },
      });
    }

    return record;
  }

  const prevWorkdayDate = getPreviousWorkdayDate(todayDate);
  const prev2WorkdayDate = getPreviousWorkdayDate(prevWorkdayDate);
  const h2Morning = new Date(prev2WorkdayDate.getTime() + 1.5 * 3600 * 1000); // 08:30 WIB
  const h2Eod = new Date(prev2WorkdayDate.getTime() + 10 * 3600 * 1000); // 17:00 WIB
  const h1Morning = new Date(prevWorkdayDate.getTime() + 1.5 * 3600 * 1000); // 08:30 WIB
  const h1Eod = new Date(prevWorkdayDate.getTime() + 10 * 3600 * 1000); // 17:00 WIB

  // Pastikan formulir Hari H terbuka siap diisi untuk Dio Bayu Bagaskara & Raka Pratama
  for (const openFormUserId of [productManagerUser.id, internFrontendUser.id]) {
    const todayRec = await prisma.dailyAccountabilityRecord.findUnique({
      where: { userId_workDate: { userId: openFormUserId, workDate } },
      include: { commitments: { select: { id: true } } },
    });
    if (todayRec) {
      const cIds = todayRec.commitments.map((c) => c.id);
      if (cIds.length > 0) {
        await prisma.correctionRequest.deleteMany({
          where: { targetCommitmentId: { in: cIds } },
        });
      }
      await prisma.dailyAccountabilityRecord.delete({ where: { id: todayRec.id } });
    }
  }

  // 1) Dio Bayu Bagaskara (product@dutamedia.com): H-2 -> H-1 (memicu Carry-Over #2 AMBER & Carry-Over #1 + Tomorrow Priority)
  const dioH2Record = await upsertPastDailyRecordBypassTrigger({
    userId: productManagerUser.id,
    workDate: prev2WorkdayDate,
    orgContextSnapshot: {
      department: 'Delivery',
      jobTitle: 'Product Manager',
      managerName: 'Dharma Putra',
      commitmentMeta: {
        1: { projectCode: 'PRJ-PORTAL', linkedBlockerId: null },
      },
    },
    initialDailyStatus: DailyRiskStatus.AMBER,
    finalDailyStatus: DailyRiskStatus.AMBER,
    morningSubmittedAt: h2Morning,
    eodSubmittedAt: h2Eod,
    commitments: [
      {
        sequenceNo: 1,
        taskText: 'Finalisasi spesifikasi alur penagihan otomatis modul PRJ-PORTAL',
        referenceLink: 'https://github.com/dutamedia/workpulse/issues/214',
        initialRisk: CommitmentRisk.AMBER,
        knownBlockerNote: 'Skema diskon bertingkat belum dikonfirmasi tim Finance',
        isCarryOver: false,
        carryOverDaysCount: 0,
        originCommitmentId: null,
        outcome: CommitmentOutcome.PARTIALLY_COMPLETED,
        continuation: ContinuationStatus.CONTINUE,
        continuationReason: 'Menunggu konfirmasi skema diskon bertingkat dari tim Finance',
      },
    ],
  });

  const dioH2Commitment1 = dioH2Record.commitments.find((c) => c.sequenceNo === 1);
  await upsertPastDailyRecordBypassTrigger({
    userId: productManagerUser.id,
    workDate: prevWorkdayDate,
    orgContextSnapshot: {
      department: 'Delivery',
      jobTitle: 'Product Manager',
      managerName: 'Dharma Putra',
      tomorrowPriority:
        'Selesaikan spesifikasi penagihan PRJ-PORTAL dan validasi kriteria UAT bersama QA sebelum pukul 14:00 WIB',
      commitmentMeta: {
        1: { projectCode: 'PRJ-PORTAL', linkedBlockerId: null },
        2: { projectCode: 'PRJ-CORE', linkedBlockerId: null },
      },
    },
    initialDailyStatus: DailyRiskStatus.AMBER,
    finalDailyStatus: DailyRiskStatus.AMBER,
    morningSubmittedAt: h1Morning,
    eodSubmittedAt: h1Eod,
    commitments: [
      {
        sequenceNo: 1,
        taskText: 'Finalisasi spesifikasi alur penagihan otomatis modul PRJ-PORTAL',
        referenceLink: 'https://github.com/dutamedia/workpulse/issues/214',
        initialRisk: CommitmentRisk.AMBER,
        knownBlockerNote: 'Menunggu konfirmasi skema diskon bertingkat dari tim Finance',
        isCarryOver: true,
        carryOverDaysCount: 1,
        originCommitmentId: dioH2Commitment1?.id ?? null,
        outcome: CommitmentOutcome.PARTIALLY_COMPLETED,
        continuation: ContinuationStatus.CONTINUE,
        continuationReason: 'Masih menunggu tabel tarif pajak final dari Finance, dilanjutkan pagi ini',
      },
      {
        sequenceNo: 2,
        taskText: 'Menyusun dokumen kriteria penerimaan (Acceptance Criteria) fitur SSO Enterprise',
        referenceLink: 'https://github.com/dutamedia/workpulse/pull/219',
        initialRisk: CommitmentRisk.GREEN,
        isCarryOver: false,
        carryOverDaysCount: 0,
        originCommitmentId: null,
        outcome: CommitmentOutcome.PARTIALLY_COMPLETED,
        continuation: ContinuationStatus.CONTINUE,
        continuationReason: 'Selesai 75%, tinggal melengkapi skenario batas sesi login paralel',
      },
    ],
  });

  // 2) Raka Pratama (intern.frontend@dutamedia.com): H-1 dengan Carry-Over #1 & Tomorrow Priority
  await upsertPastDailyRecordBypassTrigger({
    userId: internFrontendUser.id,
    workDate: prevWorkdayDate,
    orgContextSnapshot: {
      department: 'Engineering',
      jobTitle: 'Frontend Developer',
      managerName: 'Arif Budiman',
      tomorrowPriority:
        'Merapikan komponen tabel responsif pada halaman riwayat harian dan memperbaiki batas margin layar ponsel',
      commitmentMeta: {
        1: { projectCode: 'WP-CORE', linkedBlockerId: null },
      },
    },
    initialDailyStatus: DailyRiskStatus.GREEN,
    finalDailyStatus: DailyRiskStatus.GREEN,
    morningSubmittedAt: h1Morning,
    eodSubmittedAt: h1Eod,
    commitments: [
      {
        sequenceNo: 1,
        taskText: 'Implementasi tata letak kartu responsif pada modul pengajuan izin',
        referenceLink: 'https://github.com/dutamedia/workpulse/pull/225',
        initialRisk: CommitmentRisk.GREEN,
        isCarryOver: false,
        carryOverDaysCount: 0,
        originCommitmentId: null,
        outcome: CommitmentOutcome.PARTIALLY_COMPLETED,
        continuation: ContinuationStatus.CONTINUE,
        continuationReason: 'Masih perlu menyesuaikan jarak tepi pada layar ponsel 375px',
      },
    ],
  });

  // 3) Aditya Nugroho (dev.frontend@dutamedia.com): H-1 selesai agar Prioritas Kemarin Sore tetap tampil di mode terkunci Hari H
  await upsertPastDailyRecordBypassTrigger({
    userId: frontendUser.id,
    workDate: prevWorkdayDate,
    orgContextSnapshot: {
      department: 'Engineering',
      jobTitle: 'Frontend Developer',
      managerName: 'Arif Budiman',
      tomorrowPriority:
        'Pastikan investigasi CI runner OOM tereskalasi ke Tech Lead dan cek hasil build PR navigasi responsif',
      commitmentMeta: {
        1: { projectCode: 'WP-CORE', linkedBlockerId: null },
      },
    },
    initialDailyStatus: DailyRiskStatus.GREEN,
    finalDailyStatus: DailyRiskStatus.GREEN,
    morningSubmittedAt: h1Morning,
    eodSubmittedAt: h1Eod,
    commitments: [
      {
        sequenceNo: 1,
        taskText: 'Menyelesaikan komponen kerangka header dan sidebar navigasi responsif',
        initialRisk: CommitmentRisk.GREEN,
        isCarryOver: false,
        carryOverDaysCount: 0,
        originCommitmentId: null,
        outcome: CommitmentOutcome.COMPLETED,
        continuation: ContinuationStatus.DO_NOT_CONTINUE,
      },
    ],
  });

  // Sinkronkan tiket contoh OOM agar selalu memiliki multi-dampak baru
  await prisma.blockerTicket.updateMany({
    where: {
      description: 'CI runner mengalami Out Of Memory (OOM) saat proses bundle minification',
    },
    data: {
      impacts: [BlockerImpact.TASK, BlockerImpact.MILESTONE],
    },
  });

  // Pengaman: pastikan seluruh tiket lama di DB yang kolom impacts-nya masih kosong terisi dari impact utama
  const ticketsMissingImpacts = await prisma.blockerTicket.findMany({
    where: { impacts: { equals: [] } },
    select: { id: true, impact: true },
  });
  for (const legacyTicket of ticketsMissingImpacts) {
    await prisma.blockerTicket.update({
      where: { id: legacyTicket.id },
      data: { impacts: [legacyTicket.impact] },
    });
  }

  // Contoh tiket kendala lintas kategori & multi-dampak (idempoten)
  const crossCategorySampleBlockers = [
    {
      raisedByUserId: frontendUser.id,
      type: BlockerType.NETWORK,
      severity: BlockerSeverity.HIGH,
      impact: BlockerImpact.TASK,
      impacts: [BlockerImpact.TASK, BlockerImpact.COMPANY_OPS],
      description:
        '[Koneksi WiFi & VPN Ruang Kerja Lantai 2 Terputus] Jaringan internet kantor dan akses VPN ke repositori internal tidak stabil sejak pagi.',
      ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      assignedOwnerId: networkInfraUser.id,
      projectCodeReference: null,
      status: 'OPEN' as const,
      targetResolutionAt: new Date(Date.now() + 4 * 3600 * 1000),
    },
    {
      raisedByUserId: qaUser.id,
      type: BlockerType.OFFICE_FACILITY,
      severity: BlockerSeverity.MEDIUM,
      impact: BlockerImpact.COMPANY_OPS,
      impacts: [BlockerImpact.COMPANY_OPS, BlockerImpact.TEAM],
      description:
        '[AC Ruang Rapat Utama & Area Kerja Proyek Mati] Pendingin ruangan di area kerja tim proyek tidak berfungsi sehingga suhu ruangan panas.',
      ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      assignedOwnerId: gaUser.id,
      projectCodeReference: null,
      status: 'OPEN' as const,
      targetResolutionAt: new Date(Date.now() + 8 * 3600 * 1000),
    },
    {
      raisedByUserId: backendUser.id,
      type: BlockerType.CLIENT,
      severity: BlockerSeverity.HIGH,
      impact: BlockerImpact.CLIENT,
      impacts: [BlockerImpact.CLIENT, BlockerImpact.PROJECT],
      description:
        '[Klien Belum Mengirimkan Data Umpan Balik UAT Portal] Tim klien belum memberikan konfirmasi tertulis atas hasil demo modul diskon.',
      ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
      assignedOwnerId: pmUser.id,
      projectCodeReference: 'PRJ-PORTAL',
      status: 'OPEN' as const,
      targetResolutionAt: new Date(Date.now() + 4 * 3600 * 1000),
    },
    {
      raisedByUserId: techLeadUser.id,
      type: BlockerType.APPROVAL,
      severity: BlockerSeverity.MEDIUM,
      impact: BlockerImpact.MILESTONE,
      impacts: [BlockerImpact.MILESTONE],
      description:
        '[Menunggu Persetujuan Rilis Arsitektur Database Baru] Dokumen skema migrasi tahap 2 memerlukan tanda tangan persetujuan Head of Engineering.',
      ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
      assignedOwnerId: headEngUser.id,
      projectCodeReference: 'WP-CORE',
      status: 'OPEN' as const,
      targetResolutionAt: new Date(Date.now() + 8 * 3600 * 1000),
    },
    {
      raisedByUserId: frontendUser.id,
      type: BlockerType.CROSS_TEAM,
      severity: BlockerSeverity.MEDIUM,
      impact: BlockerImpact.TASK,
      impacts: [BlockerImpact.TASK, BlockerImpact.PROJECT],
      waitingForFunction: CanonicalFunction.Delivery,
      description:
        '[Menunggu Hasil Uji QA dari Tim Delivery] Perbaikan fitur navigasi sudah selesai, tetapi belum bisa dirilis karena hasil pengujian belum diterima.',
      ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      assignedOwnerId: headDeliveryUser.id,
      projectCodeReference: null,
      status: 'OPEN' as const,
      targetResolutionAt: new Date(Date.now() + 8 * 3600 * 1000),
    },
    {
      raisedByUserId: backendUser.id,
      type: BlockerType.INFRA,
      severity: BlockerSeverity.CRITICAL,
      impact: BlockerImpact.PRODUCTION,
      impacts: [BlockerImpact.PRODUCTION, BlockerImpact.MILESTONE, BlockerImpact.CLIENT],
      description:
        '[Server API Produksi WP-CORE Mengalami Lonjakan Timeout Database] Layanan sinkronisasi utama melebihi batas waktu respon sehingga menghambat jadwal rilis klien hari ini.',
      ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
      assignedOwnerId: networkInfraUser.id,
      projectCodeReference: 'WP-CORE',
      status: 'OPEN' as const,
      // Sengaja diset 2 jam yang lalu agar Radar Penuaan (/blockers/aging) & Risiko Proyek langsung menampilkan status Lewat Batas Waktu
      targetResolutionAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
  ];

  for (const sampleTicket of crossCategorySampleBlockers) {
    const existingSample = await prisma.blockerTicket.findFirst({
      where: { description: sampleTicket.description },
      select: { id: true },
    });
    if (!existingSample) {
      await prisma.blockerTicket.create({ data: sampleTicket });
    } else {
      await prisma.blockerTicket.update({
        where: { id: existingSample.id },
        data: {
          type: sampleTicket.type,
          impact: sampleTicket.impact,
          impacts: sampleTicket.impacts,
          waitingForFunction: (sampleTicket as any).waitingForFunction ?? null,
          assignedOwnerId: sampleTicket.assignedOwnerId,
        },
      });
    }
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

  // 6c-2. Pengajuan Izin (PERMIT) PENDING untuk Anak Magang (Raka Pratama - Divisi Engineering) pada H+5
  const existingLeaveRaka = await prisma.leaveRequest.findFirst({
    where: { userId: internFrontendUser.id, status: 'PENDING' },
  });
  if (!existingLeaveRaka) {
    const internPermitDate = new Date(workDate);
    internPermitDate.setDate(internPermitDate.getDate() + 5);

    await prisma.leaveRequest.create({
      data: {
        userId: internFrontendUser.id,
        startDate: internPermitDate,
        endDate: internPermitDate,
        leaveType: 'PERMIT',
        reason: 'Menghadiri seminar tugas akhir wajib di kampus (surat keterangan terlampir)',
        status: 'PENDING',
      },
    });
  }

  // 6c-3. Cuti Resmi APPROVED Hari Ini untuk Specialist IT (Achmad Noer Wahid — Penanggung Jawab Kategori HOSTING_DOMAIN)
  // Membuktikan langsung 2 fitur sekaligus: (1) Spanduk Hijau Bebas Check-In & (2) Aturan Cuti Vertikal Blocker (naik ke Gunawan Setiawan)
  const existingApprovedLeaveAchmad = await prisma.leaveRequest.findFirst({
    where: { userId: specialistItUser.id, status: 'APPROVED', startDate: workDate },
  });
  if (!existingApprovedLeaveAchmad) {
    const tomorrowAchmad = new Date(workDate);
    tomorrowAchmad.setDate(tomorrowAchmad.getDate() + 1);

    await prisma.leaveRequest.create({
      data: {
        userId: specialistItUser.id,
        startDate: workDate,
        endDate: tomorrowAchmad,
        leaveType: 'ANNUAL',
        reason: 'Cuti tahunan keperluan keluarga (disetujui resmi Head Ops & Infra)',
        status: 'APPROVED',
        reviewedByUserId: headOpsUser.id,
        reviewedAt: new Date(),
        reviewNote: 'Disetujui. Seluruh kendala Hosting & Domain sementara dialihkan otomatis ke Head Ops & Infra.',
      },
    });
  }

  // 6d. Catatan Pembinaan Awal (ManagerNote) — 2 Mode Kerahasiaan (Dibagikan ke Karyawan vs Rahasia Manajemen)
  const existingSharedNote = await prisma.managerNote.findFirst({
    where: {
      subjectUserId: frontendUser.id,
      visibility: NoteVisibility.SHARED_WITH_EMPLOYEE,
    },
  });
  if (!existingSharedNote) {
    await prisma.managerNote.create({
      data: {
        subjectUserId: frontendUser.id,
        authorUserId: headEngUser.id,
        noteType: ManagerNoteType.RECOGNITION,
        visibility: NoteVisibility.SHARED_WITH_EMPLOYEE,
        content:
          'Apresiasi atas inisiatif cepat menyelesaikan kerangka navigasi responsif lintas 5 ukuran layar sebelum tenggat UAT.',
      },
    });
  }

  const existingConfidentialNote = await prisma.managerNote.findFirst({
    where: {
      subjectUserId: frontendUser.id,
      visibility: NoteVisibility.CONFIDENTIAL_MANAGER_ONLY,
    },
  });
  if (!existingConfidentialNote) {
    await prisma.managerNote.create({
      data: {
        subjectUserId: frontendUser.id,
        authorUserId: headEngUser.id,
        noteType: ManagerNoteType.COACHING,
        visibility: NoteVisibility.CONFIDENTIAL_MANAGER_ONLY,
        content:
          '[Rahasia Manajemen] Perlu pendampingan tambahan estimasi beban kerja ketika mengerjakan 2 modul paralel agar risiko AMBER bisa ditekan.',
      },
    });
  }

  // 6e. Antrean Kepatuhan HRGA (ComplianceEvent) — 1 OPEN (Tindak Lanjut) & 1 ADDRESSED (Ubah Catatan)
  const existingComplianceOpen = await prisma.complianceEvent.findFirst({
    where: { userId: backendUser.id, stage: ComplianceEventStage.PATTERN_FLAG_3X },
  });
  if (!existingComplianceOpen) {
    await prisma.complianceEvent.create({
      data: {
        userId: backendUser.id,
        eventDate: prevWorkdayDate,
        stage: ComplianceEventStage.PATTERN_FLAG_3X,
        policySnapshot: { morningCutoff: '09:30', patternThreshold: 3 },
        followUpStatus: 'OPEN',
      },
    });
  }

  const existingComplianceAddressed = await prisma.complianceEvent.findFirst({
    where: { userId: qaUser.id, followUpStatus: 'ADDRESSED' },
  });
  if (!existingComplianceAddressed) {
    const hrgaFollowUpNote = await prisma.managerNote.create({
      data: {
        subjectUserId: qaUser.id,
        authorUserId: hrgaUser.id,
        noteType: ManagerNoteType.COACHING,
        visibility: NoteVisibility.SHARED_WITH_EMPLOYEE,
        content:
          'Sudah dikonfirmasi bersama Head of Delivery: keterlambatan disebabkan kendala listrik pagi hari di lokasi kerja.',
      },
    });
    await prisma.complianceEvent.create({
      data: {
        userId: qaUser.id,
        eventDate: prev2WorkdayDate,
        stage: ComplianceEventStage.NO_SUBMISSION,
        policySnapshot: { morningCutoff: '09:30' },
        followUpStatus: 'ADDRESSED',
        followUpManagerNoteId: hrgaFollowUpNote.id,
      },
    });
  }

  // 6f. Dispensasi Kepatuhan Aktif (BoundedExemption) — Dinas Luar Sales/BD (Hari Wibowo) pada H+2 s/d H+3
  const existingExemptionHari = await prisma.boundedExemption.findFirst({
    where: { userId: salesBdUser.id, officialReferenceNumber: 'ST/HRGA/2026/XI/104' },
  });
  if (!existingExemptionHari) {
    const exStart = new Date(workDate);
    exStart.setDate(exStart.getDate() + 2);
    const exEnd = new Date(workDate);
    exEnd.setDate(exEnd.getDate() + 3);
    await prisma.boundedExemption.create({
      data: {
        userId: salesBdUser.id,
        startDate: exStart,
        endDate: exEnd,
        exemptionCategory: 'DINAS_LUAR',
        officialReferenceNumber: 'ST/HRGA/2026/XI/104',
        reason: 'Kunjungan presentasi proposal solusi teknologi ke klien korporasi di Surabaya',
        createdByUserId: hrgaUser.id,
      },
    });
  }

  // 6g. Notifikasi In-App untuk Technical Lead 1 & Aditya Nugroho
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

  const existingNotifAditya = await prisma.notification.findFirst({
    where: { recipientUserId: frontendUser.id, triggerType: 'COACHING_NOTE_SHARED' },
  });
  if (!existingNotifAditya) {
    await prisma.notification.create({
      data: {
        recipientUserId: frontendUser.id,
        triggerType: 'COACHING_NOTE_SHARED',
        channel: NotificationChannel.IN_APP_CENTER,
        title: 'Catatan Apresiasi Baru dari Head of Engineering',
        message: 'Arif Budiman membagikan catatan apresiasi terkait penyelesaian kerangka navigasi responsif.',
        actionUrl: '/profile',
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
  • Head of Delivery         : head.delivery@dutamedia.com  (Dharma Putra)        [HEAD]
  • Project Manager 1 (Del)  : pm@dutamedia.com             (Dimas Prakoso)       [PROJECT_MANAGER / Project Lead PRJ-PORTAL & PRJ-MOBILE]
  • Product Manager (Del)    : product@dutamedia.com        (Dio Bayu Bagaskara)  [PROJECT_MANAGER]
  • Software QA (Del)        : qa@dutamedia.com             (Nadia Kusuma)        [EMPLOYEE]
  • Head of Ops & Infra      : head.ops@dutamedia.com       (Gunawan Setiawan)    [HEAD]
  • Operations Supervisor    : lead.creative@dutamedia.com  (Rian Kurniawan)      [SUPERVISOR]
  • Network & Infra (Ops)    : network.infra@dutamedia.com  (Fakhrizal Asshiddiq) [EMPLOYEE]
  • Specialist IT (Ops)      : specialist.it@dutamedia.com  (Achmad Noer Wahid)   [EMPLOYEE]
  • IT Support (Ops)         : it.support@dutamedia.com     (Rahian M. Suari)     [EMPLOYEE]
  • Principal Engineer (R&D) : designer@dutamedia.com       (Maya Putri)          [EMPLOYEE]
  • Head of Sales & Presales : head.sales@dutamedia.com     (Lukman Hakim)        [HEAD]
  • Sales / BD Executive     : sales.bd@dutamedia.com       (Hari Wibowo)         [EMPLOYEE]
  • Senior Finance Staff     : finance@dutamedia.com        (Ratna Sari)          [EMPLOYEE]
  • Finance Staff            : staff.finance@dutamedia.com  (Oivi Deasepta)       [EMPLOYEE]
  • HRGA & Legal Admin       : hrga@dutamedia.com           (Dewi Lestari)        [HRGA]
  • General Affairs (GA)     : ga@dutamedia.com             (Sugito Erik Fajar)   [EMPLOYEE]
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
