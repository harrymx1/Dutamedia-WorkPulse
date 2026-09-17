<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <h2 class="text-h6 font-weight-bold">Notification Channel Setup</h2>
        <p class="text-caption text-medium-emphasis">
          Konfigurasi trigger dan preferensi channel notifikasi (In-App, Email, WhatsApp/Push) untuk setiap jenis event sistem.
        </p>
      </div>
    </div>

    <!-- Master Switch for Global Outbound -->
    <v-card variant="tonal" color="warning" class="pa-4 rounded-lg mb-6 d-flex align-center justify-space-between">
      <div>
        <div class="font-weight-bold">Master Outbound Switch</div>
        <div class="text-caption">Menghentikan SEMUA pengiriman notifikasi via Email dan Push. (Hanya In-App yang aktif).</div>
      </div>
      <v-switch
        v-model="masterSwitch"
        color="warning"
        hide-details
        inset
      />
    </v-card>

    <!-- Notification Events Table -->
    <v-card variant="outlined" class="border-subtle rounded-lg">
      <v-table>
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-left font-weight-bold">Kategori / Event Type</th>
            <th class="text-center font-weight-bold">In-App</th>
            <th class="text-center font-weight-bold">Email</th>
            <th class="text-center font-weight-bold">Push / WA</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in notificationEvents" :key="event.id">
            <td>
              <div class="font-weight-medium">{{ event.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ event.description }}</div>
            </td>
            <td class="text-center">
              <v-checkbox-btn v-model="event.inApp" color="primary" class="d-inline-flex" />
            </td>
            <td class="text-center">
              <v-checkbox-btn v-model="event.email" color="primary" class="d-inline-flex" />
            </td>
            <td class="text-center">
              <v-checkbox-btn v-model="event.push" color="primary" class="d-inline-flex" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <div class="d-flex justify-end mt-4">
      <v-btn color="primary" prepend-icon="mdi-content-save">
        Simpan Pengaturan
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const masterSwitch = ref(true);

const notificationEvents = ref([
  { id: '1', name: 'Cutoff Pagi (Reminder)', description: 'Peringatan 15 menit sebelum cutoff', inApp: true, email: false, push: true },
  { id: '2', name: 'Cutoff Pagi (Missed)', description: 'Telah melewati batas waktu (No Submission)', inApp: true, email: true, push: false },
  { id: '3', name: 'Blocker Critical/High', description: 'Kendala baru didaftarkan ke Owner', inApp: true, email: true, push: true },
  { id: '4', name: 'Leave Approval', description: 'Pengajuan cuti disetujui/ditolak', inApp: true, email: true, push: false },
  { id: '5', name: 'Compliance Coaching', description: 'Dicatatnya surat teguran atau pembinaan', inApp: true, email: true, push: false },
]);
</script>

<style scoped>
.border-subtle { border-color: #dce7e2 !important; }
</style>
