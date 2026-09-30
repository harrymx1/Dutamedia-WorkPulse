import 'dotenv/config';
import { PrismaService } from '../modules/prisma/prisma.service.js';
import { DatabaseBackupService, TOPOLOGICAL_TABLES } from '../modules/scheduler/services/database-backup.service.js';
import {
  Role,
  UserStatus,
  DailyStatus,
  SubmissionTiming,
  CommitmentOutcome,
  Continuation,
  BlockerSeverity,
  OwnerNeededType,
  BlockerStatus,
  CorrectionClassification,
  CorrectionStatus,
  PolicyCategory,
  PolicyStatus,
  NotificationChannel,
  NotificationStatus,
  ManagerNoteType,
  ManagerNoteVisibility,
  ComplianceEventType,
  ExceptionType,
  ExceptionStatus,
  Prisma,
} from '@prisma/client';


async function main() {
  console.log('=============================================================================');
  console.log('WorkPulse Real Database Restore Verification (SAD §21.6, §23.2 B1 / EPIC-23-T5)');
  console.log('=============================================================================\n');

  const prisma = new PrismaService();
  await prisma.onModuleInit();

  const mockS3Storage: any = {
    uploadBuffer: async () => ({ success: true, key: 'test-backup-key' }),
  };
  const backupService = new DatabaseBackupService(prisma, mockS3Storage);

  // Helper untuk menghitung row count seluruh tabel
  async function getTableCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const item of TOPOLOGICAL_TABLES) {
      const delegate = (prisma as any)[item.modelName];
      if (delegate && typeof delegate.count === 'function') {
        counts[item.tableName] = await delegate.count();
      }
    }
    return counts;
  }

  // Helper untuk membersihkan database dalam urutan reverse topological
  async function cleanAllTables() {
    console.log('[STEP] Membersihkan database (reverse topological order)...');
    const reversed = [...TOPOLOGICAL_TABLES].reverse();
    for (const item of reversed) {
      const delegate = (prisma as any)[item.modelName];
      if (delegate && typeof delegate.deleteMany === 'function') {
        await delegate.deleteMany();
      }
    }
  }

  // 1. Bersihkan database awal
  await cleanAllTables();

  // 2. Seeding data sample komprehensif
  console.log('[STEP] Melakukan seeding data sample realistis ke 18 tabel...');

  // 2.1 Users
  const userAdmin = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: 'admin.verify@dutamedia.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash1',
      status: UserStatus.Active,
      mustResetPassword: false,
    },
  });

  const userHead = await prisma.user.create({
    data: {
      fullName: 'Head of Engineering',
      email: 'head.verify@dutamedia.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash2',
      status: UserStatus.Active,
      mustResetPassword: false,
    },
  });

  const userSupervisor = await prisma.user.create({
    data: {
      fullName: 'Engineering Supervisor',
      email: 'spv.verify@dutamedia.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash3',
      status: UserStatus.Active,
      mustResetPassword: false,
    },
  });

  const userEmployee1 = await prisma.user.create({
    data: {
      fullName: "Budi Santoso O'Connor",
      email: 'budi.verify@dutamedia.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash4',
      status: UserStatus.Active,
      mustResetPassword: false,
    },
  });

  const userEmployee2 = await prisma.user.create({
    data: {
      fullName: 'Siti Rahmawati',
      email: 'siti.verify@dutamedia.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash5',
      status: UserStatus.Active,
      mustResetPassword: true,
    },
  });

  // 2.2 Policies & PolicyOwnerAssignments
  const cutoffPolicy = await prisma.policy.create({
    data: {
      category: PolicyCategory.Cutoff,
      value: { morningCutoff: '09:00', eodCutoff: '18:00', timezone: 'Asia/Jakarta' },
      effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
      status: PolicyStatus.Active,
      createdByUserId: userAdmin.id,
    },
  });

  await prisma.policyOwnerAssignment.create({
    data: {
      userId: userHead.id,
      policyCategory: PolicyCategory.Cutoff,
      effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
    },
  });

  // 2.3 Organizational Assignments
  await prisma.organizationalAssignment.createMany({
    data: [
      {
        userId: userAdmin.id,
        role: Role.SystemAdmin,
        function: 'IT & Infrastructure',
        effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
        createdByUserId: userAdmin.id,
      },
      {
        userId: userHead.id,
        role: Role.Head,
        function: 'Engineering',
        effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
        createdByUserId: userAdmin.id,
      },
      {
        userId: userSupervisor.id,
        role: Role.Supervisor_TL,
        function: 'Engineering',
        directManagerId: userHead.id,
        effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
        createdByUserId: userHead.id,
      },
      {
        userId: userEmployee1.id,
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: userSupervisor.id,
        effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
        createdByUserId: userSupervisor.id,
      },
      {
        userId: userEmployee2.id,
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: userSupervisor.id,
        effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
        createdByUserId: userSupervisor.id,
      },
    ],
  });

  // 2.4 Project Authority Mappings
  await prisma.projectAuthorityMapping.create({
    data: {
      userId: userSupervisor.id,
      scopeReference: 'Project-WorkPulse',
      effectiveDate: new Date('2026-01-01T00:00:00.000Z'),
      createdByUserId: userHead.id,
    },
  });

  // 2.5 Temporary Reviewer Assignment
  await prisma.temporaryReviewerAssignment.create({
    data: {
      reviewerUserId: userHead.id,
      scope: 'Engineering-Delegated',
      reason: 'Supervisor on leave',
      effectiveDate: new Date('2026-09-15T00:00:00.000Z'),
      expiryDate: new Date('2026-09-25T00:00:00.000Z'),
      createdByUserId: userHead.id,
    },
  });

  // 2.6 Session
  await prisma.session.create({
    data: {
      userId: userEmployee1.id,
      expiresAt: new Date('2026-09-30T00:00:00.000Z'),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  // 2.7 Exception (Leave/Holiday)
  await prisma.exception.create({
    data: {
      type: ExceptionType.Leave,
      employeeUserId: userEmployee2.id,
      dateStart: new Date('2026-09-20T00:00:00.000Z'),
      dateEnd: new Date('2026-09-21T00:00:00.000Z'),
      status: ExceptionStatus.Approved,
      reason: 'Cuti tahunan keluarga',
      approvedByUserId: userSupervisor.id,
      createdByUserId: userEmployee2.id,
    },
  });

  // 2.8 Daily Accountability Record
  const dailyRecord1 = await prisma.dailyAccountabilityRecord.create({
    data: {
      employeeUserId: userEmployee1.id,
      workDate: new Date('2026-09-17T00:00:00.000Z'),
      orgContextSnapshot: {
        role: 'Employee',
        function: 'Engineering',
        supervisorName: 'Engineering Supervisor',
      },
      policySnapshot: {
        cutoffTime: '09:00',
        gracePeriodMins: 15,
      },
      morningSubmittedAt: new Date('2026-09-17T01:45:00.000Z'),
      eodSubmittedAt: new Date('2026-09-17T10:30:00.000Z'),
      morningTiming: SubmissionTiming.OnTime,
      eodTiming: SubmissionTiming.OnTime,
      cutoffLockedAt: new Date('2026-09-17T02:00:00.000Z'),
      initialStatus: DailyStatus.GREEN,
      finalStatus: DailyStatus.GREEN,
    },
  });

  const dailyRecord2 = await prisma.dailyAccountabilityRecord.create({
    data: {
      employeeUserId: userEmployee2.id,
      workDate: new Date('2026-09-17T00:00:00.000Z'),
      orgContextSnapshot: {
        role: 'Employee',
        function: 'Engineering',
        supervisorName: 'Engineering Supervisor',
      },
      policySnapshot: {
        cutoffTime: '09:00',
        gracePeriodMins: 15,
      },
      morningSubmittedAt: new Date('2026-09-17T01:50:00.000Z'),
      morningTiming: SubmissionTiming.OnTime,
      cutoffLockedAt: new Date('2026-09-17T02:00:00.000Z'),
      initialStatus: DailyStatus.AMBER,
    },
  });

  // 2.9 Commitments
  const commitment1 = await prisma.commitment.create({
    data: {
      dailyRecordId: dailyRecord1.id,
      sequenceNo: 1,
      text: 'Implementasi scheduled database backup dump service',
      referenceLink: 'https://github.com/org/repo/issues/101',
      initialRisk: DailyStatus.GREEN,
      outcome: CommitmentOutcome.Completed,
      continuation: Continuation.DoNotContinue,
      isMorningLocked: true,
      isEodLocked: true,
    },
  });

  const _commitment2 = await prisma.commitment.create({
    data: {
      dailyRecordId: dailyRecord1.id,
      sequenceNo: 2,
      text: 'Review PR otorisasi role dan scope audit',
      initialRisk: DailyStatus.GREEN,
      outcome: CommitmentOutcome.Completed,
      continuation: Continuation.DoNotContinue,
      isMorningLocked: true,
      isEodLocked: true,
    },
  });

  const commitment3 = await prisma.commitment.create({
    data: {
      dailyRecordId: dailyRecord2.id,
      sequenceNo: 1,
      text: 'Integrasi S3 presigned upload URL evidence file',
      initialRisk: DailyStatus.AMBER,
      knownBlockerNote: 'Menunggu kredensial bucket dari IT Cloud',
      outcome: CommitmentOutcome.PartiallyCompleted,
      outcomeReason: 'Bucket permissions perlu di-whitelist',
      continuation: Continuation.Continue,
      continuationReason: 'Lanjut besok setelah akses diberikan',
      isMorningLocked: true,
      isEodLocked: true,
    },
  });

  // 2.10 Additional Works
  await prisma.additionalWork.create({
    data: {
      dailyRecordId: dailyRecord1.id,
      text: 'Hotfix bug login CSRF cookie parsing',
      reason: 'OperationalIncident' as any,
      outcome: CommitmentOutcome.Completed,
      continuation: Continuation.DoNotContinue,
      isLocked: true,
    },
  });

  // 2.11 Blockers
  const blocker1 = await prisma.blocker.create({
    data: {
      raisedByUserId: userEmployee2.id,
      linkedCommitmentId: commitment3.id,
      type: 'Access & Permission',
      severity: BlockerSeverity.High,
      impact: 'Tidak bisa upload evidence file pengujian S3',
      ownerNeededType: OwnerNeededType.OrganizationalAuthority,
      ownerNeededUserId: userSupervisor.id,
      status: BlockerStatus.Open,
      raisedAt: new Date('2026-09-17T02:30:00.000Z'),
    },
  });

  // 2.12 Support Contributions
  await prisma.supportContribution.create({
    data: {
      blockerId: blocker1.id,
      supporterUserId: userSupervisor.id,
      action: 'Menghubungi IT Infrastructure Helpdesk via tiket #4588',
      resultNote: 'Sedang menunggu approval tiket IT',
      createdAt: new Date('2026-09-17T03:15:00.000Z'),
    },
  });

  // 2.13 Correction Requests
  await prisma.correctionRequest.create({
    data: {
      targetCommitmentId: commitment1.id,
      requestedByUserId: userEmployee1.id,
      requestedChange: { text: 'Implementasi scheduled database backup dump service (selesai full)' },
      reason: 'Koreksi typo deskripsi komitmen',
      classification: CorrectionClassification.Minor,
      policySnapshot: { windowHours: 24 },
      status: CorrectionStatus.Applied,
      appliedAt: new Date('2026-09-17T03:00:00.000Z'),
    },
  });

  // 2.14 Manager Notes
  await prisma.managerNote.create({
    data: {
      aboutUserId: userEmployee1.id,
      createdByUserId: userSupervisor.id,
      type: ManagerNoteType.Recognition,
      note: 'Kerja bagus dalam menuntaskan triase audit arsitektur',
      visibility: ManagerNoteVisibility.VisibleToEmployee,
      createdAt: new Date('2026-09-17T11:00:00.000Z'),
    },
  });

  // 2.15 Compliance Events
  await prisma.complianceEvent.create({
    data: {
      userId: userEmployee2.id,
      eventType: ComplianceEventType.PatternFlag,
      eventDate: new Date('2026-09-17T00:00:00.000Z'),
      relatedDailyRecordId: dailyRecord2.id,
      policySnapshot: { thresholdConsecutiveAmber: 3 },
      followUpStatus: 'Needs review in weekly 1on1',
      createdAt: new Date('2026-09-17T12:00:00.000Z'),
    },
  });

  // 2.16 Notifications
  await prisma.notification.create({
    data: {
      recipientUserId: userEmployee1.id,
      triggerType: 'CORRECTION_APPROVED',
      channel: NotificationChannel.WebNotificationCenter,
      payload: {
        title: 'Koreksi Komitmen Diterapkan',
        body: 'Koreksi minor pada komitmen Anda telah otomatis diterapkan.',
      },
      status: NotificationStatus.Sent,
      sentAt: new Date('2026-09-17T03:00:00.000Z'),
    },
  });

  // 2.17 Audit Logs (Append-Only)
  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: userAdmin.id,
        action: 'POLICY_CREATED',
        relatedEntityType: 'Policy',
        relatedEntityId: cutoffPolicy.id,
        valueBefore: Prisma.JsonNull,
        valueAfter: { category: 'Cutoff', morningCutoff: '09:00' },
        timestamp: new Date('2026-09-17T00:30:00.000Z'),
      },
      {
        actorUserId: userEmployee1.id,
        action: 'DAILY_RECORD_SUBMITTED',
        relatedEntityType: 'DailyAccountabilityRecord',
        relatedEntityId: dailyRecord1.id,
        valueBefore: Prisma.JsonNull,
        valueAfter: { timing: 'OnTime', initialStatus: 'GREEN' },
        timestamp: new Date('2026-09-17T01:45:00.000Z'),
      },
      {
        actorUserId: userEmployee2.id,
        action: 'BLOCKER_RAISED',
        relatedEntityType: 'Blocker',
        relatedEntityId: blocker1.id,
        valueBefore: Prisma.JsonNull,
        valueAfter: { severity: 'High', ownerNeeded: userSupervisor.id },
        timestamp: new Date('2026-09-17T02:30:00.000Z'),
      },
      {
        actorUserId: userEmployee1.id,
        action: 'CORRECTION_REQUEST_APPLIED',
        relatedEntityType: 'CorrectionRequest',
        relatedEntityId: commitment1.id,
        valueBefore: { text: 'Implementasi scheduled database backup dump service' },
        valueAfter: { text: 'Implementasi scheduled database backup dump service (selesai full)' },
        timestamp: new Date('2026-09-17T03:00:00.000Z'),
      },
    ],
  });

  console.log('[STEP] Data seeding selesai.');

  // 3. Rekam row count SEBELUM backup
  console.log('\n=============================================================================');
  console.log('1. ROW COUNT SEBELUM BACKUP (PRE-BACKUP STATE):');
  console.log('=============================================================================');
  const preCounts = await getTableCounts();
  console.table(
    Object.entries(preCounts).map(([table, count]) => ({
      Table: table,
      'Pre-Backup Count': count,
    })),
  );

  // 4. Eksekusi generateSqlDump()
  console.log('\n[STEP] Menjalankan DatabaseBackupService.generateSqlDump()...');
  const dumpTimestamp = new Date();
  const sqlDump = await backupService.generateSqlDump(dumpTimestamp);

  console.log(`[INFO] Ukuran dump SQL: ${sqlDump.length} karakter.`);
  console.log(`[INFO] Cuplikan header SQL dump:\n${sqlDump.split('\n').slice(0, 25).join('\n')}\n...`);

  // Validasi dump memuat data esensial
  if (!sqlDump.includes('INSERT INTO "users"')) {
    throw new Error('Dump SQL gagal: tidak memuat INSERT INTO "users"!');
  }
  if (!sqlDump.includes('INSERT INTO "audit_logs"')) {
    throw new Error('Dump SQL gagal: tidak memuat INSERT INTO "audit_logs"!');
  }
  if (!sqlDump.includes('INSERT INTO "daily_accountability_records"')) {
    throw new Error('Dump SQL gagal: tidak memuat INSERT INTO "daily_accountability_records"!');
  }
  if (!sqlDump.includes('INSERT INTO "blockers"')) {
    throw new Error('Dump SQL gagal: tidak memuat INSERT INTO "blockers"!');
  }
  if (!sqlDump.includes('INSERT INTO "correction_requests"')) {
    throw new Error('Dump SQL gagal: tidak memuat INSERT INTO "correction_requests"!');
  }

  // 5. Simulasi Bencana / Kosongkan Database
  console.log('\n=============================================================================');
  console.log('2. SIMULASI BENCANA: MENGOSONGKAN DATABASE PENUH (WIPE TO ZERO)...');
  console.log('=============================================================================');
  await cleanAllTables();

  const wipedCounts = await getTableCounts();
  console.table(
    Object.entries(wipedCounts).map(([table, count]) => ({
      Table: table,
      'Wiped Count': count,
    })),
  );

  // Verifikasi semua tabel benar-benar kosong
  const totalWipedRows = Object.values(wipedCounts).reduce((a, b) => a + b, 0);
  if (totalWipedRows !== 0) {
    throw new Error(`Gagal mengosongkan database: masih tersisa ${totalWipedRows} baris!`);
  }
  console.log('[VERIFIKASI] Database telah 100% kosong (0 rows di seluruh tabel).');

  // 6. Eksekusi Restore Nyata dari SQL Dump
  console.log('\n=============================================================================');
  console.log('3. MENJALANKAN RESTORE NYATA DARI SQL DUMP VIA RESTOREFROMSQLDUMP()...');
  console.log('=============================================================================');
  const restoreStart = Date.now();
  const restoreResult = await backupService.restoreFromSqlDump(sqlDump);
  const restoreDurationMs = Date.now() - restoreStart;

  console.log(`[HASIL RESTORE] Success: ${restoreResult.success}, Statements Executed: ${restoreResult.statementsExecuted}, Duration: ${restoreDurationMs}ms`);
  if (!restoreResult.success) {
    throw new Error(`Eksekusi restore gagal: ${restoreResult.error}`);
  }

  // 7. Rekam row count SETELAH restore
  console.log('\n=============================================================================');
  console.log('4. ROW COUNT SETELAH RESTORE (POST-RESTORE STATE):');
  console.log('=============================================================================');
  const postCounts = await getTableCounts();

  let allMatch = true;
  const comparisonReport: any[] = [];

  for (const item of TOPOLOGICAL_TABLES) {
    const table = item.tableName;
    const pre = preCounts[table] || 0;
    const post = postCounts[table] || 0;
    const match = pre === post;
    if (!match) allMatch = false;

    comparisonReport.push({
      Table: table,
      'Pre-Backup': pre,
      'Post-Restore': post,
      Status: match ? 'MATCH (100%)' : 'MISMATCH',
    });
  }

  console.table(comparisonReport);

  // 8. Verifikasi Data Sampel Spesifik (Data Fidelity Verification)
  console.log('\n=============================================================================');
  console.log('5. VERIFIKASI INTEGRITAS ISI DATA (DATA FIDELITY CHECK):');
  console.log('=============================================================================');

  // Cek User
  const restoredUser = await prisma.user.findUnique({ where: { email: 'budi.verify@dutamedia.com' } });
  console.log(`- User "Budi Santoso O'Connor": ${restoredUser ? 'DITEMUKAN & UTUH (ID: ' + restoredUser.id + ')' : 'TIDAK DITEMUKAN!'}`);
  if (!restoredUser || restoredUser.fullName !== "Budi Santoso O'Connor") {
    throw new Error('Data User tidak cocok setelah restore!');
  }

  // Cek DailyAccountabilityRecord & JSON Snapshot
  const restoredDar = await prisma.dailyAccountabilityRecord.findFirst({
    where: { employeeUserId: restoredUser.id },
  });
  console.log(`- DailyAccountabilityRecord orgContextSnapshot: ${JSON.stringify(restoredDar?.orgContextSnapshot)}`);
  if (!restoredDar || (restoredDar.orgContextSnapshot as any)?.role !== 'Employee') {
    throw new Error('Data DailyAccountabilityRecord snapshot tidak cocok setelah restore!');
  }

  // Cek Blocker
  const restoredBlocker = await prisma.blocker.findFirst({
    where: { type: 'Access & Permission' },
  });
  console.log(`- Blocker Severity & Impact: [${restoredBlocker?.severity}] "${restoredBlocker?.impact}"`);
  if (!restoredBlocker || restoredBlocker.severity !== BlockerSeverity.High) {
    throw new Error('Data Blocker tidak cocok setelah restore!');
  }

  // Cek CorrectionRequest & JSON payload
  const restoredCr = await prisma.correctionRequest.findFirst({
    where: { classification: CorrectionClassification.Minor },
  });
  console.log(`- CorrectionRequest status: ${restoredCr?.status}, change: ${JSON.stringify(restoredCr?.requestedChange)}`);
  if (!restoredCr || restoredCr.status !== CorrectionStatus.Applied) {
    throw new Error('Data CorrectionRequest tidak cocok setelah restore!');
  }

  // Cek AuditLog (Append-Only Survivability)
  const restoredLogs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'asc' } });
  console.log(`- AuditLog records recovered: ${restoredLogs.length} events:`);
  for (const log of restoredLogs) {
    console.log(`  * [${log.action}] entity=${log.relatedEntityType}:${log.relatedEntityId} at ${log.timestamp.toISOString()}`);
  }
  if (restoredLogs.length !== preCounts.audit_logs) {
    throw new Error('Jumlah AuditLog tidak sesuai setelah restore!');
  }

  // 9. Status Akhir
  if (!allMatch) {
    throw new Error('VERIFIKASI GAGAL: Terjadi ketidakcocokan row count antara pre-backup dan post-restore!');
  }

  console.log('\n=============================================================================');
  console.log('HASIL AKHIR: UJI COBA RESTORE NYATA BERHASIL 100% (SAD §21.6, §23.2 B1 TERPENUHI)');
  console.log('=============================================================================\n');

  await prisma.onModuleDestroy();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('\n[FATAL ERROR] Gagal menjalankan verifikasi restore:', err);
  process.exit(1);
});
