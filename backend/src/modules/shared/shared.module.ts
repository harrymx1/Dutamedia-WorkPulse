import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from './filters/http-exception.filter.js';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard.js';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
  exports: [],
})
export class SharedModule {}
