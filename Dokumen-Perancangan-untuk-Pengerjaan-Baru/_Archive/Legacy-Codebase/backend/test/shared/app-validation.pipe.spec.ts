import { describe, it, expect } from 'vitest';
import { IsNotEmpty, IsEmail, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { createAppValidationPipe } from '../../src/modules/shared/pipes/app-validation.pipe.js';
import { ValidationException } from '../../src/modules/shared/exceptions/api.exception.js';

class SampleDto {
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @Type(() => Number)
  @IsInt({ message: 'Usia harus berupa bilangan bulat' })
  @Min(18, { message: 'Usia minimal 18 tahun' })
  age!: number;
}

describe('createAppValidationPipe (SAD §7.4 & §7.7)', () => {
  const pipe = createAppValidationPipe();

  it('harus berhasil meloloskan dan mentransformasikan payload yang valid', async () => {
    const validPayload = {
      name: 'Budi Santoso',
      email: 'budi@dutamedia.com',
      age: '25', // string yang akan dikonversi ke number
    };

    const result = await pipe.transform(validPayload, {
      type: 'body',
      metatype: SampleDto,
    });

    expect(result.name).toBe('Budi Santoso');
    expect(result.email).toBe('budi@dutamedia.com');
    expect(result.age).toBe(25);
    expect(typeof result.age).toBe('number');
  });

  it('harus membuang field yang tidak ada di whitelist', async () => {
    const payloadWithExtra = {
      name: 'Budi Santoso',
      email: 'budi@dutamedia.com',
      age: 25,
      maliciousField: 'attack',
    };

    const result = await pipe.transform(payloadWithExtra, {
      type: 'body',
      metatype: SampleDto,
    });

    expect(result).not.toHaveProperty('maliciousField');
  });

  it('harus melempar ValidationException dengan format details yang tepat jika validasi gagal', async () => {
    const invalidPayload = {
      name: '',
      email: 'bukan-email',
      age: 15,
    };

    try {
      await pipe.transform(invalidPayload, {
        type: 'body',
        metatype: SampleDto,
      });
      expect.fail('Seharusnya melempar ValidationException');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      const valError = error as ValidationException;
      expect(valError.code).toBe('VALIDATION_ERROR');
      expect(valError.details).toBeDefined();
      expect(valError.details?.length).toBeGreaterThanOrEqual(3);

      const fields = valError.details?.map((d) => d.field);
      expect(fields).toContain('name');
      expect(fields).toContain('email');
      expect(fields).toContain('age');
    }
  });
});
