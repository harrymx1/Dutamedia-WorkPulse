-- Daily Accountability & Blocker Domain (WP-EP05 / SAD v2.1.0 Sec 3.3-3.6)
-- =============================================================================

-- 1. ENUMS
CREATE TYPE "timing_status_enum" AS ENUM ('ON_TIME', 'LATE', 'NO_SUBMISSION', 'EXEMPTED', 'APPROVED_LEAVE');
CREATE TYPE "daily_risk_status_enum" AS ENUM ('GREEN', 'AMBER', 'RED', 'NOT_APPLICABLE_NO_COMMITMENT');
CREATE TYPE "commitment_risk_enum" AS ENUM ('GREEN', 'AMBER', 'RED');
CREATE TYPE "commitment_outcome_enum" AS ENUM ('COMPLETED', 'PARTIALLY_COMPLETED', 'NOT_COMPLETED', 'CANCELLED');
CREATE TYPE "continuation_status_enum" AS ENUM ('CONTINUE', 'DO_NOT_CONTINUE');
CREATE TYPE "additional_work_reason_enum" AS ENUM ('NEWLY_ASSIGNED', 'MISSED_IN_PLANNING', 'PRIORITY_CHANGE', 'OPERATIONAL_INCIDENT', 'OTHER');
CREATE TYPE "blocker_type_enum" AS ENUM ('TECHNICAL', 'REQUIREMENT', 'CLIENT', 'VENDOR', 'RESOURCE', 'APPROVAL', 'INFRA', 'FINANCE', 'LEGAL', 'OTHER');
CREATE TYPE "blocker_severity_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "blocker_impact_enum" AS ENUM ('TASK', 'MILESTONE', 'PROJECT', 'PRODUCTION', 'CLIENT', 'FINANCIAL', 'COMPLIANCE');
CREATE TYPE "authority_context_enum" AS ENUM ('ORGANIZATIONAL_AUTHORITY', 'PROJECT_AUTHORITY');
CREATE TYPE "blocker_status_enum" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ACCEPTED_RISK');
CREATE TYPE "leave_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- 2. DAILY ACCOUNTABILITY RECORDS
CREATE TABLE "daily_accountability_records" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "work_date" DATE NOT NULL,
    "org_context_snapshot" JSONB NOT NULL,
    "policy_snapshot" JSONB NOT NULL,
    "morning_submitted_at" TIMESTAMPTZ NULL,
    "eod_submitted_at" TIMESTAMPTZ NULL,
    "morning_timing" "timing_status_enum" NOT NULL DEFAULT 'NO_SUBMISSION',
    "eod_timing" "timing_status_enum" NOT NULL DEFAULT 'NO_SUBMISSION',
    "initial_daily_status" "daily_risk_status_enum" NOT NULL DEFAULT 'NOT_APPLICABLE_NO_COMMITMENT',
    "final_daily_status" "daily_risk_status_enum" NULL,
    "zero_commitment_reason" TEXT NULL,
    "morning_cutoff_locked_at" TIMESTAMPTZ NULL,
    "eod_cutoff_locked_at" TIMESTAMPTZ NULL,
    "override_reason" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_user_work_date" UNIQUE ("user_id", "work_date"),
    CONSTRAINT "chk_zero_commitment_reason" CHECK (
        ("initial_daily_status" = 'NOT_APPLICABLE_NO_COMMITMENT' AND "zero_commitment_reason" IS NOT NULL) OR
        ("initial_daily_status" != 'NOT_APPLICABLE_NO_COMMITMENT')
    )
);

CREATE INDEX "idx_dar_user_date" ON "daily_accountability_records"("user_id", "work_date");

-- 3. COMMITMENTS
CREATE TABLE "commitments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "daily_record_id" UUID NOT NULL REFERENCES "daily_accountability_records"("id") ON DELETE CASCADE,
    "sequence_no" SMALLINT NOT NULL,
    "task_text" TEXT NOT NULL,
    "reference_link" VARCHAR(500) NULL,
    "initial_risk" "commitment_risk_enum" NOT NULL,
    "known_blocker_note" TEXT NULL,
    "support_needed" TEXT NULL,
    "is_carry_over" BOOLEAN NOT NULL DEFAULT FALSE,
    "carry_over_days_count" INT NOT NULL DEFAULT 0,
    "origin_commitment_id" UUID NULL REFERENCES "commitments"("id") ON DELETE RESTRICT,
    "outcome" "commitment_outcome_enum" NULL,
    "outcome_reason" TEXT NULL,
    "continuation" "continuation_status_enum" NULL,
    "continuation_reason" TEXT NULL,
    "is_morning_locked" BOOLEAN NOT NULL DEFAULT FALSE,
    "is_eod_locked" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_commitment_sequence" CHECK ("sequence_no" BETWEEN 1 AND 3),
    CONSTRAINT "uq_record_sequence" UNIQUE ("daily_record_id", "sequence_no"),
    CONSTRAINT "chk_blocker_note_required" CHECK (
        ("initial_risk" IN ('AMBER', 'RED') AND "known_blocker_note" IS NOT NULL) OR
        ("initial_risk" = 'GREEN')
    ),
    CONSTRAINT "chk_carry_origin_consistency" CHECK (
        ("origin_commitment_id" IS NULL AND "is_carry_over" = FALSE AND "carry_over_days_count" = 0) OR
        ("origin_commitment_id" IS NOT NULL AND "is_carry_over" = TRUE AND "carry_over_days_count" >= 1)
    )
);

CREATE INDEX "idx_commitments_origin" ON "commitments"("origin_commitment_id");

-- 4. ADDITIONAL WORKS
CREATE TABLE "additional_works" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "daily_record_id" UUID NOT NULL REFERENCES "daily_accountability_records"("id") ON DELETE CASCADE,
    "task_text" TEXT NOT NULL,
    "reason" "additional_work_reason_enum" NOT NULL,
    "assigned_by_user_id" UUID NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "outcome" "commitment_outcome_enum" NULL,
    "outcome_reason" TEXT NULL,
    "continuation" "continuation_status_enum" NULL,
    "continuation_reason" TEXT NULL,
    "is_eod_locked" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_assigned_by_required" CHECK (
        ("reason" = 'NEWLY_ASSIGNED' AND "assigned_by_user_id" IS NOT NULL) OR
        ("reason" != 'NEWLY_ASSIGNED')
    )
);

-- 5. BLOCKER TICKETS
CREATE TABLE "blocker_tickets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "raised_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "linked_commitment_id" UUID NULL REFERENCES "commitments"("id") ON DELETE SET NULL,
    "type" "blocker_type_enum" NOT NULL,
    "severity" "blocker_severity_enum" NOT NULL,
    "impact" "blocker_impact_enum" NOT NULL,
    "description" TEXT NOT NULL,
    "owner_needed_type" "authority_context_enum" NOT NULL,
    "assigned_owner_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "project_code_reference" VARCHAR(50) NULL,
    "status" "blocker_status_enum" NOT NULL DEFAULT 'OPEN',
    "raised_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_resolution_at" TIMESTAMPTZ NULL,
    "acknowledged_at" TIMESTAMPTZ NULL,
    "resolved_at" TIMESTAMPTZ NULL,
    "closed_at" TIMESTAMPTZ NULL,
    "resolution_note" TEXT NULL,
    "risk_acceptance_justification" TEXT NULL,
    "risk_mitigation_plan" TEXT NULL,
    "auto_escalation_level" SMALLINT NOT NULL DEFAULT 0,
    "last_escalated_at" TIMESTAMPTZ NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_project_required_for_project_authority" CHECK (
        "owner_needed_type" <> 'PROJECT_AUTHORITY' OR "project_code_reference" IS NOT NULL
    )
);

CREATE INDEX "idx_blockers_status_severity" ON "blocker_tickets"("status", "severity", "target_resolution_at");
CREATE INDEX "idx_blockers_assigned_owner" ON "blocker_tickets"("assigned_owner_id", "status");

-- 6. SUPPORT CONTRIBUTIONS
CREATE TABLE "support_contributions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "blocker_id" UUID NOT NULL REFERENCES "blocker_tickets"("id") ON DELETE CASCADE,
    "supporter_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "action_taken" TEXT NOT NULL,
    "result_note" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. COMPANY HOLIDAYS
CREATE TABLE "company_holidays" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "holiday_date" DATE NOT NULL UNIQUE,
    "holiday_name" VARCHAR(150) NOT NULL,
    "created_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_holidays_date" ON "company_holidays"("holiday_date");

-- 8. LEAVE REQUESTS
CREATE TABLE "leave_requests" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "leave_type" VARCHAR(50) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "leave_status_enum" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_user_id" UUID NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "review_note" TEXT NULL,
    "reviewed_at" TIMESTAMPTZ NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_leave_date_range" CHECK ("end_date" >= "start_date")
);

CREATE INDEX "idx_leave_user_range" ON "leave_requests"("user_id", "start_date", "end_date", "status");

-- 9. ANTI-BACKDATING TRIGGERS FOR DAILY RECORDS & LEAVE
CREATE OR REPLACE FUNCTION enforce_no_backdating_work_date() RETURNS trigger AS $$
DECLARE
  org_tz text;
  current_org_date date;
BEGIN
  org_tz := current_setting('app.org_timezone', true);
  IF org_tz IS NULL OR org_tz = '' THEN
    org_tz := 'Asia/Jakarta';
  END IF;

  current_org_date := (now() AT TIME ZONE org_tz)::date;

  IF NEW.work_date < current_org_date THEN
    RAISE EXCEPTION 'BACKDATING_FORBIDDEN' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_backdating_daily_records BEFORE INSERT ON "daily_accountability_records" FOR EACH ROW EXECUTE FUNCTION enforce_no_backdating_work_date();

CREATE OR REPLACE FUNCTION enforce_no_backdating_leave() RETURNS trigger AS $$
DECLARE
  org_tz text;
  current_org_date date;
BEGIN
  org_tz := current_setting('app.org_timezone', true);
  IF org_tz IS NULL OR org_tz = '' THEN
    org_tz := 'Asia/Jakarta';
  END IF;

  current_org_date := (now() AT TIME ZONE org_tz)::date;

  IF NEW.start_date < current_org_date THEN
    RAISE EXCEPTION 'BACKDATING_FORBIDDEN' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_backdating_leave_requests BEFORE INSERT ON "leave_requests" FOR EACH ROW EXECUTE FUNCTION enforce_no_backdating_leave();
