import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node ./prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://workpulse_app:workpulse_dev_password@localhost:5432/workpulse_dev',
  },
});

