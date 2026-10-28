import { describe, it, expect } from 'vitest';
import { PasswordHasherService } from './password-hasher.service';

describe('PasswordHasherService (EP02-TK002 / SAD IV.3 Argon2id)', () => {
  const service = new PasswordHasherService();

  it('should hash password and produce valid argon2id hash', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await service.hash(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).toContain('$argon2id$');
  });

  it('should correctly verify valid password against hash', async () => {
    const rawPassword = 'CorrectPassword@2026';
    const hash = await service.hash(rawPassword);

    const isValid = await service.verify(rawPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should reject invalid password against hash', async () => {
    const rawPassword = 'CorrectPassword@2026';
    const hash = await service.hash(rawPassword);

    const isValid = await service.verify('WrongPassword@9999', hash);
    expect(isValid).toBe(false);
  });
});

