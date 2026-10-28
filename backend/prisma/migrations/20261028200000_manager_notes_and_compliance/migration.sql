-- Manager Coaching & Compliance Domain (WP-EP07 / SAD v2.1.0 Sec 3.7)
-- =============================================================================

CREATE TYPE "manager_note_type_enum" AS ENUM ('COACHING', 'RECOGNITION', 'CORRECTIVE');
CREATE TYPE "note_visibility_enum" AS ENUM ('CONFIDENTIAL_MANAGER_ONLY', 'SHARED_WITH_EMPLOYEE', 'HRGA_ESCALATION');
CREATE TYPE "compliance_event_stage_enum" AS ENUM ('NO_SUBMISSION', 'PATTERN_FLAG_3X', 'COACHING_LOGGED', 'RECORDED_WARNING', 'FORMAL_HR_ESCALATION');

CREATE TABLE "manager_notes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "subject_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "author_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "note_type" "manager_note_type_enum" NOT NULL,
    "visibility" "note_visibility_enum" NOT NULL,
    "content" TEXT NOT NULL,
    "related_entity_type" VARCHAR(64) NULL,
    "related_entity_id" UUID NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "compliance_events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "event_date" DATE NOT NULL,
    "stage" "compliance_event_stage_enum" NOT NULL,
    "related_daily_record_id" UUID NULL REFERENCES "daily_accountability_records"("id") ON DELETE SET NULL,
    "policy_snapshot" JSONB NOT NULL,
    "follow_up_status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "follow_up_manager_note_id" UUID NULL REFERENCES "manager_notes"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_compliance_user_date" ON "compliance_events"("user_id", "event_date", "stage");
