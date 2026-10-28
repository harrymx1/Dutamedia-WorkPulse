import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '../api/client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const isSuperAdmin = computed(() => user.value?.role === 'SYSTEM_ADMIN');
  const isHRGA = computed(() => user.value?.role === 'HRGA');

  async function login(email: string, password: string):Promise<UserProfile> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient<{ user: UserProfile }>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      user.value = res.data.user;
      return res.data.user;
    } catch (err: any) {
      error.value = err.message || 'Login gagal';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true;
    try {
      await apiClient('/v1/auth/logout', { method: 'POST' });
    } catch {
      // Abaikan error jaringan saat logout
    } finally {
      user.value = null;
      isLoading.value = false;
    }
  }

  async function activate(token: string, password: string): Promise<string> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient<{ message: string }>('/v1/auth/activate', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      return res.data.message;
    } catch (err: any) {
      error.value = err.message || 'Aktivasi akun gagal';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMe(): Promise<UserProfile | null> {
    isLoading.value = true;
    try {
      const res = await apiClient<{ user: UserProfile }>('/v1/auth/me');
      user.value = res.data.user;
      return user.value;
    } catch {
      user.value = null;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<string> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient<{ message: string }>('/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return res.data.message;
    } catch (err: any) {
      error.value = err.message || 'Gagal mengubah kata sandi';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isSuperAdmin,
    isHRGA,
    login,
    logout,
    activate,
    fetchMe,
    changePassword,
  };
});
