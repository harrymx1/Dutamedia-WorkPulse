-- =============================================================================
-- Baseline Schema & Anti-Backdating Triggers (WP-EP01-TK007 / SAD v2.1.0)
-- =============================================================================

-- 1. ENUMS
CREATE TYPE "user_status_enum" AS ENUM ('INVITED', 'ACTIVE', 'INACTIVE');
CREATE TYPE "invitation_status_enum" AS ENUM ('PENDING', 'USED', 'REVOKED', 'EXPIRED');
CREATE TYPE "canonical_role_enum" AS ENUM (
    'EMPLOYEE',
    'SUPERVISOR',
    'HEAD',
    'PROJECT_MANAGER',
    'HRGA',
    'CEO_MANAGEMENT',
    'SYSTEM_ADMIN'
);
CREATE TYPE "canonical_function_enum" AS ENUM (
    'Engineering',
    'Quality',
    'Operations & Infrastructure',
    'R&D',
    'Delivery',
    'Business Development',
    'Sales Enablement & Presales',
    'Finance',
    'HRGA',
    'Management'
);
CREATE TYPE "policy_category_enum" AS ENUM (
    'CHECKIN_TIMING',
    'BLOCKER_SLA',
    'COMPLIANCE_THRESHOLD',
    'CORRECTION_WINDOW',
    'NOTIFICATION_REMINDER_THRESHOLD'
);
CREATE TYPE "notification_channel_enum" AS ENUM ('IN_APP_CENTER', 'BROWSER_PUSH', 'EMAIL');
CREATE TYPE "notification_status_enum" AS ENUM ('QUEUED', 'SENT', 'READ', 'FAILED');

-- 2. TABLES

-- Users (SAD II.3.1)
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NULL,
    "status" "user_status_enum" NOT NULL DEFAULT 'INVITED',
    "must_reset_password" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Invitations (SAD II.3.1, DEC-005)
CREATE TABLE "user_invitations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "token_hash" VARCHAR(255) NOT NULL UNIQUE,
    "status" "invitation_status_enum" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ NULL,
    "revoked_at" TIMESTAMPTZ NULL,
    "revocation_reason" TEXT NULL,
    "created_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (SAD II.3.1)
CREATE TABLE "sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "session_token_hash" VARCHAR(255) NOT NULL UNIQUE,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ NULL,
    "ip_address" VARCHAR(45) NULL,
    "user_agent" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Organizational Assignments (SAD II.3.2, DEC-008, DEC-009)
CREATE TABLE "organizational_assignments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "job_title" VARCHAR(150) NOT NULL,
    "role" "canonical_role_enum" NOT NULL,
    "function" "canonical_function_enum" NOT NULL,
    "direct_manager_id" UUID NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "effective_date" DATE NOT NULL,
    "end_date" DATE NULL,
    "assignment_reason" TEXT NOT NULL,
    "created_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_org_date_range" CHECK ("end_date" IS NULL OR "end_date" >= "effective_date"),
    CONSTRAINT "chk_no_self_reporting" CHECK ("user_id" != "direct_manager_id")
);

-- Project Authority Mappings (SAD II.3.2, DEC-008)
CREATE TABLE "project_authority_mappings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_code" VARCHAR(50) NOT NULL,
    "project_name" VARCHAR(150) NOT NULL,
    "project_manager_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "escalation_reviewer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "involved_function" "canonical_function_enum" NOT NULL,
    "effective_date" DATE NOT NULL,
    "end_date" DATE NULL,
    "assignment_reason" TEXT NOT NULL,
    "created_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_pa_date_range" CHECK ("end_date" IS NULL OR "end_date" >= "effective_date")
);

-- Temporary Reviewer Assignments (SAD II.3.2, DEC-008)
CREATE TABLE "temporary_reviewer_assignments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "delegate_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "target_function" "canonical_function_enum" NOT NULL,
    "delegation_reason" TEXT NOT NULL,
    "effective_date" DATE NOT NULL,
    "expiry_date" DATE NOT NULL,
    "created_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_temp_date_range" CHECK ("expiry_date" >= "effective_date")
);

-- Policies (SAD II.3.6, DEC-011, SAD B.1)
CREATE TABLE "policies" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category" "policy_category_enum" NOT NULL,
    "configuration_values" JSONB NOT NULL,
    "is_illustrative" BOOLEAN NOT NULL DEFAULT FALSE,
    "effective_date" DATE NOT NULL,
    "end_date" DATE NULL,
    "created_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_policy_date_range" CHECK ("end_date" IS NULL OR "end_date" >= "effective_date")
);

-- Policy Owner Assignments (SAD II.3.6)
CREATE TABLE "policy_owner_assignments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "policy_category" "policy_category_enum" NOT NULL,
    "effective_date" DATE NOT NULL,
    "end_date" DATE NULL,
    "created_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notifications (SAD II.3.7)
CREATE TABLE "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recipient_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "trigger_type" VARCHAR(100) NOT NULL,
    "channel" "notification_channel_enum" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" VARCHAR(500) NULL,
    "related_entity_type" VARCHAR(64) NULL,
    "related_entity_id" UUID NULL,
    "status" "notification_status_enum" NOT NULL DEFAULT 'QUEUED',
    "sent_at" TIMESTAMPTZ NULL,
    "read_at" TIMESTAMPTZ NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs (SAD II.3.7)
CREATE TABLE "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "actor_user_id" UUID NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "action_code" VARCHAR(100) NOT NULL,
    "related_entity_type" VARCHAR(64) NOT NULL,
    "related_entity_id" UUID NOT NULL,
    "value_before" JSONB NULL,
    "value_after" JSONB NULL,
    "ip_address" VARCHAR(45) NULL,
    "user_agent" TEXT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. COMPOSITE INDEXES (SAD II.5)
CREATE INDEX "idx_org_active_lookup" ON "organizational_assignments"("user_id", "effective_date", "end_date");
CREATE INDEX "idx_pa_active_lookup" ON "project_authority_mappings"("project_code", "effective_date", "end_date");

-- 4. ANTI-BACKDATING TRIGGER FUNCTION (SAD II.4 & Lampiran B.5)
CREATE OR REPLACE FUNCTION enforce_no_backdating() RETURNS trigger AS $$
DECLARE
  org_tz text;
  current_org_date date;
BEGIN
  org_tz := current_setting('app.org_timezone', true);
  IF org_tz IS NULL OR org_tz = '' THEN
    org_tz := 'Asia/Jakarta';
  END IF;

  current_org_date := (now() AT TIME ZONE org_tz)::date;

  IF NEW.effective_date < current_org_date THEN
    RAISE EXCEPTION 'BACKDATING_FORBIDDEN' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- 5. ATTACH TRIGGERS (BEFORE INSERT only, never on UPDATE)
CREATE TRIGGER trg_no_backdating BEFORE INSERT ON "organizational_assignments" FOR EACH ROW EXECUTE FUNCTION enforce_no_backdating();
CREATE TRIGGER trg_no_backdating BEFORE INSERT ON "project_authority_mappings" FOR EACH ROW EXECUTE FUNCTION enforce_no_backdating();
CREATE TRIGGER trg_no_backdating BEFORE INSERT ON "temporary_reviewer_assignments" FOR EACH ROW EXECUTE FUNCTION enforce_no_backdating();
CREATE TRIGGER trg_no_backdating BEFORE INSERT ON "policies" FOR EACH ROW EXECUTE FUNCTION enforce_no_backdating();
CREATE TRIGGER trg_no_backdating BEFORE INSERT ON "policy_owner_assignments" FOR EACH ROW EXECUTE FUNCTION enforce_no_backdating();

