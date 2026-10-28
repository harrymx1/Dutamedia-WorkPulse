import { describe, it, expect } from 'vitest';
import { TestDatabaseSafetyGuard } from './test-db-guard';
import { resetTestDatabase } from './test-db-reset';

describe('TestDatabaseSafetyGuard (EP01-TK005)', () => {
  it('should accept valid isolated test database URL', () => {
    const validUrl = 'postgresql://postgres:test_password@localhost:54332/workpulse_test';
    expect(() => TestDatabaseSafetyGuard.validate(validUrl)).not.toThrow();
  });

  it('should reject missing or empty DATABASE_URL', () => {
    expect(() => TestDatabaseSafetyGuard.validate(undefined)).toThrowError(
      /DATABASE_URL is not set/,
    );
    expect(() => TestDatabaseSafetyGuard.validate('')).toThrowError(/DATABASE_URL is not set/);
  });

  it('should reject production or development databases', () => {
    const devUrl = 'postgresql://workpulse_app:dev_password@localhost:5432/workpulse_dev';
    expect(() => TestDatabaseSafetyGuard.validate(devUrl)).toThrowError(
      /is NOT a test database/,
    );

    const prodUrl = 'postgresql://prod_user:secret@db.company.com:5432/workpulse_prod';
    expect(() => TestDatabaseSafetyGuard.validate(prodUrl)).toThrowError(
      /is NOT a test database/,
    );

    const defaultPgUrl = 'postgresql://postgres:secret@localhost:5432/postgres';
    expect(() => TestDatabaseSafetyGuard.validate(defaultPgUrl)).toThrowError(
      /is a reserved non-test database/,
    );
  });

  it('resetTestDatabase should immediately abort if invoked with production database', () => {
    const dangerousUrl = 'postgresql://workpulse_app:secret@db.prod.internal:5432/workpulse_prod';
    expect(() => resetTestDatabase(dangerousUrl)).toThrowError(/is NOT a test database/);
  });
});
