import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import pinoHttp from 'pino-http';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { createPinoHttpConfig } from './common/logging/pino-logger.config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. HTTP Security Headers via Helmet (CSP, anti-clickjacking, no-sniff, HSTS)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Anti-Payload DoS (Strict Payload Limits: 100kb)
  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ limit: '100kb', extended: true }));

  // 3. Strict CORS Configuration
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Izinkan request tanpa origin (seperti curl, mobile app, internal healthcheck) atau domain terdaftar
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token',
      'x-request-id',
      'Accept',
    ],
  });

  // 4. Request Logging & Cookie Parser
  app.use(pinoHttp(createPinoHttpConfig()));
  app.use((cookieParser.default || cookieParser)());

  // 5. Global Validation Pipe (Strict White-listing, Anti-Mass Assignment)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 6. Graceful Shutdown Hooks (Release DB connections & finish pending transactions)
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`WorkPulse Backend API is running on http://localhost:${port}`);
}

bootstrap();
