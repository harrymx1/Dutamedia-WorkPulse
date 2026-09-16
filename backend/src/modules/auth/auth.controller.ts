import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { ThrottleAuth } from '../shared/decorators/throttle.decorator.js';
import { SkipEnvelope } from '../shared/decorators/skip-envelope.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login (SAD §8.4, §10.1)
   * Rate limit: 5 perc./menit per IP (@ThrottleAuth)
   */
  @Public()
  @ThrottleAuth()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress =
      req.ip ||
      (Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']?.split(',')[0]) ||
      req.socket?.remoteAddress;

    const userAgent = req.headers['user-agent'];

    const result = await this.authService.login(dto, ipAddress, userAgent);

    const isProd = process.env.NODE_ENV === 'production';
    const secure = isProd || process.env.COOKIE_SECURE === 'true';
    const sameSite = secure ? ('none' as const) : ('lax' as const);
    const cookieMaxAge = 12 * 60 * 60 * 1000; // 12 jam (SAD §8.4)

    // 1. Set cookie access_token (HttpOnly, Secure, SameSite=None)
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: cookieMaxAge,
      path: '/',
    });

    // 2. Set cookie csrf_token (TIDAK HttpOnly, Secure, SameSite=None)
    res.cookie('csrf_token', result.csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: cookieMaxAge,
      path: '/',
    });

    return {
      mustResetPassword: result.mustResetPassword,
      user: result.user,
    };
  }

  /**
   * POST /api/v1/auth/logout (SAD §8.4, §10.1)
   * 204 No Content + hapus cookie
   */
  @SkipEnvelope()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser('sessionId') sessionId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    if (sessionId) {
      await this.authService.logout(sessionId);
    }

    const isProd = process.env.NODE_ENV === 'production';
    const secure = isProd || process.env.COOKIE_SECURE === 'true';
    const sameSite = secure ? ('none' as const) : ('lax' as const);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    res.clearCookie('csrf_token', {
      httpOnly: false,
      secure,
      sameSite,
      path: '/',
    });
  }

  /**
   * POST /api/v1/auth/reset-password (SAD §8.2, §10.1)
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @CurrentUser('userId') userId: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(userId, dto);
  }

  /**
   * POST /api/v1/auth/admin-reset-password/:userId (SAD §8.2, §10.1, §15.3)
   */
  @Post('admin-reset-password/:userId')
  @HttpCode(HttpStatus.OK)
  async adminResetPassword(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser('userId') actorAdminId: string,
  ) {
    return this.authService.adminResetPassword(targetUserId, actorAdminId);
  }

  /**
   * GET /api/v1/auth/me (SAD §10.1)
   */
  @Get('me')
  async getMe(@CurrentUser('userId') userId: string) {
    return this.authService.getMe(userId);
  }
}
