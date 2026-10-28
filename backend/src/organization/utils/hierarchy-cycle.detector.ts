export interface ReportingNode {
  userId: string;
  directManagerId: string | null;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cyclePath: string[];
}

export class HierarchyCycleDetector {
  /**
   * Mendeteksi siklus pelaporan hierarki organisasi.
   * Contoh siklus terlarang: A -> B -> C -> A.
   * 
   * @param targetUserId ID karyawan yang akan menerima manajer baru
   * @param proposedManagerId ID manajer langsung yang diajukan
   * @param getManagerFn Fungsi untuk mengambil directManagerId dari basis data untuk user tertentu
   */
  static async detectCycle(
    targetUserId: string,
    proposedManagerId: string | null,
    getManagerFn: (userId: string) => Promise<string | null>,
    maxDepth = 50,
  ): Promise<CycleDetectionResult> {
    if (!proposedManagerId) {
      return { hasCycle: false, cyclePath: [] };
    }

    // 1. Kasus Lapor Diri Sendiri (Self-reporting)
    if (targetUserId === proposedManagerId) {
      return {
        hasCycle: true,
        cyclePath: [targetUserId, proposedManagerId],
      };
    }

    const visited = new Set<string>([targetUserId]);
    const path: string[] = [targetUserId, proposedManagerId];

    let currentManagerId: string | null = proposedManagerId;
    let depth = 0;

    while (currentManagerId && depth < maxDepth) {
      if (visited.has(currentManagerId)) {
        return {
          hasCycle: true,
          cyclePath: [...path],
        };
      }

      visited.add(currentManagerId);
      currentManagerId = await getManagerFn(currentManagerId);

      if (currentManagerId) {
        path.push(currentManagerId);
      }

      depth++;
    }

    return { hasCycle: false, cyclePath: [] };
  }
}

