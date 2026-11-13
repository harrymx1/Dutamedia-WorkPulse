import { CanonicalRole, PolicyCategory, UserStatus } from '@prisma/client';

/**
 * Sinkronisasi satu kali (one-time baseline sync) untuk memastikan 3 pemegang wewenang awal
 * (Direktur / CEO_MANAGEMENT, Admin / SYSTEM_ADMIN, dan HRGA) tercatat secara eksplisit
 * di tabel policy_owner_assignments untuk ke-5 kategori kebijakan sistem.
 *
 * Setelah penanda 'POLICY_OWNERS_BASELINE_SYNCED_V1' tercatat di audit_logs, fungsi ini
 * tidak akan pernah menimpa perubahan CRUD (tambah/ubah/cabut) yang dilakukan pengguna.
 */
export async function ensurePolicyOwnersBaselineSynced(
  prisma: any,
  today: Date,
): Promise<void> {
  if (!prisma || prisma._policyBaselineSynced === true) {
    return;
  }

  try {
    if (!prisma.policyOwnerAssignment?.findMany || !prisma.policyOwnerAssignment?.create) {
      return;
    }

    if (prisma.auditLog?.findFirst) {
      const marker = await prisma.auditLog.findFirst({
        where: { actionCode: 'POLICY_OWNERS_BASELINE_SYNCED_V1' },
        select: { id: true },
      });
      if (marker) {
        prisma._policyBaselineSynced = true;
        return;
      }
    }

    let roleAssignments: Array<{ userId: string; role: CanonicalRole }> = [];
    if (prisma.organizationalAssignment?.findMany) {
      const raw = await prisma.organizationalAssignment.findMany({
        where: {
          role: {
            in: [
              CanonicalRole.CEO_MANAGEMENT,
              CanonicalRole.SYSTEM_ADMIN,
              CanonicalRole.HRGA,
            ],
          },
          effectiveDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }],
          user: { status: UserStatus.ACTIVE },
        },
        select: { userId: true, role: true },
      });
      if (Array.isArray(raw)) {
        roleAssignments = raw.filter(
          (r: any) => r && typeof r.userId === 'string',
        );
      }
    }

    let fallbackUsers: Array<{ id: string; email: string }> = [];
    if (prisma.user?.findMany) {
      const rawUsers = await prisma.user.findMany({
        where: {
          status: UserStatus.ACTIVE,
          email: {
            in: [
              'direktur@dutamedia.com',
              'admin@dutamedia.com',
              'hrga@dutamedia.com',
            ],
          },
        },
        select: { id: true, email: true },
      });
      if (Array.isArray(rawUsers)) {
        fallbackUsers = rawUsers.filter(
          (u: any) =>
            u && typeof u.id === 'string' && typeof u.email === 'string',
        );
      }
    }

    // Urutkan agar Direktur, Admin, lalu HRGA konsisten
    const orderedIds: string[] = [];
    const addUnique = (id?: string) => {
      if (id && !orderedIds.includes(id)) orderedIds.push(id);
    };

    const dirRole = roleAssignments.find(
      (r) => r.role === CanonicalRole.CEO_MANAGEMENT,
    );
    const dirEmail = fallbackUsers.find(
      (u) => u.email === 'direktur@dutamedia.com',
    );
    addUnique(dirRole?.userId || dirEmail?.id);

    const admRole = roleAssignments.find(
      (r) => r.role === CanonicalRole.SYSTEM_ADMIN,
    );
    const admEmail = fallbackUsers.find(
      (u) => u.email === 'admin@dutamedia.com',
    );
    addUnique(admRole?.userId || admEmail?.id);

    const hrgaRole = roleAssignments.find((r) => r.role === CanonicalRole.HRGA);
    const hrgaEmail = fallbackUsers.find(
      (u) => u.email === 'hrga@dutamedia.com',
    );
    addUnique(hrgaRole?.userId || hrgaEmail?.id);

    for (const r of roleAssignments) addUnique(r.userId);
    for (const u of fallbackUsers) addUnique(u.id);

    if (orderedIds.length === 0) {
      return;
    }

    const creatorId = orderedIds[0];

    const existingActive =
      (await prisma.policyOwnerAssignment.findMany({
        where: {
          effectiveDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }],
        },
        select: { userId: true, policyCategory: true },
      })) || [];

    let hasPriorOwnerMutation = false;
    if (prisma.auditLog?.findFirst) {
      const priorMutation = await prisma.auditLog.findFirst({
        where: {
          actionCode: {
            in: [
              'POLICY_OWNER_ASSIGNED',
              'POLICY_OWNER_UPDATED',
              'POLICY_OWNER_REVOKED',
            ],
          },
        },
        select: { id: true },
      });
      hasPriorOwnerMutation = Boolean(priorMutation);
    }

    const allCategories: PolicyCategory[] = [
      PolicyCategory.CHECKIN_TIMING,
      PolicyCategory.BLOCKER_SLA,
      PolicyCategory.COMPLIANCE_THRESHOLD,
      PolicyCategory.CORRECTION_WINDOW,
      PolicyCategory.NOTIFICATION_REMINDER_THRESHOLD,
    ];

    for (const category of allCategories) {
      const categoryHasAnyActive = existingActive.some(
        (e: any) => e.policyCategory === category,
      );
      if (hasPriorOwnerMutation && categoryHasAnyActive) {
        continue;
      }
      for (const userId of orderedIds) {
        const alreadyExists = existingActive.some(
          (e: any) => e.userId === userId && e.policyCategory === category,
        );
        if (!alreadyExists) {
          await prisma.policyOwnerAssignment.create({
            data: {
              userId,
              policyCategory: category,
              effectiveDate: today,
              createdByUserId: creatorId,
            },
          });
        }
      }
    }

    if (prisma.auditLog?.create) {
      await prisma.auditLog.create({
        data: {
          actorUserId: creatorId,
          actionCode: 'POLICY_OWNERS_BASELINE_SYNCED_V1',
          relatedEntityType: 'policy_owner_assignments',
          relatedEntityId: creatorId,
          valueAfter: {
            syncedAt: today.toISOString(),
            initialOwnerIds: orderedIds,
            categories: allCategories,
          },
        },
      });
    }

    prisma._policyBaselineSynced = true;
  } catch (err) {
    console.warn('Gagal melakukan ensurePolicyOwnersBaselineSynced:', err);
  }
}

