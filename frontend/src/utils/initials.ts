/**
 * Utility pembentukan inisial avatar pengguna WorkPulse secara global (IMP-020).
 *
 * Aturan Product Owner:
 * 1. Maksimal 2 karakter, selalu huruf kapital (UPPERCASE).
 * 2. 1 kata: dua karakter pertama (contoh: "Harry" -> "HA").
 *    Jika nama hanya 1 karakter, gunakan 1 karakter tersebut (contoh: "H" -> "H").
 * 3. 2 kata: huruf pertama setiap kata (contoh: "Harry Phalosa" -> "HP").
 * 4. 3 kata: huruf pertama kata pertama dan terakhir (contoh: "Harry Aditya Phalosa" -> "HP").
 * 5. 4+ kata: huruf pertama kata pertama dan terakhir (contoh: "Harry Aditya Nugroho Phalosa" -> "HP").
 * 6. Abaikan spasi berlebih pada awal, akhir, dan di antara kata.
 * 7. Jika nama tidak tersedia, gunakan dua karakter pertama email.
 * 8. Jika nama dan email tidak tersedia, gunakan 'U'.
 */
export function getUserInitials(fullName?: string | null, email?: string | null): string {
  const cleanName = (fullName || '').trim().replace(/\s+/g, ' ');
  if (cleanName) {
    const words = cleanName.split(' ').filter(Boolean);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    const firstChar = words[0].charAt(0);
    const lastChar = words[words.length - 1].charAt(0);
    return (firstChar + lastChar).toUpperCase();
  }

  const cleanEmail = (email || '').trim();
  if (cleanEmail) {
    return cleanEmail.slice(0, 2).toUpperCase();
  }

  return 'U';
}
