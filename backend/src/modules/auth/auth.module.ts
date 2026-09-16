import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './guards/auth.guard.js';
import { CsrfGuard } from './guards/csrf.guard.js';
import { IdentityModule } from '../identity/identity.module.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'workpulse-default-dev-secret-key-32chars',
        signOptions: { expiresIn: '12h' },
      }),
    }),
    IdentityModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Urutan eksekusi: AuthGuard -> CsrfGuard (SAD §8.8)
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
  exports: [AuthService, JwtModule, AuthGuard, CsrfGuard],
})
export class AuthModule {}
