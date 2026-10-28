import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { createAppValidationPipe } from './modules/shared/pipes/app-validation.pipe.js';
import { SwaggerModule } from '@nestjs/swagger';
import { createOpenApiDocument } from './openapi.config.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Base URL & Versioning: /api/v1 (SAD §7.1)
  app.setGlobalPrefix('api/v1');

  // 2. Cookie Parser Middleware untuk session cookie (SAD §6.2 #1, §16.1)
  app.use(cookieParser());

  // 3. Request Body Size Limit: 1 MB untuk JSON (SAD §7.10)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  // 4. CORS Configuration dinamis dari ALLOWED_ORIGIN (SAD §7.9)
  const allowedOrigins = (
    process.env.ALLOWED_ORIGIN || 'http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Izinkan request tanpa origin (seperti health check internal, server-to-server, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' tidak diizinkan oleh kebijakan CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
  });

  // 5. Global Validation Pipe dengan custom exceptionFactory (SAD §7.4, §7.7)
  app.useGlobalPipes(createAppValidationPipe());

  // 6. OpenAPI / Swagger Documentation UI (SAD §17.1, EPIC-21-T1)
  const openApiDoc = createOpenApiDocument(app);
  SwaggerModule.setup('api/v1/docs', app, openApiDoc);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`WorkPulse Backend API v1 berjalan pada port ${port}`);
  logger.log(`Swagger OpenAPI Documentation tersedia pada http://localhost:${port}/api/v1/docs`);
}

await bootstrap();
