import { Injectable, Logger } from '@nestjs/common';
import type { StandardNotificationPayload } from '../constants/notification-trigger.constants.js';

export interface PushNotificationResult {
  success: boolean;
  messageId?: string;
  stubbed: boolean;
}

@Injectable()
export class BrowserPushService {
  private readonly logger = new Logger(BrowserPushService.name);

  /**
   * Stub channel Browser Push untuk MVP (SAD §12.4).
   * Row Notification(channel=BrowserPush) tetap dicatat di database, namun pengiriman aktual di-stub.
   */
  async sendPushNotification(
    recipientUserId: string,
    payload: StandardNotificationPayload,
  ): Promise<PushNotificationResult> {
    this.logger.log(
      `[STUB BROWSER PUSH] Recipient: ${recipientUserId} | Title: "${payload.title}" | Link: ${payload.linkPath}`,
    );

    return {
      success: true,
      messageId: `stub-push-${Date.now()}`,
      stubbed: true,
    };
  }
}
