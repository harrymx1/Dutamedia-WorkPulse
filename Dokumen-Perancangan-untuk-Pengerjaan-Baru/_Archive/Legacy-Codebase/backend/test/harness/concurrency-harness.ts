import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertSafeTestDatabase } from '../../src/scripts/test-db-lifecycle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env.test is loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

/**
 * ConcurrencyBarrier
 * Coordinates N parties so that execution synchronizes deterministically at defined checkpoints.
 */
export class ConcurrencyBarrier {
  private partiesLeft: number;
  private generation = 0;
  private resolveWaiters: Array<(value: number) => void> = [];
  private rejectWaiters: Array<(reason: any) => void> = [];

  constructor(
    public readonly parties: number,
    public readonly defaultTimeoutMs: number = 10000
  ) {
    if (parties <= 0) {
      throw new Error('Barrier requires at least 1 party');
    }
    this.partiesLeft = parties;
  }

  /**
   * Arrive at the barrier and await until all other parties arrive.
   * Returns the arrival order index (0-indexed).
   */
  async wait(partyName: string = 'party', timeoutMs?: number): Promise<number> {
    const currentGeneration = this.generation;
    const arrivalOrder = this.parties - this.partiesLeft;
    this.partiesLeft -= 1;

    if (this.partiesLeft === 0) {
      // Last party arrived: trip the barrier and release all waiters
      const currentResolvers = [...this.resolveWaiters];
      this.resolveWaiters = [];
      this.rejectWaiters = [];
      this.partiesLeft = this.parties;
      this.generation += 1;

      for (const resolve of currentResolvers) {
        resolve(arrivalOrder);
      }
      return arrivalOrder;
    }

    // Await other parties with timeout
    const actualTimeout = timeoutMs ?? this.defaultTimeoutMs;
    return new Promise<number>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;

      if (actualTimeout > 0) {
        timeoutId = setTimeout(() => {
          if (this.generation === currentGeneration) {
            reject(
              new Error(
                `ConcurrencyBarrier timeout after ${actualTimeout}ms waiting for party '${partyName}'`
              )
            );
          }
        }, actualTimeout);
      }

      this.resolveWaiters.push((order) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(order);
      });

      this.rejectWaiters.push((err) => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(err);
      });
    });
  }

  /**
   * Force reset of the barrier, rejecting any pending waiters.
   */
  reset(reason: string = 'Barrier reset'): void {
    const currentRejecters = [...this.rejectWaiters];
    this.resolveWaiters = [];
    this.rejectWaiters = [];
    this.partiesLeft = this.parties;
    this.generation += 1;

    for (const reject of currentRejecters) {
      reject(new Error(reason));
    }
  }
}

/**
 * Wrapper for a distinct physical PostgreSQL connection.
 */
export class PhysicalConnection {
  public pid: number = 0;
  private inTransaction: boolean = false;

  constructor(
    public readonly client: pg.Client,
    public readonly label: string
  ) {}

  async initialize(): Promise<void> {
    await this.client.connect();
    const res = await this.client.query<{ pg_backend_pid: number }>('SELECT pg_backend_pid()');
    this.pid = res.rows[0].pg_backend_pid;
  }

  async query<T extends pg.QueryResultRow = any>(
    sql: string,
    params?: any[]
  ): Promise<pg.QueryResult<T>> {
    return this.client.query<T>(sql, params);
  }

  async beginTransaction(
    isolationLevel: 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE' = 'READ COMMITTED'
  ): Promise<void> {
    if (this.inTransaction) {
      throw new Error(`Connection ${this.label} (PID ${this.pid}) is already in a transaction`);
    }
    await this.client.query(`BEGIN TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
    this.inTransaction = true;
  }

  async commit(): Promise<void> {
    if (!this.inTransaction) {
      throw new Error(`Connection ${this.label} (PID ${this.pid}) has no active transaction to commit`);
    }
    await this.client.query('COMMIT');
    this.inTransaction = false;
  }

  async rollback(): Promise<void> {
    if (this.inTransaction) {
      await this.client.query('ROLLBACK');
      this.inTransaction = false;
    }
  }

  get isInTransaction(): boolean {
    return this.inTransaction;
  }

  async close(): Promise<void> {
    try {
      if (this.inTransaction) {
        await this.rollback();
      }
      await this.client.end();
    } catch {
      // Ignored during shutdown
    }
  }
}

export interface RacePartyResult<T> {
  success: boolean;
  value?: T;
  error?: Error;
  durationMs: number;
}

export interface RaceOutcome<T1, T2> {
  partyA: RacePartyResult<T1>;
  partyB: RacePartyResult<T2>;
  connAPid: number;
  connBPid: number;
  totalDurationMs: number;
}

/**
 * PhysicalConcurrencyHarness
 * Manages separate physical PostgreSQL connections and barrier synchronization for race conditions.
 */
export class PhysicalConcurrencyHarness {
  private connections: PhysicalConnection[] = [];
  private connectionString: string;

  constructor(connectionString?: string) {
    const rawUrl = connectionString || process.env.DATABASE_URL || '';
    assertSafeTestDatabase(rawUrl);
    this.connectionString = rawUrl;
  }

  /**
   * Spawns a new independent physical PostgreSQL connection.
   */
  async createConnection(label: string): Promise<PhysicalConnection> {
    const client = new pg.Client({
      connectionString: this.connectionString,
    });
    const connection = new PhysicalConnection(client, label);
    await connection.initialize();
    this.connections.push(connection);
    return connection;
  }

  /**
   * Spawns a new ConcurrencyBarrier for N coordinating parties.
   */
  createBarrier(parties: number, timeoutMs?: number): ConcurrencyBarrier {
    return new ConcurrencyBarrier(parties, timeoutMs);
  }

  /**
   * Executes a two-party race with distinct physical connections and synchronization.
   */
  async runTwoPartyRace<T1, T2>(options: {
    name: string;
    partyA: (connA: PhysicalConnection, barrier: ConcurrencyBarrier) => Promise<T1>;
    partyB: (connB: PhysicalConnection, barrier: ConcurrencyBarrier) => Promise<T2>;
    timeoutMs?: number;
    barrierCount?: number;
  }): Promise<RaceOutcome<T1, T2>> {
    const connA = await this.createConnection(`${options.name}-PartyA`);
    const connB = await this.createConnection(`${options.name}-PartyB`);

    if (connA.pid === connB.pid) {
      throw new Error(
        `FATAL: Connections share identical backend PID (${connA.pid}). Physical separation failed.`
      );
    }

    const barrier = this.createBarrier(options.barrierCount ?? 2, options.timeoutMs ?? 15000);
    const startTime = Date.now();

    const executeParty = async <T>(
      fn: () => Promise<T>
    ): Promise<RacePartyResult<T>> => {
      const pStart = Date.now();
      try {
        const val = await fn();
        return {
          success: true,
          value: val,
          durationMs: Date.now() - pStart,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err instanceof Error ? err : new Error(String(err)),
          durationMs: Date.now() - pStart,
        };
      }
    };

    const [resA, resB] = await Promise.all([
      executeParty(() => options.partyA(connA, barrier)),
      executeParty(() => options.partyB(connB, barrier)),
    ]);

    return {
      partyA: resA,
      partyB: resB,
      connAPid: connA.pid,
      connBPid: connB.pid,
      totalDurationMs: Date.now() - startTime,
    };
  }

  /**
   * Closes all active connections and cleans up resources.
   */
  async cleanup(): Promise<void> {
    const conns = [...this.connections];
    this.connections = [];
    await Promise.all(conns.map((c) => c.close()));
  }
}
