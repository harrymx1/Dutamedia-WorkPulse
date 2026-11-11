import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  getLandingRouteForRole,
  OPERATIONAL_ROLES,
  ALL_MANAGERIAL,
  ADMIN_LEVEL,
  HR_APPROVAL_ROLES,
  canAccessRoute,
} from './navigation';
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
import MyLeaveRequestView from '../views/leave/MyLeaveRequestView.vue';
import LeaveApprovalQueueView from '../views/leave/LeaveApprovalQueueView.vue';
import NotificationCenterView from '../views/notifications/NotificationCenterView.vue';
import NotificationChannelSetupView from '../views/admin/NotificationChannelSetupView.vue';
import PulseDashboardView from '../views/dashboard/PulseDashboardView.vue';
import ProjectRiskView from '../views/projects/ProjectRiskView.vue';
import ExecutiveReportsView from '../views/reports/ExecutiveReportsView.vue';
import AdminUserInvitationView from '../views/admin/AdminUserInvitationView.vue';
import ErrorPageView from '../views/system/ErrorPageView.vue';

const routes: RouteRecordRaw[] = [
  {
    // Diputuskan oleh router.beforeEach (login -> /dashboard, belum login -> /login)
    path: '/',
    name: 'root',
    component: LoginView,
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
    meta: { requiresAuth: true, roles: ADMIN_LEVEL },
  },
  {
    path: '/admin/organization',
    name: 'admin-organization',
    component: OrgMappingView,
    meta: { requiresAuth: true, roles: ADMIN_LEVEL },
  },
  {
    path: '/admin/temporary-reviewers',
    name: 'admin-temporary-reviewers',
    component: TempReviewerView,
    meta: { requiresAuth: true, roles: ADMIN_LEVEL },
  },
  {
    path: '/admin/policies',
    name: 'admin-policies',
    component: PolicySettingsView,
    meta: { requiresAuth: true, roles: ADMIN_LEVEL },
  },
  {
    path: '/daily',
    redirect: '/daily/morning',
  },
  {
    path: '/daily/morning',
    name: 'daily-morning',
    component: MorningCommitmentView,
    meta: { requiresAuth: true, roles: OPERATIONAL_ROLES },
  },
  {
    path: '/daily/additional-work',
    name: 'daily-additional-work',
    component: AdditionalWorkView,
    meta: { requiresAuth: true, roles: OPERATIONAL_ROLES },
  },
  {
    path: '/daily/eod',
    name: 'daily-eod',
    component: EodOutcomeView,
    meta: { requiresAuth: true, roles: OPERATIONAL_ROLES },
  },
  {
    path: '/daily/history',
    name: 'daily-history',
    component: MyHistoryView,
    meta: { requiresAuth: true, roles: OPERATIONAL_ROLES },
  },
  {
    path: '/raise-blockers',
    name: 'raise-blockers',
    component: RaiseBlockerView,
    meta: { requiresAuth: true, roles: OPERATIONAL_ROLES },
  },
  {
    path: '/blockers/raise',
    redirect: '/raise-blockers',
  },
  {
    path: '/blockers',
    name: 'blockers-queue',
    component: BlockerQueueView,
    meta: { requiresAuth: true, roles: ALL_MANAGERIAL, allowProjectLead: true, allowTemporaryReviewer: true },
  },
  {
    path: '/blockers/aging',
    name: 'blockers-aging',
    component: EscalationAgingView,
    meta: { requiresAuth: true, roles: ALL_MANAGERIAL, allowProjectLead: true, allowTemporaryReviewer: true },
  },
  {
    path: '/coaching',
    name: 'coaching-notes',
    component: ManagerNoteCoachingView,
    meta: { requiresAuth: true, requiresSubordinates: true },
  },
  {
    path: '/compliance',
    name: 'compliance-queue',
    component: ComplianceQueueView,
    meta: { requiresAuth: true, roles: ADMIN_LEVEL },
  },
  {
    path: '/exemptions',
    name: 'exemption-management',
    component: ExemptionManagementView,
    meta: { requiresAuth: true, roles: ADMIN_LEVEL },
  },
  {
    path: '/corrections/morning',
    name: 'corrections-morning',
    component: MorningCorrectionRequestView,
    meta: { requiresAuth: true, roles: OPERATIONAL_ROLES },
  },
  {
    path: '/corrections/eod',
    name: 'corrections-eod',
    component: EodCorrectionRequestView,
    meta: { requiresAuth: true, roles: OPERATIONAL_ROLES },
  },
  {
    path: '/corrections/review',
    name: 'corrections-review',
    component: CorrectionReviewView,
    meta: { requiresAuth: true, roles: HR_APPROVAL_ROLES, allowTemporaryReviewer: true },
  },
  {
    path: '/leave/my',
    name: 'leave-my',
    component: MyLeaveRequestView,
    meta: { requiresAuth: true, roles: OPERATIONAL_ROLES },
  },
  {
    path: '/leave/queue',
    name: 'leave-queue',
    component: LeaveApprovalQueueView,
    meta: { requiresAuth: true, roles: HR_APPROVAL_ROLES, allowTemporaryReviewer: true },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationCenterView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/notifications',
    name: 'admin-notifications',
    component: NotificationChannelSetupView,
    meta: { requiresAuth: true, roles: ADMIN_LEVEL },
  },
  {
    path: '/dashboard',
    name: 'pulse-dashboard',
    component: PulseDashboardView,
    meta: { requiresAuth: true, roles: ALL_MANAGERIAL, allowProjectLead: true },
  },
  {
    path: '/projects/risk',
    name: 'project-risk',
    component: ProjectRiskView,
    meta: { requiresAuth: true, roles: ALL_MANAGERIAL, allowProjectLead: true },
  },
  {
    path: '/reports',
    name: 'executive-reports',
    component: ExecutiveReportsView,
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA'] },
  },
  {
    path: '/admin/invitations',
    name: 'admin-invitations',
    component: AdminUserInvitationView,
    meta: { requiresAuth: true, roles: ADMIN_LEVEL },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: ErrorPageView,
    meta: { requiresAuth: true, errorKind: 'forbidden' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: ErrorPageView,
    meta: { errorKind: 'not-found' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Pulihkan sesi (cookie) sekali bila belum diketahui, untuk rute akar & guest-only
  if (!authStore.isAuthenticated && (to.path === '/' || to.meta.guestOnly)) {
    await authStore.fetchMe();
  }

  // Rute akar: sudah login -> rute pendaratan sesuai peran, belum -> login
  if (to.path === '/') {
    if (authStore.isAuthenticated) {
      return next(getLandingRouteForRole(authStore.user?.role));
    }
    return next({ name: 'login' });
  }

  // Pengguna yang sudah login tidak perlu melihat halaman login/aktivasi
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next(getLandingRouteForRole(authStore.user?.role));
  }

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      const user = await authStore.fetchMe();
      if (!user) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
      }
    }

    if (!canAccessRoute(to.path, authStore.user)) {
      return next({ name: 'forbidden', query: { from: to.fullPath }, replace: true });
    }
  }

  next();
});

export default router;
