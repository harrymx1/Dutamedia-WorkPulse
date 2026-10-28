DROP TABLE IF EXISTS "correction_requests" CASCADE;
DROP TABLE IF EXISTS "bounded_exemptions" CASCADE;
DROP TYPE IF EXISTS "CorrectionScopeType" CASCADE;
DROP TYPE IF EXISTS "CorrectionClassification" CASCADE;
DROP TYPE IF EXISTS "CorrectionStatus" CASCADE;

-- CreateEnum
CREATE TYPE "CorrectionScopeType" AS ENUM ('MORNING_COMMITMENT', 'EOD_OUTCOME');

-- CreateEnum
CREATE TYPE "CorrectionClassification" AS ENUM ('MINOR', 'MATERIAL');

-- CreateEnum
CREATE TYPE "CorrectionStatus" AS ENUM ('PENDING', 'AUTO_APPLIED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "correction_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "target_commitment_id" UUID NOT NULL,
    "requested_by_user_id" UUID NOT NULL,
    "scope_type" "CorrectionScopeType" NOT NULL,
    "classification" "CorrectionClassification" NOT NULL,
    "reason" TEXT NOT NULL,
    "value_before" JSONB NOT NULL,
    "value_requested" JSONB NOT NULL,
    "policy_snapshot" JSONB NOT NULL,
    "status" "CorrectionStatus" NOT NULL DEFAULT 'PENDING',
    "objection_window_ends_at" TIMESTAMPTZ,
    "reviewed_by_user_id" UUID,
    "review_note" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "applied_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "correction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bounded_exemptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "exemption_category" VARCHAR(100) NOT NULL,
    "official_reference_number" VARCHAR(100),
    "reason" TEXT NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bounded_exemptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_exemption_date_range" CHECK ("end_date" >= "start_date")
);

-- CreateIndex
CREATE INDEX "idx_correction_commitment" ON "correction_requests"("target_commitment_id");
CREATE INDEX "idx_correction_user" ON "correction_requests"("requested_by_user_id");
CREATE INDEX "idx_correction_status" ON "correction_requests"("status");
CREATE INDEX "idx_bounded_exemptions_date" ON "bounded_exemptions"("user_id", "start_date", "end_date");

-- AddForeignKey
ALTER TABLE "correction_requests" ADD CONSTRAINT "correction_requests_target_commitment_id_fkey" FOREIGN KEY ("target_commitment_id") REFERENCES "commitments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "correction_requests" ADD CONSTRAINT "correction_requests_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "correction_requests" ADD CONSTRAINT "correction_requests_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bounded_exemptions" ADD CONSTRAINT "bounded_exemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bounded_exemptions" ADD CONSTRAINT "bounded_exemptions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
