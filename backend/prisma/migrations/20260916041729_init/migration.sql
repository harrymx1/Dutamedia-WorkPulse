-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Employee', 'Supervisor_TL', 'Head', 'PM', 'HRGA', 'CEO_Management', 'SystemAdmin');

-- CreateEnum
CREATE TYPE "DailyStatus" AS ENUM ('GREEN', 'AMBER', 'RED');

-- CreateEnum
CREATE TYPE "SubmissionTiming" AS ENUM ('OnTime', 'Late', 'NoSubmission');

-- CreateEnum
CREATE TYPE "CommitmentOutcome" AS ENUM ('Completed', 'PartiallyCompleted', 'NotCompleted', 'Cancelled');

-- CreateEnum
CREATE TYPE "Continuation" AS ENUM ('Continue', 'DoNotContinue');

-- CreateEnum
CREATE TYPE "AdditionalWorkReason" AS ENUM ('NewlyAssigned', 'MissedInPlanning', 'PriorityChange', 'OperationalIncident', 'Other');

-- CreateEnum
CREATE TYPE "BlockerSeverity" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "OwnerNeededType" AS ENUM ('OrganizationalAuthority', 'ProjectAuthority');

-- CreateEnum
CREATE TYPE "BlockerStatus" AS ENUM ('Open', 'Acknowledged', 'InProgress', 'Resolved', 'Closed', 'AcceptedRisk');

-- CreateEnum
CREATE TYPE "CorrectionClassification" AS ENUM ('Minor', 'Material');

-- CreateEnum
CREATE TYPE "CorrectionStatus" AS ENUM ('Applied', 'Pending', 'Rejected');

-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('Leave', 'Holiday', 'Exemption');

-- CreateEnum
CREATE TYPE "ExceptionStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "ManagerNoteType" AS ENUM ('Coaching', 'Recognition', 'Corrective');

-- CreateEnum
CREATE TYPE "ManagerNoteVisibility" AS ENUM ('PrivateToManagement', 'VisibleToEmployee');

-- CreateEnum
CREATE TYPE "ComplianceEventType" AS ENUM ('NoSubmission', 'PatternFlag', 'Coaching', 'RecordedWarning', 'EscalatedFormalProcess');

-- CreateEnum
CREATE TYPE "PolicyCategory" AS ENUM ('Cutoff', 'GracePeriod', 'WorkdayCalendar', 'EscalationThreshold', 'CoachingFollowUpPeriod', 'RetentionPeriod', 'ExemptionRule', 'ObjectionWindowDuration', 'MinorMaterialThreshold', 'ParticipationRule');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('Email', 'BrowserPush', 'WebNotificationCenter');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('Sent', 'Read', 'Failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'Active',
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizational_assignments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "function" VARCHAR(100) NOT NULL,
    "directManagerId" UUID,
    "effectiveDate" DATE NOT NULL,
    "endDate" DATE,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizational_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_authority_mappings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scopeReference" VARCHAR(255) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "endDate" DATE,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_authority_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temporary_reviewer_assignments" (
    "id" UUID NOT NULL,
    "reviewerUserId" UUID NOT NULL,
    "scope" VARCHAR(255) NOT NULL,
    "reason" VARCHAR(255),
    "effectiveDate" DATE NOT NULL,
    "expiryDate" DATE NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temporary_reviewer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "issuedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "revokedAt" TIMESTAMP(6),
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_accountability_records" (
    "id" UUID NOT NULL,
    "employeeUserId" UUID NOT NULL,
    "workDate" DATE NOT NULL,
    "orgContextSnapshot" JSONB NOT NULL,
    "policySnapshot" JSONB NOT NULL,
    "morningSubmittedAt" TIMESTAMP(6),
    "eodSubmittedAt" TIMESTAMP(6),
    "morningTiming" "SubmissionTiming",
    "eodTiming" "SubmissionTiming",
    "cutoffLockedAt" TIMESTAMP(6),
    "initialStatus" "DailyStatus",
    "finalStatus" "DailyStatus",
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "daily_accountability_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commitments" (
    "id" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "sequenceNo" SMALLINT NOT NULL,
    "text" TEXT NOT NULL,
    "referenceLink" VARCHAR(500),
    "initialRisk" "DailyStatus" NOT NULL,
    "knownBlockerNote" TEXT,
    "supportNeeded" TEXT,
    "outcome" "CommitmentOutcome",
    "outcomeReason" TEXT,
    "continuation" "Continuation",
    "continuationReason" TEXT,
    "isMorningLocked" BOOLEAN NOT NULL DEFAULT false,
    "isEodLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "commitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_works" (
    "id" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "reason" "AdditionalWorkReason" NOT NULL,
    "assignedByUserId" UUID,
    "outcome" "CommitmentOutcome",
    "outcomeReason" TEXT,
    "continuation" "Continuation",
    "continuationReason" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "additional_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockers" (
    "id" UUID NOT NULL,
    "raisedByUserId" UUID NOT NULL,
    "linkedCommitmentId" UUID,
    "type" VARCHAR(100) NOT NULL,
    "severity" "BlockerSeverity" NOT NULL,
    "impact" TEXT NOT NULL,
    "ownerNeededType" "OwnerNeededType" NOT NULL,
    "ownerNeededUserId" UUID NOT NULL,
    "relatedScopeReference" VARCHAR(255),
    "status" "BlockerStatus" NOT NULL DEFAULT 'Open',
    "raisedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(6),
    "resolvedAt" TIMESTAMP(6),
    "closedAt" TIMESTAMP(6),
    "expectedResolution" DATE,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "blockers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_contributions" (
    "id" UUID NOT NULL,
    "blockerId" UUID NOT NULL,
    "supporterUserId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resultNote" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correction_requests" (
    "id" UUID NOT NULL,
    "targetCommitmentId" UUID NOT NULL,
    "requestedByUserId" UUID NOT NULL,
    "requestedChange" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "classification" "CorrectionClassification" NOT NULL,
    "policySnapshot" JSONB NOT NULL,
    "status" "CorrectionStatus" NOT NULL,
    "objectionWindowStart" TIMESTAMP(6),
    "objectionWindowEnd" TIMESTAMP(6),
    "reviewedByUserId" UUID,
    "objectionReason" TEXT,
    "appliedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "correction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exceptions" (
    "id" UUID NOT NULL,
    "type" "ExceptionType" NOT NULL,
    "employeeUserId" UUID,
    "dateStart" DATE NOT NULL,
    "dateEnd" DATE NOT NULL,
    "status" "ExceptionStatus" NOT NULL DEFAULT 'Approved',
    "reason" TEXT,
    "approvedByUserId" UUID,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_notes" (
    "id" UUID NOT NULL,
    "aboutUserId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "type" "ManagerNoteType" NOT NULL,
    "note" TEXT NOT NULL,
    "relatedEntityType" VARCHAR(100),
    "relatedEntityId" UUID,
    "visibility" "ManagerNoteVisibility" NOT NULL DEFAULT 'PrivateToManagement',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manager_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_events" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "eventType" "ComplianceEventType" NOT NULL,
    "eventDate" DATE NOT NULL,
    "relatedDailyRecordId" UUID,
    "policySnapshot" JSONB,
    "followUpStatus" VARCHAR(100),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" UUID NOT NULL,
    "category" "PolicyCategory" NOT NULL,
    "value" JSONB NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "endDate" DATE,
    "status" "PolicyStatus" NOT NULL DEFAULT 'Active',
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_owner_assignments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "policyCategory" "PolicyCategory" NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "endDate" DATE,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_owner_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "recipientUserId" UUID NOT NULL,
    "triggerType" VARCHAR(100) NOT NULL,
    "relatedEntityType" VARCHAR(100),
    "relatedEntityId" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'Sent',
    "sentAt" TIMESTAMP(6),
    "readAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "relatedEntityType" VARCHAR(100) NOT NULL,
    "relatedEntityId" UUID NOT NULL,
    "valueBefore" JSONB,
    "valueAfter" JSONB,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "organizational_assignments_userId_effectiveDate_endDate_idx" ON "organizational_assignments"("userId", "effectiveDate", "endDate");

-- CreateIndex
CREATE INDEX "organizational_assignments_directManagerId_effectiveDate_en_idx" ON "organizational_assignments"("directManagerId", "effectiveDate", "endDate");

-- CreateIndex
CREATE INDEX "project_authority_mappings_userId_scopeReference_effectiveD_idx" ON "project_authority_mappings"("userId", "scopeReference", "effectiveDate", "endDate");

-- CreateIndex
CREATE INDEX "project_authority_mappings_scopeReference_effectiveDate_end_idx" ON "project_authority_mappings"("scopeReference", "effectiveDate", "endDate");

-- CreateIndex
CREATE INDEX "temporary_reviewer_assignments_reviewerUserId_scope_effecti_idx" ON "temporary_reviewer_assignments"("reviewerUserId", "scope", "effectiveDate", "expiryDate");

-- CreateIndex
CREATE INDEX "sessions_userId_expiresAt_revokedAt_idx" ON "sessions"("userId", "expiresAt", "revokedAt");

-- CreateIndex
CREATE INDEX "daily_accountability_records_employeeUserId_workDate_idx" ON "daily_accountability_records"("employeeUserId", "workDate");

-- CreateIndex
CREATE INDEX "daily_accountability_records_workDate_initialStatus_finalSt_idx" ON "daily_accountability_records"("workDate", "initialStatus", "finalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "daily_accountability_records_employeeUserId_workDate_key" ON "daily_accountability_records"("employeeUserId", "workDate");

-- CreateIndex
CREATE INDEX "commitments_dailyRecordId_sequenceNo_idx" ON "commitments"("dailyRecordId", "sequenceNo");

-- CreateIndex
CREATE UNIQUE INDEX "commitments_dailyRecordId_sequenceNo_key" ON "commitments"("dailyRecordId", "sequenceNo");

-- CreateIndex
CREATE INDEX "additional_works_dailyRecordId_idx" ON "additional_works"("dailyRecordId");

-- CreateIndex
CREATE INDEX "blockers_status_severity_raisedAt_idx" ON "blockers"("status", "severity", "raisedAt");

-- CreateIndex
CREATE INDEX "blockers_ownerNeededUserId_status_idx" ON "blockers"("ownerNeededUserId", "status");

-- CreateIndex
CREATE INDEX "blockers_raisedByUserId_status_idx" ON "blockers"("raisedByUserId", "status");

-- CreateIndex
CREATE INDEX "support_contributions_blockerId_idx" ON "support_contributions"("blockerId");

-- CreateIndex
CREATE INDEX "support_contributions_supporterUserId_idx" ON "support_contributions"("supporterUserId");

-- CreateIndex
CREATE INDEX "correction_requests_targetCommitmentId_status_idx" ON "correction_requests"("targetCommitmentId", "status");

-- CreateIndex
CREATE INDEX "correction_requests_status_objectionWindowEnd_idx" ON "correction_requests"("status", "objectionWindowEnd");

-- CreateIndex
CREATE INDEX "exceptions_type_status_dateStart_dateEnd_idx" ON "exceptions"("type", "status", "dateStart", "dateEnd");

-- CreateIndex
CREATE INDEX "exceptions_employeeUserId_dateStart_dateEnd_idx" ON "exceptions"("employeeUserId", "dateStart", "dateEnd");

-- CreateIndex
CREATE INDEX "manager_notes_aboutUserId_visibility_idx" ON "manager_notes"("aboutUserId", "visibility");

-- CreateIndex
CREATE INDEX "manager_notes_relatedEntityType_relatedEntityId_idx" ON "manager_notes"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "compliance_events_userId_eventType_eventDate_idx" ON "compliance_events"("userId", "eventType", "eventDate");

-- CreateIndex
CREATE INDEX "policies_category_effectiveDate_endDate_status_idx" ON "policies"("category", "effectiveDate", "endDate", "status");

-- CreateIndex
CREATE INDEX "policy_owner_assignments_userId_policyCategory_effectiveDat_idx" ON "policy_owner_assignments"("userId", "policyCategory", "effectiveDate", "endDate");

-- CreateIndex
CREATE INDEX "notifications_recipientUserId_status_createdAt_idx" ON "notifications"("recipientUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_triggerType_relatedEntityId_channel_idx" ON "notifications"("triggerType", "relatedEntityId", "channel");

-- CreateIndex
CREATE INDEX "audit_logs_relatedEntityType_relatedEntityId_idx" ON "audit_logs"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_timestamp_idx" ON "audit_logs"("actorUserId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_action_timestamp_idx" ON "audit_logs"("action", "timestamp");

-- AddForeignKey
ALTER TABLE "organizational_assignments" ADD CONSTRAINT "organizational_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizational_assignments" ADD CONSTRAINT "organizational_assignments_directManagerId_fkey" FOREIGN KEY ("directManagerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizational_assignments" ADD CONSTRAINT "organizational_assignments_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_authority_mappings" ADD CONSTRAINT "project_authority_mappings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_authority_mappings" ADD CONSTRAINT "project_authority_mappings_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temporary_reviewer_assignments" ADD CONSTRAINT "temporary_reviewer_assignments_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temporary_reviewer_assignments" ADD CONSTRAINT "temporary_reviewer_assignments_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_accountability_records" ADD CONSTRAINT "daily_accountability_records_employeeUserId_fkey" FOREIGN KEY ("employeeUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "daily_accountability_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_works" ADD CONSTRAINT "additional_works_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "daily_accountability_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_works" ADD CONSTRAINT "additional_works_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockers" ADD CONSTRAINT "blockers_raisedByUserId_fkey" FOREIGN KEY ("raisedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockers" ADD CONSTRAINT "blockers_linkedCommitmentId_fkey" FOREIGN KEY ("linkedCommitmentId") REFERENCES "commitments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockers" ADD CONSTRAINT "blockers_ownerNeededUserId_fkey" FOREIGN KEY ("ownerNeededUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_contributions" ADD CONSTRAINT "support_contributions_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "blockers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_contributions" ADD CONSTRAINT "support_contributions_supporterUserId_fkey" FOREIGN KEY ("supporterUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_requests" ADD CONSTRAINT "correction_requests_targetCommitmentId_fkey" FOREIGN KEY ("targetCommitmentId") REFERENCES "commitments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_requests" ADD CONSTRAINT "correction_requests_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_requests" ADD CONSTRAINT "correction_requests_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_employeeUserId_fkey" FOREIGN KEY ("employeeUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_notes" ADD CONSTRAINT "manager_notes_aboutUserId_fkey" FOREIGN KEY ("aboutUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_notes" ADD CONSTRAINT "manager_notes_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_events" ADD CONSTRAINT "compliance_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_events" ADD CONSTRAINT "compliance_events_relatedDailyRecordId_fkey" FOREIGN KEY ("relatedDailyRecordId") REFERENCES "daily_accountability_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policies" ADD CONSTRAINT "policies_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_owner_assignments" ADD CONSTRAINT "policy_owner_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
