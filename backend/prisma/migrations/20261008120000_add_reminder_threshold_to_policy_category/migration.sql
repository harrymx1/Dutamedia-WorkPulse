-- =============================================================================
-- Migration: 20261008120000_add_reminder_threshold_to_policy_category
-- WorkPulse — S3-T3-FIND-02 Remediation
-- Invariant: PolicyCategory enum includes ReminderThreshold per ADR-004, SAD §8.10
-- =============================================================================

-- AlterEnum
ALTER TYPE "PolicyCategory" ADD VALUE 'ReminderThreshold';
