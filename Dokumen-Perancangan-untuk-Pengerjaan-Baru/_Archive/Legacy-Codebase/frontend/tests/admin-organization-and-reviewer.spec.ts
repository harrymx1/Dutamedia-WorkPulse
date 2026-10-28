import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identityApi } from '../src/api/identity.api.js';
import { apiClient } from '../src/api/client.js';
import {
  USER_KEYS,
  useUserAssignmentsQuery,
  useCreateOrgAssignmentMutation,
  useCreateProjectAuthorityMutation,
  useUpdateProjectAuthorityMutation,
  useCreateTempReviewerMutation,
  useTempReviewersQuery,
} from '../src/queries/useUsers.js';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createApp, type App } from 'vue';

describe('Admin Organization & Temporary Reviewer Tabs (SAD §10.2, BR-10, BR-11, SAD §16.3, §17.4)', () => {
  let queryClient: QueryClient;
  let app: App;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    app = createApp({});
    app.use(VueQueryPlugin, { queryClient });
    vi.clearAllMocks();
  });

  describe('identityApi client — Organization & Reviewer endpoints (SAD §10.2)', () => {
    it('getOrganizationalAssignments harus memanggil GET /users/:id/organizational-assignments', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: [
          {
            id: 'oa-1',
            userId: 'u1',
            role: 'Employee',
            function: 'Engineering',
            effectiveDate: '2026-01-01',
            endDate: null,
          },
        ],
      } as any);

      const result = await identityApi.getOrganizationalAssignments('u1');

      expect(getSpy).toHaveBeenCalledWith('/users/u1/organizational-assignments');
      expect(result.data).toHaveLength(1);
    });

    it('createOrganizationalAssignment harus memanggil POST /organizational-assignments (BR-10)', async () => {
      const payload = {
        userId: 'u1',
        role: 'Supervisor_TL' as const,
        function: 'Engineering',
        directManagerId: 'mgr-1',
        effectiveDate: '2026-09-18',
      };

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: { id: 'oa-new', ...payload, endDate: null },
      } as any);

      const result = await identityApi.createOrganizationalAssignment(payload);

      expect(postSpy).toHaveBeenCalledWith('/organizational-assignments', payload);
      expect(result.data.id).toBe('oa-new');
    });

    it('createProjectAuthorityMapping harus memanggil POST /project-authority-mappings', async () => {
      const payload = {
        userId: 'u1',
        scopeReference: 'Project-Alpha',
        effectiveDate: '2026-09-18',
        endDate: '2026-12-31',
      };

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: { id: 'pam-1', ...payload },
      } as any);

      const result = await identityApi.createProjectAuthorityMapping(payload);

      expect(postSpy).toHaveBeenCalledWith('/project-authority-mappings', payload);
      expect(result.data.id).toBe('pam-1');
    });

    it('updateProjectAuthorityMapping harus memanggil PATCH /project-authority-mappings/:id', async () => {
      const payload = { endDate: '2026-10-01' };

      const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
        data: { id: 'pam-1', scopeReference: 'Project-Alpha', endDate: '2026-10-01' },
      } as any);

      const result = await identityApi.updateProjectAuthorityMapping('pam-1', payload);

      expect(patchSpy).toHaveBeenCalledWith('/project-authority-mappings/pam-1', payload);
      expect(result.data.endDate).toBe('2026-10-01');
    });

    it('createTemporaryReviewerAssignment harus memanggil POST /temporary-reviewer-assignments (BR-11)', async () => {
      const payload = {
        reviewerUserId: 'u-delegate',
        scope: 'Engineering',
        reason: 'Atasan Cuti Tahunan',
        effectiveDate: '2026-09-18',
        expiryDate: '2026-09-25',
      };

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: { id: 'tra-1', ...payload },
      } as any);

      const result = await identityApi.createTemporaryReviewerAssignment(payload);

      expect(postSpy).toHaveBeenCalledWith('/temporary-reviewer-assignments', payload);
      expect(result.data.id).toBe('tra-1');
    });

    it('getTemporaryReviewerAssignments harus memanggil GET /temporary-reviewer-assignments (ADR-002)', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: [
          {
            id: 'tra-1',
            reviewerUserId: 'u-delegate',
            scope: 'Engineering',
            reason: 'Atasan Cuti',
            effectiveDate: '2026-09-18',
            expiryDate: '2026-09-25',
          },
        ],
      } as any);

      const result = await identityApi.getTemporaryReviewerAssignments({
        scope: 'Engineering',
        activeOnly: true,
      });

      expect(getSpy).toHaveBeenCalledWith(
        '/temporary-reviewer-assignments?scope=Engineering&activeOnly=true',
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('TanStack Query Hooks & Automatic Invalidation (SAD §16.3, §17.4)', () => {
    it('useUserAssignmentsQuery harus memanggil identityApi.getOrganizationalAssignments', async () => {
      const getSpy = vi.spyOn(identityApi, 'getOrganizationalAssignments').mockResolvedValue({
        data: [
          {
            id: 'oa-1',
            userId: 'u1',
            role: 'Employee',
            function: 'Engineering',
            effectiveDate: '2026-01-01',
            endDate: null,
          },
        ],
      } as any);

      const query = app.runWithContext(() => useUserAssignmentsQuery('u1'));
      const res = await query.refetch();

      expect(getSpy).toHaveBeenCalledWith('u1');
      expect(res.data).toHaveLength(1);
    });

    it('useCreateOrgAssignmentMutation harus memanggil API dan meng-invalidsi USER_KEYS.all', async () => {
      vi.spyOn(identityApi, 'createOrganizationalAssignment').mockResolvedValue({
        data: { id: 'oa-new', userId: 'u1', role: 'Head' },
      } as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const mutation = app.runWithContext(() => useCreateOrgAssignmentMutation());
      await mutation.mutateAsync({
        userId: 'u1',
        role: 'Head',
        function: 'Engineering',
        directManagerId: null,
        effectiveDate: '2026-09-18',
      });

      expect(identityApi.createOrganizationalAssignment).toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USER_KEYS.all });
    });

    it('useCreateProjectAuthorityMutation harus memanggil API dan meng-invalidsi USER_KEYS.all', async () => {
      vi.spyOn(identityApi, 'createProjectAuthorityMapping').mockResolvedValue({
        data: { id: 'pam-new', userId: 'u1', scopeReference: 'Project-Alpha' },
      } as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const mutation = app.runWithContext(() => useCreateProjectAuthorityMutation());
      await mutation.mutateAsync({
        userId: 'u1',
        scopeReference: 'Project-Alpha',
        effectiveDate: '2026-09-18',
      });

      expect(identityApi.createProjectAuthorityMapping).toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USER_KEYS.all });
    });

    it('useUpdateProjectAuthorityMutation harus memanggil API dan meng-invalidsi USER_KEYS.all', async () => {
      vi.spyOn(identityApi, 'updateProjectAuthorityMapping').mockResolvedValue({
        data: { id: 'pam-1', endDate: '2026-10-01' },
      } as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const mutation = app.runWithContext(() => useUpdateProjectAuthorityMutation());
      await mutation.mutateAsync({
        id: 'pam-1',
        payload: { endDate: '2026-10-01' },
      });

      expect(identityApi.updateProjectAuthorityMapping).toHaveBeenCalledWith('pam-1', {
        endDate: '2026-10-01',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USER_KEYS.all });
    });

    it('useCreateTempReviewerMutation harus memanggil API dan meng-invalidsi USER_KEYS.all (BR-11)', async () => {
      vi.spyOn(identityApi, 'createTemporaryReviewerAssignment').mockResolvedValue({
        data: { id: 'tra-new', reviewerUserId: 'u-rev', scope: 'Engineering' },
      } as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const mutation = app.runWithContext(() => useCreateTempReviewerMutation());
      await mutation.mutateAsync({
        reviewerUserId: 'u-rev',
        scope: 'Engineering',
        reason: 'Atasan Cuti',
        effectiveDate: '2026-09-18',
        expiryDate: '2026-09-25',
      });

      expect(identityApi.createTemporaryReviewerAssignment).toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USER_KEYS.all });
    });

    it('useTempReviewersQuery harus memanggil identityApi.getTemporaryReviewerAssignments (ADR-002)', async () => {
      const getSpy = vi.spyOn(identityApi, 'getTemporaryReviewerAssignments').mockResolvedValue({
        data: [
          {
            id: 'tra-1',
            reviewerUserId: 'u-delegate',
            scope: 'Engineering',
            effectiveDate: '2026-09-18',
            expiryDate: '2026-09-25',
          },
        ],
      } as any);

      const query = app.runWithContext(() => useTempReviewersQuery({ activeOnly: true }));
      const res = await query.refetch();

      expect(getSpy).toHaveBeenCalledWith({ activeOnly: true });
      expect(res.data).toHaveLength(1);
    });
  });
});
