/**
 * Mengambil daftar kategori kendala yang secara resmi dipegang oleh pengguna
 * pada tanggal aktif tertentu (DEC-017).
 */
export async function resolveOwnedBlockerCategories(
  prisma: any,
  ownerUserId: string,
  today: Date,
): Promise<string[]> {
  if (!prisma?.blockerCategoryOwner?.findMany) {
    return [];
  }
  const records = await prisma.blockerCategoryOwner.findMany({
    where: {
      ownerUserId,
      effectiveDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
    select: { blockerType: true },
  });
  return Array.from(new Set((records || []).map((r: any) => String(r.blockerType))));
}
