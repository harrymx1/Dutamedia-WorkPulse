import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from './filters/http-exception.filter.js';

@Global()
@Module({
  providers: [
    Reflector,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [Reflector],
})
export class SharedModule {}
