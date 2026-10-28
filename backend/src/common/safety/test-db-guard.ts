export class TestDatabaseSafetyGuard {
  /**
   * Memvalidasi bahwa koneksi database yang digunakan aman untuk eksekusi pengujian otomatis.
   * Mencegah kecelakaan eksekusi tes/reset data terhadap database development atau produksi.
   */
  static validate(databaseUrl: string | undefined): void {
    if (!databaseUrl) {
      throw new Error('FATAL SAFETY GUARD: DATABASE_URL is not set!');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(databaseUrl);
    } catch {
      throw new Error(`FATAL SAFETY GUARD: Invalid DATABASE_URL format: ${databaseUrl}`);
    }

    const dbName = parsedUrl.pathname.replace(/^\//, '').toLowerCase();

    // 1. Strict rejection of default administrative or reserved databases
    if (dbName === 'postgres' || dbName === 'template0' || dbName === 'template1') {
      throw new Error(
        `FATAL SAFETY GUARD: Target database '${dbName}' is a reserved non-test database! Test execution aborted.`,
      );
    }

    // 2. Database name MUST explicitly contain 'test'
    if (!dbName.includes('test')) {
      throw new Error(
        `FATAL SAFETY GUARD: Target database '${dbName}' is NOT a test database! Test execution aborted.`,
      );
    }
  }
}
