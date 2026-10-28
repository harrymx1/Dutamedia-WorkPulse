import { describe, it, expect } from 'vitest';
import { HierarchyCycleDetector } from './hierarchy-cycle.detector';

describe('HierarchyCycleDetector (WP-EP03-TK003 / SAD III.1 & B.5)', () => {
  it('should detect direct self-reporting cycle (A -> A)', async () => {
    const result = await HierarchyCycleDetector.detectCycle(
      'USR-A',
      'USR-A',
      async () => null,
    );

    expect(result.hasCycle).toBe(true);
    expect(result.cyclePath).toEqual(['USR-A', 'USR-A']);
  });

  it('should detect simple 2-node cycle (A -> B -> A)', async () => {
    // Topologi saat ini: USR-B melapor ke USR-A
    // Skenario usulan: USR-A ingin melapor ke USR-B
    const mockGetManager = async (userId: string) => {
      if (userId === 'USR-B') return 'USR-A';
      return null;
    };

    const result = await HierarchyCycleDetector.detectCycle(
      'USR-A',
      'USR-B',
      mockGetManager,
    );

    expect(result.hasCycle).toBe(true);
    expect(result.cyclePath).toEqual(['USR-A', 'USR-B', 'USR-A']);
  });

  it('should detect multi-node chain cycle (A -> B -> C -> D -> A)', async () => {
    const topology: Record<string, string | null> = {
      'USR-B': 'USR-C',
      'USR-C': 'USR-D',
      'USR-D': 'USR-A',
    };

    const mockGetManager = async (userId: string) => topology[userId] || null;

    const result = await HierarchyCycleDetector.detectCycle(
      'USR-A',
      'USR-B',
      mockGetManager,
    );

    expect(result.hasCycle).toBe(true);
    expect(result.cyclePath).toContain('USR-A');
  });

  it('should pass cleanly for valid acyclic hierarchy (A -> B -> C -> null)', async () => {
    const topology: Record<string, string | null> = {
      'USR-B': 'USR-C',
      'USR-C': null,
    };

    const mockGetManager = async (userId: string) => topology[userId] || null;

    const result = await HierarchyCycleDetector.detectCycle(
      'USR-A',
      'USR-B',
      mockGetManager,
    );

    expect(result.hasCycle).toBe(false);
    expect(result.cyclePath).toEqual([]);
  });
});

