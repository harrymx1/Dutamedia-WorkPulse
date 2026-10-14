-- =============================================================================
-- Migration: 20261007153000_add_unique_pending_correction_per_commitment
-- WorkPulse — S3-T1-P2B1-DEF-01 Remediation
-- Invariant: For each Commitment, at most ONE CorrectionRequest with status 'Pending'
-- Reference: SAD §9.6, PRD BR-16, ADR-003
-- =============================================================================

-- Safety Guard: Ensure no duplicate Pending records exist before applying index
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "correction_requests"
        WHERE "status" = 'Pending'
        GROUP BY "targetCommitmentId"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: Duplicate Pending CorrectionRequests found on targetCommitmentId. Canonicalization policy is UNDEFINED. Resolve duplicates before applying index.';
    END IF;
END $$;

-- Create partial unique index enforcing max 1 Pending CorrectionRequest per Commitment
CREATE UNIQUE INDEX "unique_pending_correction_per_commitment"
ON "correction_requests"("targetCommitmentId")
WHERE "status" = 'Pending';
