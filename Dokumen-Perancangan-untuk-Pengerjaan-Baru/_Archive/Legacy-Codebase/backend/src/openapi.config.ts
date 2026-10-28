import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('WorkPulse API')
    .setDescription(
      'Kontrak Resmi WorkPulse — Daily Accountability & Blocker Log System API v1.0 (Dutamedia) sesuai SAD Section 10',
    )
    .setVersion('1.0.0')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'Session HttpOnly Cookie JWT Token (SAD §8.1)',
    })
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-CSRF-Token',
        description: 'Double Submit Cookie CSRF Token (SAD §8.5)',
      },
      'csrf',
    )
    .addTag('Auth', 'Autentikasi dan sesi login (SAD §10.1)')
    .addTag('Identity', 'Organisasi, pengguna, tim, departemen, dan proyek (SAD §10.2)')
    .addTag('DailyAccountability', 'Check-in harian pagi & sore, komitmen, dan tugas tambahan (SAD §10.3)')
    .addTag('Blocker', 'Manajemen blocker, kontribusi bantuan, dan resolusi (SAD §10.4)')
    .addTag('CorrectionRequest', 'Pengajuan dan review koreksi record (SAD §10.5)')
    .addTag('Exception', 'Cuti, libur, dan dispensasi kehadiran (SAD §10.6)')
    .addTag('ManagerNote', 'Catatan manajerial dan coaching (SAD §10.7)')
    .addTag('Compliance', 'Pelanggaran kompensasi dan progres sanksi (SAD §10.8)')
    .addTag('Policy', 'Pengaturan kebijakan dan penugasan policy owner (SAD §10.9)')
    .addTag('Notification', 'Pengaturan notifikasi dan riwayat pemberitahuan (SAD §10.10)')
    .addTag('Reporting', 'Laporan agregat dan analitik tim/fungsi/manajemen (SAD §10.11)')
    .addTag('FileStorage', 'Upload signed URL dan unduhan bukti (SAD §10.12)')
    .build();

  return SwaggerModule.createDocument(app, config);
}
