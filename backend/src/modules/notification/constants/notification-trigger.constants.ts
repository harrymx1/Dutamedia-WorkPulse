import { NotificationChannel } from '@prisma/client';

export enum NotificationPriorityTier {
  TIER_1 = 'Tier_1', // Selalu dikirim (RED, Critical Blocker, Blocker unacknowledged)
  TIER_2 = 'Tier_2', // Didahulukan (AMBER+support, Correction Material, Leave Request)
  TIER_3 = 'Tier_3', // Boleh di-drop dari Email saat mendekati limit (Reminder, Weekly summary, dll.)
}

export enum SystemNotificationTrigger {
  // 1. Morning/EOD mendekati cutoff (Employee)
  MORNING_EOD_CUTOFF_REMINDER = 'MORNING_EOD_CUTOFF_REMINDER',

  // 2. AMBER + support needed (Support owner + employee)
  AMBER_SUPPORT_NEEDED = 'AMBER_SUPPORT_NEEDED',

  // 3. RED (Supervisor/Head + PM/owner terkait)
  RED_STATUS = 'RED_STATUS',

  // 4. Critical/instant blocker (Escalation chain)
  CRITICAL_INSTANT_BLOCKER = 'CRITICAL_INSTANT_BLOCKER',

  // 5. Blocker unacknowledged melebihi threshold (Level eskalasi berikutnya)
  BLOCKER_UNACKNOWLEDGED_ESCALATION = 'BLOCKER_UNACKNOWLEDGED_ESCALATION',

  // 6. Repeated no-submission flag (Supervisor/Head; HRGA jika threshold)
  REPEATED_NO_SUBMISSION_FLAG = 'REPEATED_NO_SUBMISSION_FLAG',

  // 7. Weekly summary tersedia (Employee + Manager)
  WEEKLY_SUMMARY_AVAILABLE = 'WEEKLY_SUMMARY_AVAILABLE',

  // 8. Policy/organizational assignment berubah (User terdampak; Policy Owner)
  POLICY_ASSIGNMENT_CHANGED = 'POLICY_ASSIGNMENT_CHANGED',

  // 9. Correction Request Material diajukan (Authorized Reviewer)
  CORRECTION_REQUEST_MATERIAL_SUBMITTED = 'CORRECTION_REQUEST_MATERIAL_SUBMITTED',

  // 10. Correction Request menuju akhir Objection Window (Authorized Reviewer)
  CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING = 'CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING',

  // 11. Correction Request Applied/Rejected (Employee pengaju)
  CORRECTION_REQUEST_RESOLVED = 'CORRECTION_REQUEST_RESOLVED',

  // 12. Leave Request diajukan (Authorized Approver)
  LEAVE_REQUEST_SUBMITTED = 'LEAVE_REQUEST_SUBMITTED',

  // 13. Leave Request disetujui/ditolak (Employee pengaju)
  LEAVE_REQUEST_RESOLVED = 'LEAVE_REQUEST_RESOLVED',

  // System Internal: Peringatan kuota email harian mendekati limit (Admin)
  EMAIL_QUOTA_WARNING = 'EMAIL_QUOTA_WARNING',
}

export interface StandardNotificationPayload {
  title: string;
  body: string;
  linkPath: string; // Wajib relative path (SAD §12.6)
  iconType: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TriggerDefinition {
  triggerType: SystemNotificationTrigger;
  channels: NotificationChannel[];
  priorityTier: NotificationPriorityTier;
  defaultIcon: string;
}

/**
 * Pemetaan 13 Trigger resmi SAD §12.1 ke Channel & Priority Tier.
 */
export const TRIGGER_DEFINITIONS: Record<
  SystemNotificationTrigger,
  TriggerDefinition
> = {
  [SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER]: {
    triggerType: SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.BrowserPush,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_3,
    defaultIcon: 'clock-outline',
  },
  [SystemNotificationTrigger.AMBER_SUPPORT_NEEDED]: {
    triggerType: SystemNotificationTrigger.AMBER_SUPPORT_NEEDED,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.BrowserPush,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_2,
    defaultIcon: 'alert-circle',
  },
  [SystemNotificationTrigger.RED_STATUS]: {
    triggerType: SystemNotificationTrigger.RED_STATUS,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.BrowserPush,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_1,
    defaultIcon: 'alert-octagon',
  },
  [SystemNotificationTrigger.CRITICAL_INSTANT_BLOCKER]: {
    triggerType: SystemNotificationTrigger.CRITICAL_INSTANT_BLOCKER,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.BrowserPush,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_1,
    defaultIcon: 'blocker-critical',
  },
  [SystemNotificationTrigger.BLOCKER_UNACKNOWLEDGED_ESCALATION]: {
    triggerType: SystemNotificationTrigger.BLOCKER_UNACKNOWLEDGED_ESCALATION,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.BrowserPush,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_1,
    defaultIcon: 'arrow-up-bold-box',
  },
  [SystemNotificationTrigger.REPEATED_NO_SUBMISSION_FLAG]: {
    triggerType: SystemNotificationTrigger.REPEATED_NO_SUBMISSION_FLAG,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_3,
    defaultIcon: 'account-alert',
  },
  [SystemNotificationTrigger.WEEKLY_SUMMARY_AVAILABLE]: {
    triggerType: SystemNotificationTrigger.WEEKLY_SUMMARY_AVAILABLE,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_3,
    defaultIcon: 'chart-box',
  },
  [SystemNotificationTrigger.POLICY_ASSIGNMENT_CHANGED]: {
    triggerType: SystemNotificationTrigger.POLICY_ASSIGNMENT_CHANGED,
    channels: [NotificationChannel.WebNotificationCenter],
    priorityTier: NotificationPriorityTier.TIER_3,
    defaultIcon: 'shield-account',
  },
  [SystemNotificationTrigger.CORRECTION_REQUEST_MATERIAL_SUBMITTED]: {
    triggerType:
      SystemNotificationTrigger.CORRECTION_REQUEST_MATERIAL_SUBMITTED,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_2,
    defaultIcon: 'file-edit',
  },
  [SystemNotificationTrigger.CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING]: {
    triggerType:
      SystemNotificationTrigger.CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING,
    channels: [NotificationChannel.WebNotificationCenter],
    priorityTier: NotificationPriorityTier.TIER_3,
    defaultIcon: 'clock-alert',
  },
  [SystemNotificationTrigger.CORRECTION_REQUEST_RESOLVED]: {
    triggerType: SystemNotificationTrigger.CORRECTION_REQUEST_RESOLVED,
    channels: [NotificationChannel.WebNotificationCenter],
    priorityTier: NotificationPriorityTier.TIER_3,
    defaultIcon: 'check-decagram',
  },
  [SystemNotificationTrigger.LEAVE_REQUEST_SUBMITTED]: {
    triggerType: SystemNotificationTrigger.LEAVE_REQUEST_SUBMITTED,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.BrowserPush,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_2,
    defaultIcon: 'calendar-clock',
  },
  [SystemNotificationTrigger.LEAVE_REQUEST_RESOLVED]: {
    triggerType: SystemNotificationTrigger.LEAVE_REQUEST_RESOLVED,
    channels: [
      NotificationChannel.Email,
      NotificationChannel.WebNotificationCenter,
    ],
    priorityTier: NotificationPriorityTier.TIER_3,
    defaultIcon: 'calendar-check',
  },
  [SystemNotificationTrigger.EMAIL_QUOTA_WARNING]: {
    triggerType: SystemNotificationTrigger.EMAIL_QUOTA_WARNING,
    channels: [NotificationChannel.WebNotificationCenter],
    priorityTier: NotificationPriorityTier.TIER_1,
    defaultIcon: 'email-alert',
  },
};
