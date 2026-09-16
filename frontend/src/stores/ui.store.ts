import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timeout: number;
}

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref<boolean>(false);
  const activeFilters = ref<Record<string, unknown>>({});
  const toasts = ref<ToastNotification[]>([]);

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setSidebar(collapsed: boolean): void {
    sidebarCollapsed.value = collapsed;
  }

  function setFilter(key: string, value: unknown): void {
    activeFilters.value[key] = value;
  }

  function clearFilters(): void {
    activeFilters.value = {};
  }

  function showToast(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    timeout = 4000,
  ): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastNotification = { id, message, type, timeout };
    toasts.value.push(newToast);

    if (timeout > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, timeout);
    }
  }

  function dismissToast(id: string): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    sidebarCollapsed,
    activeFilters,
    toasts,
    toggleSidebar,
    setSidebar,
    setFilter,
    clearFilters,
    showToast,
    dismissToast,
  };
});
