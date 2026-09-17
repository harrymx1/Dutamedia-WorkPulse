export type WorkType = 'WFO' | 'WFH' | 'ClientVisit' | 'BusinessTrip';
export type RiskLevel = 'GREEN' | 'AMBER' | 'RED';
export type OutcomeStatus = 'Completed' | 'PartiallyCompleted' | 'NotCompleted' | 'Cancelled';
export type ContinuationStatus = 'Continue' | 'DoNotContinue';
export type SubmissionTiming = 'OnTime' | 'Late' | 'NoSubmission';
export type BlockerSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type BlockerStatus = 'Open' | 'Acknowledged' | 'InProgress' | 'Resolved' | 'AcceptedRisk';
export type BlockerType =
  | 'Technical'
  | 'InterTeamDependency'
  | 'ResourceOrAccess'
  | 'ScopeOrRequirement'
  | 'VendorOrThirdParty'
  | 'Other';
export type AdditionalWorkReason =
  | 'NewlyAssigned'
  | 'MissedInPlanning'
  | 'PriorityChange'
  | 'OperationalIncident'
  | 'Other';

export interface Commitment {
  id: string;
  dailyRecordId: string;
  description: string;
  referenceUrl?: string | null;
  initialRisk: RiskLevel;
  knownBlocker?: string | null;
  supportNeeded?: string | null;
  outcomeStatus?: OutcomeStatus | null;
  continuation?: ContinuationStatus | null;
  continuationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdditionalWork {
  id: string;
  dailyRecordId: string;
  description: string;
  reason: AdditionalWorkReason;
  assignedBy?: string | null;
  outcomeStatus?: OutcomeStatus | null;
  continuation?: ContinuationStatus | null;
  continuationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Blocker {
  id: string;
  reporterUserId: string;
  targetOwnerUserId: string;
  type: BlockerType;
  severity: BlockerSeverity;
  impactDescription: string;
  expectedResolution?: string | null;
  status: BlockerStatus;
  resolutionNote?: string | null;
  createdAt: string;
  updatedAt: string;
  reporterUser?: {
    id: string;
    fullName: string;
    email: string;
  };
  targetOwnerUser?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface DailyAccountabilityRecord {
  id: string;
  employeeUserId: string;
  workDate: string;
  workType?: WorkType | null;
  morningSubmittedAt?: string | null;
  eodSubmittedAt?: string | null;
  cutoffLockedAt?: string | null;
  morningCutoffTiming?: SubmissionTiming | null;
  eodCutoffTiming?: SubmissionTiming | null;
  finalStatus?: RiskLevel | null;
  statusSuggested?: RiskLevel | null;
  statusOverridden: boolean;
  statusOverrideReason?: string | null;
  tomorrowPriority?: string | null;
  commitments?: Commitment[];
  additionalWorks?: AdditionalWork[];
  createdAt: string;
  updatedAt: string;
}

export interface MorningCommitmentInput {
  description: string;
  referenceUrl?: string;
  initialRisk: RiskLevel;
  knownBlocker?: string;
  supportNeeded?: string;
}

export interface MorningCheckinPayload {
  workType: WorkType;
  commitments: MorningCommitmentInput[];
}

export interface EodItemOutcomeInput {
  id: string;
  outcomeStatus: OutcomeStatus;
  continuation: ContinuationStatus;
  continuationReason?: string;
}

export interface EodCheckinPayload {
  itemOutcomes: EodItemOutcomeInput[];
  finalStatus: RiskLevel;
  tomorrowPriority?: string;
}

export interface ConfirmOverridePayload {
  overrideReason: string;
  finalStatus: RiskLevel;
}

export interface AdditionalWorkPayload {
  dailyRecordId: string;
  description: string;
  reason: AdditionalWorkReason;
  assignedBy?: string;
}

export interface CreateBlockerPayload {
  type: BlockerType;
  severity: BlockerSeverity;
  impactDescription: string;
  targetOwnerUserId: string;
  expectedResolution?: string;
}

export interface CorrectionRequestPayload {
  commitmentId: string;
  proposedDescription: string;
  reason: string;
}
