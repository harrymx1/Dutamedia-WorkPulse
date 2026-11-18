import * as dotenv from 'dotenv';
import * as path from 'path';
import { defineConfig } from 'prisma/config';

dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../.env.production') });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node ./prisma/seed.ts',
  },
  datasource: {
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      'postgresql://workpulse_app:workpulse_dev_password@localhost:5432/workpulse_dev',
  },
});

