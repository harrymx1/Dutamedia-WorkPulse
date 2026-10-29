/**
 * Audit kontrak API: memetakan SETIAP panggilan apiClient di frontend ke rute backend NestJS.
 * Menjalankan: node scripts/audit-api-contract.js   (exit code 1 bila ada yang tidak cocok)
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const walk = (d, out = []) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    fs.statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

// ---------- Backend ----------
const norm = (p) =>
  '/' + p.split('?')[0].split('/').filter(Boolean).map((s) => (s.startsWith(':') || s.includes('${') ? ':p' : s)).join('/');

const strList = (s) => [...s.matchAll(/['"`]([^'"`]*)['"`]/g)].map((m) => m[1]);
const backend = new Set();
for (const f of walk(path.join(root, 'backend', 'src')).filter((f) => f.endsWith('.controller.ts'))) {
  const src = fs.readFileSync(f, 'utf8');
  const cm = src.match(/@Controller\(([^)]*)\)/);
  const prefixes = cm && cm[1].trim() ? strList(cm[1]) : [''];
  const re = /@(Get|Post|Put|Patch|Delete)\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(src))) {
    const subs = m[2].trim() ? strList(m[2]) : [''];
    for (const pre of prefixes) for (const sub of subs) backend.add(`${m[1].toUpperCase()} ${norm(`${pre}/${sub}`)}`);
  }
}

// ---------- Frontend ----------
const problems = [];
let total = 0;
const files = walk(path.join(root, 'frontend', 'src')).filter((f) => /\.(vue|ts)$/.test(f) && !f.endsWith('.spec.ts'));
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const re = /apiClient(?:<[\s\S]*?>)?\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1\s*(,\s*\{([\s\S]*?)\}\s*)?\)/g;
  let m;
  while ((m = re.exec(src))) {
    const ep = m[2];
    if (ep.startsWith('http')) continue;
    const opts = m[4] || '';
    const mm = opts.match(/method:\s*['"](\w+)['"]/);
    const method = (mm ? mm[1] : 'GET').toUpperCase();
    const url = norm('/api' + (ep.startsWith('/') ? ep : '/' + ep));
    total++;
    if (!backend.has(`${method} ${url}`)) {
      const line = src.slice(0, m.index).split('\n').length;
      problems.push(`${path.relative(root, f)}:${line}  ${method} ${ep}  ->  tidak ada di backend (dicari: ${method} ${url})`);
    }
  }
}

console.log(`Rute backend terdaftar: ${backend.size} | Panggilan frontend dianalisis: ${total}`);
if (problems.length) {
  console.log(`\nTIDAK COCOK (${problems.length}):\n` + problems.map((p, i) => `${i + 1}. ${p}`).join('\n'));
  process.exit(1);
}
console.log('SEMUA panggilan API frontend memiliki rute backend yang cocok.');

