/**
 * Type definitions untuk Domain Manajemen & Tata Kelola (EPIC-20)
 * Sesuai SAD §13, §10, §9, §8 dan Prisma Schema
 */

import type { SubmissionTiming } from './daily-records.js';

export type DailyStatus = 'GREEN' | 'AMBER' | 'RED';
export type CommitmentOutcome = 'Completed' | 'PartiallyCompleted' | 'NotCompleted' | 'Cancelled';

// =============================================================================
// 1. REPORTING & EXCEPTION SUMMARY TYPES (SAD §13, §10.11)
// =============================================================================

export interface ExceptionSummaryMetrics {
  totalExpectedEmployees: number;
  submittedCount: number;
  noSubmissionCount: number;
  redCount: number;
  amberCount: number;
  greenCount: number;
  criticalBlockerCount: number;
  overdueAcknowledgementCount: number;
}

export interface ExceptionSummaryItem {
  type: 'NO_SUBMISSION' | 'RISK_RED' | 'RISK_AMBER' | 'CRITICAL_BLOCKER' | 'OVERDUE_ACKNOWLEDGEMENT';
  userId?: string;
  userName?: string;
  userFunction?: string;
  recordId?: string;
  blockerId?: string;
  title: string;
  details: string;
  severity?: string;
  status?: string;
}

export interface ExceptionSummaryResult {
  date: string;
  metrics: ExceptionSummaryMetrics;
  exceptions: ExceptionSummaryItem[];
}

export interface DailyExceptionItem {
  userId: string;
  userName: string;
  function: string;
  recordDate: string;
  submissionTiming: SubmissionTiming;
  status: DailyStatus;
  commitmentsCount: number;
  criticalBlockersCount: number;
  hasNoSubmission: boolean;
  isOverdueAcknowledgement: boolean;
}

export interface DailyExceptionReport {
  date: string;
  totalItems: number;
  items: DailyExceptionItem[];
}

export interface WeeklyTeamSummaryReport {
  weekStartDate: string;
  weekEndDate: string;
  totalSubmissions: number;
  greenCount: number;
  amberCount: number;
  redCount: number;
  blockerCount: number;
  continuationRate: number;
  teamBreakdown?: Array<{
    teamId: string;
    teamName: string;
    totalExpected: number;
    submitted: number;
    onTimeRate: number;
    greenRate: number;
  }>;
}

export interface MonthlyTrendReport {
  year: number;
  month: number;
  totalWorkingDays: number;
  completionRate: number;
  onTimeRate: number;
  statusTrend: Array<{
    date: string;
    green: number;
    amber: number;
    red: number;
    noSub: number;
  }>;
  functionBreakdown?: Array<{
    function: string;
    totalEmployees: number;
    submissionRate: number;
    greenRate: number;
    blockerCount: number;
  }>;
}

export interface IndividualEvidenceReport {
  userId: string;
  userName: string;
  function: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalDays: number;
    greenDays: number;
    amberDays: number;
    redDays: number;
    noSubDays: number;
    completedCommitments: number;
    totalCommitments: number;
  };
  dailyRecords: Array<{
    id: string;
    date: string;
    status: DailyStatus;
    submissionTiming: SubmissionTiming;
    commitmentsCount: number;
    completedCount: number;
    blockersCount: number;
  }>;
  managerNotes: ManagerNoteItem[];
  complianceEvents: ComplianceEventItem[];
}

export interface BlockerRootCauseReport {
  period: {
    startDate: string;
    endDate: string;
  };
  totalBlockers: number;
  averageResolutionHours: number;
  rootCauseBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  severityBreakdown: Array<{
    severity: string;
    count: number;
  }>;
  persistentBlockers: Array<{
    id: string;
    description: string;
    raisedByName: string;
    ownerNeededName: string;
    durationHours: number;
    status: string;
  }>;
}

export interface ExportReportPayload {
  reportType: 'daily-exception' | 'weekly-team-summary' | 'monthly-trend' | 'individual-evidence' | 'blocker-root-cause';
  format: 'PDF' | 'XLSX';
  date?: string;
  weekStartDate?: string;
  year?: number;
  month?: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
  function?: string;
  teamId?: string;
  scope?: string;
}

export interface ExportReportResponse {
  signedUrl: string;
  fileKey: string;
  format: 'PDF' | 'XLSX';
  expiresInMinutes: number;
}

// =============================================================================
// 2. COMPLIANCE & EXEMPTION TYPES (SAD §9.7, §10.8, §10.6)
// =============================================================================

export type ComplianceEventType =
  | 'NoSubmission'
  | 'PatternFlag'
  | 'Coaching'
  | 'RecordedWarning'
  | 'EscalatedFormalProcess';

export type FollowUpStatus =
  | 'Pending'
  | 'Coached'
  | 'WarningIssued'
  | 'FormalEscalated'
  | 'Closed';

export interface ComplianceEventItem {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userFunction?: string;
  eventType: ComplianceEventType;
  eventDate: string;
  relatedDailyRecordId?: string | null;
  policySnapshot?: Record<string, unknown> | null;
  followUpStatus: string;
  createdAt: string;
  availableActions?: string[];
}

export interface CoachPayload {
  coachingNotes: string;
}

export interface RecordWarningPayload {
  warningLetterRef: string;
  notes?: string;
}

export interface EscalateFormalPayload {
  externalCaseRef: string;
  notes?: string;
}

export type ExceptionType = 'Leave' | 'CompanyHoliday' | 'IndividualExemption';
export type ExceptionStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ExceptionItem {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  type: ExceptionType;
  status: ExceptionStatus;
  startDate: string;
  endDate: string;
  reason: string;
  rejectionReason?: string | null;
  approvedByUserId?: string | null;
  createdAt: string;
  availableActions?: string[];
}

export interface CreateLeavePayload {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface CreateHolidayPayload {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface CreateExemptionPayload {
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface RejectLeavePayload {
  reason: string;
}

// =============================================================================
// 3. CORRECTION REQUEST TYPES (SAD §9.6, §10.5)
// =============================================================================

export type CorrectionClassification = 'Minor' | 'Material';
export type CorrectionStatus = 'Pending' | 'Approved' | 'Objected' | 'AutoApproved';

export interface CorrectionRequestItem {
  id: string;
  dailyRecordId: string;
  commitmentId?: string | null;
  userId: string;
  userName?: string;
  userFunction?: string;
  classification: CorrectionClassification;
  status: CorrectionStatus;
  requestedChanges: Record<string, unknown>;
  objectionReason?: string | null;
  objectionWindowDeadline: string;
  createdAt: string;
  availableActions?: string[];
}

export interface ObjectCorrectionPayload {
  objectionReason: string;
}

// =============================================================================
// 4. POLICY TYPES (SAD §10.9)
// =============================================================================

export type PolicyCategory =
  | 'Schedule'
  | 'SubmissionWindow'
  | 'CommitmentBoundary'
  | 'BlockerSLA'
  | 'ObjectionWindow'
  | 'ComplianceThreshold';

export interface PolicyItem {
  id: string;
  category: PolicyCategory;
  versionNumber: number;
  effectiveDate: string;
  parameters: Record<string, any>;
  changeReason?: string;
  isCurrent: boolean;
  createdByUserId: string;
  createdByName?: string;
  createdAt: string;
}

export interface CreatePolicyPayload {
  category: PolicyCategory;
  effectiveDate: string;
  parameters: Record<string, any>;
  changeReason: string;
}

// =============================================================================
// 5. MANAGER NOTE TYPES (SAD §10.7, §15.1)
// =============================================================================

export type ManagerNoteCategory = 'Coaching' | 'Recognition' | 'Corrective' | 'General';
export type ManagerNoteVisibility = 'PrivateToManagers' | 'SharedWithEmployee';

export interface ManagerNoteItem {
  id: string;
  targetUserId: string;
  targetUserName?: string;
  createdByUserId: string;
  createdByName?: string;
  note: string;
  category?: ManagerNoteCategory;
  visibility: ManagerNoteVisibility;
  eventDate?: string;
  createdAt: string;
}

export interface CreateManagerNotePayload {
  targetUserId: string;
  note: string;
  category?: ManagerNoteCategory;
  visibility: ManagerNoteVisibility;
  eventDate?: string;
}

// =============================================================================
// 6. BLOCKER QUEUE & ACTION TYPES (SAD §9.4, §10.4)
// =============================================================================

export type BlockerSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type BlockerStatus =
  | 'Open'
  | 'Acknowledged'
  | 'InProgress'
  | 'Resolved'
  | 'RiskAccepted'
  | 'Closed';

export interface BlockerItem {
  id: string;
  dailyRecordId?: string;
  description: string;
  severity: BlockerSeverity;
  status: BlockerStatus;
  authorityType: 'Organizational' | 'Project';
  raisedByUserId: string;
  raisedByName?: string;
  raisedByFunction?: string;
  ownerNeededUserId: string;
  ownerNeededName?: string;
  ownerNeededFunction?: string;
  acknowledgmentDeadline?: string;
  resolutionDeadline?: string;
  rootCause?: string | null;
  resolutionSummary?: string | null;
  createdAt: string;
  availableActions?: string[];
}

export interface UpdateBlockerProgressPayload {
  progressSummary: string;
  targetResolutionDate?: string;
}

export interface ResolveBlockerPayload {
  rootCause: string;
  resolutionSummary: string;
}

export interface AddSupportContributionPayload {
  comment: string;
}
