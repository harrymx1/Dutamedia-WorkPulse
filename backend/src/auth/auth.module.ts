import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';
import { AuthGuard } from './guards/auth.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'workpulse-default-dev-jwt-secret-key-at-least-32-chars-long!',
      signOptions: { expiresIn: '24h' },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordHasherService,
    TokenService,
    AuthGuard,
    CsrfGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    PasswordHasherService,
    TokenService,
    AuthGuard,
    CsrfGuard,
    RolesGuard,
  ],
})
export class AuthModule {}

