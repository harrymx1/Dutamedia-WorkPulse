import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth.api.js';
import type { AuthUser, LoginCredentials, Role } from '../types/auth.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const isInitialized = ref<boolean>(false);
  const isLoading = ref<boolean>(false);

  const isAuthenticated = computed<boolean>(() => !!user.value);
  const currentRole = computed<Role | null>(() => user.value?.role ?? null);
  const mustResetPassword = computed<boolean>(
    () => !!user.value?.mustResetPassword,
  );

  /**
   * Pengecekan role pengguna untuk render kondisional (SAD §16.4).
   */
  function hasRole(roles: Role | Role[]): boolean {
    if (!user.value || !user.value.role) return false;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return allowed.includes(user.value.role);
  }

  function setUser(newUser: AuthUser | null): void {
    user.value = newUser;
  }

  /**
   * Mengambil data user dari backend (GET /auth/me) untuk bootstrap sesi (SAD §16.3).
   */
  async function fetchMe(): Promise<AuthUser | null> {
    isLoading.value = true;
    try {
      const response = await authApi.getMe();
      user.value = response.data;
      return response.data;
    } catch {
      user.value = null;
      return null;
    } finally {
      isInitialized.value = true;
      isLoading.value = false;
    }
  }

  /**
   * Login user dan simpan data profil ke store (SAD §10.1).
   */
  async function login(credentials: LoginCredentials): Promise<AuthUser> {
    isLoading.value = true;
    try {
      const response = await authApi.login(credentials);
      user.value = response.data.user;
      isInitialized.value = true;
      return response.data.user;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout user, membersihkan sesi backend dan client state (SAD §8.4, §10.1).
   */
  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Abaikan jika network gagal saat logout
    } finally {
      reset();
    }
  }

  /**
   * Reset store client state saat unauthenticated / 401 (SAD §17.2).
   */
  function reset(): void {
    user.value = null;
    isInitialized.value = true;
    isLoading.value = false;
  }

  return {
    user,
    isInitialized,
    isLoading,
    isAuthenticated,
    currentRole,
    mustResetPassword,
    hasRole,
    setUser,
    fetchMe,
    login,
    logout,
    reset,
  };
});
