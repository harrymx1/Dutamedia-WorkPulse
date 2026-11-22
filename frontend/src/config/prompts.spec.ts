import { describe, it, expect } from 'vitest';
import {
  CANONICAL_PROMPT_HINTS,
  DEFAULT_FALLBACK_PROMPT,
  getPromptHintForFunction,
  resolveUserFunction,
} from './prompts';

describe('prompts.ts — Kamus 10 Fungsi Kanonikal (FR-12)', () => {
  it('memetakan seluruh 10 fungsi kanonikal (format display maupun format enum Prisma) ke prompt divisinya sendiri', () => {
    const cases: Array<{ inputFn: string; expectedFn: string }> = [
      { inputFn: 'Engineering', expectedFn: 'Engineering' },
      { inputFn: 'Quality', expectedFn: 'Quality' },
      { inputFn: 'Operations & Infrastructure', expectedFn: 'Operations & Infrastructure' },
      { inputFn: 'OperationsInfrastructure', expectedFn: 'Operations & Infrastructure' },
      { inputFn: 'R&D', expectedFn: 'R&D' },
      { inputFn: 'RnD', expectedFn: 'R&D' },
      { inputFn: 'Delivery', expectedFn: 'Delivery' },
      { inputFn: 'Business Development', expectedFn: 'Business Development' },
      { inputFn: 'BusinessDevelopment', expectedFn: 'Business Development' },
      { inputFn: 'Sales Enablement & Presales', expectedFn: 'Sales Enablement & Presales' },
      { inputFn: 'SalesEnablementPresales', expectedFn: 'Sales Enablement & Presales' },
      { inputFn: 'Finance', expectedFn: 'Finance' },
      { inputFn: 'HRGA', expectedFn: 'HRGA' },
      { inputFn: 'Management', expectedFn: 'Management' },
    ];

    for (const item of cases) {
      const resolvedFn = resolveUserFunction({ role: 'EMPLOYEE', function: item.inputFn });
      expect(resolvedFn).toBe(item.expectedFn);
      expect(getPromptHintForFunction(resolvedFn)).toBe(CANONICAL_PROMPT_HINTS[item.expectedFn]);
    }
  });

  it('memprioritaskan function akun walaupun role adalah PROJECT_MANAGER atau SUPERVISOR', () => {
    const pmInDelivery = resolveUserFunction({ role: 'PROJECT_MANAGER', function: 'Delivery' });
    expect(pmInDelivery).toBe('Delivery');
    expect(getPromptHintForFunction(pmInDelivery)).toContain('delivery proyek');

    const staffFinance = resolveUserFunction({ role: 'EMPLOYEE', function: 'Finance' });
    expect(staffFinance).toBe('Finance');
    expect(getPromptHintForFunction(staffFinance)).toContain('rekonsiliasi');
  });

  it('tetap mempertahankan fallback berbasis role jika atribut function tidak tersedia', () => {
    expect(resolveUserFunction(null)).toBe('Engineering');
    expect(resolveUserFunction({ role: 'HRGA' })).toBe('HRGA');
    expect(resolveUserFunction({ role: 'CEO_MANAGEMENT' })).toBe('Management');
    expect(resolveUserFunction({ role: 'SYSTEM_ADMIN' })).toBe('Operations & Infrastructure');
    expect(getPromptHintForFunction(null)).toBe(DEFAULT_FALLBACK_PROMPT);
    expect(getPromptHintForFunction('DivisiTidakDikenal')).toBe(DEFAULT_FALLBACK_PROMPT);
  });
});
