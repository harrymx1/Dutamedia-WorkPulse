import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { setupRouterGuards } from './guards.js';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/today',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false, title: 'Masuk — WorkPulse' },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../pages/ResetPasswordPage.vue'),
    meta: { requiresAuth: true, title: 'Perbarui Password — WorkPulse' },
  },

  // 1. Self-Service Area (UI/UX Spec §3)
  {
    path: '/today',
    name: 'MyToday',
    component: () => import('../pages/MyTodayPage.vue'),
    meta: { requiresAuth: true, title: 'My Today — WorkPulse' },
  },
  {
    path: '/history',
    name: 'MyHistory',
    component: () => import('../pages/MyHistoryPage.vue'),
    meta: { requiresAuth: true, title: 'My History — WorkPulse' },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../pages/NotificationsPage.vue'),
    meta: { requiresAuth: true, title: 'Notifikasi — WorkPulse' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/ProfilePage.vue'),
    meta: { requiresAuth: true, title: 'Profil Pengguna — WorkPulse' },
  },
  {
    path: '/today/leave-request',
    name: 'MyLeaveRequest',
    component: () => import('../pages/MyLeaveRequestPage.vue'),
    meta: { requiresAuth: true, title: 'My Leave Request — WorkPulse' },
  },

  // 2. Management & Governance Area (UI/UX Spec §3)
  {
    path: '/team',
    name: 'TeamPulse',
    component: () => import('../pages/TeamPulsePage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['Supervisor_TL', 'Head', 'Head_Dept', 'CEO_Management', 'CEO_Director', 'SystemAdmin', 'PM'],
      title: 'Team Pulse — WorkPulse',
    },
  },
  {
    path: '/function',
    name: 'FunctionPulse',
    component: () => import('../pages/FunctionPulsePage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['Head', 'Head_Dept', 'CEO_Management', 'CEO_Director', 'SystemAdmin'],
      title: 'Function Pulse — WorkPulse',
    },
  },
  {
    path: '/compliance',
    name: 'Compliance',
    component: () => import('../pages/CompliancePage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['HRGA', 'CEO_Management', 'CEO_Director', 'SystemAdmin'],
      title: 'Compliance & Exemption — WorkPulse',
    },
  },
  {
    path: '/management',
    name: 'ManagementPulse',
    component: () => import('../pages/ManagementPulsePage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['CEO_Management', 'CEO_Director', 'SystemAdmin'],
      title: 'Management Pulse — WorkPulse',
    },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../pages/ReportsPage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['Supervisor_TL', 'Head', 'Head_Dept', 'HRGA', 'CEO_Management', 'CEO_Director', 'SystemAdmin'],
      title: 'Reports — WorkPulse',
    },
  },
  {
    path: '/my-scope/project-risk',
    name: 'ProjectRisk',
    component: () => import('../pages/ProjectRiskPage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['PM', 'SystemAdmin', 'CEO_Management', 'CEO_Director', 'Head_Dept', 'Head', 'Supervisor_TL'],
      title: 'Project Risk View — WorkPulse',
    },
  },
  {
    path: '/policy-settings',
    name: 'PolicySettings',
    component: () => import('../pages/PolicySettingsPage.vue'),
    meta: {
      requiresAuth: true,
      title: 'Policy Settings — WorkPulse',
    },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../pages/AdminUsersPage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['SystemAdmin'],
      title: 'Admin Master Data — WorkPulse',
    },
  },

  // Wildcard 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFoundPage.vue'),
    meta: { requiresAuth: false, title: 'Halaman Tidak Ditemukan — WorkPulse' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupRouterGuards(router);
