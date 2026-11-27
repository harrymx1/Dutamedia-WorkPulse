<script setup lang="ts">
import ToastPopup from '../../components/ToastPopup.vue';
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/auth';
import { canAccessRoute } from '../../router/navigation';
import { formatTimeWib, formatShortDateTimeWib } from '../../utils/dateTime';
import { isInternStatus } from '../../utils/employmentStatus';
import {
  BLOCKER_DELETE_REASON_OPTIONS,
  BLOCKER_IMPACT_OPTIONS,
  BLOCKER_SEVERITY_OPTIONS,
  BLOCKER_STATUS_LABELS,
  BLOCKER_TYPE_GROUPS,
  WAITING_FOR_FUNCTION_OPTIONS,
  buildBlockerTicketHistory,
  composeBlockerDescription,
  getBlockerStatusLabel,
  getBlockerTypeInfo,
  getTicketImpactsList,
  getWaitingForFunctionLabel,
  isActiveBlockerStatus,
  parseBlockerTextParts,
  sortBlockersByNewest,
  toggleImpactSelection,
  type BlockerDeleteReasonCategory,
} from '../../utils/blockerStatus';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldAlert,
  FolderGit2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  Layers,
  RotateCcw,
  Pencil,
  Trash2,
  X,
} from 'lucide-vue-next';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const isFromMorningCommitment = computed(() => route?.query?.returnTo === '/daily/morning');
const morningReturnSlot = computed(() =>
  typeof route?.query?.slot === 'string' && route.query.slot.trim()
    ? route.query.slot.trim()
    : '0',
);

// Tab State
const activeTab = ref<'create' | 'mine'>(route?.query?.tab === 'mine' ? 'mine' : 'create');

// Form Data
const title = ref('');
const linkedCommitmentId = ref('');
const blockerType = ref<string>('');
const blockerImpacts = ref<string[]>([]);
const waitingForFunction = ref<string>('');
const blockerSeverity = ref<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
const description = ref('');
const expectedHelp = ref('');
const authorityContext = ref<'ORGANIZATIONAL_AUTHORITY' | 'PROJECT_AUTHORITY'>('ORGANIZATIONAL_AUTHORITY');
const projectCode = ref('');
const assignedOwnerId = ref('');

// Kebijakan batas waktu penanganan & rekomendasi penanggung jawab otomatis (sumber tunggal: backend)
const slaMinutes = ref<Record<string, number>>({ CRITICAL: 120, HIGH: 240, MEDIUM: 480, LOW: 1440 });
const suggestedOwner = ref<{ id: string; fullName: string; jobTitle?: string | null } | null>(null);
const suggestionReason = ref<'PROJECT_LEAD' | 'CATEGORY_OWNER' | 'DIVISION_HEAD' | 'DIRECT_MANAGER' | 'NONE'>('NONE');
const suggestionDivision = ref('');
const suggestionNote = ref('');
const nowTick = ref(Date.now());
let tickTimer: ReturnType<typeof setInterval> | null = null;

function formatSla(minutes?: number): string {
  if (!minutes) return '-';
  if (minutes % 60 === 0) return `${minutes / 60} jam`;
  return `${minutes} menit`;
}

const impactTouched = ref(false);

function toggleBlockerImpact(code: string) {
  impactTouched.value = true;
  blockerImpacts.value = toggleImpactSelection(blockerImpacts.value, code, 3);
}

async function loadRoutingPreview() {
  try {
    const params = new URLSearchParams();
    if (blockerType.value) params.set('type', blockerType.value);
    params.set('ownerNeededType', authorityContext.value);
    if (authorityContext.value === 'PROJECT_AUTHORITY' && projectCode.value) {
      params.set('projectCode', projectCode.value);
    }
    if (blockerType.value === 'CROSS_TEAM' && waitingForFunction.value) {
      params.set('waitingForFunction', waitingForFunction.value);
    }
    const res = await apiClient<any>(`/blockers/routing-preview?${params.toString()}`);
    if (res.data) {
      if (res.data.slaMinutes) slaMinutes.value = res.data.slaMinutes;
      suggestedOwner.value = res.data.suggestedOwner || null;
      suggestionReason.value = res.data.reason || 'NONE';
      suggestionDivision.value = res.data.divisionLabel || '';
      suggestionNote.value = res.data.routingNote || '';
    }
  } catch {
    // Preview bersifat informatif; pengiriman tiket tetap ditentukan backend
  }
}

watch([blockerType, authorityContext, projectCode, waitingForFunction], () => {
  if (blockerType.value !== 'CROSS_TEAM' && waitingForFunction.value) {
    waitingForFunction.value = '';
  }
  loadRoutingPreview();
});

watch(
  () => route?.query?.tab,
  (tab) => {
    if (tab === 'mine') {
      activeTab.value = 'mine';
    } else if (tab === 'create') {
      activeTab.value = 'create';
    }
  },
);

function slaRemainingLabel(b: any): { text: string; overdue: boolean } | null {
  if (!b.targetResolutionAt || ['RESOLVED', 'CLOSED', 'ACCEPTED_RISK'].includes(b.status)) return null;
  const diffMin = Math.round((new Date(b.targetResolutionAt).getTime() - nowTick.value) / 60000);
  const abs = Math.abs(diffMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const dur = h > 0 ? `${h}j ${m}m` : `${m}m`;
  return diffMin >= 0
    ? { text: `Sisa Waktu ${dur}`, overdue: false }
    : { text: `Lewat Batas Waktu ${dur}`, overdue: true };
}

export interface AvailableUser {
  id: string;
  fullName: string;
  email: string;
  jobTitle?: string | null;
  role?: string | null;
  function?: string | null;
  employmentStatus?: string | null;
  directManagerId?: string | null;
}

export interface GroupedUser extends AvailableUser {
  isDirectManager?: boolean;
}

export interface ProjectAuthorityInfo {
  projectCode: string;
  projectName: string;
  projectManagerId?: string;
  escalationReviewerId?: string;
  projectManager?: { id: string; fullName: string; email: string };
  escalationReviewer?: { id: string; fullName: string; email: string };
}

// Options & Reference Data
const todayCommitments = ref<
  Array<{ id: string; taskText: string; sequenceNo?: number; sequenceNumber?: number }>
>([]);

function getCommitmentSeqNo(
  c?: { sequenceNo?: number; sequenceNumber?: number } | null,
): string {
  const seq = c?.sequenceNo ?? c?.sequenceNumber;
  return seq !== undefined && seq !== null ? String(seq) : '';
}
const availableProjects = ref([
  { code: 'PRJ-PORTAL', name: 'Dutamedia Client Portal v2.4' },
  { code: 'PRJ-CORE', name: 'Core Banking Settlement Engine' },
  { code: 'PRJ-MOBILE', name: 'Customer SuperApp Mobile' },
  { code: 'WP-CORE', name: 'WorkPulse Platform Core 2026' },
]);
const availableUsers = ref<AvailableUser[]>([]);
const projectAuthorities = ref<ProjectAuthorityInfo[]>([
  {
    projectCode: 'WP-CORE',
    projectName: 'WorkPulse Platform Core 2026',
  },
  {
    projectCode: 'PRJ-CORE',
    projectName: 'Core Banking Settlement Engine',
  },
  {
    projectCode: 'PRJ-PORTAL',
    projectName: 'Dutamedia Client Portal v2.4',
  },
  {
    projectCode: 'PRJ-MOBILE',
    projectName: 'Customer SuperApp Mobile',
  },
]);

// State
const loading = ref(false);
const submitting = ref(false);
const submittedTicket = ref<any>(null);
const errorMessage = ref<string | null>(null);
const toastMessage = ref<string | null>(null);

// Reset penanggung jawab khusus saat berganti jalur wewenang atau berganti proyek
watch(authorityContext, () => {
  assignedOwnerId.value = '';
});

watch(projectCode, () => {
  if (authorityContext.value === 'PROJECT_AUTHORITY') {
    assignedOwnerId.value = '';
  }
});

// Pemisahan Tegas Direktori Penanggung Jawab Berdasarkan Konteks Wewenang (DEC-002, IMP-046)
const eligibleOwners = computed(() => {
  const currentUserId = authStore.user?.id;
  const myDirectManagerId =
    availableUsers.value.find((u) => u.id === currentUserId)?.directManagerId ||
    (authStore.user as any)?.directManagerId ||
    null;

  // 1. Filter dasar: singkirkan akun diri sendiri, SYSTEM_ADMIN, karyawan Intern, dan calon karyawan/non-aktif
  const cleanUsers = availableUsers.value.filter(
    (u) =>
      u.id !== currentUserId &&
      u.role !== 'SYSTEM_ADMIN' &&
      !isInternStatus(u.employmentStatus) &&
      !u.email.includes('admin@') &&
      !u.email.includes('calon.karyawan@')
  );

  // KASUS A: ORGANIZATIONAL AUTHORITY (STRUKTURAL)
  // Hanya menampilkan hirarki struktural perusahaan: Atasan Langsung, Kepala Divisi, dan Direksi Eksekutif.
  // Project Manager yang bukan atasan langsung dilarang masuk ke sini!
  if (authorityContext.value === 'ORGANIZATIONAL_AUTHORITY') {
    const directManagers: GroupedUser[] = [];
    const departmentHeads: GroupedUser[] = [];
    const directors: GroupedUser[] = [];

    // Deteksi Atasan Langsung (Direct Supervisor)
    for (const u of cleanUsers) {
      const isDirectManager = !!myDirectManagerId && u.id === myDirectManagerId;

      if (isDirectManager) {
        directManagers.push({ ...u, isDirectManager: true });
      }
    }

    const directManagerIds = new Set(directManagers.map((m) => m.id));

    // Deteksi Kepala Divisi & Direksi (Eksklusif: jika sudah menjadi Atasan Langsung, jangan duplikasi!)
    for (const u of cleanUsers) {
      if (directManagerIds.has(u.id)) continue;

      if (
        u.role === 'CEO_MANAGEMENT' ||
        u.role === 'DIRECTOR' ||
        u.jobTitle?.includes('CEO') ||
        u.email.includes('direktur')
      ) {
        directors.push(u);
      } else if (
        u.role === 'HEAD' ||
        u.jobTitle?.startsWith('Head') ||
        u.email.includes('head.') ||
        u.email.includes('hrga@') ||
        u.email.includes('finance@')
      ) {
        departmentHeads.push(u);
      }
    }

    return {
      directManagers,
      departmentHeads,
      directors,
      projectLeads: [] as GroupedUser[],
      projectSponsors: [] as GroupedUser[],
    };
  }

  // KASUS B: PROJECT AUTHORITY (KEWENANGAN PROYEK)
  // Berdasarkan proyek yang dipilih (projectCode). Menampilkan Pimpinan Proyek (PM/Lead) dan Pengarah Proyek (Sponsor).
  if (!projectCode.value) {
    return {
      directManagers: [] as GroupedUser[],
      departmentHeads: [] as GroupedUser[],
      directors: [] as GroupedUser[],
      projectLeads: [] as GroupedUser[],
      projectSponsors: [] as GroupedUser[],
    };
  }

  const code = projectCode.value.toUpperCase();
  const mapping = projectAuthorities.value.find((p) => p.projectCode.toUpperCase() === code);

  const projectLeads: GroupedUser[] = [];
  const projectSponsors: GroupedUser[] = [];

  let pm = cleanUsers.find(
    (u) =>
      (mapping?.projectManagerId && u.id === mapping.projectManagerId) ||
      (mapping?.projectManager?.id && u.id === mapping.projectManager.id)
  );

  let reviewer = cleanUsers.find(
    (u) =>
      (mapping?.escalationReviewerId && u.id === mapping.escalationReviewerId) ||
      (mapping?.escalationReviewer?.id && u.id === mapping.escalationReviewer.id)
  );

  // Fallback deterministik sesuai katalog wewenang proyek Dutamedia
  if (!pm) {
    if (code.includes('CORE')) {
      pm = cleanUsers.find((u) => u.email.includes('lead.tech') || u.fullName.includes('Bambang'));
    } else {
      pm = cleanUsers.find((u) => u.email.includes('pm@') || u.fullName.includes('Dimas'));
    }
  }

  if (!reviewer) {
    if (code.includes('CORE')) {
      reviewer = cleanUsers.find((u) => u.email.includes('head.eng') || u.fullName.includes('Arif'));
    } else {
      reviewer = cleanUsers.find((u) => u.email.includes('head.delivery') || u.fullName.includes('Dharma'));
    }
  }

  if (pm) projectLeads.push(pm);
  if (reviewer && reviewer.id !== pm?.id) projectSponsors.push(reviewer);

  return {
    directManagers: [] as GroupedUser[],
    departmentHeads: [] as GroupedUser[],
    directors: [] as GroupedUser[],
    projectLeads,
    projectSponsors,
  };
});

// Rekan / pihak lain di luar jalur kewenangan: pelapor bebas menunjuk orang yang dinilai tepat
const otherOwners = computed(() => {
  const currentUserId = authStore.user?.id;
  const e = eligibleOwners.value;
  const shown = new Set(
    [
      ...e.directManagers,
      ...e.departmentHeads,
      ...e.directors,
      ...e.projectLeads,
      ...e.projectSponsors,
    ].map((u) => u.id)
  );
  return availableUsers.value
    .filter(
      (u) =>
        u.id !== currentUserId &&
        u.role !== 'SYSTEM_ADMIN' &&
        !isInternStatus(u.employmentStatus) &&
        !u.email.includes('admin@') &&
        !u.email.includes('calon.karyawan@') &&
        !shown.has(u.id)
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
});

const selectedOwnerDetails = computed(() => {
  if (!assignedOwnerId.value) return null;
  return availableUsers.value.find((u) => u.id === assignedOwnerId.value) || null;
});

const defaultSupervisorName = computed(() => {
  return suggestedOwner.value?.fullName || eligibleOwners.value.directManagers[0]?.fullName || '';
});

const defaultProjectLeadName = computed(() => {
  return (
    suggestedOwner.value?.fullName ||
    eligibleOwners.value.projectLeads[0]?.fullName ||
    ''
  );
});

// My Blockers State
const myBlockers = ref<any[]>([]);
const loadingBlockers = ref(false);
const blockerFilter = ref<'all' | 'open' | 'handling' | 'resolved' | 'closed'>('all');
const closingId = ref<string | null>(null);
const reopeningId = ref<string | null>(null);
const reopenReasonMap = ref<Record<string, string>>({});
const submittingReopenId = ref<string | null>(null);
const respondingSupportId = ref<string | null>(null);
const rejectingSupportId = ref<string | null>(null);
const supportResponseMode = ref<'ACCEPT_AS_SUPPORT' | 'REJECT_SUPPORT'>('REJECT_SUPPORT');
const supportRejectReasonMap = ref<Record<string, string>>({});

// State Edit & Hapus Tiket Blocker Aktif (DEC-016)
const editingTicket = ref<any>(null);
const editTitle = ref('');
const editType = ref('');
const editImpacts = ref<string[]>([]);
const editWaitingForFunction = ref('');
const editSeverity = ref<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
const editDescription = ref('');
const editExpectedHelp = ref('');
const submittingEdit = ref(false);

const deletingTicket = ref<any>(null);
const deleteReasonCategory = ref<BlockerDeleteReasonCategory | ''>('');
const deleteReason = ref('');
const submittingDelete = ref(false);

const charCount = computed(() => title.value.length);

const isFormValid = computed(() => {
  if (title.value.trim().length < 10) return false;
  if (!blockerType.value) return false;
  if (blockerImpacts.value.length < 1 || blockerImpacts.value.length > 3) return false;
  if (
    blockerType.value === 'CROSS_TEAM' &&
    authorityContext.value !== 'PROJECT_AUTHORITY' &&
    !assignedOwnerId.value &&
    !waitingForFunction.value
  ) {
    return false;
  }
  if (!blockerSeverity.value) return false;
  if (description.value.trim().length < 20) return false;
  if (authorityContext.value === 'PROJECT_AUTHORITY' && !projectCode.value.trim()) return false;
  return true;
});

const activeBlockersCount = computed(() => {
  return myBlockers.value.filter((b) =>
    ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED_RISK'].includes(b.status),
  ).length;
});

const countAll = computed(() => myBlockers.value.length);
const countPendingResponse = computed(
  () => myBlockers.value.filter((b) => b.status === 'OPEN').length,
);
const countInProgress = computed(
  () => myBlockers.value.filter((b) => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(b.status)).length,
);
const countResolved = computed(
  () => myBlockers.value.filter((b) => ['RESOLVED', 'ACCEPTED_RISK'].includes(b.status)).length,
);
const countClosed = computed(
  () => myBlockers.value.filter((b) => b.status === 'CLOSED').length,
);

const filteredBlockers = computed(() => {
  let items = myBlockers.value;
  if (blockerFilter.value === 'open') {
    items = items.filter((b) => b.status === 'OPEN');
  } else if (blockerFilter.value === 'handling') {
    items = items.filter((b) => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(b.status));
  } else if (blockerFilter.value === 'resolved') {
    items = items.filter((b) => ['RESOLVED', 'ACCEPTED_RISK'].includes(b.status));
  } else if (blockerFilter.value === 'closed') {
    items = items.filter((b) => b.status === 'CLOSED');
  }
  return sortBlockersByNewest(items);
});

const STRUCTURED_TEMPLATE_TEXT = `[Fakta Kendala]: 
[Dampak Nyata]: 
[Upaya Mandiri yang Telah Dicoba]: 
[Kebutuhan Bantuan Konkret]: `;

const showTemplateConfirm = ref(false);

watch(description, (val) => {
  if (showTemplateConfirm.value && val.trim().length === 0) {
    showTemplateConfirm.value = false;
  }
});

function insertStructuredTemplate() {
  if (description.value.trim().length === 0) {
    description.value = STRUCTURED_TEMPLATE_TEXT;
    showTemplateConfirm.value = false;
    return;
  }
  showTemplateConfirm.value = true;
}

function confirmApplyTemplate() {
  description.value = STRUCTURED_TEMPLATE_TEXT;
  showTemplateConfirm.value = false;
}

function cancelApplyTemplate() {
  showTemplateConfirm.value = false;
}

function appendExpectedHelp(chipText: string) {
  if (!expectedHelp.value) {
    expectedHelp.value = chipText;
  } else {
    expectedHelp.value += ` | ${chipText}`;
  }
}


function resetForm() {
  title.value = '';
  linkedCommitmentId.value = '';
  blockerType.value = '';
  blockerImpacts.value = [];
  impactTouched.value = false;
  waitingForFunction.value = '';
  blockerSeverity.value = 'HIGH';
  description.value = '';
  showTemplateConfirm.value = false;
  expectedHelp.value = '';
  authorityContext.value = 'ORGANIZATIONAL_AUTHORITY';
  projectCode.value = '';
  assignedOwnerId.value = '';
  errorMessage.value = null;
  submittedTicket.value = null;
  toastMessage.value = 'Formulir berhasil dibersihkan.';
}

function resetFormForAnother() {
  submittedTicket.value = null;
  resetForm();
}

function switchToMyBlockers(resetFilter = false) {
  if (resetFilter) {
    blockerFilter.value = 'all';
    submittedTicket.value = null;
  }
  activeTab.value = 'mine';
  loadMyBlockers();
}

async function loadInitialData() {
  loading.value = true;
  try {
    // Ambil komitmen hari ini untuk ditautkan
    const todayRes = await apiClient<{ record?: { commitments?: any[] } }>('/daily/today');
    if (todayRes.data?.record?.commitments) {
      todayCommitments.value = todayRes.data.record.commitments;
    }

    // Ambil daftar pengguna untuk routing penugasan
    const usersRes = await apiClient<AvailableUser[]>('/v1/organization/users');
    if (usersRes.data) {
      availableUsers.value = usersRes.data;
      // Jangan set otomatis ke pengguna pertama; biarkan kosong agar sistem menentukan otomatis
      assignedOwnerId.value = '';
    }

    // Ambil pemetaan wewenang proyek aktif dari backend
    try {
      const projAuthRes = await apiClient<{ data: ProjectAuthorityInfo[] }>('/v1/organization/project-authorities');
      const rawList = Array.isArray(projAuthRes.data)
        ? projAuthRes.data
        : projAuthRes.data?.data;
      if (Array.isArray(rawList) && rawList.length > 0) {
        projectAuthorities.value = rawList;
        const seen = new Set<string>();
        const syncedProjects: Array<{ code: string; name: string }> = [];
        for (const pa of rawList) {
          if (pa.projectCode && !seen.has(pa.projectCode)) {
            seen.add(pa.projectCode);
            syncedProjects.push({
              code: pa.projectCode,
              name: pa.projectName || pa.projectCode,
            });
          }
        }
        if (syncedProjects.length > 0) {
          availableProjects.value = syncedProjects;
        }
      }
    } catch {
      // Fallback tetap menggunakan catalog awal jika endpoint belum tersedia
    }
  } catch (err: any) {
    console.error('Failed to load initial data:', err);
  } finally {
    loading.value = false;
  }
}

async function loadMyBlockers() {
  loadingBlockers.value = true;
  try {
    const res = await apiClient<any[]>('/blockers?mine=raised');
    if (res.data) {
      myBlockers.value = sortBlockersByNewest(res.data);
    }
  } catch (err: any) {
    console.error('Failed to load my blockers:', err);
  } finally {
    loadingBlockers.value = false;
  }
}

async function submitBlocker() {
  errorMessage.value = null;

  if (title.value.trim().length < 10) {
    errorMessage.value = 'Judul kendala wajib diisi minimal 10 karakter.';
    return;
  }
  if (!blockerType.value) {
    errorMessage.value = 'Kategori kendala wajib dipilih.';
    return;
  }
  if (blockerImpacts.value.length < 1 || blockerImpacts.value.length > 3) {
    errorMessage.value = 'Pilih minimal 1 dan maksimal 3 dampak kendala.';
    return;
  }
  if (
    blockerType.value === 'CROSS_TEAM' &&
    authorityContext.value !== 'PROJECT_AUTHORITY' &&
    !assignedOwnerId.value &&
    !waitingForFunction.value
  ) {
    errorMessage.value =
      'Silakan pilih divisi yang sedang ditunggu untuk kategori Menunggu Tim / Rekan Lain.';
    return;
  }
  if (description.value.trim().length < 20) {
    errorMessage.value = 'Deskripsi kendala & upaya mandiri wajib diisi minimal 20 karakter.';
    return;
  }
  if (authorityContext.value === 'PROJECT_AUTHORITY' && !projectCode.value.trim()) {
    errorMessage.value = 'Kode proyek wajib dipilih jika menggunakan Kewenangan Proyek (Project Authority).';
    return;
  }

  submitting.value = true;
  try {
    // Jika pelapor memilih mode otomatis (kosong), biarkan undefined agar backend mengevaluasi aturan cuti/delegasi/rantai terkini saat submit
    const targetOwnerId = assignedOwnerId.value || undefined;

    const payload = {
      type: blockerType.value,
      severity: blockerSeverity.value,
      impact: blockerImpacts.value[0],
      impacts: [...blockerImpacts.value],
      ...(blockerType.value === 'CROSS_TEAM' && waitingForFunction.value
        ? { waitingForFunction: waitingForFunction.value }
        : {}),
      description: `[${title.value.trim()}] ${description.value.trim()}${expectedHelp.value.trim() ? ` (Ekspektasi: ${expectedHelp.value.trim()})` : ''}`,
      ownerNeededType: authorityContext.value,
      assignedOwnerId: targetOwnerId,
      projectCodeReference: authorityContext.value === 'PROJECT_AUTHORITY' ? projectCode.value.trim() : undefined,
      linkedCommitmentId: linkedCommitmentId.value ? linkedCommitmentId.value : undefined,
    };

    const res = await apiClient<any>('/blockers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    submittedTicket.value = res.data;
    toastMessage.value = 'Tiket kendala berhasil diterbitkan dan dinotifikasi ke penanggung jawab.';
    loadMyBlockers();

    if (isFromMorningCommitment.value && res.data?.id && router && typeof router.push === 'function') {
      await router.push({
        path: '/daily/morning',
        query: {
          linkedBlockerId: res.data.id,
          slot: morningReturnSlot.value,
        },
      });
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menerbitkan tiket kendala.';
  } finally {
    submitting.value = false;
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'RESOLVED':
      return 'teal';
    case 'IN_PROGRESS':
    case 'ACKNOWLEDGED':
      return 'blue';
    case 'OPEN':
      return 'amber';
    case 'ACCEPTED_RISK':
      return 'orange';
    case 'CLOSED':
      return 'green';
    default:
      return 'neutral';
  }
}

const getStatusLabel = getBlockerStatusLabel;

function getSeverityClass(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'red';
    case 'HIGH':
      return 'amber';
    case 'MEDIUM':
      return 'blue';
    case 'LOW':
    default:
      return 'neutral';
  }
}

function formatDate(isoDate?: string): string {
  return formatShortDateTimeWib(isoDate, 'Hari ini');
}

function getTicketTitle(ticket: any): string {
  if (ticket.title) return ticket.title;
  if (!ticket.description) return 'Laporan Kendala';
  const match = ticket.description.match(/^\[(.*?)\]/);
  if (match && match[1]) {
    return match[1];
  }
  return ticket.description.slice(0, 50);
}

function getTicketDescription(ticket: any): string {
  if (!ticket.description) return '';
  return ticket.description
    .replace(/\s*\(Ekspektasi:\s*[^)]+\)\s*$/i, '')
    .replace(/^\[.*?\]\s*/, '')
    .trim();
}

function getTicketExpectedHelp(ticket: any): string | null {
  if (!ticket.description) return null;
  const match = ticket.description.match(/\(Ekspektasi:\s*([^)]+)\)\s*$/i);
  return match?.[1]?.trim() || null;
}

async function confirmAndCloseTicket(ticketId: string) {
  closingId.value = ticketId;
  errorMessage.value = null;
  try {
    await apiClient(`/blockers/${ticketId}/close`, { method: 'POST' });
    toastMessage.value = 'Tiket kendala telah dikonfirmasi dan ditutup permanen.';
    await loadMyBlockers();
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menutup tiket kendala.';
  } finally {
    closingId.value = null;
  }
}

function openInlineReopen(ticketId: string) {
  reopeningId.value = ticketId;
  reopenReasonMap.value[ticketId] = '';
}

function cancelInlineReopen() {
  reopeningId.value = null;
}

async function submitInlineReopen(ticketId: string) {
  const reason = (reopenReasonMap.value[ticketId] || '').trim();
  if (reason.length < 10) {
    errorMessage.value = 'Alasan pengembalian minimal 10 karakter.';
    return;
  }
  submittingReopenId.value = ticketId;
  errorMessage.value = null;
  try {
    await apiClient(`/blockers/${ticketId}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ reopenReason: reason }),
    });
    reopeningId.value = null;
    toastMessage.value = 'Tiket dikembalikan ke penanggung jawab untuk penanganan ulang.';
    await loadMyBlockers();
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mengembalikan tiket kendala.';
  } finally {
    submittingReopenId.value = null;
  }
}

function getTicketHistory(ticket: any) {
  return buildBlockerTicketHistory(ticket);
}

function formatHistoryTime(dateStr: string): string {
  return formatTimeWib(dateStr);
}

function openSupportAcceptForm(supportId: string) {
  rejectingSupportId.value = supportId;
  supportResponseMode.value = 'ACCEPT_AS_SUPPORT';
  supportRejectReasonMap.value[supportId] = '';
}

function openSupportRejectForm(supportId: string) {
  rejectingSupportId.value = supportId;
  supportResponseMode.value = 'REJECT_SUPPORT';
  supportRejectReasonMap.value[supportId] = '';
}

function cancelSupportRejectForm() {
  rejectingSupportId.value = null;
}

async function respondToSupport(
  ticketId: string,
  supportId: string,
  decision: 'RESOLVE_AND_CLOSE' | 'ACCEPT_AS_SUPPORT' | 'REJECT_SUPPORT',
) {
  const reason = (supportRejectReasonMap.value[supportId] || '').trim();
  if (decision !== 'RESOLVE_AND_CLOSE' && reason.length < 10) {
    errorMessage.value =
      decision === 'ACCEPT_AS_SUPPORT'
        ? 'Catatan progres dan sisa kendala yang masih terjadi wajib diisi minimal 10 karakter.'
        : 'Penjelasan kendala yang masih terjadi wajib diisi minimal 10 karakter.';
    return;
  }

  respondingSupportId.value = supportId;
  errorMessage.value = null;
  try {
    await apiClient(`/blockers/${ticketId}/support/${supportId}/respond`, {
      method: 'POST',
      body: JSON.stringify({
        decision,
        ...(decision !== 'RESOLVE_AND_CLOSE' ? { reason } : {}),
      }),
    });
    if (rejectingSupportId.value === supportId) {
      rejectingSupportId.value = null;
    }
    if (decision === 'RESOLVE_AND_CLOSE') {
      toastMessage.value = 'Bantuan diterima sebagai penyelesaian. Tiket ditutup permanen.';
    } else if (decision === 'ACCEPT_AS_SUPPORT') {
      toastMessage.value = 'Bantuan diterima (membantu sebagian). Tiket tetap dilanjutkan penanggung jawab.';
    } else {
      toastMessage.value = 'Catatan bahwa kendala masih berlanjut telah disimpan dan diberitahukan ke penanggung jawab.';
    }
    await loadMyBlockers();
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal merespons kontribusi bantuan.';
  } finally {
    respondingSupportId.value = null;
  }
}

const modalError = ref<string | null>(null);

watch(
  [
    editTitle,
    editType,
    editImpacts,
    editWaitingForFunction,
    editSeverity,
    editDescription,
    editExpectedHelp,
    deleteReasonCategory,
    deleteReason,
  ],
  () => {
    if (modalError.value) modalError.value = null;
  },
  { deep: true },
);

const canSubmitEdit = computed(() => {
  if (!editingTicket.value) return false;
  if (editTitle.value.trim().length < 10) return false;
  if (!editType.value || editImpacts.value.length < 1 || editImpacts.value.length > 3 || !editSeverity.value) {
    return false;
  }
  if (
    editType.value === 'CROSS_TEAM' &&
    editingTicket.value.ownerNeededType !== 'PROJECT_AUTHORITY' &&
    !editWaitingForFunction.value
  ) {
    return false;
  }
  if (editDescription.value.trim().length < 20) return false;
  return true;
});

const canSubmitDelete = computed(() => {
  if (!deletingTicket.value) return false;
  if (!deleteReasonCategory.value) return false;
  if (deleteReasonCategory.value === 'OTHER' && deleteReason.value.trim().length < 10) {
    return false;
  }
  return true;
});

function toggleEditImpact(code: string) {
  editImpacts.value = toggleImpactSelection(editImpacts.value, code, 3);
}

function openEditModal(ticket: any) {
  errorMessage.value = null;
  modalError.value = null;
  editingTicket.value = ticket;
  const parts = parseBlockerTextParts(ticket?.description);
  editTitle.value = parts.title;
  editType.value = ticket?.type || 'TECHNICAL';
  const parsedImpacts = getTicketImpactsList(ticket).map((i) => i.value);
  editImpacts.value = parsedImpacts.length > 0 ? parsedImpacts.slice(0, 3) : ['TASK'];
  editWaitingForFunction.value = ticket?.waitingForFunction || '';
  editSeverity.value = ticket?.severity || 'HIGH';
  editDescription.value = parts.body;
  editExpectedHelp.value = parts.expectedHelp || '';
}

function closeEditModal() {
  modalError.value = null;
  editingTicket.value = null;
}

async function submitEditTicket() {
  if (!editingTicket.value) return;
  errorMessage.value = null;
  modalError.value = null;

  if (editTitle.value.trim().length < 10) {
    modalError.value = 'Judul kendala wajib diisi minimal 10 karakter.';
    errorMessage.value = modalError.value;
    return;
  }
  if (!editType.value || editImpacts.value.length < 1 || editImpacts.value.length > 3 || !editSeverity.value) {
    modalError.value = 'Kategori, minimal 1–3 dampak, dan tingkat keparahan wajib dipilih.';
    errorMessage.value = modalError.value;
    return;
  }
  if (
    editType.value === 'CROSS_TEAM' &&
    editingTicket.value.ownerNeededType !== 'PROJECT_AUTHORITY' &&
    !editWaitingForFunction.value
  ) {
    modalError.value = 'Silakan pilih divisi yang sedang ditunggu untuk kategori Menunggu Tim / Rekan Lain.';
    errorMessage.value = modalError.value;
    return;
  }
  if (editDescription.value.trim().length < 20) {
    modalError.value = 'Deskripsi kendala wajib diisi minimal 20 karakter.';
    errorMessage.value = modalError.value;
    return;
  }

  submittingEdit.value = true;
  try {
    await apiClient(`/blockers/${editingTicket.value.id}/update`, {
      method: 'POST',
      body: JSON.stringify({
        type: editType.value,
        severity: editSeverity.value,
        impact: editImpacts.value[0],
        impacts: [...editImpacts.value],
        ...(editType.value === 'CROSS_TEAM' && editWaitingForFunction.value
          ? { waitingForFunction: editWaitingForFunction.value }
          : {}),
        description: composeBlockerDescription(
          editTitle.value,
          editDescription.value,
          editExpectedHelp.value,
        ),
      }),
    });
    editingTicket.value = null;
    toastMessage.value =
      'Perubahan tiket kendala disimpan dan dinotifikasikan ke PIC, Lead, serta Head terkait.';
    await loadMyBlockers();
  } catch (err: any) {
    modalError.value = err.message || 'Gagal memperbarui tiket kendala.';
    errorMessage.value = modalError.value;
  } finally {
    submittingEdit.value = false;
  }
}

function openDeleteModal(ticket: any) {
  errorMessage.value = null;
  modalError.value = null;
  deletingTicket.value = ticket;
  deleteReasonCategory.value = '';
  deleteReason.value = '';
}

function closeDeleteModal() {
  modalError.value = null;
  deletingTicket.value = null;
}

async function submitDeleteTicket() {
  if (!deletingTicket.value) return;
  errorMessage.value = null;
  modalError.value = null;

  if (!deleteReasonCategory.value) {
    modalError.value = 'Kategori alasan penghapusan wajib dipilih terlebih dahulu.';
    errorMessage.value = modalError.value;
    return;
  }
  const trimmedReason = deleteReason.value.trim();
  if (deleteReasonCategory.value === 'OTHER' && trimmedReason.length < 10) {
    modalError.value =
      'Detail alasan penghapusan wajib diisi minimal 10 karakter untuk kategori Alasan Lainnya.';
    errorMessage.value = modalError.value;
    return;
  }

  submittingDelete.value = true;
  try {
    await apiClient(`/blockers/${deletingTicket.value.id}/delete`, {
      method: 'POST',
      body: JSON.stringify({
        reasonCategory: deleteReasonCategory.value,
        ...(deleteReasonCategory.value === 'OTHER' ? { reason: trimmedReason } : {}),
      }),
    });
    deletingTicket.value = null;
    toastMessage.value =
      'Tiket kendala telah dihapus dan pemberitahuan dikirim ke PIC, Lead, serta Head terkait.';
    await loadMyBlockers();
  } catch (err: any) {
    modalError.value = err.message || 'Gagal menghapus tiket kendala.';
    errorMessage.value = modalError.value;
  } finally {
    submittingDelete.value = false;
  }
}

onMounted(() => {
  if (typeof route?.query?.projectCode === 'string' && route.query.projectCode.trim()) {
    authorityContext.value = 'PROJECT_AUTHORITY';
    projectCode.value = route.query.projectCode.trim();
  }
  loadInitialData();
  loadMyBlockers();
  loadRoutingPreview();
  tickTimer = setInterval(() => {
    nowTick.value = Date.now();
  }, 30000);
});

onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer);
});
</script>

<template>
  <div class="blocker-layout">
    <!-- Topbar Navigation -->
    <TopBar breadcrumb="Workspace / Blocker" />

    <!-- Toasts -->
    <ToastPopup
      :toast-message="toastMessage"
      :error-message="errorMessage"
      @clear-toast="toastMessage = null"
      @clear-error="errorMessage = null"
    />

    <main class="main-content">
      <!-- Back Navigation Link (IMP-041) -->
      <router-link
        v-if="!authStore.user || canAccessRoute('/daily/morning', authStore.user)"
        to="/daily/morning"
        class="back-nav-link"
        data-testid="back-nav-link"
        title="Kembali ke Ruang Kerja My Today"
      >
        <ArrowLeft :size="15" />
        <span>Kembali ke Ruang Kerja My Today</span>
      </router-link>

      <!-- Banner Konteks saat datang dari Morning Commitment RED (DEC-020 Cara A) -->
      <div
        v-if="isFromMorningCommitment"
        class="morning-return-banner"
        role="status"
        data-testid="morning-return-banner"
      >
        <div class="morning-return-content">
          <AlertTriangle :size="18" />
          <div>
            <strong>Membuat Tiket Blocker untuk Morning Commitment:</strong>
            Draf komitmen pagi Anda sudah tersimpan otomatis. Setelah tiket ini dikirim, Anda akan langsung diarahkan kembali ke Morning Commitment dengan tiket baru sudah otomatis tertaut.
          </div>
        </div>
        <router-link to="/daily/morning" class="btn-secondary btn-return-cancel">
          Batal &amp; Kembali ke Morning Commitment
        </router-link>
      </div>

      <!-- Page Heading (IMP-041: No kicker, IMP-042: No antrean blocker aktif link) -->
      <div class="page-heading">
        <div>
          <h1>Laporkan &amp; Pantau Blocker</h1>
          <p class="subtitle">
            Laporkan hambatan atau dependensi kerja beserta dampak dan tingkat keparahannya agar penanggung jawab berwenang dapat segera menindaklanjuti.
          </p>
        </div>
      </div>

      <!-- View Mode Tabs (IMP-041: Buat Laporan Blocker vs Blocker Saya) -->
      <div class="view-tabs" role="tablist" aria-label="Mode Tampilan Halaman Blocker">
        <button
          type="button"
          class="view-tab"
          :class="{ active: activeTab === 'create' }"
          role="tab"
          :aria-selected="activeTab === 'create'"
          data-testid="tab-create-blocker"
          @click="activeTab = 'create'"
        >
          <Plus :size="16" />
          <span>Buat Laporan Blocker</span>
        </button>
        <button
          type="button"
          class="view-tab"
          :class="{ active: activeTab === 'mine' }"
          role="tab"
          :aria-selected="activeTab === 'mine'"
          data-testid="tab-my-blockers"
          @click="switchToMyBlockers(false)"
        >
          <Layers :size="16" />
          <span>Blocker Saya</span>
          <span
            class="tab-badge"
            :class="{ alert: activeBlockersCount > 0 }"
            data-testid="active-blockers-count"
          >
            {{ activeBlockersCount }}
          </span>
        </button>
      </div>

      <!-- VIEW A: FORMULIR PELAPORAN CEPAT -->
      <div v-if="activeTab === 'create'" class="create-blocker-view">
        <!-- Success Screen If Submitted -->
        <div v-if="submittedTicket" class="submitted-card" data-testid="submitted-ticket-card">
          <div class="submitted-icon">
            <CheckCircle2 :size="36" />
          </div>
          <h2>Tiket Kendala Berhasil Diterbitkan</h2>
          <p class="submitted-msg">
            Tiket ID: <code>{{ submittedTicket.id }}</code> telah dicatat pada sistem dengan status <strong>{{ getStatusLabel(submittedTicket.status) }}</strong>. Notifikasi segera dikirimkan kepada penanggung jawab terkait.
          </p>
          <div class="submitted-actions">
            <button
              type="button"
              class="btn-secondary"
              data-testid="btn-view-my-blockers"
              @click="switchToMyBlockers(true)"
            >
              Lihat di Blocker Saya
            </button>
            <button
              type="button"
              class="btn-secondary"
              data-testid="btn-create-another"
              @click="resetFormForAnother"
            >
              Laporkan Kendala Lain
            </button>
            <router-link
              to="/daily/morning"
              class="btn-primary"
              data-testid="btn-back-to-workspace"
            >
              <span>Kembali ke Ruang Kerja</span>
              <ArrowRight :size="16" />
            </router-link>
          </div>
        </div>

        <form v-else class="blocker-form" @submit.prevent="submitBlocker" novalidate>
          <!-- Form Utama -->
          <!-- Panel 1: Detail Kendala -->
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>Detail Kendala, Taksonomi &amp; Dampak</h2>
                <p class="panel-desc">Tuliskan fakta kendala, kategori, dampak, dan tingkat keparahan (Severity).</p>
              </div>
              <span class="pill pill-brand">Bagian 1 dari 2</span>
            </div>

            <div class="panel-body">
              <!-- Judul -->
              <div class="form-group">
                <div class="label-row">
                  <label for="blockerTitle">Judul Kendala <span class="req">*</span></label>
                  <span class="char-counter" :class="{ 'char-valid': charCount >= 10 }">{{ charCount }} / 140</span>
                </div>
                <input
                  id="blockerTitle"
                  v-model="title"
                  type="text"
                  maxlength="140"
                  placeholder="Contoh: [Payment Gateway] Kredensial Sandbox Kadaluarsa (min. 10 karakter)"
                  required
                />
              </div>

              <!-- Tautan Komitmen -->
              <div class="form-group">
                <label for="linkedCommitment">Tautkan ke Komitmen / Tugas Hari Ini <span class="opt">(opsional)</span></label>
                <select id="linkedCommitment" v-model="linkedCommitmentId">
                  <option value="">— Tidak Terkait Komitmen Hari Ini —</option>
                  <option v-for="c in todayCommitments" :key="c.id" :value="c.id">
                    [Komitmen #{{ getCommitmentSeqNo(c) }}] {{ c.taskText }}
                  </option>
                </select>
              </div>

              <!-- Kategori & Divisi yang Ditunggu -->
              <div class="form-group">
                <label for="blockerType">Kategori Kendala <span class="req">*</span></label>
                <select id="blockerType" v-model="blockerType" required>
                  <option value="" disabled>-- Pilih Kategori Kendala (16 Kategori) --</option>
                  <optgroup
                    v-for="group in BLOCKER_TYPE_GROUPS"
                    :key="group.groupLabel"
                    :label="group.groupLabel"
                  >
                    <option
                      v-for="opt in group.options"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </optgroup>
                </select>
              </div>

              <div
                v-if="blockerType === 'CROSS_TEAM' && authorityContext !== 'PROJECT_AUTHORITY'"
                class="form-group"
              >
                <label for="waitingForFunction">Divisi yang Sedang Ditunggu <span class="req">*</span></label>
                <select id="waitingForFunction" v-model="waitingForFunction" required>
                  <option value="" disabled>-- Pilih Divisi yang Sedang Ditunggu --</option>
                  <option
                    v-for="fnOpt in WAITING_FOR_FUNCTION_OPTIONS"
                    :key="fnOpt.value"
                    :value="fnOpt.value"
                  >
                    {{ fnOpt.label }}
                  </option>
                </select>
              </div>

              <!-- Dampak Kendala (Kotak Centang 1-3 Pilihan) -->
              <div class="form-group">
                <div class="label-row">
                  <label>Dampak Kendala (Pilih 1–3 Dampak) <span class="req">*</span></label>
                  <span
                    class="char-counter"
                    :class="{
                      'char-valid': blockerImpacts.length >= 1 && blockerImpacts.length <= 3,
                      'char-invalid': impactTouched && blockerImpacts.length === 0,
                    }"
                    data-testid="impact-selection-count"
                  >
                    {{ blockerImpacts.length }} / 3 dipilih
                  </span>
                </div>
                <p class="impact-hint-text">Pilih 1 sampai maksimal 3 dampak yang paling terasa.</p>
                <p
                  v-if="impactTouched && blockerImpacts.length === 0"
                  class="impact-error-text"
                  role="alert"
                  data-testid="impact-min-warning"
                >
                  Minimal pilih 1 dampak kendala.
                </p>
                <div class="impact-checkbox-grid" data-testid="impact-checkbox-grid">
                  <label
                    v-for="opt in BLOCKER_IMPACT_OPTIONS"
                    :key="opt.value"
                    class="impact-checkbox-card"
                    :class="{
                      selected: blockerImpacts.includes(opt.value),
                      disabled: !blockerImpacts.includes(opt.value) && blockerImpacts.length >= 3,
                    }"
                  >
                    <input
                      type="checkbox"
                      :value="opt.value"
                      :checked="blockerImpacts.includes(opt.value)"
                      :disabled="!blockerImpacts.includes(opt.value) && blockerImpacts.length >= 3"
                      :data-testid="`impact-checkbox-${opt.value}`"
                      @change="toggleBlockerImpact(opt.value)"
                    />
                    <div class="impact-checkbox-copy">
                      <span class="impact-name">{{ opt.name }}</span>
                      <span class="impact-meaning">{{ opt.meaning }}</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Severity Cards -->
              <div class="form-group">
                <div class="label-row">
                  <label>Tingkat Keparahan (Severity) <span class="req">*</span></label>
                  <span class="pill pill-sla">Target Penanganan Sesuai Kebijakan Aktif</span>
                </div>
                <div class="severity-grid">
                  <label class="severity-card critical" :class="{ selected: blockerSeverity === 'CRITICAL' }">
                    <input type="radio" v-model="blockerSeverity" value="CRITICAL" />
                    <div class="card-head">
                      <span class="sev-badge critical">Critical</span>
                      <span class="sev-sla">Target: {{ formatSla(slaMinutes.CRITICAL) }}</span>
                    </div>
                    <p class="sev-desc">Kerja macet total, butuh penanganan darurat segera.</p>
                  </label>

                  <label class="severity-card high" :class="{ selected: blockerSeverity === 'HIGH' }">
                    <input type="radio" v-model="blockerSeverity" value="HIGH" />
                    <div class="card-head">
                      <span class="sev-badge high">High</span>
                      <span class="sev-sla">Target: {{ formatSla(slaMinutes.HIGH) }}</span>
                    </div>
                    <p class="sev-desc">Hambatan berat, target kerja terancam jika tidak segera ditangani.</p>
                  </label>

                  <label class="severity-card medium" :class="{ selected: blockerSeverity === 'MEDIUM' }">
                    <input type="radio" v-model="blockerSeverity" value="MEDIUM" />
                    <div class="card-head">
                      <span class="sev-badge medium">Medium</span>
                      <span class="sev-sla">Target: {{ formatSla(slaMinutes.MEDIUM) }}</span>
                    </div>
                    <p class="sev-desc">Hambatan sedang, masih bisa mengerjakan tugas lain sementara.</p>
                  </label>

                  <label class="severity-card low" :class="{ selected: blockerSeverity === 'LOW' }">
                    <input type="radio" v-model="blockerSeverity" value="LOW" />
                    <div class="card-head">
                      <span class="sev-badge low">Low</span>
                      <span class="sev-sla">Target: {{ formatSla(slaMinutes.LOW) }}</span>
                    </div>
                    <p class="sev-desc">Kendala kecil, tidak mendesak dan risiko rendah.</p>
                  </label>
                </div>

                <!-- Critical Alert Box -->
                <div v-if="blockerSeverity === 'CRITICAL'" class="critical-notice">
                  <AlertTriangle :size="18" />
                  <span>
                    <strong>Perhatian Skala Critical:</strong> Opsi ini mengaktifkan timer darurat (target respons {{ formatSla(slaMinutes.CRITICAL) }}) dan memicu eskalasi prioritas ke pimpinan divisi.
                  </span>
                </div>
              </div>

              <!-- Deskripsi & Upaya Mandiri -->
              <div class="form-group">
                <div class="label-row">
                  <label for="blockerDesc">Deskripsi Kendala &amp; Upaya Mandiri <span class="req">*</span></label>
                  <button type="button" class="btn-text-action" @click="insertStructuredTemplate">
                    + Gunakan Format Terstruktur
                  </button>
                </div>
                <div
                  v-if="showTemplateConfirm"
                  class="template-confirm-box"
                  role="alertdialog"
                  aria-label="Konfirmasi penggantian teks deskripsi"
                  data-testid="template-overwrite-confirm"
                >
                  <p>
                    Kolom deskripsi sudah berisi teks. Menerapkan format terstruktur akan mengganti isi yang sudah diketik.
                  </p>
                  <div class="template-confirm-actions">
                    <button
                      type="button"
                      class="btn-template-cancel"
                      data-testid="btn-cancel-apply-template"
                      @click="cancelApplyTemplate"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      class="btn-template-confirm"
                      data-testid="btn-confirm-apply-template"
                      @click="confirmApplyTemplate"
                    >
                      Ganti dengan Format Terstruktur
                    </button>
                  </div>
                </div>
                <textarea
                  id="blockerDesc"
                  v-model="description"
                  rows="5"
                  minlength="20"
                  placeholder="Jelaskan fakta kendala, pihak/area yang terdampak, serta langkah mandiri yang sudah dicoba... (min. 20 karakter)"
                  required
                ></textarea>
              </div>

              <!-- Ekspektasi Bantuan -->
              <div class="form-group">
                <div class="label-row">
                  <label for="expectedHelpInput">Bantuan Konkret yang Diharapkan <span class="opt">(opsional)</span></label>
                </div>
                <div class="chip-container">
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Approval PR/Tiket')">+ Approval</button>
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Konfirmasi Requirement')">+ Requirement</button>
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Akses Kredensial / Token')">+ Akses</button>
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Bantuan Tim Infra / Server')">+ Infra</button>
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Review Solusi / Arsitektur')">+ Code Review</button>
                </div>
                <input
                  id="expectedHelpInput"
                  v-model="expectedHelp"
                  type="text"
                  maxlength="200"
                  placeholder="Aksi konkret yang Anda harapkan (Contoh: Butuh approval token staging oleh PM)..."
                />
              </div>
            </div>
          </section>

          <!-- Panel 2: Penanggung Jawab & Jalur Kewenangan -->
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>Penanggung Jawab Awal &amp; Jalur Kewenangan</h2>
                <p class="panel-desc">Tentukan konteks kewenangan penanganan kendala.</p>
              </div>
              <span class="pill pill-brand">Bagian 2 dari 2</span>
            </div>

            <div class="panel-body">
              <div class="authority-grid">
                <label
                  class="authority-card"
                  :class="{ selected: authorityContext === 'ORGANIZATIONAL_AUTHORITY' }"
                >
                  <input
                    type="radio"
                    v-model="authorityContext"
                    value="ORGANIZATIONAL_AUTHORITY"
                  />
                  <div class="auth-icon"><Shield :size="20" /></div>
                  <div>
                    <strong>Organizational Authority (Struktural)</strong>
                    <p>Ditangani oleh Atasan Langsung atau Lead Divisi dalam bagan organisasi (Level 1).</p>
                  </div>
                </label>

                <label
                  class="authority-card"
                  :class="{ selected: authorityContext === 'PROJECT_AUTHORITY' }"
                >
                  <input
                    type="radio"
                    v-model="authorityContext"
                    value="PROJECT_AUTHORITY"
                  />
                  <div class="auth-icon"><FolderGit2 :size="20" /></div>
                  <div>
                    <strong>Project Authority (Kewenangan Proyek)</strong>
                    <p>Ditangani oleh personil berwenang di proyek terkait.</p>
                  </div>
                </label>
              </div>

              <!-- Proyek Terkait (Kondisional jika Project Authority dipilih) -->
              <div v-if="authorityContext === 'PROJECT_AUTHORITY'" class="form-group" style="margin-top: 16px;">
                <label for="projectCodeSelect">Pilih Proyek Terdaftar <span class="req">*</span></label>
                <select id="projectCodeSelect" v-model="projectCode" required>
                  <option value="">-- Pilih Proyek Terdaftar --</option>
                  <option v-for="p in availableProjects" :key="p.code" :value="p.code">
                    {{ p.code }} — {{ p.name }}
                  </option>
                </select>
              </div>

              <!-- Pemilihan Orang Tertentu (IMP-046: Pengelompokan Hierarkis Otoritas Berdasarkan Jalur) -->
              <div class="form-group" style="margin-top: 16px;">
                <label for="assignedOwner">Penanggung Jawab Khusus <span class="opt">(opsional)</span></label>
                <select
                  id="assignedOwner"
                  v-model="assignedOwnerId"
                  :disabled="authorityContext === 'PROJECT_AUTHORITY' && !projectCode"
                >
                  <option
                    v-if="authorityContext === 'ORGANIZATIONAL_AUTHORITY' || projectCode"
                    value=""
                  >
                    — Ditentukan Otomatis{{ defaultSupervisorName ? `: ${defaultSupervisorName}${suggestedOwner?.jobTitle ? ` (${suggestedOwner.jobTitle})` : ''}` : ' oleh Sistem' }} —
                  </option>
                  <option v-else value="">
                    — Pilih Proyek Terdaftar terlebih dahulu —
                  </option>

                  <!-- 1. JALUR ORGANIZATIONAL AUTHORITY (STRUKTURAL) -->
                  <optgroup
                    v-if="authorityContext === 'ORGANIZATIONAL_AUTHORITY' && eligibleOwners.directManagers.length > 0"
                    label="── Atasan Langsung (Direct Supervisor) ──"
                  >
                    <option
                      v-for="u in eligibleOwners.directManagers"
                      :key="u.id"
                      :value="u.id"
                    >
                      {{ u.fullName }} — {{ u.jobTitle || 'Technical Lead' }} [Atasan Langsung]
                    </option>
                  </optgroup>

                  <optgroup
                    v-if="authorityContext === 'ORGANIZATIONAL_AUTHORITY' && eligibleOwners.departmentHeads.length > 0"
                    label="── Penanggung Jawab Divisi Terkait (Department Heads) ──"
                  >
                    <option
                      v-for="u in eligibleOwners.departmentHeads"
                      :key="u.id"
                      :value="u.id"
                    >
                      {{ u.fullName }} — {{ u.jobTitle || 'Head of Department' }}
                    </option>
                  </optgroup>

                  <optgroup
                    v-if="authorityContext === 'ORGANIZATIONAL_AUTHORITY' && eligibleOwners.directors.length > 0"
                    label="── Direksi Eksekutif (Leadership) ──"
                  >
                    <option
                      v-for="u in eligibleOwners.directors"
                      :key="u.id"
                      :value="u.id"
                    >
                      {{ u.fullName }} — {{ u.jobTitle || 'Chief Executive Officer' }}
                    </option>
                  </optgroup>

                  <!-- 2. JALUR PROJECT AUTHORITY (KEWENANGAN PROYEK) -->
                  <optgroup
                    v-if="authorityContext !== 'ORGANIZATIONAL_AUTHORITY' && eligibleOwners.projectLeads.length > 0"
                    :label="`── Pimpinan Proyek (Project Lead / PM: ${projectCode}) ──`"
                  >
                    <option
                      v-for="u in eligibleOwners.projectLeads"
                      :key="u.id"
                      :value="u.id"
                    >
                      {{ u.fullName }} — {{ u.jobTitle || 'Project Lead' }} [Pimpinan Proyek]
                    </option>
                  </optgroup>

                  <optgroup
                    v-if="authorityContext !== 'ORGANIZATIONAL_AUTHORITY' && eligibleOwners.projectSponsors.length > 0"
                    :label="`── Pengarah Proyek (Project Sponsor / Reviewer: ${projectCode}) ──`"
                  >
                    <option
                      v-for="u in eligibleOwners.projectSponsors"
                      :key="u.id"
                      :value="u.id"
                    >
                      {{ u.fullName }} — {{ u.jobTitle || 'Project Sponsor' }} [Pengarah Proyek]
                    </option>
                  </optgroup>

                  <!-- 3. REKAN / PIHAK LAIN: pilihan bebas pelapor di luar jalur kewenangan -->
                  <optgroup
                    v-if="otherOwners.length > 0 && !(authorityContext === 'PROJECT_AUTHORITY' && !projectCode)"
                    label="── Lainnya ──"
                  >
                    <option v-for="u in otherOwners" :key="u.id" :value="u.id">
                      {{ u.fullName }} — {{ u.jobTitle || 'Staf' }}
                    </option>
                  </optgroup>
                </select>
                <span class="field-help" style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; display: block;">
                  Jika dibiarkan pada opsi default, sistem secara otomatis menugaskan penanggung jawab sesuai jalur kewenangan dan pemetaan yang berlaku.
                </span>
              </div>

              <!-- Route Preview Box -->
              <div class="route-preview">
                <Clock :size="20" class="route-icon" />
                <div>
                  <strong>Jalur Penanganan {{ assignedOwnerId ? 'Khusus' : 'Otomatis' }}:</strong>
                  <p v-if="selectedOwnerDetails">
                    Penanggung jawab ditunjuk spesifik: <strong>{{ selectedOwnerDetails.fullName }}</strong> ({{ selectedOwnerDetails.jobTitle || selectedOwnerDetails.role }}). Notifikasi darurat dan eskalasi langsung diarahkan ke yang bersangkutan.
                  </p>
                  <p v-else-if="authorityContext === 'ORGANIZATIONAL_AUTHORITY'">
                    <template v-if="suggestionNote">
                      {{ suggestionNote }} Penanggung jawab otomatis saat ini<span v-if="defaultSupervisorName">: <strong>{{ defaultSupervisorName }}</strong></span>.
                    </template>
                    <template v-else-if="suggestionReason === 'CATEGORY_OWNER'">
                      Tiket otomatis diteruskan ke Penanggung Jawab Kategori {{ suggestionDivision }}<span v-if="defaultSupervisorName">: <strong>{{ defaultSupervisorName }}</strong></span>.
                    </template>
                    <template v-else-if="suggestionReason === 'DIVISION_HEAD'">
                      Karena kategori kendala ini membutuhkan keahlian divisi {{ suggestionDivision }}, tiket otomatis diteruskan ke pimpinan divisi tersebut<span v-if="defaultSupervisorName">: <strong>{{ defaultSupervisorName }}</strong></span>.
                    </template>
                    <template v-else>
                      Tiket akan langsung diteruskan otomatis ke Atasan Langsung Anda<span v-if="defaultSupervisorName">: <strong>{{ defaultSupervisorName }}</strong></span>.
                    </template>
                    Batas waktu respons mulai dihitung mundur sejak tiket terbit. Jika bantuan yang dibutuhkan ada pada orang lain, pilih sendiri pada Penanggung Jawab Khusus.
                  </p>
                  <p v-else-if="!projectCode">
                    Silakan pilih Proyek Terdaftar terlebih dahulu untuk menentukan Pimpinan Proyek yang berwenang menerima eskalasi kendala ini.
                  </p>
                  <p v-else>
                    <template v-if="suggestionNote">
                      {{ suggestionNote }} Tiket Proyek {{ projectCode }} diteruskan otomatis ke<span v-if="defaultProjectLeadName">: <strong>{{ defaultProjectLeadName }}</strong></span>.
                    </template>
                    <template v-else>
                      Tiket akan langsung diteruskan otomatis ke Pimpinan Proyek {{ projectCode }}<span v-if="defaultProjectLeadName">: <strong>{{ defaultProjectLeadName }}</strong></span> untuk ditindaklanjuti.
                    </template>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Form Sticky Footer (IMP-044) -->
          <div class="sticky-footer">
            <div class="footer-content">
              <span class="footer-hint" data-testid="footer-hint">
                Pastikan fakta kendala akurat dan objektif untuk mempercepat penanganan oleh atasan.
              </span>
              <div class="footer-actions">
                <button
                  type="button"
                  class="btn-secondary"
                  data-testid="btn-reset-form"
                  @click="resetForm"
                >
                  <RotateCcw :size="15" />
                  <span>Bersihkan Formulir</span>
                </button>
                <button
                  type="submit"
                  class="btn-primary"
                  data-testid="btn-submit-blocker"
                  :disabled="submitting || !isFormValid"
                >
                  <span v-if="submitting">Mengirim Laporan...</span>
                  <span v-else>Kirim Laporan Blocker</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- VIEW B: DAFTAR BLOCKER SAYA (IMP-041) -->
      <section v-else class="my-blockers-view" data-testid="my-blockers-view">
        <div class="blockers-filter-bar">
          <div>
            <h2>Daftar Blocker yang Saya Laporkan</h2>
            <p class="subtitle">Pantau siklus hidup tiket kendala, sisa waktu penanganan, dan tindak lanjut penanganan.</p>
          </div>
          <div class="filter-pills" role="radiogroup" aria-label="Filter status blocker">
            <button
              type="button"
              class="filter-pill"
              :class="{ active: blockerFilter === 'all' }"
              data-testid="filter-all"
              @click="blockerFilter = 'all'"
            >
              Semua ({{ countAll }})
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ active: blockerFilter === 'open' }"
              data-testid="filter-open"
              @click="blockerFilter = 'open'"
            >
              {{ BLOCKER_STATUS_LABELS.OPEN }} ({{ countPendingResponse }})
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ active: blockerFilter === 'handling' }"
              data-testid="filter-handling"
              @click="blockerFilter = 'handling'"
            >
              {{ BLOCKER_STATUS_LABELS.ACKNOWLEDGED }} ({{ countInProgress }})
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ active: blockerFilter === 'resolved' }"
              data-testid="filter-resolved"
              @click="blockerFilter = 'resolved'"
            >
              Menunggu Konfirmasi ({{ countResolved }})
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ active: blockerFilter === 'closed' }"
              data-testid="filter-closed"
              @click="blockerFilter = 'closed'"
            >
              {{ BLOCKER_STATUS_LABELS.CLOSED }} ({{ countClosed }})
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingBlockers" class="loading-state" data-testid="loading-blockers">
          Memuat daftar blocker saya...
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBlockers.length === 0" class="empty-blockers" data-testid="empty-blockers">
          <div class="empty-blockers-icon">
            <Layers :size="24" />
          </div>
          <h3>Tidak Ada Blocker pada Filter Ini</h3>
          <p class="empty-desc">Semua kendala terkendali atau belum ada laporan pada kategori ini.</p>
        </div>

        <!-- Blocker Cards List -->
        <div v-else class="blockers-list" data-testid="blockers-list">
          <div
            v-for="b in filteredBlockers"
            :key="b.id"
            class="blocker-item-card"
            :class="{ resolved: b.status === 'RESOLVED' }"
            :data-ticket-id="b.id"
          >
            <div class="blocker-item-head">
              <div class="head-left">
                <span class="blocker-item-id">#{{ b.id.slice(0, 8) }}</span>
                <span class="pill" :class="getStatusBadgeClass(b.status)">
                  <span class="dot-sm"></span> {{ getStatusLabel(b.status) }}
                </span>
              </div>
              <div class="head-right">
                <span
                  v-if="b.status === 'RESOLVED' || b.status === 'ACCEPTED_RISK'"
                  class="confirm-status-label"
                  data-testid="reporter-confirm-label"
                >
                  <Clock :size="12" />
                  <span>Menunggu Konfirmasi Anda</span>
                </span>
                <span class="pill" :class="getSeverityClass(b.severity)">Tingkat {{ b.severity }}</span>
                <span class="date-sep"></span>
                <span class="blocker-date wp-datetime">{{ formatDate(b.raisedAt) }}</span>
              </div>
            </div>

            <div class="blocker-item-title">{{ getTicketTitle(b) }}</div>
            <p class="blocker-item-desc">{{ getTicketDescription(b) }}</p>
            <div v-if="getTicketExpectedHelp(b)" class="blocker-expected-box">
              <strong>Ekspektasi Bantuan:</strong> {{ getTicketExpectedHelp(b) }}
            </div>

            <div class="blocker-taxonomy-box" :data-testid="`my-blocker-taxonomy-${b.id}`">
              <div class="blocker-taxonomy-row">
                <span class="taxonomy-label">Kategori Kendala:</span>
                <span class="taxonomy-value">
                  <strong>{{ getBlockerTypeInfo(b.type).name }}</strong>
                  <template v-if="getBlockerTypeInfo(b.type).examples">
                    — {{ getBlockerTypeInfo(b.type).examples }}
                  </template>
                </span>
              </div>
              <div v-if="b.waitingForFunction" class="blocker-taxonomy-row">
                <span class="taxonomy-label">Divisi yang Ditunggu:</span>
                <span class="taxonomy-value"><strong>{{ getWaitingForFunctionLabel(b.waitingForFunction) }}</strong></span>
              </div>
              <div class="blocker-taxonomy-row">
                <span class="taxonomy-label">Dampak Kendala:</span>
                <ul class="blocker-taxonomy-impact-list">
                  <li v-for="imp in getTicketImpactsList(b)" :key="imp.value">
                    <strong>{{ imp.name }}</strong><template v-if="imp.meaning"> — {{ imp.meaning }}</template>
                  </li>
                </ul>
              </div>
            </div>

            <div class="blocker-item-meta">
              <span class="blocker-meta-item">
                Penanggung Jawab: <strong>{{ b.assignedOwner?.fullName || 'Belum Ditugaskan' }}</strong>
              </span>
              <span
                v-if="slaRemainingLabel(b)"
                class="blocker-meta-item sla-countdown"
                :class="{ overdue: slaRemainingLabel(b)?.overdue }"
                data-testid="sla-countdown"
              >
                <Clock :size="12" /> <strong>{{ slaRemainingLabel(b)?.text }}</strong>
              </span>
              <span v-if="b.linkedCommitment" class="blocker-meta-item">
                Terkait: <strong>Komitmen #{{ getCommitmentSeqNo(b.linkedCommitment) }}</strong>
              </span>
            </div>

            <!-- Tombol Edit & Hapus Khusus Tiket Aktif oleh Pelapor (DEC-016) -->
            <div
              v-if="isActiveBlockerStatus(b.status)"
              class="reporter-manage-bar"
              :data-testid="`reporter-manage-${b.id}`"
            >
              <button
                type="button"
                class="btn-manage-edit"
                :data-testid="`edit-ticket-${b.id}`"
                @click="openEditModal(b)"
              >
                <Pencil :size="13" />
                <span>Edit Tiket</span>
              </button>
              <button
                type="button"
                class="btn-manage-delete"
                :data-testid="`delete-ticket-${b.id}`"
                @click="openDeleteModal(b)"
              >
                <Trash2 :size="13" />
                <span>Hapus Tiket</span>
              </button>
            </div>

            <!-- Resolution Note (if available) -->
            <div
              v-if="b.resolutionNote && (b.status === 'RESOLVED' || b.status === 'CLOSED')"
              class="resolution-box"
            >
              <div class="resolution-title">
                <CheckCircle2 :size="14" />
                <span>Catatan Penyelesaian:</span>
              </div>
              <p class="resolution-text">{{ b.resolutionNote }}</p>
            </div>

            <!-- Accepted Risk Guidance (if available) -->
            <div
              v-if="
                (b.riskAcceptanceJustification || b.riskMitigationPlan) &&
                (b.status === 'ACCEPTED_RISK' || b.status === 'CLOSED')
              "
              class="risk-box"
            >
              <div class="risk-title">
                <ShieldAlert :size="14" />
                <span>Keputusan Terima Risiko &amp; Arahan Mitigasi:</span>
              </div>
              <p v-if="b.riskAcceptanceJustification" class="risk-text">
                <strong>Justifikasi:</strong> {{ b.riskAcceptanceJustification }}
              </p>
              <p v-if="b.riskMitigationPlan" class="risk-text">
                <strong>Mitigasi Sementara:</strong> {{ b.riskMitigationPlan }}
              </p>
            </div>

            <!-- History & Peer Support Timeline -->
            <div class="my-history-section" :data-testid="`my-blocker-history-${b.id}`">
              <div class="my-history-head">
                <Clock :size="14" />
                <span>Riwayat Penanganan &amp; Kontribusi ({{ getTicketHistory(b).length }})</span>
              </div>

              <div v-if="getTicketHistory(b).length === 0" class="my-history-empty">
                Belum ada catatan penanganan atau bantuan tercatat untuk tiket ini.
              </div>

              <div v-else class="my-history-list">
                <div
                  v-for="entry in getTicketHistory(b)"
                  :key="entry.id"
                  class="my-history-item"
                  :class="`variant-${entry.variant}`"
                  :data-testid="`my-history-item-${entry.id}`"
                >
                  <div class="my-hist-meta">
                    <div class="my-hist-actor-group">
                      <strong>{{ entry.actorName }}</strong>
                      <span class="my-hist-badge" :class="`variant-${entry.variant}`">
                        {{ entry.badgeLabel }}
                      </span>
                    </div>
                    <span class="my-hist-time wp-datetime">{{ formatHistoryTime(entry.createdAt) }}</span>
                  </div>
                  <div v-if="entry.primaryLabel" class="my-hist-line">
                    <strong>{{ entry.primaryLabel }}:</strong> {{ entry.primaryText }}
                  </div>
                  <div class="my-hist-line">
                    <strong>{{ entry.secondaryLabel }}:</strong> {{ entry.secondaryText }}
                  </div>
                  <div
                    v-if="entry.reporterFeedback"
                    class="my-hist-feedback"
                    :class="{ 'is-progress': entry.supportStatus === 'ACCEPTED_PROGRESS' }"
                  >
                    <strong>{{ entry.reporterFeedbackLabel || 'Catatan / Kendala yang Masih Terjadi' }}:</strong> {{ entry.reporterFeedback }}
                  </div>

                  <div
                    v-if="
                      entry.entryType === 'PEER_SUPPORT' &&
                      entry.supportStatus === 'PENDING' &&
                      b.status !== 'CLOSED'
                    "
                    class="support-response-panel"
                    :data-testid="`support-response-panel-${entry.id}`"
                  >
                    <div class="support-response-prompt">
                      Bagaimana tanggapan Anda terhadap bantuan ini?
                    </div>
                    <div v-if="rejectingSupportId !== entry.id" class="confirm-actions">
                      <button
                        type="button"
                        class="btn-sup-resolve"
                        :disabled="respondingSupportId === entry.id"
                        :data-testid="`support-resolve-close-${entry.id}`"
                        @click="respondToSupport(b.id, entry.id, 'RESOLVE_AND_CLOSE')"
                      >
                        Terima sbg Penyelesaian (Tutup Tiket)
                      </button>
                      <button
                        type="button"
                        class="btn-sup-accept"
                        :disabled="respondingSupportId === entry.id"
                        :data-testid="`support-accept-progress-${entry.id}`"
                        @click="openSupportAcceptForm(entry.id)"
                      >
                        Terima Bantuan (Membantu Sebagian)
                      </button>
                      <button
                        type="button"
                        class="btn-sup-reject"
                        :disabled="respondingSupportId === entry.id"
                        :data-testid="`support-reject-open-${entry.id}`"
                        @click="openSupportRejectForm(entry.id)"
                      >
                        Bantuan Belum Membantu
                      </button>
                    </div>
                    <div v-else class="inline-reopen-form">
                      <textarea
                        v-model="supportRejectReasonMap[entry.id]"
                        rows="2"
                        :placeholder="
                          supportResponseMode === 'ACCEPT_AS_SUPPORT'
                            ? 'Jelaskan bagian yang sudah terbantu dan sisa kendala yang masih perlu dituntaskan (min. 10 karakter)...'
                            : 'Jelaskan kendala yang masih terjadi setelah bantuan ini dicoba (min. 10 karakter)...'
                        "
                      ></textarea>
                      <div class="confirm-actions">
                        <button
                          v-if="supportResponseMode === 'ACCEPT_AS_SUPPORT'"
                          type="button"
                          class="btn-confirm-accept-progress"
                          :disabled="respondingSupportId === entry.id"
                          :data-testid="`support-accept-submit-${entry.id}`"
                          @click="respondToSupport(b.id, entry.id, 'ACCEPT_AS_SUPPORT')"
                        >
                          {{ respondingSupportId === entry.id ? 'Mengirim...' : 'Kirim Catatan Membantu Sebagian' }}
                        </button>
                        <button
                          v-else
                          type="button"
                          class="btn-confirm-reopen"
                          :disabled="respondingSupportId === entry.id"
                          :data-testid="`support-reject-submit-${entry.id}`"
                          @click="respondToSupport(b.id, entry.id, 'REJECT_SUPPORT')"
                        >
                          {{ respondingSupportId === entry.id ? 'Mengirim...' : 'Kirim Catatan Kendala' }}
                        </button>
                        <button
                          type="button"
                          class="btn-cancel-reopen"
                          @click="cancelSupportRejectForm"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reporter Confirmation Actions -->
            <div
              v-if="b.status === 'RESOLVED' || b.status === 'ACCEPTED_RISK'"
              class="reporter-confirm-panel"
            >
              <div class="confirm-prompt">
                Apakah kendala sudah benar-benar teratasi atau arahan mitigasi dapat dijalankan?
              </div>
              <div v-if="reopeningId !== b.id" class="confirm-actions">
                <button
                  type="button"
                  class="btn-confirm-close"
                  :disabled="closingId === b.id"
                  :data-testid="`close-ticket-${b.id}`"
                  @click="confirmAndCloseTicket(b.id)"
                >
                  <CheckCircle2 :size="14" />
                  <span>{{ closingId === b.id ? 'Menutup Tiket...' : 'Konfirmasi & Tutup Tiket' }}</span>
                </button>
                <button
                  type="button"
                  class="btn-reopen-ticket"
                  :data-testid="`reopen-ticket-${b.id}`"
                  @click="openInlineReopen(b.id)"
                >
                  <RotateCcw :size="14" />
                  <span>Belum Memadai (Kembalikan)</span>
                </button>
              </div>
              <div v-else class="inline-reopen-form">
                <textarea
                  v-model="reopenReasonMap[b.id]"
                  rows="2"
                  placeholder="Jelaskan alasan mengapa solusi/mitigasi belum memadai (min. 10 karakter)..."
                ></textarea>
                <div class="confirm-actions">
                  <button
                    type="button"
                    class="btn-confirm-reopen"
                    :disabled="submittingReopenId === b.id"
                    @click="submitInlineReopen(b.id)"
                  >
                    {{ submittingReopenId === b.id ? 'Mengembalikan...' : 'Kirim & Kembalikan ke PIC' }}
                  </button>
                  <button type="button" class="btn-cancel-reopen" @click="cancelInlineReopen">
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal Edit Tiket Blocker Aktif (DEC-016) -->
    <div
      v-if="editingTicket"
      class="modal-backdrop"
      data-testid="edit-blocker-modal"
      @click.self="closeEditModal"
    >
      <div class="modal-card modal-card-wide">
        <div class="modal-head">
          <h3>Edit Tiket Kendala #{{ editingTicket.id.slice(0, 8) }}</h3>
          <button type="button" class="btn-close" aria-label="Tutup" @click="closeEditModal">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Perubahan rincian tiket akan tercatat di jejak audit dan otomatis dikirimkan sebagai notifikasi ke PIC, Lead, Head, serta pihak terkait.
          </p>

          <div class="form-group">
            <div class="label-row">
              <label for="editBlockerTitle">Judul Kendala <span class="req">*</span></label>
              <span
                class="char-count"
                :class="{
                  ok: editTitle.trim().length >= 10,
                  invalid: editTitle.trim().length < 10,
                }"
                data-testid="edit-title-counter"
              >
                {{ editTitle.trim().length }} / 10 min
              </span>
            </div>
            <input
              id="editBlockerTitle"
              v-model="editTitle"
              type="text"
              maxlength="140"
              placeholder="Tuliskan judul kendala yang jelas (min. 10 karakter)"
            />
          </div>

          <div class="form-group">
            <label for="editBlockerType">Kategori Kendala <span class="req">*</span></label>
            <select id="editBlockerType" v-model="editType">
              <optgroup
                v-for="group in BLOCKER_TYPE_GROUPS"
                :key="group.groupLabel"
                :label="group.groupLabel"
              >
                <option
                  v-for="opt in group.options"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </optgroup>
            </select>
          </div>

          <div
            v-if="editType === 'CROSS_TEAM' && editingTicket.ownerNeededType !== 'PROJECT_AUTHORITY'"
            class="form-group"
          >
            <label for="editWaitingForFunction">Divisi yang Sedang Ditunggu <span class="req">*</span></label>
            <select id="editWaitingForFunction" v-model="editWaitingForFunction">
              <option value="" disabled>-- Pilih Divisi yang Sedang Ditunggu --</option>
              <option
                v-for="fnOpt in WAITING_FOR_FUNCTION_OPTIONS"
                :key="fnOpt.value"
                :value="fnOpt.value"
              >
                {{ fnOpt.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label>Dampak Kendala (Pilih 1–3 Dampak) <span class="req">*</span></label>
              <span
                class="char-count"
                :class="{
                  ok: editImpacts.length >= 1 && editImpacts.length <= 3,
                  invalid: editImpacts.length === 0,
                }"
              >
                {{ editImpacts.length }} / 3 dipilih
              </span>
            </div>
            <p class="impact-hint-text">Pilih 1 sampai maksimal 3 dampak yang paling terasa.</p>
            <p
              v-if="editImpacts.length === 0"
              class="impact-error-text"
              role="alert"
              data-testid="edit-impact-min-warning"
            >
              Minimal pilih 1 dampak kendala.
            </p>
            <div class="impact-checkbox-grid compact">
              <label
                v-for="opt in BLOCKER_IMPACT_OPTIONS"
                :key="opt.value"
                class="impact-checkbox-card"
                :class="{
                  selected: editImpacts.includes(opt.value),
                  disabled: !editImpacts.includes(opt.value) && editImpacts.length >= 3,
                }"
              >
                <input
                  type="checkbox"
                  :value="opt.value"
                  :checked="editImpacts.includes(opt.value)"
                  :disabled="!editImpacts.includes(opt.value) && editImpacts.length >= 3"
                  :data-testid="`edit-impact-checkbox-${opt.value}`"
                  @change="toggleEditImpact(opt.value)"
                />
                <div class="impact-checkbox-copy">
                  <span class="impact-name">{{ opt.name }}</span>
                  <span class="impact-meaning">{{ opt.meaning }}</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="editBlockerSeverity">Tingkat Keparahan (Severity) <span class="req">*</span></label>
            <select id="editBlockerSeverity" v-model="editSeverity">
              <option
                v-for="opt in BLOCKER_SEVERITY_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="editBlockerDescription">Deskripsi Kendala &amp; Upaya Mandiri <span class="req">*</span></label>
              <span
                class="char-count"
                :class="{
                  ok: editDescription.trim().length >= 20,
                  invalid: editDescription.trim().length < 20,
                }"
                data-testid="edit-desc-counter"
              >
                {{ editDescription.trim().length }} / 20 min
              </span>
            </div>
            <textarea
              id="editBlockerDescription"
              v-model="editDescription"
              rows="4"
              placeholder="Jelaskan detail kendala dan upaya yang sudah dicoba (min. 20 karakter)..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="editBlockerExpectedHelp">Bantuan Konkret yang Diharapkan <span class="opt">(opsional)</span></label>
            <input
              id="editBlockerExpectedHelp"
              v-model="editExpectedHelp"
              type="text"
              maxlength="200"
              placeholder="Contoh: Perbaikan query transaksi dan deploy hotfix ke staging"
            />
          </div>

          <div v-if="modalError" class="modal-inline-error" role="alert" data-testid="modal-inline-error">
            <AlertCircle :size="15" />
            <span>{{ modalError }}</span>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="closeEditModal">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="submittingEdit || !canSubmitEdit"
            data-testid="confirm-edit-blocker"
            @click="submitEditTicket"
          >
            {{ submittingEdit ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hapus Tiket Blocker Aktif (DEC-016) -->
    <div
      v-if="deletingTicket"
      class="modal-backdrop"
      data-testid="delete-blocker-modal"
      @click.self="closeDeleteModal"
    >
      <div class="modal-card">
        <div class="modal-head">
          <h3>Hapus Tiket Kendala #{{ deletingTicket.id.slice(0, 8) }}</h3>
          <button type="button" class="btn-close" aria-label="Tutup" @click="closeDeleteModal">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Anda akan menghapus tiket <strong>"{{ getTicketTitle(deletingTicket) }}"</strong> dari antrean aktif. Pilih kategori alasan di bawah; pemberitahuan akan dikirim ke PIC, Lead, serta Head terkait.
          </p>

          <div class="form-group">
            <label>Kategori Alasan Penghapusan <span class="req">*</span></label>
            <div class="reason-radio-grid">
              <label
                v-for="opt in BLOCKER_DELETE_REASON_OPTIONS"
                :key="opt.value"
                class="reason-radio-card"
                :class="{ selected: deleteReasonCategory === opt.value }"
              >
                <input
                  v-model="deleteReasonCategory"
                  type="radio"
                  name="deleteReasonCategory"
                  :value="opt.value"
                  :data-testid="`delete-reason-${opt.value}`"
                />
                <div>
                  <div class="reason-title">{{ opt.label }}</div>
                  <div class="reason-desc">{{ opt.description }}</div>
                </div>
              </label>
            </div>
          </div>

          <div v-if="deleteReasonCategory === 'OTHER'" class="form-group">
            <div class="label-row">
              <label for="deleteBlockerReason">Detail / Keterangan Alasan Penghapusan <span class="req">*</span></label>
              <span
                class="char-count"
                :class="{
                  ok: deleteReason.trim().length >= 10,
                  invalid: deleteReason.trim().length < 10,
                }"
                data-testid="delete-reason-counter"
              >
                {{ deleteReason.trim().length }} / 10 karakter min
              </span>
            </div>
            <textarea
              id="deleteBlockerReason"
              v-model="deleteReason"
              rows="3"
              placeholder="Tuliskan penjelasan spesifik mengapa tiket ini dihapus (min. 10 karakter)..."
            ></textarea>
          </div>

          <div v-if="modalError" class="modal-inline-error" role="alert" data-testid="modal-inline-error">
            <AlertCircle :size="15" />
            <span>{{ modalError }}</span>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="closeDeleteModal">Batal</button>
          <button
            type="button"
            class="btn-danger-solid"
            :disabled="submittingDelete || !canSubmitDelete"
            data-testid="confirm-delete-blocker"
            @click="submitDeleteTicket"
          >
            {{ submittingDelete ? 'Menghapus...' : 'Konfirmasi Hapus Tiket' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blocker-layout {
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
  font-family: var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px clamp(1.5rem, 4vw, 3.5rem) 120px;
}

/* Back Navigation Link */
.back-nav-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-brand-primary, #00674D);
  text-decoration: none;
  margin-bottom: 12px;
  padding: 4px 0;
  transition: color 0.15s ease;
}

.back-nav-link:hover {
  color: #0B8061;
  text-decoration: none;
}

.back-nav-link svg {
  transition: transform 0.15s ease;
}

.back-nav-link:hover svg {
  transform: translateX(-3px);
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 6px;
}

.subtitle {
  font-size: 13.5px;
  color: #5C6E68;
  max-width: 720px;
  line-height: 1.5;
}

/* View Tabs */
.view-tabs {
  display: inline-flex;
  align-items: center;
  background: #EDF2F0;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
  margin-bottom: 24px;
}

.view-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  color: #5C6E68;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-tab:hover {
  color: #0E211B;
  background: rgba(255, 255, 255, 0.5);
}

.view-tab.active {
  background: #fff;
  color: #00674D;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #E6F4EE;
  color: #00674D;
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.tab-badge.alert {
  background: #FEE2E2;
  color: #991B1B;
}

.panel {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid #DCE7E2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  background: #FAFCFB;
}

.panel-head h2 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.panel-desc {
  font-size: 12.5px;
  color: #5C6E68;
  margin-top: 2px;
}

.pill {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.pill-brand {
  background: #E6F4EE;
  color: #00674D;
  white-space: nowrap;
  flex-shrink: 0;
}

.pill-sla {
  background: #EFF5F2;
  color: #5C6E68;
}

.pill-neutral,
.pill.neutral {
  background: #F1F5F9;
  color: #334155;
  border: 1px solid #CBD5E1;
}

.pill.teal {
  background: #CCFBF1;
  color: #0F766E;
  border: 1px solid #5EEAD4;
}

.pill.green {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.pill.blue {
  background: #E0F2FE;
  color: #075985;
  border: 1px solid #7DD3FC;
}

.pill.amber {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

.pill.orange {
  background: #FFEDD5;
  color: #9A3412;
  border: 1px solid #FDBA74;
}

.pill.red {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
}

.dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.panel-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 18px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

label {
  font-size: 13px;
  font-weight: 700;
  color: #0E211B;
}

.req {
  color: #991B1B;
}

.opt {
  font-size: 11px;
  color: #66736E;
  font-weight: normal;
}

.char-counter {
  font-size: 11.5px;
  color: #66736E;
  white-space: nowrap;
  flex-shrink: 0;
}

.char-valid {
  color: #166534;
  font-weight: 700;
}

input[type="text"],
select,
textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  font-size: 13.5px;
  background: #fff;
  color: #0E211B;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #00674D;
  box-shadow: 0 0 0 2px rgba(0, 103, 77, 0.15);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.severity-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 6px;
}

.severity-card {
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  background: #fff;
  transition: all 0.15s ease;
  position: relative;
}

.severity-card input {
  position: absolute;
  top: 10px;
  right: 10px;
}

.severity-card.selected {
  border-color: #00674D;
  background: #F4FBF7;
}

.severity-card.critical.selected {
  border-color: #DC2626;
  background: #FEF2F2;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.sev-badge {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}

.sev-badge.critical { background: #FEE2E2; color: #991B1B; }
.sev-badge.high { background: #FFEDD5; color: #9A3412; }
.sev-badge.medium { background: #FEF3C7; color: #92400E; }
.sev-badge.low { background: #EFF5F2; color: #5C6E68; }

.sla-countdown {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-primary, #0b6b4d);
}
.sla-countdown.overdue {
  color: #b91c1c;
}
.sev-sla {
  font-size: 11px;
  color: #5C6E68;
}

.sev-desc {
  font-size: 11.5px;
  color: #5C6E68;
  margin: 0;
  line-height: 1.35;
}

.critical-notice {
  margin-top: 10px;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-text-action {
  background: none;
  border: none;
  color: #00674D;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.btn-text-action:hover {
  text-decoration: underline;
}

.chip-container {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.quick-chip {
  background: #EFF5F2;
  border: 1px solid #DCE7E2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #0E211B;
  cursor: pointer;
}

.quick-chip:hover {
  background: #E6F4EE;
  border-color: #00674D;
  color: #00674D;
}

.authority-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.authority-card {
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  background: #fff;
  position: relative;
}

.authority-card input {
  position: absolute;
  top: 12px;
  right: 12px;
}

.authority-card.selected {
  border-color: #00674D;
  background: #F4FBF7;
}

.auth-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #E6F4EE;
  color: #00674D;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.authority-card strong {
  font-size: 13px;
  display: block;
}

.authority-card p {
  font-size: 12px;
  color: #5C6E68;
  margin: 4px 0 0;
}

.route-preview {
  margin-top: 16px;
  background: #EFF5F2;
  border: 1px dashed #A9C7BC;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.route-icon {
  color: #00674D;
  flex-shrink: 0;
}

.route-preview strong {
  font-size: 12.5px;
  color: #0E211B;
}

.route-preview p {
  font-size: 12px;
  color: #5C6E68;
  margin: 2px 0 0;
}

/* Form Fixed Footer (Full-width from sidebar edge to screen edge - Prototipe 05) */
.sticky-footer {
  position: fixed;
  bottom: 0;
  left: 232px;
  right: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border-top: 1px solid #DCE7E2;
  box-shadow: 0 -4px 16px -2px rgba(0, 0, 0, 0.06);
  padding: 14px clamp(1.5rem, 4vw, 3.5rem);
  transition: left 0.2s ease;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

@media (max-width: 992px) {
  .sticky-footer {
    left: 0;
    padding: 12px 16px;
  }
}

@media (max-width: 680px) {
  .sticky-footer {
    left: 0;
    padding: 12px 16px max(14px, env(safe-area-inset-bottom));
  }

  .footer-content {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .footer-actions {
    display: grid;
    grid-template-columns: 1fr 2fr;
    width: 100%;
    gap: 10px;
  }

  .footer-actions .btn-secondary,
  .footer-actions .btn-primary {
    width: 100%;
    min-height: 44px;
    padding: 10px 14px;
    font-size: 14px;
    justify-content: center;
  }
}

.footer-hint {
  font-size: 12.5px;
  color: #5C6E68;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #DCE7E2;
  background: #fff;
  color: #0E211B;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #EFF5F2;
  border-color: #A9C7BC;
}

.btn-primary {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: #00674D;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: background 0.15s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #00523D;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submitted-card {
  background: #fff;
  border: 1px solid #86EFAC;
  border-radius: 12px;
  padding: 36px 24px;
  text-align: center;
  max-width: 600px;
  margin: 30px auto;
}

.submitted-icon {
  color: #166534;
  margin-bottom: 12px;
}

.submitted-card h2 {
  font-size: 20px;
  font-weight: 800;
  color: #166534;
  margin-bottom: 8px;
}

.submitted-msg {
  font-size: 13.5px;
  color: #5C6E68;
  margin-bottom: 24px;
}

.submitted-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* My Blockers View Styling (IMP-041) */
.blockers-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.blockers-filter-bar h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
}

.filter-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 6px 14px;
  border: 1px solid #DCE7E2;
  background: #fff;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  color: #5C6E68;
  cursor: pointer;
  transition: all 0.15s ease;
  font-variant-numeric: tabular-nums;
}

.filter-pill:hover {
  border-color: #A9C7BC;
  color: #0E211B;
}

.filter-pill.active {
  background: #00674D;
  color: #fff;
  border-color: #00674D;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #5C6E68;
  font-size: 14px;
}

.empty-blockers {
  text-align: center;
  padding: 48px 24px;
  background: #fff;
  border: 1px dashed #DCE7E2;
  border-radius: 12px;
  margin: 10px 0;
}

.empty-blockers-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #E6F4EE;
  color: #00674D;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
}

.empty-blockers h3 {
  font-size: 16px;
  font-weight: 800;
  color: #0E211B;
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
  color: #5C6E68;
  max-width: 420px;
  margin: 0 auto;
}

.blocker-item-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 14px;
  transition: border-color 0.15s ease;
}

.blocker-item-card:hover {
  border-color: #A9C7BC;
}

.blocker-item-card.resolved {
  border-color: #86EFAC;
  box-shadow: 0 4px 14px rgba(22, 101, 52, 0.06);
}

.blocker-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.head-right {
  display: flex;
  align-items: center;
  gap: 8px 10px;
  flex-wrap: wrap;
}

.confirm-status-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  background: #FFFBEB;
  border: 1px solid #FCD34D;
  color: #92400E;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}

.blocker-item-id {
  font-size: 13px;
  font-weight: 800;
  color: #00674D;
  letter-spacing: 0.02em;
  font-family: monospace;
}

.date-sep {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: #CBD5E1;
}

.blocker-date {
  font-size: 12.5px;
  font-weight: 600;
  color: #5C6E68;
  white-space: nowrap;
}

.blocker-item-title {
  font-size: 15px;
  font-weight: 700;
  color: #0E211B;
  margin-bottom: 6px;
  line-height: 1.4;
}

.blocker-item-desc {
  font-size: 13.5px;
  color: #5C6E68;
  line-height: 1.5;
  margin: 0 0 12px;
}

.blocker-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #5C6E68;
  flex-wrap: wrap;
}

.blocker-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #F8FAFC;
  border: 1px solid #DCE7E2;
  padding: 3px 9px;
  border-radius: 6px;
}

.blocker-meta-item strong {
  color: #0E211B;
  font-weight: 700;
}

.resolution-box {
  background: #DCFCE7;
  border: 1px solid #86EFAC;
  border-radius: 8px;
  padding: 12px 14px;
  margin-top: 12px;
}

.resolution-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 800;
  color: #166534;
  margin-bottom: 4px;
}

.resolution-text {
  font-size: 13px;
  color: #166534;
  line-height: 1.45;
  margin: 0;
}

.blocker-expected-box {
  margin-top: 8px;
  margin-bottom: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: #F4F9F7;
  border: 1px solid #DCE7E2;
  font-size: 12.5px;
  color: #1F352E;
}

.risk-box {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #FFF7ED;
  border: 1px solid #FED7AA;
}

.risk-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #C2410C;
  margin-bottom: 4px;
}

.risk-text {
  font-size: 12.5px;
  color: #7C2D12;
  line-height: 1.45;
  margin: 2px 0;
}

.reporter-confirm-panel {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #DCE7E2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.confirm-prompt {
  font-size: 12.5px;
  font-weight: 600;
  color: #1F352E;
}

.confirm-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-confirm-close {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 7px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-confirm-close:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-reopen-ticket {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 7px;
  border: 1px solid #FECACA;
  background: #FEF2F2;
  color: #991B1B;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.inline-reopen-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inline-reopen-form textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #CBD5E1;
  font-family: inherit;
  font-size: 12.5px;
}

.btn-confirm-reopen {
  padding: 7px 14px;
  border-radius: 7px;
  border: none;
  background: #991B1B;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-confirm-accept-progress {
  padding: 7px 14px;
  border-radius: 7px;
  border: none;
  background: #1D4ED8;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel-reopen {
  padding: 7px 12px;
  border-radius: 7px;
  border: 1px solid #DCE7E2;
  background: #fff;
  color: #475B54;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.my-history-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E2ECE7;
}

.my-history-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #00674D;
  margin-bottom: 8px;
}

.my-history-empty {
  font-size: 12px;
  color: #5C6E68;
  background: #FAFCFB;
  border: 1px solid #E2ECE7;
  border-radius: 6px;
  padding: 8px 10px;
}

.my-history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.my-history-item {
  background: #F4FBF7;
  border: 1px solid #C4EBD8;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 12.5px;
  line-height: 1.45;
}

.my-history-item.variant-reopen {
  background: #FFFBEB;
  border-color: #FDE68A;
}

.my-history-item.variant-resolution {
  background: #F0FDFA;
  border-color: #5EEAD4;
}

.my-history-item.variant-risk {
  background: #FFF7ED;
  border-color: #FDBA74;
}

.my-history-item.variant-closed {
  background: #F0FDF4;
  border-color: #86EFAC;
}

.my-hist-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
  color: #00674D;
}

.my-history-item.variant-reopen .my-hist-meta {
  color: #92400E;
}

.my-history-item.variant-resolution .my-hist-meta {
  color: #0F766E;
}

.my-history-item.variant-risk .my-hist-meta {
  color: #9A3412;
}

.my-history-item.variant-closed .my-hist-meta {
  color: #166534;
}

.my-hist-actor-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.my-hist-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.my-hist-badge.variant-support {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.my-hist-badge.variant-reopen {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

.my-hist-badge.variant-resolution {
  background: #CCFBF1;
  color: #0F766E;
  border: 1px solid #5EEAD4;
}

.my-hist-badge.variant-risk {
  background: #FFEDD5;
  color: #9A3412;
  border: 1px solid #FDBA74;
}

.my-hist-badge.variant-closed {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.my-hist-time {
  font-size: 11.5px;
  white-space: nowrap;
}

.my-hist-line {
  color: #1F352E;
}

.my-hist-feedback {
  margin-top: 4px;
  color: #991B1B;
}

.my-hist-feedback.is-progress {
  color: #1E40AF;
}

.support-response-panel {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #CBD5E1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.support-response-prompt {
  font-size: 12px;
  font-weight: 600;
  color: #1F352E;
}

.btn-sup-resolve {
  padding: 6px 11px;
  border-radius: 6px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-sup-accept {
  padding: 6px 11px;
  border-radius: 6px;
  border: 1px solid #93C5FD;
  background: #EFF6FF;
  color: #1D4ED8;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-sup-reject {
  padding: 6px 11px;
  border-radius: 6px;
  border: 1px solid #FECACA;
  background: #FEF2F2;
  color: #991B1B;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.reporter-manage-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.btn-manage-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  border: 1px solid #B7DEC9;
  background: #F2FAF6;
  color: #00674D;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-manage-edit:hover {
  background: #E2F4EA;
}

.btn-manage-delete {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  border: 1px solid #FECACA;
  background: #FEF2F2;
  color: #991B1B;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-manage-delete:hover {
  background: #FEE2E2;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 27, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 120;
  padding: 20px;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(14, 33, 27, 0.2);
}

.modal-card-wide {
  max-width: 660px;
}

.modal-head {
  padding: 15px 20px;
  border-bottom: 1px solid #DCE7E2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-head h3 {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
  color: #0E211B;
}

.btn-close {
  background: none;
  border: none;
  color: #5C6E68;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
}

.modal-body {
  padding: 18px 20px;
  overflow-y: auto;
}

.modal-hint {
  font-size: 12.5px;
  color: #5C6E68;
  margin: 0 0 14px;
  line-height: 1.5;
}

.char-count {
  font-size: 11.5px;
  font-weight: 600;
  color: #94A3B8;
}

.char-count.ok {
  color: #00674D;
}

.char-count.invalid {
  color: #B91C1C;
  font-weight: 700;
}

.modal-inline-error {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #B91C1C;
  font-size: 12.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-foot {
  padding: 14px 20px;
  border-top: 1px solid #DCE7E2;
  background: #FAFCFB;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.reason-radio-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-radio-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1.5px solid #DCE7E2;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.reason-radio-card.selected {
  border-color: #DC2626;
  background: #FEF2F2;
}

.reason-radio-card input {
  width: auto;
  margin-top: 3px;
}

.reason-title {
  font-size: 13px;
  font-weight: 700;
  color: #0E211B;
}

.reason-desc {
  font-size: 12px;
  color: #5C6E68;
  margin-top: 2px;
}

.btn-danger-solid {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #DC2626;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-danger-solid:hover:not(:disabled) {
  background: #B91C1C;
}

.btn-danger-solid:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toast-popup {
  position: fixed;
  top: 70px;
  right: 24px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 250;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.toast-popup.error {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
}

.impact-hint-text {
  font-size: 12px;
  color: #5C6E68;
  margin: 0 0 8px;
}

.impact-error-text {
  font-size: 12px;
  font-weight: 600;
  color: #B91C1C;
  margin: -2px 0 8px;
}

.char-counter.char-invalid {
  color: #B91C1C;
  font-weight: 700;
}

.impact-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.impact-checkbox-grid.compact {
  grid-template-columns: 1fr;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
}

.impact-checkbox-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1.5px solid #DCE7E2;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.impact-checkbox-card input[type="checkbox"] {
  width: auto;
  margin-top: 3px;
  accent-color: #00674D;
  flex-shrink: 0;
}

.impact-checkbox-card.selected {
  border-color: #00674D;
  background: #F4FBF7;
}

.impact-checkbox-card.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.impact-checkbox-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.impact-name {
  font-size: 13px;
  font-weight: 700;
  color: #0E211B;
}

.impact-meaning {
  font-size: 11.5px;
  font-weight: 400;
  color: #5C6E68;
  line-height: 1.35;
}

.blocker-taxonomy-box {
  background: #F8FBFA;
  border: 1px solid #E2ECE7;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  color: #243831;
}

.blocker-taxonomy-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.taxonomy-label {
  font-size: 11px;
  font-weight: 700;
  color: #5C6E68;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.taxonomy-value {
  line-height: 1.45;
}

.blocker-taxonomy-impact-list {
  margin: 2px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  line-height: 1.4;
}

.template-confirm-box {
  background: var(--color-status-amber-bg, #FEF3C7);
  border: 1px solid var(--color-status-amber-border, #FCD34D);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.template-confirm-box p {
  margin: 0;
  font-size: 12.5px;
  color: var(--color-status-amber-fg, #92400E);
  line-height: 1.45;
  flex: 1;
  min-width: 220px;
}

.template-confirm-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-template-cancel {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #DCE7E2;
  background: #fff;
  color: #0E211B;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-template-confirm {
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.char-count {
  white-space: nowrap;
  flex-shrink: 0;
}

.footer-actions {
  flex-shrink: 0;
}

.btn-secondary,
.btn-primary {
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .severity-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 18px 16px 120px;
  }

  .form-grid-2,
  .authority-grid,
  .impact-checkbox-grid {
    grid-template-columns: 1fr;
  }

  .severity-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .sticky-footer {
    left: 0;
    padding: 8px 14px max(10px, env(safe-area-inset-bottom));
  }

  .footer-content {
    gap: 6px;
  }

  .footer-hint {
    font-size: 11.5px;
    line-height: 1.3;
  }

  .footer-actions {
    grid-template-columns: 1fr 1.15fr;
    gap: 8px;
  }

  .footer-actions .btn-secondary,
  .footer-actions .btn-primary {
    min-height: 38px;
    padding: 8px 10px;
    font-size: 12.5px;
    white-space: nowrap;
  }
}

@media (max-width: 640px) {
  .severity-grid {
    grid-template-columns: 1fr;
  }

  .view-tabs {
    display: flex;
    width: 100%;
    box-sizing: border-box;
  }

  .view-tab {
    flex: 1;
    justify-content: center;
    padding: 8px 10px;
    font-size: 12.5px;
    white-space: nowrap;
  }

  .modal-backdrop {
    padding: 12px;
  }

  .modal-head,
  .modal-body,
  .modal-foot {
    padding: 14px 16px;
  }
}

.morning-return-banner {
  background: #FFFBEB;
  border: 1px solid #FCD34D;
  color: #92400E;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  line-height: 1.45;
}

.morning-return-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1 1 320px;
}

.btn-return-cancel {
  white-space: nowrap;
  text-decoration: none;
}
</style>
