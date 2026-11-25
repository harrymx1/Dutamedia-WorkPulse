import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '../api/client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  jobTitle?: string | null;
  function?: string | null;
  employmentStatus?: 'PERMANENT' | 'CONTRACT' | 'INTERN' | null;
  assignmentEffectiveDate?: string | null;
  assignmentEndDate?: string | null;
  managerName?: string | null;
  hasSubordinates?: boolean;
  isTemporaryReviewer?: boolean;
  isProjectLead?: boolean;
  isPolicyOwner?: boolean;
  ownedPolicyCategories?: string[];
  isCategoryOwner?: boolean;
  ownedBlockerCategories?: string[];
  activeExemption?: {
    type: 'BOUNDED' | 'PERMANENT' | 'ROLE_INDEFINITE';
    category: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
  reminderSchedule?: {
    leadMinutes: number;
    morningReminderTime: string;
    eodReminderTime: string;
    morningOnTimeCutoff: string;
    eodOnTimeCutoff: string;
  } | null;
}

export interface InvitationPreviewResult {
  valid: boolean;
  status: 'PENDING' | 'USED' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND';
  message?: string;
  account?: {
    fullName: string;
    email: string;
    department: string | null;
    jobTitle: string | null;
  };
}

function sanitizeUserProfile(u: UserProfile | null | undefined): UserProfile | null {
  if (!u) return null;
  return {
    ...u,
    fullName: u.fullName ? u.fullName.replace(/\s*\([^)]*\)/g, '').trim() : u.fullName,
  };
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const isSuperAdmin = computed(() => user.value?.role === 'SYSTEM_ADMIN');
  const isHRGA = computed(() => user.value?.role === 'HRGA');

  async function login(email: string, password: string): Promise<UserProfile> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient<{ user: UserProfile }>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      user.value = sanitizeUserProfile(res.data.user);
      return user.value!;
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

  async function previewInvitation(token: string): Promise<InvitationPreviewResult> {
    const res = await apiClient<InvitationPreviewResult>(
      `/v1/auth/invitation-preview?token=${encodeURIComponent(token.trim())}`,
    );
    return res.data;
  }

  async function fetchMe(): Promise<UserProfile | null> {
    isLoading.value = true;
    try {
      const res = await apiClient<{ user: UserProfile }>('/v1/auth/me');
      user.value = sanitizeUserProfile(res.data.user);
      return user.value;
    } catch {
      user.value = null;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string,
    revokeOtherSessions = true,
  ): Promise<string> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await apiClient<{ message: string }>('/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions }),
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
    previewInvitation,
    fetchMe,
    changePassword,
  };
});
