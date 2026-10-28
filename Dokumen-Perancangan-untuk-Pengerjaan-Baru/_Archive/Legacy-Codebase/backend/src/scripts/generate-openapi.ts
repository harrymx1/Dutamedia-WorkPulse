import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../app.module.js';
import { createOpenApiDocument } from '../openapi.config.js';
import * as fs from 'fs/promises';
import * as path from 'path';

async function generate() {
  process.env.SKIP_DB_CONNECT = 'true';
  console.log('[OpenAPI Codegen] Menginisialisasi NestJS context...');

  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    logger: ['error', 'warn'],
  });

  app.setGlobalPrefix('api/v1');

  console.log('[OpenAPI Codegen] Membangun OpenAPI Specification...');
  const document = createOpenApiDocument(app);

  const outputPath = path.resolve(process.cwd(), 'openapi.json');
  await fs.writeFile(outputPath, JSON.stringify(document, null, 2), 'utf-8');
  console.log(`[OpenAPI Codegen] Sukses! openapi.json tersimpan pada: ${outputPath}`);

  await app.close();
  process.exit(0);
}

generate().catch((err) => {
  console.error('[OpenAPI Codegen] Error:', err);
  process.exit(1);
});
