import {
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { ValidationException } from '../exceptions/api.exception.js';
import type { ErrorDetail } from '../dto/base-response.dto.js';

function formatErrors(errors: ValidationError[], parentProperty = ''): ErrorDetail[] {
  const details: ErrorDetail[] = [];

  for (const error of errors) {
    const propertyPath = parentProperty
      ? `${parentProperty}.${error.property}`
      : error.property;

    if (error.constraints) {
      for (const [reasonKey, message] of Object.entries(error.constraints)) {
        details.push({
          field: propertyPath,
          reason: reasonKey.toUpperCase(),
          message,
        });
      }
    }

    if (error.children && error.children.length > 0) {
      details.push(...formatErrors(error.children, propertyPath));
    }
  }

  return details;
}

export function createAppValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors: ValidationError[]) => {
      const details = formatErrors(errors);
      const firstMessage =
        details[0]?.message || 'Data permintaan tidak valid';

      return new ValidationException(firstMessage, details);
    },
  });
}
