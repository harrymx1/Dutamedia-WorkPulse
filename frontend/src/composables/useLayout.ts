import { ref } from 'vue';

const isMobileSidebarOpen = ref(false);

export function useLayout() {
  function toggleSidebar() {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
  }

  function closeSidebar() {
    isMobileSidebarOpen.value = false;
  }

  function openSidebar() {
    isMobileSidebarOpen.value = true;
  }

  return {
    isMobileSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };
}

