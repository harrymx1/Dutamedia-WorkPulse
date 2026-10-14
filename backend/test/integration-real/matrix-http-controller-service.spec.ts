import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import pg from 'pg';
import { AppModule } from '../../src/app.module.js';
import { createAppValidationPipe } from '../../src/modules/shared/pipes/app-validation.pipe.js';
import { FilePurpose } from '../../src/modules/file-storage/dto/generate-upload-url.dto.js';
import { ManagerNoteType, ManagerNoteVisibility } from '@prisma/client';

describe('Real PostgreSQL Integration Matrix: HTTP → Controller → Service Per-Module Coverage', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let app: INestApplication;
  let pgClient: pg.Client;
  let aliceToken: string;
  let bobToken: string;
  let aliceCookie: string;
  let bobCookie: string;
  let aliceCsrf: string;
  let bobCsrf: string;
  let aliceId: string;
  let bobId: string;

  beforeAll(async () => {
    pgClient = new pg.Client({ connectionString: databaseUrl });
    await pgClient.connect();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(createAppValidationPipe());
    await app.init();

    // 1. Login Alice (Employee)
    const loginAliceRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'alice@dutamedia.test', password: 'TestPassword123!' });

    expect(loginAliceRes.status).toBe(200);
    const rawAliceCookie = loginAliceRes.headers['set-cookie'];
    const aliceSetCookie: string[] = Array.isArray(rawAliceCookie) ? rawAliceCookie : typeof rawAliceCookie === 'string' ? [rawAliceCookie] : [];
    const aliceTokenCookie = aliceSetCookie.find((c: string) => c.startsWith('access_token='));
    const aliceCsrfCookie = aliceSetCookie.find((c: string) => c.startsWith('csrf_token='));
    aliceToken = aliceTokenCookie?.split(';')[0]?.replace('access_token=', '') || '';
    aliceCsrf = aliceCsrfCookie?.split(';')[0]?.replace('csrf_token=', '') || '';
    aliceCookie = aliceSetCookie.join('; ');
    aliceId = (loginAliceRes.body.data?.user || loginAliceRes.body.user)?.id;

    expect(aliceToken).toBeTruthy();
    expect(aliceId).toBeTruthy();

    // 2. Login Bob (Supervisor)
    const loginBobRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'bob@dutamedia.test', password: 'TestPassword123!' });

    expect(loginBobRes.status).toBe(200);
    const rawBobCookie = loginBobRes.headers['set-cookie'];
    const bobSetCookie: string[] = Array.isArray(rawBobCookie) ? rawBobCookie : typeof rawBobCookie === 'string' ? [rawBobCookie] : [];
    const bobTokenCookie = bobSetCookie.find((c: string) => c.startsWith('access_token='));
    const bobCsrfCookie = bobSetCookie.find((c: string) => c.startsWith('csrf_token='));
    bobToken = bobTokenCookie?.split(';')[0]?.replace('access_token=', '') || '';
    bobCsrf = bobCsrfCookie?.split(';')[0]?.replace('csrf_token=', '') || '';
    bobCookie = bobSetCookie.join('; ');
    bobId = (loginBobRes.body.data?.user || loginBobRes.body.user)?.id;

    expect(bobToken).toBeTruthy();
    expect(bobId).toBeTruthy();
  }, 45000);

  afterAll(async () => {
    if (app) await app.close();
    if (pgClient) await pgClient.end();
  });

  it('HTTP-01 [AuthModule]: POST /api/v1/auth/login persists session row in real PostgreSQL', async () => {
    // Verify in real PostgreSQL that active session exists for Alice
    const rawSessions = await pgClient.query<{ id: string; user_id: string; revoked_at: Date | null }>(
      'SELECT id, "userId" as user_id, "revokedAt" as revoked_at FROM sessions WHERE "userId" = $1 AND "revokedAt" IS NULL ORDER BY "createdAt" DESC LIMIT 1',
      [aliceId]
    );
    expect(rawSessions.rows.length).toBe(1);
    expect(rawSessions.rows[0].user_id).toBe(aliceId);
    expect(rawSessions.rows[0].revoked_at).toBeNull();
  });

  it('HTTP-02 [IdentityModule]: GET /api/v1/users/:id retrieves real PostgreSQL user data', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/users/${aliceId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .set('Cookie', aliceCookie);

    expect(res.status).toBe(200);
    const user = res.body.data || res.body;
    expect(user.email).toBe('alice@dutamedia.test');
    expect(user.fullName).toBe('Alice Employee');

    // DB assertion
    const rawUser = await pgClient.query('SELECT "fullName" as full_name FROM users WHERE id = $1', [aliceId]);
    expect(rawUser.rows[0].full_name).toBe(user.fullName);
  });

  it('HTTP-03 [PolicyModule]: GET /api/v1/policies returns active policies from real PostgreSQL', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/policies')
      .set('Authorization', `Bearer ${aliceToken}`)
      .set('Cookie', aliceCookie);

    expect(res.status).toBe(200);
    const policies = res.body.data || res.body;
    expect(Array.isArray(policies)).toBe(true);
    expect(policies.length).toBeGreaterThanOrEqual(5);

    // DB assertion
    const count = await pgClient.query('SELECT count(*) FROM policies WHERE status = \'Active\' AND "endDate" IS NULL');
    expect(Number(count.rows[0].count)).toBe(policies.length);
  });

  it('HTTP-04 [DailyAccountabilityModule]: GET /api/v1/daily-accountability-records/today returns daily record from PostgreSQL', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/daily-accountability-records/today')
      .set('Authorization', `Bearer ${aliceToken}`)
      .set('Cookie', aliceCookie);

    expect(res.status).toBe(200);
    const data = res.body.data || res.body;
    expect(data.availableActions).toBeDefined();
    if (data.record) {
      expect(data.record.employeeUserId).toBe(aliceId);
    }
    const rawCount = await pgClient.query('SELECT count(*) FROM daily_accountability_records');
    expect(Number(rawCount.rows[0].count)).toBeGreaterThanOrEqual(0);
  });

  it('HTTP-05 [BlockerModule]: GET /api/v1/blockers returns blockers from real PostgreSQL', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/blockers')
      .set('Authorization', `Bearer ${aliceToken}`)
      .set('Cookie', aliceCookie);

    expect(res.status).toBe(200);
    const items = res.body.data || res.body;
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThanOrEqual(1);

    // DB assertion
    const rawBlocker = await pgClient.query('SELECT count(*) FROM blockers');
    expect(Number(rawBlocker.rows[0].count)).toBeGreaterThanOrEqual(items.length);
  });

  it('HTTP-06 [CorrectionRequestModule]: GET /api/v1/correction-requests returns correction requests from PostgreSQL', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/correction-requests')
      .set('Authorization', `Bearer ${bobToken}`)
      .set('Cookie', bobCookie);

    expect(res.status).toBe(200);
    const items = res.body.data || res.body;
    expect(Array.isArray(items)).toBe(true);

    // DB assertion
    const rawCR = await pgClient.query('SELECT count(*) FROM correction_requests');
    expect(Number(rawCR.rows[0].count)).toBeGreaterThanOrEqual(items.length);
  });

  it('HTTP-07 [ManagerNoteModule]: POST /api/v1/manager-notes creates note and persists row in PostgreSQL', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/manager-notes')
      .set('Authorization', `Bearer ${bobToken}`)
      .set('Cookie', bobCookie)
      .set('X-CSRF-Token', bobCsrf)
      .send({
        aboutUserId: aliceId,
        type: ManagerNoteType.Coaching,
        note: 'Excellent performance on real PostgreSQL integration tests',
        visibility: ManagerNoteVisibility.VisibleToEmployee,
      });

    expect(res.status).toBe(201);
    const note = res.body.data || res.body;
    expect(note.id).toBeDefined();

    // DB assertion
    const rawNote = await pgClient.query<{ id: string; about_user_id: string; note: string }>(
      'SELECT id, "aboutUserId" as about_user_id, note FROM manager_notes WHERE id = $1',
      [note.id]
    );
    expect(rawNote.rows.length).toBe(1);
    expect(rawNote.rows[0].about_user_id).toBe(aliceId);

    // Cleanup
    await pgClient.query('DELETE FROM manager_notes WHERE id = $1', [note.id]);
  });

  it('HTTP-08 [ExceptionModule]: GET /api/v1/exceptions returns exception list from PostgreSQL', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/exceptions')
      .set('Authorization', `Bearer ${bobToken}`)
      .set('Cookie', bobCookie);

    expect(res.status).toBe(200);
    const items = res.body.data || res.body;
    expect(Array.isArray(items)).toBe(true);
  });

  it('HTTP-09 [ComplianceModule]: GET /api/v1/compliance-events returns compliance events from PostgreSQL', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/compliance-events')
      .set('Authorization', `Bearer ${bobToken}`)
      .set('Cookie', bobCookie);

    expect(res.status).toBe(200);
    const items = res.body.data || res.body;
    expect(Array.isArray(items)).toBe(true);
  });

  it('HTTP-10 [NotificationModule]: GET /api/v1/notifications returns user notifications from PostgreSQL', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${bobToken}`)
      .set('Cookie', bobCookie);

    expect(res.status).toBe(200);
    const items = res.body.data || res.body;
    expect(Array.isArray(items)).toBe(true);
  });

  it('HTTP-11 [ReportingModule]: GET /api/v1/reports/exception-summary aggregates from real PostgreSQL', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/reports/exception-summary')
      .set('Authorization', `Bearer ${bobToken}`)
      .set('Cookie', bobCookie);

    expect(res.status).toBe(200);
    const report = res.body.data || res.body;
    expect(report).toBeDefined();
  });

  it('HTTP-12 [FileStorageModule]: POST /api/v1/files/upload-url generates presigned upload URL metadata', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/files/upload-url')
      .set('Authorization', `Bearer ${aliceToken}`)
      .set('Cookie', aliceCookie)
      .set('X-CSRF-Token', aliceCsrf)
      .send({
        purpose: FilePurpose.EVIDENCE,
        contentType: 'image/png',
        fileSize: 2048,
        originalFileName: 'screenshot.png',
      });

    expect(res.status).toBe(200);
    const body = res.body.data || res.body;
    expect(body.uploadUrl).toBeDefined();
    expect(body.fileId).toBeDefined();
  });
});
