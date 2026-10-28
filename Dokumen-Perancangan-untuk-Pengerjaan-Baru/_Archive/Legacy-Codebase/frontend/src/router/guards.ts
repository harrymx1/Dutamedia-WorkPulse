import type { Router } from 'vue-router';
import { useAuthStore } from '../stores/auth.store.js';
import { registerUnauthorizedHandler } from '../api/client.js';

/**
 * Setup navigation guards sesuai SAD §16.4 dan §17.2:
 * 1. Global 401 interceptor redirect ke /login
 * 2. Mandatory reset-password enforcement
 * 3. Role-based conditional navigation
 */
export function setupRouterGuards(router: Router): void {
  // Daftarkan global 401 handler dari API client (SAD §17.2)
  registerUnauthorizedHandler(() => {
    const authStore = useAuthStore();
    authStore.reset();
    if (router.currentRoute.value.path !== '/login') {
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath },
      });
    }
  });

  router.beforeEach(async (to, _from) => {
    const authStore = useAuthStore();

    // Inisialisasi sesi pengguna pada navigasi awal jika belum dimuat (SAD §16.3)
    if (!authStore.isInitialized) {
      await authStore.fetchMe();
    }

    const requiresAuth = to.meta.requiresAuth !== false;

    // 1. Skenario belum login dan halaman butuh autentikasi
    if (requiresAuth && !authStore.isAuthenticated) {
      return {
        path: '/login',
        query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
      };
    }

    // 2. Skenario pengguna terautentikasi
    if (authStore.isAuthenticated) {
      // SAD §17.2: mustResetPassword wajib redirect paksa ke /reset-password
      if (authStore.mustResetPassword && to.path !== '/reset-password') {
        return { path: '/reset-password' };
      }

      // Jika password sudah direset, jangan biarkan akses /reset-password
      if (!authStore.mustResetPassword && to.path === '/reset-password') {
        const homePath = authStore.hasRole('Supervisor_TL') ? '/team' : '/today';
        return { path: homePath };
      }

      // Pengguna aktif mengakses /login atau / dialihkan ke beranda kerja sesuai peran
      if (to.path === '/login' || to.path === '/') {
        const homePath = authStore.hasRole('Supervisor_TL') ? '/team' : '/today';
        return { path: homePath };
      }

      const allowedRoles = to.meta.roles as any;
      if (allowedRoles && allowedRoles.length > 0) {
        if (!authStore.hasRole(allowedRoles)) {
          // Navigasi dibelokkan ke home role untuk mencegah akses rute di luar role
          const fallbackPath = authStore.hasRole('Supervisor_TL') ? '/team' : '/today';
          return { path: fallbackPath };
        }
      }
    }

    return true;
  });
}
