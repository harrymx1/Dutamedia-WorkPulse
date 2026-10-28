/**
 * STABILIZATION PASS: RoleGuard Regression Integration Test (Supertest)
 * Verifikasi regresi kerentanan keamanan endpoint administratif (SAD §10.2, §8.8):
 * Pengguna dengan peran 'Employee' yang memanggil 9 endpoint terproteksi HARUS mendapat HTTP 403 FORBIDDEN.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import request from 'supertest';
import { Role, UserStatus } from '@prisma/client';
import { IdentityController } from '../../src/modules/identity/identity.controller.js';
import { IdentityService } from '../../src/modules/identity/identity.service.js';
import { AuthController } from '../../src/modules/auth/auth.controller.js';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import { ComplianceController } from '../../src/modules/compliance/controllers/compliance.controller.js';
import { ComplianceService } from '../../src/modules/compliance/services/compliance.service.js';
import { RoleGuard } from '../../src/modules/authorization/guards/role.guard.js';
import { HttpExceptionFilter } from '../../src/modules/shared/filters/http-exception.filter.js';
import { TransformInterceptor } from '../../src/modules/shared/interceptors/transform.interceptor.js';

describe('RoleGuard Regression Integration Test (Supertest - SAD §10.2, §8.8)', () => {
  let app: INestApplication;
  let activeRole: Role = Role.Employee;

  // Valid UUIDv4 constants
  const validUuid1 = 'a0000000-0000-4000-8000-000000000001';
  const validUuid2 = 'b0000000-0000-4000-8000-000000000002';
  const validUuid3 = 'c0000000-0000-4000-8000-000000000003';
  const validUuid4 = 'd0000000-0000-4000-8000-000000000004';
  const validUuid5 = 'e0000000-0000-4000-8000-000000000005';

  const mockIdentityService = {
    getUsers: vi.fn().mockResolvedValue({ items: [], pagination: { total: 0 } }),
    createUser: vi.fn().mockResolvedValue({ user: { id: validUuid1 }, temporaryPassword: 'temp-password' }),
    updateUserStatus: vi.fn().mockResolvedValue({ id: validUuid2, status: UserStatus.Inactive }),
    createOrganizationalAssignment: vi.fn().mockResolvedValue({ id: validUuid3 }),
    createProjectAuthorityMapping: vi.fn().mockResolvedValue({ id: validUuid4 }),
    updateProjectAuthorityMapping: vi.fn().mockResolvedValue({ id: validUuid4 }),
    createTemporaryReviewerAssignment: vi.fn().mockResolvedValue({ id: validUuid5 }),
    getTemporaryReviewerAssignments: vi.fn().mockResolvedValue([]),
  };

  const mockAuthService = {
    adminResetPassword: vi.fn().mockResolvedValue({ temporaryPassword: 'new-temp-password' }),
  };

  const mockComplianceService = {
    recordWarning: vi.fn().mockResolvedValue({ id: validUuid5, followUpStatus: 'Recorded' }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [IdentityController, AuthController, ComplianceController],
      providers: [
        Reflector,
        { provide: IdentityService, useValue: mockIdentityService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ComplianceService, useValue: mockComplianceService },
        // Simulasi Auth Context Guard: menyematkan req.user sesuai activeRole yang sedang diuji
        {
          provide: APP_GUARD,
          useValue: {
            canActivate: (context: ExecutionContext) => {
              const req = context.switchToHttp().getRequest();
              req.user = {
                userId: validUuid1,
                email: 'test-user@dutamedia.com',
                role: activeRole,
                function: 'Engineering',
                directManagerId: null,
                sessionId: 'sess-test-1',
                mustResetPassword: false,
              };
              return true;
            },
          },
        },
        // Real RoleGuard implementation
        {
          provide: APP_GUARD,
          useClass: RoleGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    const reflector = app.get(Reflector);
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor(reflector));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Employee Role Denied (403 FORBIDDEN) pada 9 Endpoint Administratif', () => {
    beforeAll(() => {
      activeRole = Role.Employee;
    });

    it('1. POST /api/v1/users → HARUS 403 FORBIDDEN untuk Employee', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          fullName: 'Budi Santoso',
          email: 'budi@dutamedia.com',
          initialRole: Role.Employee,
          function: 'Operations',
          effectiveDate: '2026-09-01',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('2. PATCH /api/v1/users/:id → HARUS 403 FORBIDDEN untuk Employee', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${validUuid2}`)
        .send({ status: UserStatus.Inactive });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('3. POST /api/v1/organizational-assignments → HARUS 403 FORBIDDEN untuk Employee', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/organizational-assignments')
        .send({
          userId: validUuid2,
          role: Role.Supervisor_TL,
          function: 'Engineering',
          effectiveDate: '2026-09-01',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('4. POST /api/v1/project-authority-mappings → HARUS 403 FORBIDDEN untuk Employee', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/project-authority-mappings')
        .send({
          userId: validUuid2,
          scopeReference: 'Project Alpha',
          effectiveDate: '2026-09-01',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('5. PATCH /api/v1/project-authority-mappings/:id → HARUS 403 FORBIDDEN untuk Employee', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/project-authority-mappings/${validUuid3}`)
        .send({ endDate: '2026-09-30' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('6. POST /api/v1/temporary-reviewer-assignments → HARUS 403 FORBIDDEN untuk Employee', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/temporary-reviewer-assignments')
        .send({
          originalReviewerUserId: validUuid2,
          delegateReviewerUserId: validUuid3,
          dateStart: '2026-09-20',
          dateEnd: '2026-09-25',
          reason: 'Cuti tahunan',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('7. GET /api/v1/users → HARUS 403 FORBIDDEN untuk Employee', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('8. POST /api/v1/auth/admin-reset-password/:userId → HARUS 403 FORBIDDEN untuk Employee', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/auth/admin-reset-password/${validUuid4}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('9. POST /api/v1/compliance-events/:id/record-warning → HARUS 403 FORBIDDEN untuk Employee', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/compliance-events/${validUuid5}/record-warning`)
        .send({ note: 'Peringatan resmi atas ketidakpatuhan' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('10. GET /api/v1/temporary-reviewer-assignments → HARUS 403 FORBIDDEN untuk Employee (ADR-002)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/temporary-reviewer-assignments');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Supervisor_TL Role Denied (403 FORBIDDEN) pada Endpoint Reviewer Sementara (ADR-002)', () => {
    beforeAll(() => {
      activeRole = Role.Supervisor_TL;
    });

    it('GET /api/v1/temporary-reviewer-assignments → HARUS 403 FORBIDDEN untuk Supervisor_TL (ADR-002)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/temporary-reviewer-assignments');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('POST /api/v1/temporary-reviewer-assignments → HARUS 403 FORBIDDEN untuk Supervisor_TL (SAD §10.2)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/temporary-reviewer-assignments')
        .send({
          reviewerUserId: validUuid2,
          scope: 'Engineering',
          reason: 'Cuti tahunan',
          effectiveDate: '2026-09-20',
          expiryDate: '2026-09-25',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Authorized Roles Allowed (Positive Verification)', () => {
    it('SystemAdmin diizinkan memanggil POST /api/v1/users (HTTP 201)', async () => {
      activeRole = Role.SystemAdmin;
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ fullName: 'Admin User' });

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
    });

    it('HRGA diizinkan memanggil GET /api/v1/users (HTTP 200)', async () => {
      activeRole = Role.HRGA;
      const response = await request(app.getHttpServer())
        .get('/api/v1/users');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('Head diizinkan memanggil POST /api/v1/project-authority-mappings (HTTP 201)', async () => {
      activeRole = Role.Head;
      const response = await request(app.getHttpServer())
        .post('/api/v1/project-authority-mappings')
        .send({ scopeReference: 'Project Alpha' });

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
    });

    it('HRGA diizinkan memanggil POST /api/v1/compliance-events/:id/record-warning (HTTP 200)', async () => {
      activeRole = Role.HRGA;
      const response = await request(app.getHttpServer())
        .post(`/api/v1/compliance-events/${validUuid5}/record-warning`)
        .send({ note: 'Peringatan resmi' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('SystemAdmin diizinkan memanggil POST /api/v1/auth/admin-reset-password/:userId (HTTP 200)', async () => {
      activeRole = Role.SystemAdmin;
      const response = await request(app.getHttpServer())
        .post(`/api/v1/auth/admin-reset-password/${validUuid4}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('SystemAdmin diizinkan memanggil GET /api/v1/temporary-reviewer-assignments (HTTP 200 - ADR-002)', async () => {
      activeRole = Role.SystemAdmin;
      const response = await request(app.getHttpServer())
        .get('/api/v1/temporary-reviewer-assignments');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('Head diizinkan memanggil GET /api/v1/temporary-reviewer-assignments (HTTP 200 - ADR-002)', async () => {
      activeRole = Role.Head;
      const response = await request(app.getHttpServer())
        .get('/api/v1/temporary-reviewer-assignments');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });
});
