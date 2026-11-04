import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RaiseBlockerView from './RaiseBlockerView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('RaiseBlockerView.vue (Cycle 2 / Group 4: SOL-BLKR-FORM - IMP-041, IMP-042, IMP-044)', () => {
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              record: {
                commitments: [
                  { id: 'com-1', taskText: 'Selesaikan API Gateway', sequenceNumber: 1 },
                ],
              },
            },
          }),
        });
      }
      if (url.includes('/blockers?mine=raised')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 'blk-1',
                type: 'TECHNICAL',
                severity: 'HIGH',
                impact: 'TASK',
                description: '[Bug Autentikasi] Sesi login tidak tersimpan di cookie',
                status: 'OPEN',
                raisedAt: '2026-11-03T08:00:00Z',
                assignedOwner: { id: 'usr-1', fullName: 'Budi Lead', email: 'budi@dutamedia.com' },
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: 'usr-1', fullName: 'Budi Lead', email: 'budi@dutamedia.com' },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/raise-blockers', component: RaiseBlockerView },
        { path: '/blockers/raise', redirect: '/raise-blockers' },
        { path: '/blockers', component: { template: '<div>Queue</div>' } },
        { path: '/blockers/aging', component: { template: '<div>Aging</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
        { path: '/notifications', component: { template: '<div>Notifications</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders headline, back link to /daily/morning, and does NOT render old kicker or queue button (IMP-041, IMP-042)', () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    // IMP-041: Back link to Morning Workspace
    const backLink = wrapper.find('[data-testid="back-nav-link"]');
    expect(backLink.exists()).toBe(true);
    expect(backLink.attributes('to') || backLink.attributes('href')).toContain('/daily/morning');
    expect(backLink.text()).toContain('Kembali ke Ruang Kerja My Today');

    // Heading verification
    expect(wrapper.text()).toContain('Laporkan & Pantau Blocker');
    expect(wrapper.text()).toContain('Workspace');
    expect(wrapper.text()).toContain('Blocker');

    // IMP-041: No kicker eyebrow
    expect(wrapper.text()).not.toContain('MANAJEMEN KENDALA & ESKALASI OTOMATIS');

    // IMP-042: No button link to management queue
    expect(wrapper.text()).not.toContain('Lihat Antrean Blocker Aktif');
  });

  it('provides 2 tabs: "Buat Laporan Blocker" and "Blocker Saya" with tab switching (IMP-041)', async () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    const tabCreate = wrapper.find('[data-testid="tab-create-blocker"]');
    const tabMine = wrapper.find('[data-testid="tab-my-blockers"]');

    expect(tabCreate.exists()).toBe(true);
    expect(tabMine.exists()).toBe(true);
    expect(tabCreate.classes()).toContain('active');

    // Default tab shows form
    expect(wrapper.find('form.blocker-form').exists()).toBe(true);
    expect(wrapper.find('[data-testid="my-blockers-view"]').exists()).toBe(false);

    // Switch to Tab 2: Blocker Saya
    await tabMine.trigger('click');
    expect(tabMine.classes()).toContain('active');
    expect(tabCreate.classes()).not.toContain('active');
    expect(wrapper.find('[data-testid="my-blockers-view"]').exists()).toBe(true);
    expect(wrapper.find('form.blocker-form').exists()).toBe(false);

    // Filter pills exist
    expect(wrapper.find('[data-testid="filter-all"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-active"]').exists()).toBe(true);
  });

  it('provides clean business footer without internal audit code and reset button functionality (IMP-044)', async () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    // IMP-044: Clean footer hint
    const footerHint = wrapper.find('[data-testid="footer-hint"]');
    expect(footerHint.exists()).toBe(true);
    expect(footerHint.text()).toBe('Pastikan fakta kendala akurat dan objektif untuk mempercepat penanganan oleh atasan.');
    expect(wrapper.text()).not.toContain('Audit Trail DEC-008');

    // IMP-044: Submit button label
    const submitBtn = wrapper.find('[data-testid="btn-submit-blocker"]');
    expect(submitBtn.exists()).toBe(true);
    expect(submitBtn.text()).toContain('Kirim Laporan Blocker');

    // Fill form title and test reset button
    const titleInput = wrapper.find('#blockerTitle');
    await titleInput.setValue('Testing Judul Blocker Baru');
    expect((titleInput.element as HTMLInputElement).value).toBe('Testing Judul Blocker Baru');

    const resetBtn = wrapper.find('[data-testid="btn-reset-form"]');
    expect(resetBtn.exists()).toBe(true);
    expect(resetBtn.text()).toContain('Bersihkan Formulir');

    await resetBtn.trigger('click');
    expect((titleInput.element as HTMLInputElement).value).toBe('');
  });

  it('displays project code input when Project Authority is selected (DEC-002)', async () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    // Default authority: Organizational
    expect(wrapper.find('#projectCodeSelect').exists()).toBe(false);

    // Switch to Project Authority
    const projectRadio = wrapper.findAll('input[type="radio"]').find(r => r.attributes('value') === 'PROJECT_AUTHORITY');
    expect(projectRadio).toBeDefined();
    await projectRadio!.setValue();

    expect(wrapper.find('#projectCodeSelect').exists()).toBe(true);
  });
});
