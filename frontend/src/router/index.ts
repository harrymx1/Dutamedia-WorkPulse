import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/auth/LoginView.vue';
import ActivateView from '../views/auth/ActivateView.vue';
import ProfileView from '../views/profile/ProfileView.vue';
import AdminUsersView from '../views/admin/AdminUsersView.vue';
import OrgMappingView from '../views/admin/OrgMappingView.vue';
import TempReviewerView from '../views/admin/TempReviewerView.vue';
import PolicySettingsView from '../views/admin/PolicySettingsView.vue';
import MorningCommitmentView from '../views/daily/MorningCommitmentView.vue';
import AdditionalWorkView from '../views/daily/AdditionalWorkView.vue';
import EodOutcomeView from '../views/daily/EodOutcomeView.vue';
import MyHistoryView from '../views/daily/MyHistoryView.vue';
import RaiseBlockerView from '../views/blockers/RaiseBlockerView.vue';
import BlockerQueueView from '../views/blockers/BlockerQueueView.vue';
import EscalationAgingView from '../views/blockers/EscalationAgingView.vue';
import ManagerNoteCoachingView from '../views/coaching/ManagerNoteCoachingView.vue';
import ComplianceQueueView from '../views/hrga/ComplianceQueueView.vue';
import ExemptionManagementView from '../views/hrga/ExemptionManagementView.vue';
import MorningCorrectionRequestView from '../views/corrections/MorningCorrectionRequestView.vue';
import EodCorrectionRequestView from '../views/corrections/EodCorrectionRequestView.vue';
import CorrectionReviewView from '../views/corrections/CorrectionReviewView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/activate',
    name: 'activate',
    component: ActivateView,
    meta: { guestOnly: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersView,
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'HRGA'] },
  },
  {
    path: '/admin/organization',
    name: 'admin-organization',
    component: OrgMappingView,
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'HRGA'] },
  },
  {
    path: '/admin/temporary-reviewers',
    name: 'admin-temporary-reviewers',
    component: TempReviewerView,
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'HRGA'] },
  },
  {
    path: '/admin/policies',
    name: 'admin-policies',
    component: PolicySettingsView,
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA'] },
  },
  {
    path: '/daily/morning',
    name: 'daily-morning',
    component: MorningCommitmentView,
    meta: { requiresAuth: true },
  },
  {
    path: '/daily/additional-work',
    name: 'daily-additional-work',
    component: AdditionalWorkView,
    meta: { requiresAuth: true },
  },
  {
    path: '/daily/eod',
    name: 'daily-eod',
    component: EodOutcomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/daily/history',
    name: 'daily-history',
    component: MyHistoryView,
    meta: { requiresAuth: true },
  },
  {
    path: '/blockers/raise',
    name: 'blockers-raise',
    component: RaiseBlockerView,
    meta: { requiresAuth: true },
  },
  {
    path: '/blockers',
    name: 'blockers-queue',
    component: BlockerQueueView,
    meta: { requiresAuth: true },
  },
  {
    path: '/blockers/aging',
    name: 'blockers-aging',
    component: EscalationAgingView,
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA'] },
  },
  {
    path: '/coaching',
    name: 'coaching-notes',
    component: ManagerNoteCoachingView,
    meta: { requiresAuth: true },
  },
  {
    path: '/compliance',
    name: 'compliance-queue',
    component: ComplianceQueueView,
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HRGA'] },
  },
  {
    path: '/exemptions',
    name: 'exemption-management',
    component: ExemptionManagementView,
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HRGA'] },
  },
  {
    path: '/corrections/morning',
    name: 'corrections-morning',
    component: MorningCorrectionRequestView,
    meta: { requiresAuth: true },
  },
  {
    path: '/corrections/eod',
    name: 'corrections-eod',
    component: EodCorrectionRequestView,
    meta: { requiresAuth: true },
  },
  {
    path: '/corrections/review',
    name: 'corrections-review',
    component: CorrectionReviewView,
    meta: { requiresAuth: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      const user = await authStore.fetchMe();
      if (!user) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
      }
    }

    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const allowedRoles = to.meta.roles as string[];
      if (!authStore.user?.role || !allowedRoles.includes(authStore.user.role)) {
        return next({ name: 'profile' });
      }
    }
  }

  next();
});

export default router;

