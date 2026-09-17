<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <h2 class="text-h6 font-weight-bold">User & Role Management</h2>
        <p class="text-caption text-medium-emphasis">
          Kelola direktori karyawan, penempatan departemen/fungsi, dan hak akses (role).
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-account-plus">
        Tambah User Baru
      </v-btn>
    </div>

    <!-- Data Table Mockup for Users -->
    <v-card variant="outlined" class="border-subtle rounded-lg">
      <v-table>
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-left font-weight-bold">Nama Karyawan</th>
            <th class="text-left font-weight-bold">Email</th>
            <th class="text-left font-weight-bold">Role Sistem</th>
            <th class="text-left font-weight-bold">Fungsi / Departemen</th>
            <th class="text-left font-weight-bold">Status</th>
            <th class="text-center font-weight-bold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in mockUsers" :key="user.id">
            <td>
              <div class="d-flex align-center ga-3 py-2">
                <v-avatar color="primary" size="32">
                  <span class="text-white text-caption">{{ getInitials(user.name) }}</span>
                </v-avatar>
                <span class="font-weight-medium">{{ user.name }}</span>
              </div>
            </td>
            <td class="text-medium-emphasis">{{ user.email }}</td>
            <td>
              <v-chip size="small" color="info" variant="tonal" class="font-weight-bold">
                {{ user.role }}
              </v-chip>
            </td>
            <td class="text-medium-emphasis">{{ user.function }}</td>
            <td>
              <v-chip size="small" :color="user.active ? 'success' : 'grey'" variant="flat">
                {{ user.active ? 'Aktif' : 'Non-Aktif' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn variant="text" icon="mdi-pencil" size="small" color="primary" />
              <v-btn variant="text" icon="mdi-shield-key" size="small" color="secondary" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const mockUsers = ref([
  { id: '1', name: 'John Doe', email: 'john@dutamedia.com', role: 'Employee', function: 'IT Engineering', active: true },
  { id: '2', name: 'Jane Smith', email: 'jane@dutamedia.com', role: 'Head_Dept', function: 'Marketing', active: true },
  { id: '3', name: 'Admin Utama', email: 'admin@dutamedia.com', role: 'SystemAdmin', function: 'HRGA', active: true },
]);

function getInitials(name: string) {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}
</script>

<style scoped>
.border-subtle { border-color: #dce7e2 !important; }
</style>
