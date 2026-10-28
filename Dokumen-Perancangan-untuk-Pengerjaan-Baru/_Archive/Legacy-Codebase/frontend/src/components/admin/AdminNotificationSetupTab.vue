<template>
  <div class="admin-notification-setup">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <div class="d-flex align-center ga-2">
          <h2 class="text-h6 font-weight-bold">Notification Channel Matrix & Architecture</h2>
          <v-chip size="x-small" color="info" variant="flat" class="font-weight-bold">
            SAD §12.1 Specification
          </v-chip>
        </div>
        <p class="text-caption text-medium-emphasis mt-1">
          Spesifikasi pemetaan event sistem ke kanal distribusi notifikasi (In-App, Email, Browser Push) berdasarkan rancangan arsitektur WorkPulse.
        </p>
      </div>
    </div>

    <!-- Informational Architecture Banner (SAD §12) -->
    <v-alert
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-6 rounded-lg"
      icon="mdi-information-outline"
    >
      <div class="font-weight-bold text-subtitle-2 mb-1">
        Konfigurasi Tetap Sistem (System Architectural Specification)
      </div>
      <div class="text-caption text-medium-emphasis">
        Tabel di bawah ini merupakan <strong>matriks konfigurasi tetap (built-in event routing)</strong> yang diatur secara arsitektural pada backend event dispatcher sesuai <strong>SAD §12.1</strong>.
        Kanal dan aturan distribusi notifikasi berjalan secara deterministik dan tidak disediakan opsi perubahan dinamis oleh Administrator demi menjaga kepatuhan pelaporan, audit trail, serta keandalan eskalasi (SAD §2.1, §12.2).
      </div>
    </v-alert>

    <!-- Architecture Pillars Cards -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="border-subtle rounded-lg pa-3 h-100">
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon icon="mdi-bell-ring-outline" color="primary" size="20" />
            <span class="font-weight-bold text-body-2">In-App (Notification Center)</span>
          </div>
          <p class="text-caption text-medium-emphasis">
            Seluruh 13 trigger menghasilkan minimal satu row <code class="text-primary font-weight-bold">Notification</code> in-system. Riwayat notifikasi selalu tersimpan permanen dan dapat dilihat di Bell Center.
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="border-subtle rounded-lg pa-3 h-100">
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon icon="mdi-email-fast-outline" color="indigo" size="20" />
            <span class="font-weight-bold text-body-2">Email (Brevo API — SAD §12.3)</span>
          </div>
          <p class="text-caption text-medium-emphasis">
            Menerapkan <em>Volume Monitoring</em> kuota harian & prioritas 3 Tier. Tier 1 (RED, Blocker Kritis) selalu dikirim; Tier 3 (Reminder, Weekly) di-drop bila mendekati batas harian.
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="border-subtle rounded-lg pa-3 h-100">
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon icon="mdi-cellphone-message" color="teal" size="20" />
            <span class="font-weight-bold text-body-2">Browser Push (SAD §12.4)</span>
          </div>
          <p class="text-caption text-medium-emphasis">
            Tercatat di skema database. Pada rilis MVP pengiriman aktualnya di-stub, dan notifikasi efektif tersampaikan secara andal melalui kombinasi Email dan In-App.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Notification Trigger Matrix Table -->
    <v-card variant="outlined" class="border-subtle rounded-lg overflow-hidden">
      <v-card-title class="bg-surface-variant d-flex align-center justify-space-between py-3 px-4">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-matrix" size="20" />
          <span class="text-subtitle-1 font-weight-bold">Trigger Inventory Matrix (SAD §12.1)</span>
        </div>
        <v-chip size="small" variant="outlined" color="primary">
          13 Architectural Triggers
        </v-chip>
      </v-card-title>

      <v-table hover>
        <thead class="bg-surface-light">
          <tr>
            <th class="text-left font-weight-bold" style="width: 45px;">#</th>
            <th class="text-left font-weight-bold" style="width: 250px;">Nama Trigger & Deskripsi</th>
            <th class="text-left font-weight-bold">Penerima (Recipient)</th>
            <th class="text-center font-weight-bold" style="width: 90px;">In-App</th>
            <th class="text-center font-weight-bold" style="width: 90px;">Email</th>
            <th class="text-center font-weight-bold" style="width: 110px;">Browser Push</th>
            <th class="text-left font-weight-bold" style="width: 170px;">Mekanisme Pemicu</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in triggerMatrix" :key="item.id">
            <td class="text-medium-emphasis font-weight-bold text-caption">{{ item.id }}</td>
            <td>
              <div class="font-weight-medium text-body-2">{{ item.trigger }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.description }}</div>
            </td>
            <td class="text-body-2">
              <v-chip size="x-small" variant="tonal" color="blue-grey" class="font-weight-medium">
                {{ item.recipient }}
              </v-chip>
            </td>
            <!-- In-App indicator -->
            <td class="text-center">
              <v-icon
                :icon="item.channels.inApp ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                :color="item.channels.inApp ? 'success' : 'grey-lighten-1'"
                size="18"
              />
            </td>
            <!-- Email indicator -->
            <td class="text-center">
              <v-icon
                :icon="item.channels.email ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                :color="item.channels.email ? 'indigo' : 'grey-lighten-1'"
                size="18"
              />
            </td>
            <!-- Browser Push indicator -->
            <td class="text-center">
              <v-icon
                :icon="item.channels.push ? 'mdi-check-circle' : 'mdi-minus-circle-outline'"
                :color="item.channels.push ? 'teal' : 'grey-lighten-1'"
                size="18"
              />
            </td>
            <!-- Trigger Mechanism -->
            <td>
              <v-chip
                size="x-small"
                :color="item.dipicuOleh.startsWith('Job') ? 'amber-darken-3' : 'purple'"
                variant="outlined"
                class="font-weight-medium"
              >
                {{ item.dipicuOleh }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
/**
 * Matriks Trigger Inventory Notifikasi (SAD §12.1).
 * Ditampilkan sebagai representasi spesifikasi arsitektur tetap (read-only informational view).
 */
interface TriggerDefinition {
  id: number;
  trigger: string;
  description: string;
  recipient: string;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  dipicuOleh: string;
}

const triggerMatrix: TriggerDefinition[] = [
  {
    id: 1,
    trigger: 'Morning/EOD mendekati cutoff',
    description: 'Peringatan batas waktu pengisian komitmen/outcome',
    recipient: 'Employee',
    channels: { inApp: true, email: true, push: true },
    dipicuOleh: 'Job #1 (5-menit)',
  },
  {
    id: 2,
    trigger: 'AMBER + support needed',
    description: 'Notifikasi komitmen berisiko membutuhkan bantuan',
    recipient: 'Support owner + Employee',
    channels: { inApp: true, email: true, push: true },
    dipicuOleh: 'Real-time Event',
  },
  {
    id: 3,
    trigger: 'Status RED',
    description: 'Komitmen terhenti atau gagal mencapai target',
    recipient: 'Supervisor/Head + PM/owner',
    channels: { inApp: true, email: true, push: true },
    dipicuOleh: 'Real-time Event',
  },
  {
    id: 4,
    trigger: 'Critical/instant blocker',
    description: 'Kendala level kritis membutuhkan eskalasi cepat',
    recipient: 'Escalation chain',
    channels: { inApp: true, email: true, push: true },
    dipicuOleh: 'Real-time Event',
  },
  {
    id: 5,
    trigger: 'Blocker unacknowledged > threshold',
    description: 'Blocker belum direspon melebihi SLA eskalasi',
    recipient: 'Level eskalasi berikutnya',
    channels: { inApp: true, email: true, push: true },
    dipicuOleh: 'Job #6 (5-menit)',
  },
  {
    id: 6,
    trigger: 'Repeated no-submission flag',
    description: 'Deteksi ketidakteraturan submit berulang',
    recipient: 'Supervisor/Head; HRGA jika threshold',
    channels: { inApp: true, email: true, push: false },
    dipicuOleh: 'Job #8 (Daily 03:00)',
  },
  {
    id: 7,
    trigger: 'Weekly summary tersedia',
    description: 'Laporan ringkasan akuntabilitas mingguan',
    recipient: 'Employee + Manager',
    channels: { inApp: true, email: true, push: false },
    dipicuOleh: 'Job #10 (Senin 08:00)',
  },
  {
    id: 8,
    trigger: 'Policy/assignment berubah',
    description: 'Perubahan kebijakan atau perpindahan manajer/role',
    recipient: 'User terdampak; Policy Owner',
    channels: { inApp: true, email: false, push: false },
    dipicuOleh: 'Real-time Event',
  },
  {
    id: 9,
    trigger: 'Correction Request Material diajukan',
    description: 'Permohonan koreksi material masuk masa sanggah',
    recipient: 'Authorized Reviewer',
    channels: { inApp: true, email: true, push: false },
    dipicuOleh: 'Real-time Event',
  },
  {
    id: 10,
    trigger: 'Correction Request menuju akhir window',
    description: 'Reminder menjelang batas akhir objection window',
    recipient: 'Authorized Reviewer',
    channels: { inApp: true, email: false, push: false },
    dipicuOleh: 'Job #4 (5-menit)',
  },
  {
    id: 11,
    trigger: 'Correction Request Applied/Rejected',
    description: 'Hasil tinjauan atau auto-apply koreksi komitmen',
    recipient: 'Employee pengaju',
    channels: { inApp: true, email: false, push: false },
    dipicuOleh: 'Real-time / Job #5',
  },
  {
    id: 12,
    trigger: 'Leave Request diajukan',
    description: 'Permohonan cuti/izin karyawan baru diajukan',
    recipient: 'Authorized Approver',
    channels: { inApp: true, email: true, push: true },
    dipicuOleh: 'Real-time Event',
  },
  {
    id: 13,
    trigger: 'Leave Request disetujui/ditolak',
    description: 'Keputusan status pengajuan cuti/izin karyawan',
    recipient: 'Employee pengaju',
    channels: { inApp: true, email: true, push: false },
    dipicuOleh: 'Real-time Event',
  },
];
</script>

<style scoped>
.border-subtle {
  border-color: rgba(var(--v-border-color), 0.12) !important;
}
</style>
