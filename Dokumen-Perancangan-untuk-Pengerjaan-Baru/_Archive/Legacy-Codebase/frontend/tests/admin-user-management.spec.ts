import { describe, it, expect, vi, beforeEach } from 'vitest';
import { identityApi } from '../src/api/identity.api.js';
import { authApi } from '../src/api/auth.api.js';
import { apiClient } from '../src/api/client.js';
import {
  USER_KEYS,
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserStatusMutation,
  useAdminResetPasswordMutation,
} from '../src/queries/useUsers.js';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createApp, type App } from 'vue';

describe('Admin User Management & IdentityModule (SAD §10.2, §16.3, §17.4)', () => {
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


  describe('identityApi client', () => {
    it('harus memanggil GET /users dengan query params yang benar', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: {
          items: [],
          pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
        },
      } as any);

      await identityApi.getUsers({ search: 'budi', role: 'Employee', status: 'Active' });

      expect(getSpy).toHaveBeenCalledWith(
        expect.stringContaining('/users?status=Active&role=Employee&search=budi'),
      );
    });

    it('harus memanggil POST /users untuk membuat user baru', async () => {
      const payload = {
        fullName: 'Budi Santoso',
        email: 'budi@dutamedia.com',
        initialRole: 'Employee' as const,
        function: 'Engineering',
        effectiveDate: '2026-09-18',
      };

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: {
          user: { id: 'u1', fullName: payload.fullName, email: payload.email, status: 'Active' },
          assignment: { id: 'a1', role: payload.initialRole },
          temporaryPassword: 'temp-pass-123',
        },
      } as any);

      const res = await identityApi.createUser(payload);

      expect(postSpy).toHaveBeenCalledWith('/users', payload);
      expect(res.data.temporaryPassword).toBe('temp-pass-123');
    });

    it('harus memanggil PATCH /users/:id untuk mengubah status user', async () => {
      const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
        data: { id: 'u1', status: 'Inactive' },
      } as any);

      await identityApi.updateUserStatus('u1', { status: 'Inactive' });

      expect(patchSpy).toHaveBeenCalledWith('/users/u1', { status: 'Inactive' });
    });
  });

  describe('TanStack Query Hooks & Invalidation (SAD §16.3, §17.4)', () => {
    it('USER_KEYS harus terstruktur konsisten', () => {
      expect(USER_KEYS.all).toEqual(['users']);
      expect(USER_KEYS.list({ search: 'test' })).toEqual(['users', 'list', { search: 'test' }]);
      expect(USER_KEYS.detail('u1')).toEqual(['users', 'detail', 'u1']);
      expect(USER_KEYS.assignments('u1')).toEqual(['users', 'assignments', 'u1']);
    });

    it('useUsersQuery harus memanggil identityApi.getUsers dengan query parameters yang sesuai', async () => {
      const getSpy = vi.spyOn(identityApi, 'getUsers').mockResolvedValue({
        data: {
          items: [],
          pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
        },
      } as any);

      const query = app.runWithContext(() => useUsersQuery({ role: 'Employee' }));
      await query.refetch();

      expect(getSpy).toHaveBeenCalledWith({ role: 'Employee' });
    });

    it('useCreateUserMutation harus memanggil identityApi.createUser dan meng-invalidsi USER_KEYS.all', async () => {
      vi.spyOn(identityApi, 'createUser').mockResolvedValue({
        data: {
          user: { id: 'u-new', fullName: 'New User' },
          temporaryPassword: 'temp-pass-abc',
        },
      } as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');


      const mutation = app.runWithContext(() => useCreateUserMutation());

      await mutation.mutateAsync({
        fullName: 'New User',
        email: 'new@dutamedia.com',
        initialRole: 'Employee',
        function: 'Ops',
        effectiveDate: '2026-09-18',
      });

      expect(identityApi.createUser).toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USER_KEYS.all });
    });

    it('useUpdateUserStatusMutation harus memanggil identityApi.updateUserStatus dan meng-invalidsi USER_KEYS.all', async () => {
      vi.spyOn(identityApi, 'updateUserStatus').mockResolvedValue({
        data: { id: 'u1', status: 'Inactive' },
      } as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const mutation = app.runWithContext(() => useUpdateUserStatusMutation());

      await mutation.mutateAsync({
        id: 'u1',
        payload: { status: 'Inactive' },
      });

      expect(identityApi.updateUserStatus).toHaveBeenCalledWith('u1', { status: 'Inactive' });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USER_KEYS.all });
    });

    it('useAdminResetPasswordMutation harus memanggil authApi.adminResetPassword dan meng-invalidsi USER_KEYS.all', async () => {
      vi.spyOn(authApi, 'adminResetPassword').mockResolvedValue({
        data: { temporaryPassword: 'new-temp-pass-456' },
      } as any);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const mutation = app.runWithContext(() => useAdminResetPasswordMutation());

      const res = await mutation.mutateAsync('u1');

      expect(authApi.adminResetPassword).toHaveBeenCalledWith('u1');
      expect(res.temporaryPassword).toBe('new-temp-pass-456');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USER_KEYS.all });
    });
  });
});

