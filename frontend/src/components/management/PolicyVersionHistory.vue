<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center justify-space-between pt-4 pb-2 px-6">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-history" color="primary" />
          <span class="text-h6 font-weight-bold">
            Riwayat Versi Kebijakan ({{ category }})
          </span>
        </div>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6" style="max-height: 520px;">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
          <div class="text-caption text-medium-emphasis mt-2">Memuat riwayat kebijakan...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!history || history.length === 0" class="text-center py-8 text-medium-emphasis">
          <v-icon icon="mdi-file-document-outline" size="48" class="mb-2" />
          <div>Belum ada riwayat versi sebelumnya untuk kategori ini.</div>
        </div>

        <!-- Version Timeline -->
        <v-timeline v-else side="end" density="compact" truncate-line="both">
          <v-timeline-item
            v-for="(ver, index) in history"
            :key="ver.id"
            :dot-color="index === 0 ? 'primary' : 'grey-lighten-1'"
            size="small"
          >
            <template #icon>
              <v-icon v-if="index === 0" icon="mdi-check" size="14" color="white" />
            </template>

            <v-card variant="outlined" class="pa-3 rounded border-subtle mb-3 bg-surface-elevated">
              <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-1">
                <div class="d-flex align-center ga-2">
                  <span class="text-subtitle-2 font-weight-bold">Versi {{ ver.versionNumber }}</span>
                  <v-chip
                    v-if="index === 0"
                    size="x-small"
                    color="primary"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    Aktif
                  </v-chip>
                </div>
                <span class="text-caption text-medium-emphasis font-mono">
                  Berlaku: {{ formatDate(ver.effectiveDate) }}
                </span>
              </div>

              <!-- Alasan Perubahan -->
              <div v-if="ver.changeReason" class="text-body-2 mb-2 font-weight-medium">
                Alasan: "{{ ver.changeReason }}"
              </div>

              <!-- Author -->
              <div class="text-caption text-medium-emphasis mb-2">
                Diterbitkan oleh: <strong>{{ ver.createdByName || 'System / Admin' }}</strong>
                pada {{ formatDateTime(ver.createdAt) }}
              </div>

              <!-- Parameters Viewer -->
              <v-expansion-panels variant="accordion">
                <v-expansion-panel elevation="0" class="border rounded">
                  <v-expansion-panel-title class="text-caption font-weight-bold py-1">
                    Lihat Snapshot Parameter
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <pre class="text-caption bg-grey-lighten-4 pa-2 rounded overflow-x-auto font-mono">{{ JSON.stringify(ver.parameters, null, 2) }}</pre>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-3">
        <v-spacer />
        <v-btn
          color="primary"
          variant="tonal"
          @click="emit('update:modelValue', false)"
        >
          Tutup
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { usePolicyHistoryQuery } from '../../queries/usePolicies.js';
import type { PolicyCategory } from '../../types/management.js';

interface Props {
  modelValue: boolean;
  category: PolicyCategory;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const { data: history, isLoading } = usePolicyHistoryQuery(() => props.category);

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.border-subtle {
  border-color: #dce7e2 !important;
}
.bg-surface-elevated {
  background-color: #eff5f2 !important;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
</style>
