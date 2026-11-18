-- Tahap 2B (DEC-017): Penanggung Jawab Kategori Resmi + divisi yang ditunggu pada tiket.

-- 1. Tabel Penanggung Jawab Kategori (mandat resmi per kategori kendala)
CREATE TABLE "blocker_category_owners" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "blocker_type" "blocker_type_enum" NOT NULL,
    "owner_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "effective_date" DATE NOT NULL,
    "end_date" DATE NULL,
    "assignment_reason" TEXT NOT NULL,
    "created_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_bco_date_range" CHECK ("end_date" IS NULL OR "end_date" >= "effective_date")
);

CREATE INDEX "idx_bco_active_lookup" ON "blocker_category_owners"("blocker_type", "effective_date", "end_date");
CREATE INDEX "idx_bco_owner" ON "blocker_category_owners"("owner_user_id");

-- Pengaman anti-tanggal-mundur (sama seperti tabel penugasan lain)
CREATE TRIGGER trg_no_backdating BEFORE INSERT ON "blocker_category_owners" FOR EACH ROW EXECUTE FUNCTION enforce_no_backdating();

-- 2. Divisi yang ditunggu (khusus kategori "Menunggu Tim / Rekan Lain")
ALTER TABLE "blocker_tickets"
ADD COLUMN IF NOT EXISTS "waiting_for_function" "canonical_function_enum" NULL;
