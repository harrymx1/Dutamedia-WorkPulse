-- Paket #1 (Pasca-UAT): Status Karyawan (PERMANENT / CONTRACT / INTERN) pada OrganizationalAssignment

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status_enum') THEN
    CREATE TYPE "employment_status_enum" AS ENUM ('PERMANENT', 'CONTRACT', 'INTERN');
  END IF;
END
$$;

ALTER TABLE "organizational_assignments"
ADD COLUMN IF NOT EXISTS "employment_status" "employment_status_enum" NOT NULL DEFAULT 'PERMANENT';

CREATE INDEX IF NOT EXISTS "idx_org_employment_status" ON "organizational_assignments"("employment_status");
