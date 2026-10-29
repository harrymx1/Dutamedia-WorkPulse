import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';

@Controller()
@SkipThrottle()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return {
      service: 'WorkPulse Backend API',
      status: 'online',
      version: '1.0.0-rc1',
      company: 'PT Dutamedia Mandiri Pratama',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}

