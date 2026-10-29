import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ActivateDto } from './dto/activate.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from './guards/auth.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('api/v1/auth')
@UseGuards(AuthGuard, CsrfGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: process.env.AUTH_RATE_LIMIT ? Number(process.env.AUTH_RATE_LIMIT) : 5,
      ttl: 60000,
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.login(loginDto, {
      ipAddress,
      userAgent,
    });

    const isProd = process.env.NODE_ENV === 'production';

    // 1. Set-Cookie access_token (HttpOnly, Secure, SameSite=Strict)
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 2. Set-Cookie csrf_token (Readable oleh client JS, Secure, SameSite=Strict)
    res.cookie('csrf_token', result.csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
      session: {
        id: result.session.id,
        expiresAt: result.session.expiresAt,
      },
      csrfToken: result.csrfToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = (req as any).sessionId;
    if (sessionId) {
      await this.authService.logout(sessionId);
    }

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });

    return {
      message: 'Anda telah berhasil keluar dari sistem.',
    };
  }

  @Public()
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Body() activateDto: ActivateDto) {
    return await this.authService.activate(activateDto);
  }

  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      user,
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(userId, changePasswordDto);
  }
}

