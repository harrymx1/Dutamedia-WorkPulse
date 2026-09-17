import { Injectable, Logger } from '@nestjs/common';

export interface SendEmailOptions {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class BrevoEmailService {
  private readonly logger = new Logger(BrevoEmailService.name);
  private readonly apiKey: string | undefined;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail =
      process.env.BREVO_SENDER_EMAIL || 'no-reply@dutamedia.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'WorkPulse Dutamedia';

    if (!this.apiKey) {
      this.logger.warn(
        'BREVO_API_KEY tidak dikonfigurasi. BrevoEmailService beroperasi dalam mode simulasi (mock send).',
      );
    }
  }

  /**
   * Mengirim email transaksional melalui Brevo REST API v3 (SAD §12.3).
   */
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    // Mode simulasi jika API key tidak tersedia atau mode testing
    if (!this.apiKey || this.apiKey === 'mock-brevo-key') {
      this.logger.log(
        `[SIMULASI EMAIL] Kepada: ${options.toEmail} | Subjek: "${options.subject}"`,
      );
      return {
        success: true,
        messageId: `mock-brevo-${Date.now()}`,
      };
    }

    try {
      const payload = {
        sender: {
          name: this.senderName,
          email: this.senderEmail,
        },
        to: [
          {
            email: options.toEmail,
            name: options.toName || options.toEmail,
          },
        ],
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent || options.subject,
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Gagal mengirim email via Brevo API: Status ${response.status} - ${errorText}`,
        );
        return {
          success: false,
          error: `Brevo API HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as { messageId?: string };
      this.logger.log(
        `Email berhasil dikirim via Brevo ke ${options.toEmail}. MessageId: ${data.messageId}`,
      );

      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unknown network error';
      this.logger.error(`Exception saat memanggil Brevo API: ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}
