<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <h2 class="text-h6 font-weight-bold">Temporary Reviewer Assignments</h2>
        <p class="text-caption text-medium-emphasis">
          Delegasikan hak tinjauan/approval Anda (atau atasan tertentu) kepada karyawan lain secara sementara (misal: saat cuti).
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-account-arrow-right">
        Delegasikan Wewenang
      </v-btn>
    </div>

    <v-alert
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-4 rounded-lg text-caption"
    >
      <strong>Catatan Kepatuhan:</strong> Seluruh tindakan approval/review yang dilakukan oleh Reviewer Sementara akan tercatat dalam Audit Trail atas nama delegasi tersebut, namun Atasan Asli tetap menerima notifikasi tembusan (CC).
    </v-alert>

    <!-- Data Table Mockup -->
    <v-card variant="outlined" class="border-subtle rounded-lg">
      <v-table>
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-left font-weight-bold">Atasan (Pemberi Wewenang)</th>
            <th class="text-left font-weight-bold">Penerima Wewenang</th>
            <th class="text-left font-weight-bold">Periode Berlaku</th>
            <th class="text-left font-weight-bold">Status</th>
            <th class="text-center font-weight-bold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="temp in mockTempReviewers" :key="temp.id">
            <td>
              <span class="font-weight-medium">{{ temp.managerName }}</span>
            </td>
            <td>
              <span class="font-weight-medium">{{ temp.delegateName }}</span>
            </td>
            <td class="text-medium-emphasis">
              Mulai: {{ temp.startDate }}<br/>
              <span class="text-caption">Sampai: {{ temp.endDate }}</span>
            </td>
            <td>
              <v-chip size="small" :color="temp.active ? 'success' : 'grey'" variant="flat">
                {{ temp.active ? 'Aktif' : 'Selesai / Dicabut' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn variant="text" icon="mdi-cancel" size="small" color="error" title="Cabut Delegasi" />
            </td>
          </tr>
          <tr v-if="mockTempReviewers.length === 0">
            <td colspan="5" class="text-center py-6 text-medium-emphasis">
              Tidak ada pendelegasian wewenang sementara saat ini.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const mockTempReviewers = ref([
  { id: '1', managerName: 'Jane Smith', delegateName: 'John Doe', startDate: '2023-12-25', endDate: '2024-01-02', active: false }
]);
</script>

<style scoped>
.border-subtle { border-color: #dce7e2 !important; }
</style>
