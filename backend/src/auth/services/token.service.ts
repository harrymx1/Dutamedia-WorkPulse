import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

export interface JwtAuthPayload {
  sub: string;
  sessionId: string;
  email: string;
  role: string;
  fullName: string;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateRandomToken(bytes = 32): string {
    return randomBytes(bytes).toString('hex');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  signAccessToken(payload: JwtAuthPayload): string {
    return this.jwtService.sign(payload);
  }

  verifyAccessToken(token: string): JwtAuthPayload {
    return this.jwtService.verify<JwtAuthPayload>(token);
  }
}

