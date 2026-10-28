import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { createPinoHttpConfig } from './common/logging/pino-logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(pinoHttp(createPinoHttpConfig()));
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`WorkPulse Backend API is running on http://localhost:${port}`);
}

bootstrap();
