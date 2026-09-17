<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <h2 class="text-h6 font-weight-bold">Organization & Authority Mapping</h2>
        <p class="text-caption text-medium-emphasis">
          Kelola relasi Atasan-Bawahan (Direct Manager) dan Otoritas Proyek (Project Manager) secara Effective-Dated.
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-link-plus">
        Mapping Baru
      </v-btn>
    </div>

    <!-- Data Table Mockup -->
    <v-card variant="outlined" class="border-subtle rounded-lg">
      <v-table>
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-left font-weight-bold">Subjek (Bawahan / Anggota)</th>
            <th class="text-left font-weight-bold">Target (Atasan / PM)</th>
            <th class="text-left font-weight-bold">Tipe Relasi</th>
            <th class="text-left font-weight-bold">Effective Date</th>
            <th class="text-left font-weight-bold">Status</th>
            <th class="text-center font-weight-bold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mapping in mockMappings" :key="mapping.id">
            <td>
              <span class="font-weight-medium">{{ mapping.subjectName }}</span>
            </td>
            <td>
              <span class="font-weight-medium">{{ mapping.targetName }}</span>
            </td>
            <td>
              <v-chip size="small" :color="mapping.type === 'DirectManager' ? 'primary' : 'secondary'" variant="tonal" class="font-weight-bold">
                {{ mapping.type }}
              </v-chip>
            </td>
            <td class="text-medium-emphasis">
              Mulai: {{ mapping.startDate }}<br/>
              <span v-if="mapping.endDate" class="text-caption">Sampai: {{ mapping.endDate }}</span>
              <span v-else class="text-caption text-success">Aktif (Tanpa Batas)</span>
            </td>
            <td>
              <v-chip size="small" :color="mapping.active ? 'success' : 'grey'" variant="flat">
                {{ mapping.active ? 'Aktif' : 'Masa Berlaku Habis' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn variant="text" icon="mdi-pencil" size="small" color="primary" />
              <v-btn variant="text" icon="mdi-calendar-remove" size="small" color="error" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const mockMappings = ref([
  { id: '1', subjectName: 'John Doe', targetName: 'Jane Smith', type: 'DirectManager', startDate: '2023-01-01', endDate: null, active: true },
  { id: '2', subjectName: 'Marketing Team', targetName: 'Jane Smith', type: 'ProjectManager', startDate: '2023-06-01', endDate: '2023-12-31', active: false },
]);
</script>

<style scoped>
.border-subtle { border-color: #dce7e2 !important; }
</style>
