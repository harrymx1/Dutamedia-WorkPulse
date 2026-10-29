<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { navForRole } from '../router/navigation';
import { useLayout } from '../composables/useLayout';
import {
  Sunrise,
  PlusCircle,
  Sunset,
  AlertTriangle,
  CalendarDays,
  Plane,
  FileEdit,
  FilePenLine,
  Bell,
  Activity,
  ShieldAlert,
  MessagesSquare,
  FolderGit2,
  Clock,
  CheckSquare,
  FileCheck,
  BarChart3,
  ClipboardCheck,
  CalendarRange,
  Users,
  UserPlus,
  Network,
  UserCheck,
  Sliders,
  Megaphone,
  LogOut,
  X,
} from 'lucide-vue-next';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { isMobileSidebarOpen, closeSidebar } = useLayout();

const groups = computed(() => navForRole(auth.user?.role));

const userInitials = computed(() => {
  const name = auth.user?.fullName || auth.user?.email || 'WP';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const userRoleFormatted = computed(() => {
  const r = auth.user?.role;
  switch (r) {
    case 'EMPLOYEE':
      return 'Staff / Employee';
    case 'SUPERVISOR':
      return 'Supervisor / Lead';
    case 'HEAD':
      return 'Head of Department';
    case 'PROJECT_MANAGER':
      return 'Project Manager';
    case 'HRGA':
      return 'HRGA Officer';
    case 'CEO_MANAGEMENT':
      return 'CEO / Direksi';
    case 'SYSTEM_ADMIN':
      return 'System Administrator';
    default:
      return r || 'Pengguna';
  }
});

// Tutup drawer otomatis setiap kali navigasi rute berubah
watch(
  () => route.fullPath,
  () => {
    closeSidebar();
  },
);

async function handleLogout() {
  await auth.logout();
  closeSidebar();
  router.push('/login');
}

const iconMap: Record<string, any> = {
  Sunrise,
  PlusCircle,
  Sunset,
  AlertTriangle,
  CalendarDays,
  Plane,
  FileEdit,
  FilePenLine,
  Bell,
  Activity,
  ShieldAlert,
  MessagesSquare,
  FolderGit2,
  Clock,
  CheckSquare,
  FileCheck,
  BarChart3,
  ClipboardCheck,
  CalendarRange,
  Users,
  UserPlus,
  Network,
  UserCheck,
  Sliders,
  Megaphone,
};

function getIconComponent(name: string) {
  return iconMap[name] || Activity;
}
</script>

<template>
  <div class="sidebar-wrapper" data-testid="nav-shell">
    <aside
      class="sidebar"
      :class="{ 'mobile-open': isMobileSidebarOpen }"
      aria-label="Navigasi Utama WorkPulse"
      data-testid="enterprise-sidebar"
    >
      <!-- Brand Header (Identik Prototipe HTML 08-Pulse-Dashboard.html) -->
      <div class="brand">
        <div class="brand-mark">WP</div>
        <div class="brand-info">
          <div class="brand-name">WorkPulse</div>
          <div class="brand-caption">Dutamedia Intranet</div>
        </div>
        <!-- Mobile close button (hanya muncul pada viewport mobile saat drawer terbuka) -->
        <button
          type="button"
          class="mobile-close-btn"
          aria-label="Tutup menu navigasi"
          @click="closeSidebar"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Nav Groups (Workspace, Management, Administration) -->
      <nav class="nav-tree" aria-label="Menu Aplikasi" data-testid="nav-drawer">
        <div
          v-for="group in groups"
          :key="group.title"
          class="nav-group"
          :data-testid="`nav-group-${group.title.toLowerCase()}`"
        >
          <div class="nav-label">{{ group.title }}</div>
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            active-class="active"
            :title="item.label"
            @click="closeSidebar"
          >
            <component :is="getIconComponent(item.iconName)" class="nav-icon" :size="17" />
            <span class="nav-text">{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge" :class="item.badgeType || 'neutral'">
              {{ item.badge }}
            </span>
          </router-link>
        </div>
      </nav>

      <!-- Side Bottom User Profile Card -->
      <div class="side-bottom">
        <router-link
          to="/profile"
          class="user-profile-link"
          title="Buka Profil & Pengaturan"
          @click="closeSidebar"
        >
          <div class="avatar">{{ userInitials }}</div>
          <div class="user-meta">
            <div class="user-name" :title="auth.user?.fullName">{{ auth.user?.fullName || 'Pengguna' }}</div>
            <div class="user-role" data-testid="nav-role">{{ userRoleFormatted }}</div>
          </div>
        </router-link>

        <button
          type="button"
          class="logout-btn"
          title="Keluar dari Aplikasi"
          aria-label="Keluar"
          data-testid="nav-logout"
          @click="handleLogout"
        >
          <LogOut :size="16" />
        </button>
      </div>
    </aside>

    <!-- Mobile Overlay Backdrop -->
    <div
      v-if="isMobileSidebarOpen"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<style scoped>
/* ==============================================================
   SIDEBAR ENTERPRISE WORKPULSE (LEBAR BAKU: 232px)
   SESUAI DESIGN SYSTEM v1.5.0 & PROTOTIPE HTML 01-25
   ============================================================== */
.sidebar-wrapper {
  display: contents;
}

.sidebar {
  background: var(--color-surface, #FFFFFF);
  border-right: 1px solid var(--color-border-subtle, #DCE7E2);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 0;
  height: 100vh;
  width: 232px;
  overflow-y: auto;
  box-sizing: border-box;
  z-index: 50;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.sidebar::-webkit-scrollbar {
  display: none;
}

/* Brand Header */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px;
  flex-shrink: 0;
}

.brand-mark {
  height: 38px;
  width: 38px;
  border-radius: 10px;
  background: var(--color-brand-primary, #00674D);
  display: grid;
  place-items: center;
  color: #FFFFFF;
  font-weight: 800;
  font-size: 19px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 103, 77, 0.2);
}

.brand-info {
  min-width: 0;
  flex: 1;
}

.brand-name {
  font-size: 17.5px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text-primary, #0E211B);
  line-height: 1.2;
}

.brand-caption {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
  font-weight: 500;
  margin-top: 1px;
}

.mobile-close-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--color-text-secondary, #5C6E68);
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
}

/* Navigation Groups */
.nav-tree {
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}

.nav-group {
  display: grid;
  gap: 3px;
}

.nav-label {
  padding: 0 10px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary, #5C6E68);
  font-weight: 700;
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--color-text-secondary, #5C6E68);
  font-weight: 600;
  font-size: 13.5px;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: var(--color-surface-subtle, #EFF5F2);
  color: var(--color-text-primary, #0E211B);
  text-decoration: none;
}

.nav-link.active {
  background: var(--color-brand-tint, #E6F4EE);
  color: var(--color-brand-primary, #00674D);
  font-weight: 700;
}

.nav-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  stroke: currentColor;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  font-family: var(--font-mono, monospace);
}

.nav-badge.amber {
  background: #FEF3C7;
  color: #92400E;
}

.nav-badge.red {
  background: #FEE2E2;
  color: #991B1B;
}

.nav-badge.neutral {
  background: #F1F5F9;
  color: #334155;
}

/* Side Bottom Account Profile */
.side-bottom {
  margin-top: auto;
  border-top: 1px solid var(--color-border-subtle, #DCE7E2);
  padding: 14px 6px 0;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.user-profile-link {
  display: flex;
  gap: 9px;
  align-items: center;
  min-width: 0;
  flex: 1;
  text-decoration: none;
  color: inherit;
  padding: 4px;
  margin: -4px;
  border-radius: 8px;
  transition: background 0.15s;
}

.user-profile-link:hover {
  background: var(--color-surface-subtle, #EFF5F2);
  text-decoration: none;
}

.avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #CCFBF1;
  color: var(--color-brand-primary, #00674D);
  font-weight: 800;
  font-size: 12.5px;
  flex-shrink: 0;
}

.user-meta {
  min-width: 0;
  flex: 1;
}

.user-name {
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-primary, #0E211B);
  line-height: 1.3;
}

.user-role {
  font-size: 11px;
  color: var(--color-text-secondary, #5C6E68);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: transparent;
  border: 0;
  color: var(--color-text-secondary, #5C6E68);
  padding: 6px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: #FEE2E2;
  color: #DC2626;
}

/* ==============================================================
   RESPONSIVE DRAWER UNTUK TABLET & MOBILE (<= 992px)
   ============================================================== */
@media (max-width: 992px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    bottom: 0;
    width: 260px;
    height: 100vh;
    transition: left 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .mobile-close-btn {
    display: grid;
    place-items: center;
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
    z-index: 999;
  }
}
</style>
