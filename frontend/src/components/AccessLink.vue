<script setup lang="ts">
/**
 * AccessLink — pengganti <router-link> yang sadar peran (RBAC).
 *
 * Tautan hanya dirender bila tujuan:
 *  1. terdaftar di router (bukan rute 404), dan
 *  2. boleh diakses peran pengguna saat ini (meta.roles).
 * Dengan begitu tidak pernah ada tombol/tautan buntu menuju halaman 403.
 * Seluruh atribut (class, dsb.) diteruskan ke <router-link>.
 *
 * Bila dipasang tanpa router/Pinia aktif (mis. unit test komponen terisolasi),
 * komponen berperilaku seperti <router-link> biasa.
 */
import { computed } from 'vue';
import { useRouter, type RouteLocationRaw } from 'vue-router';
import { getActivePinia } from 'pinia';
import { useAuthStore } from '../stores/auth';

defineOptions({ inheritAttrs: false });

const props = defineProps<{ to: RouteLocationRaw }>();

const router = useRouter();

const allowed = computed(() => {
  if (!router) return true;
  let authUser: any = null;
  try {
    if (getActivePinia()) authUser = useAuthStore().user;
  } catch {
    return true;
  }
  let resolved;
  try {
    resolved = router.resolve(props.to);
  } catch {
    return false;
  }
  if (!resolved.matched.length) return false;
  const last = resolved.matched[resolved.matched.length - 1];
  if (last.meta?.errorKind === 'not-found') return false;
  const roles = resolved.meta.roles as string[] | undefined;
  if (!roles) return true;
  return !!authUser?.role && roles.includes(authUser.role);
});
</script>

<template>
  <router-link v-if="allowed" v-bind="$attrs" :to="to"><slot /></router-link>
</template>
