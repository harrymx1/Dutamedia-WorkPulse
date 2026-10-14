import { describe, it, expect, afterEach } from 'vitest';
import { PhysicalConcurrencyHarness } from '../harness/concurrency-harness.js';

describe('Physical Concurrency Harness Infrastructure Smoke Verification', () => {
  let harness: PhysicalConcurrencyHarness | null = null;

  afterEach(async () => {
    if (harness) {
      await harness.cleanup();
      harness = null;
    }
  });

  it('proves physical connection separation with distinct PostgreSQL backend PIDs', async () => {
    harness = new PhysicalConcurrencyHarness();
    const connA = await harness.createConnection('TestConnA');
    const connB = await harness.createConnection('TestConnB');

    expect(connA.pid).toBeGreaterThan(0);
    expect(connB.pid).toBeGreaterThan(0);
    expect(connA.pid).not.toBe(connB.pid);

    const checkA = await connA.query<{ current_database: string }>('SELECT current_database()');
    const checkB = await connB.query<{ current_database: string }>('SELECT current_database()');

    expect(checkA.rows[0].current_database).toBe('workpulse_test');
    expect(checkB.rows[0].current_database).toBe('workpulse_test');
  });

  it('coordinates concurrent transactions deterministically via ConcurrencyBarrier', async () => {
    harness = new PhysicalConcurrencyHarness();
    const eventLog: string[] = [];

    const outcome = await harness.runTwoPartyRace({
      name: 'smoke-barrier-coordination',
      partyA: async (conn, barrier) => {
        await conn.beginTransaction();
        eventLog.push('PartyA:tx-started');
        await barrier.wait('PartyA:step1');
        eventLog.push('PartyA:after-barrier');
        await conn.rollback();
        return 'PartyA-done';
      },
      partyB: async (conn, barrier) => {
        await conn.beginTransaction();
        eventLog.push('PartyB:tx-started');
        await barrier.wait('PartyB:step1');
        eventLog.push('PartyB:after-barrier');
        await conn.rollback();
        return 'PartyB-done';
      },
    });

    expect(outcome.partyA.success).toBe(true);
    expect(outcome.partyB.success).toBe(true);
    expect(outcome.partyA.value).toBe('PartyA-done');
    expect(outcome.partyB.value).toBe('PartyB-done');
    expect(outcome.connAPid).not.toBe(outcome.connBPid);

    // Both parties must have started before either proceeded past the barrier
    const aStartedIdx = eventLog.indexOf('PartyA:tx-started');
    const bStartedIdx = eventLog.indexOf('PartyB:tx-started');
    const aAfterIdx = eventLog.indexOf('PartyA:after-barrier');
    const bAfterIdx = eventLog.indexOf('PartyB:after-barrier');

    expect(aStartedIdx).toBeLessThan(aAfterIdx);
    expect(bStartedIdx).toBeLessThan(bAfterIdx);
    expect(aStartedIdx).toBeLessThan(bAfterIdx);
    expect(bStartedIdx).toBeLessThan(aAfterIdx);
  });
});
