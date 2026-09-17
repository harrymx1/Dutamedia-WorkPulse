export type NotificationChannel = 'WebNotificationCenter' | 'EmailBrevo' | 'BrowserPush';
export type NotificationStatus = 'Pending' | 'Sent' | 'Read' | 'Failed';

export interface NotificationPayload {
  title: string;
  body: string;
  linkPath?: string;
  iconType?: string;
  actionType?: string;
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  triggerType: string;
  channel: NotificationChannel;
  payload: NotificationPayload;
  status: NotificationStatus;
  sentAt?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface QueryNotificationsParams {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}
