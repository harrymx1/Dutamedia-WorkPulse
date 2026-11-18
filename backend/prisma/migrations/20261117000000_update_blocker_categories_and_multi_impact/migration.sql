-- Tahap 2: Penyelarasan 16 Kategori Kendala (blocker_type_enum), 9 Dampak Kendala (blocker_impact_enum),
-- dan dukungan Multi-Dampak (1-3 dampak) pada tabel blocker_tickets.

-- 1. Tambahkan 6 nilai kategori kendala baru ke blocker_type_enum (Total: 16 Kategori)
ALTER TYPE "blocker_type_enum" ADD VALUE IF NOT EXISTS 'HOSTING_DOMAIN';
ALTER TYPE "blocker_type_enum" ADD VALUE IF NOT EXISTS 'ACCESS_SECURITY';
ALTER TYPE "blocker_type_enum" ADD VALUE IF NOT EXISTS 'NETWORK';
ALTER TYPE "blocker_type_enum" ADD VALUE IF NOT EXISTS 'WORK_DEVICE';
ALTER TYPE "blocker_type_enum" ADD VALUE IF NOT EXISTS 'OFFICE_FACILITY';
ALTER TYPE "blocker_type_enum" ADD VALUE IF NOT EXISTS 'CROSS_TEAM';

-- 2. Tambahkan 2 nilai dampak kendala baru ke blocker_impact_enum (Total: 9 Dampak)
ALTER TYPE "blocker_impact_enum" ADD VALUE IF NOT EXISTS 'TEAM';
ALTER TYPE "blocker_impact_enum" ADD VALUE IF NOT EXISTS 'COMPANY_OPS';

-- 3. Tambahkan kolom array impacts pada tabel blocker_tickets
ALTER TABLE "blocker_tickets"
ADD COLUMN IF NOT EXISTS "impacts" "blocker_impact_enum"[] NOT NULL DEFAULT '{}';

-- 4. Selaraskan seluruh data tiket yang sudah ada agar kolom impacts terisi dari nilai impact lama
UPDATE "blocker_tickets"
SET "impacts" = ARRAY["impact"]::"blocker_impact_enum"[]
WHERE cardinality("impacts") = 0 OR "impacts" IS NULL;
