import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const rawUrl = process.env.DATABASE_URL || '';
    // Strip sslmode=require from URL so pg doesn't override rejectUnauthorized with strict CA checks
    const cleanUrl = rawUrl.replace(/[?&]sslmode=require/g, '');

    const adapter = new PrismaPg({
      connectionString: cleanUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    super({ adapter });
  }

  async onModuleInit() {
    if (process.env.SKIP_DB_CONNECT === 'true') {
      this.logger.log('SKIP_DB_CONNECT=true: Melewati inisialisasi koneksi database');
      return;
    }
    try {
      await this.$connect();
      this.logger.log('Berhasil terhubung ke database PostgreSQL via Prisma 7');
    } catch (error) {
      this.logger.error('Gagal terhubung ke database PostgreSQL:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Koneksi database PostgreSQL terputus');
  }
}
