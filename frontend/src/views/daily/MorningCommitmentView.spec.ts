import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MorningCommitmentView from './MorningCommitmentView.vue';
import { useAuthStore } from '../../stores/auth';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('MorningCommitmentView.vue (WP-EP05-TK006 / Prototipe 02 & DEF-001 Verification)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/daily/morning', component: MorningCommitmentView },
        { path: '/daily/additional-work', component: { template: '<div>Add</div>' } },
        { path: '/daily/eod', component: { template: '<div>EOD</div>' } },
        { path: '/daily/history', component: { template: '<div>History</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
        { path: '/corrections/morning', component: { template: '<div>MorningCorrection</div>' } },
        { path: '/raise-blockers', component: { template: '<div>Raise</div>' } },
      ],
    });
  });

  it('renders Morning Commitment header and context panels', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.text()).toContain('Morning Commitment');
    expect(wrapper.text()).toContain('Konteks Hari Ini');
    expect(wrapper.text()).toContain('Batas On-Time');
    expect(wrapper.text()).toContain('Initial Daily Status');
  });

  it('renders restructured and decluttered context metric cards with dynamic date badge (IMP-027)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-30',
          currentTime: '08:45',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '23:59',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    // 1. Right header tag renders dynamic Indonesian day and date
    const dateBadge = wrapper.find('[data-testid="context-date-badge"]');
    expect(dateBadge.exists()).toBe(true);
    expect(dateBadge.text()).toBe('Jumat, 30 Oktober 2026');

    // 2. Subkotak 1: Batas On-Time without subtext
    const ontimeCard = wrapper.find('[data-testid="context-item-ontime"]');
    expect(ontimeCard.exists()).toBe(true);
    expect(ontimeCard.text()).toContain('Batas On-Time');
    expect(ontimeCard.text()).toContain('09:00 WIB');
    expect(ontimeCard.find('.context-sub').exists()).toBe(false);

    // 3. Subkotak 2: Batas Cut-Off without subtext
    const cutoffCard = wrapper.find('[data-testid="context-item-cutoff"]');
    expect(cutoffCard.exists()).toBe(true);
    expect(cutoffCard.text()).toContain('Batas Cut-Off');
    expect(cutoffCard.text()).toContain('23:59 WIB');
    expect(cutoffCard.find('.context-sub').exists()).toBe(false);

    // 4. Subkotak 3: Status Waktu without server time subtext
    const timeStatusCard = wrapper.find('[data-testid="context-item-time-status"]');
    expect(timeStatusCard.exists()).toBe(true);
    expect(timeStatusCard.text()).toContain('Status Waktu');
    expect(timeStatusCard.text()).toContain('ON-TIME');
    expect(timeStatusCard.text()).not.toContain('Jam Server');

    // 5. Subkotak 4: Status Awal Hari without risk aggregation subtext
    const riskStatusCard = wrapper.find('[data-testid="context-item-initial-status"]');
    expect(riskStatusCard.exists()).toBe(true);
    expect(riskStatusCard.text()).toContain('Status Awal Hari');
    expect(riskStatusCard.text()).toContain('GREEN — Terkendali');
    expect(riskStatusCard.text()).not.toContain('Agregasi Tingkat Risiko');

    // Redundant text eliminated
    expect(wrapper.text()).not.toContain('Hari Kerja Aktif');
    expect(wrapper.text()).not.toContain('Kebijakan: On-Time');
  });

  it('renders human-friendly late banner and Terlambat (LATE) badge without Grace Period jargon (IMP-028)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-30',
          currentTime: '09:15',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '23:59',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    // 1. Late alert banner is rendered cleanly without redundant range in title
    const lateBanner = wrapper.find('[data-testid="late-alert-banner"]');
    expect(lateBanner.exists()).toBe(true);
    expect(lateBanner.text()).toContain('Pengisian Melewati Batas Waktu:');
    expect(lateBanner.text()).toContain('Batas waktu On-Time (09:00 WIB) telah berakhir');
    expect(lateBanner.text()).toContain('sebelum sistem terkunci pada pukul 23:59 WIB');
    expect(lateBanner.text()).toContain('Terlambat (LATE)');

    // 2. Technical and confusing jargon is completely eliminated
    expect(wrapper.text()).not.toContain('Grace Period');
    expect(wrapper.text()).not.toContain('Jendela Toleransi');

    // 3. Status Waktu badge in Subkotak 3 displays "Terlambat (LATE)"
    const timeStatusCard = wrapper.find('[data-testid="context-item-time-status"]');
    expect(timeStatusCard.exists()).toBe(true);
    expect(timeStatusCard.text()).toContain('Terlambat (LATE)');
  });

  it('eliminates internal architecture code DEC-004 from zero commitment checkbox label (IMP-029)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-30',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '23:59',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    const zeroLabel = wrapper.find('[data-testid="zero-commitment-label"]');
    expect(zeroLabel.exists()).toBe(true);
    expect(zeroLabel.text()).toBe('Hari ini tidak ada komitmen harian khusus (0 Komitmen)');
    expect(zeroLabel.text()).not.toContain('DEC-004');
    expect(zeroLabel.text()).not.toContain('Zero Commitment');
  });

  it('toggles zero commitment mode on checkbox check (DEC-004)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.exists()).toBe(true);

    await checkbox.setValue(true);
    expect(wrapper.text()).toContain('Alasan Tidak Menetapkan Komitmen');
    expect(wrapper.text()).toContain('Bebas Komitmen (Disetujui)');
  });

  it('transforms zero commitment explanation into business language (IMP-030)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-30',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '23:59',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    const checkbox = wrapper.find('[data-testid="zero-commitment-checkbox"]');
    await checkbox.setValue(true);

    const subtext = wrapper.find('[data-testid="zero-commitment-subtext"]');
    expect(subtext.exists()).toBe(true);
    expect(subtext.text()).toContain('Bebas Komitmen (Disetujui)');
    expect(subtext.text()).toContain('Pelanggaran Pengisian (No Submission)');
    expect(subtext.text()).not.toContain('NOT_APPLICABLE');
    expect(subtext.text()).not.toContain('NO_COMMITMENT');
  });

  it('allows adding commitment slots up to 3 (DEC-004)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.text()).toContain('Daftar Komitmen Hari Ini (1/3)');

    const addBtn = wrapper.findAll('button').find(b => b.text().includes('Tambah Slot'));
    expect(addBtn).toBeDefined();

    await addBtn?.trigger('click');
    expect(wrapper.text()).toContain('Daftar Komitmen Hari Ini (2/3)');
  });

  // =========================================================================
  // PENGUJIAN TIGA KONDISI DEF-001 (Kondisi A, B, C)
  // =========================================================================

  it('Kondisi A — Belum Submit: timestamp null, sebelum cutoff, form aktif dan submit tersedia', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null, // Belum ada record submission
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    // 1. Form dapat diisi (tidak disabled)
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('disabled')).toBeUndefined();

    // 2. Tombol submit tersedia di action footer
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Kirim Morning Commitment'));
    expect(submitBtn).toBeDefined();

    // 3. Banner terkunci tidak ditampilkan
    expect(wrapper.find('.alert-banner.submitted').exists()).toBe(false);
    expect(wrapper.text()).toContain('ON-TIME');
    expect(wrapper.text()).not.toContain('SUBMITTED (Terkunci)');
  });

  it('Kondisi B — Sudah Submit: timestamp tersedia, form terkunci dan submit tersembunyi (DEF-001)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:50',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: {
            id: 'rec-1',
            morningSubmittedAt: '2026-10-28T08:45:00.000Z', // Sudah disubmit
            initialDailyStatus: 'GREEN',
            commitments: [
              {
                taskText: 'Selesaikan sprint delivery',
                initialRisk: 'GREEN',
                referenceLink: null,
                carryOverDaysCount: 0,
              },
            ],
          },
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    // 1. Banner status terkunci ditampilkan dengan benar
    expect(wrapper.find('.alert-banner.submitted').exists()).toBe(true);
    expect(wrapper.text()).toContain('Morning Commitment Telah Terkunci (Baseline Locked)');
    expect(wrapper.text()).toContain('SUBMITTED (Terkunci)');

    // 2. Tampilan beralih ke Summary View resmi (tidak ada lagi input textarea yang meminta isian)
    expect(wrapper.find('[data-testid="morning-summary-panel"]').exists()).toBe(true);
    expect(wrapper.find('textarea').exists()).toBe(false);

    // 3. Tombol submit tidak tersedia (action footer disembunyikan)
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Kirim Morning Commitment'));
    expect(submitBtn).toBeUndefined();

    // 4. Tombol tambah slot juga disembunyikan
    const addBtn = wrapper.findAll('button').find(b => b.text().includes('Tambah Slot'));
    expect(addBtn).toBeUndefined();

    // 5. Tautan ke rute koreksi resmi tersedia
    const correctionLink = wrapper.findAllComponents({ name: 'AccessLink' }).find(c => c.props('to') === '/corrections/morning');
    expect(correctionLink).toBeDefined();
  });

  it('Kondisi C — Setelah Refresh: status dimuat dari backend dan form tetap terkunci persisten', async () => {
    // Tahap 1: Memuat halaman pertama kali saat sudah disubmit
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '09:10',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: {
            id: 'rec-today-persisted',
            morningSubmittedAt: '2026-10-28T08:40:00.000Z',
            initialDailyStatus: 'AMBER',
            commitments: [
              {
                taskText: 'Investigasi blocker infrastruktur',
                initialRisk: 'AMBER',
                knownBlockerNote: 'Menunggu kredensial staging',
                carryOverDaysCount: 0,
              },
            ],
          },
          availableCarryOvers: [],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    // Verifikasi kondisi awal terkunci beralih ke Summary View
    expect(wrapper.text()).toContain('SUBMITTED (Terkunci)');
    expect(wrapper.find('[data-testid="morning-summary-panel"]').exists()).toBe(true);
    expect(wrapper.find('textarea').exists()).toBe(false);
    expect(wrapper.findAll('button').find(b => b.text().includes('Kirim Morning Commitment'))).toBeUndefined();

    // Tahap 2: Simulasikan refresh halaman (komponen dimuat ulang dan fetch dipanggil kembali)
    const refreshedWrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Form harus tetap terkunci persisten dari data database dan tetap di Summary View
    expect(fetchMock).toHaveBeenCalled();
    expect(refreshedWrapper.text()).toContain('SUBMITTED (Terkunci)');
    expect(refreshedWrapper.find('.alert-banner.submitted').exists()).toBe(true);
    expect(refreshedWrapper.find('[data-testid="morning-summary-panel"]').exists()).toBe(true);
    expect(refreshedWrapper.find('textarea').exists()).toBe(false);
    expect(refreshedWrapper.findAll('button').find(b => b.text().includes('Kirim Morning Commitment'))).toBeUndefined();
  });

  it('renders consistent "Laporkan Blocker" button linking to /blockers/raise on workflow bar (IMP-016)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const blockerBtn = wrapper.find('[data-testid="report-blocker-btn"]');
    expect(blockerBtn.exists()).toBe(true);
    expect(blockerBtn.text()).toContain('Laporkan Blocker');
    expect(blockerBtn.attributes('href')).toBe('/raise-blockers');
  });

  it('renders role-based responsive placeholder with canonical prompt hint (PRD v1.6 FR-12 / AC-37)', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'usr-1',
      fullName: 'Aditya Nugroho',
      email: 'dev.frontend@dutamedia.com',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-11-04',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const textarea = wrapper.find('.slots-body textarea.input-control');
    expect(textarea.exists()).toBe(true);
    expect(textarea.attributes('placeholder')).toContain('Deskripsikan deliverable utama yang dapat diverifikasi selesai hari ini.');
    expect(textarea.attributes('placeholder')).toContain('Menyelesaikan implementasi fitur dan memastikan perubahan siap diuji');
  });
});
