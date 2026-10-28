import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Baseline DDL & Anti-Backdating Triggers Verification (EP01-TK007 / SAD II.4 & B.5)', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../../prisma/migrations/20261028000000_baseline_schema_and_triggers/migration.sql',
  );

  it('migration file must exist at canonical path', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  it('must define enforce_no_backdating() PL/pgSQL function with app.org_timezone and error code P0001', () => {
    expect(sqlContent).toContain('CREATE OR REPLACE FUNCTION enforce_no_backdating()');
    expect(sqlContent).toContain("current_setting('app.org_timezone', true)");
    expect(sqlContent).toContain("'Asia/Jakarta'");
    expect(sqlContent).toContain("RAISE EXCEPTION 'BACKDATING_FORBIDDEN' USING ERRCODE = 'P0001'");
  });

  it('must attach BEFORE INSERT triggers to all 5 required tables', () => {
    const requiredTables = [
      'organizational_assignments',
      'project_authority_mappings',
      'temporary_reviewer_assignments',
      'policies',
      'policy_owner_assignments',
    ];

    for (const table of requiredTables) {
      const triggerPattern = new RegExp(
        `CREATE\\s+TRIGGER\\s+trg_no_backdating\\s+BEFORE\\s+INSERT\\s+ON\\s+"?${table}"?\\s+FOR\\s+EACH\\s+ROW\\s+EXECUTE\\s+FUNCTION\\s+enforce_no_backdating\\(\\)`,
        'i',
      );
      expect(sqlContent).toMatch(triggerPattern);
    }
  });

  it('must NEVER attach anti-backdating triggers on UPDATE (preserving end_date closures per DEC-008)', () => {
    expect(sqlContent).not.toMatch(/CREATE\s+TRIGGER.*BEFORE\s+UPDATE.*enforce_no_backdating/i);
    expect(sqlContent).not.toMatch(/CREATE\s+TRIGGER.*AFTER\s+UPDATE.*enforce_no_backdating/i);
  });

  it('must include composite indexes from SAD II.5', () => {
    expect(sqlContent).toContain('idx_org_active_lookup');
    expect(sqlContent).toContain('idx_pa_active_lookup');
  });

  it('must include policies.is_illustrative column (DEC-011, SAD B.1)', () => {
    expect(sqlContent).toMatch(/"is_illustrative"\s+BOOLEAN\s+NOT\s+NULL\s+DEFAULT\s+FALSE/i);
  });
});

