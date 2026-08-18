/**
 * 궁리노트 배치 병합 — yao-notes-b*.json → yao-notes.json
 * 각 항목은 [궁리노트, 궁리등급(3|2|1)].
 * 실행: node merge-notes.mjs
 */
import fs from 'fs';

const files = fs.readdirSync('.').filter(f => /^yao-notes-b\d+\.json$/.test(f)).sort();
const all = {};
for (const f of files) Object.assign(all, JSON.parse(fs.readFileSync(f, 'utf8')));

const keys = Object.keys(all).map(Number).sort((a, b) => a - b);
const bad = [];
for (const k of keys) {
  const rows = all[k];
  if (rows.length !== 6) { bad.push(`${k}: 효 ${rows.length}개`); continue; }
  rows.forEach((r, i) => {
    if (!Array.isArray(r) || r.length !== 2 || !r[0] || ![1, 2, 3].includes(r[1]))
      bad.push(`${k}/${i}`);
  });
}
if (bad.length) { console.error('✗ 결손:', bad.join(', ')); process.exit(1); }

const ordered = {};
for (const k of keys) ordered[k] = all[k];
fs.writeFileSync('yao-notes.json', JSON.stringify(ordered));

const grades = { 3: 0, 2: 0, 1: 0 };
for (const k of keys) for (const r of all[k]) grades[r[1]]++;
console.log(`배치 ${files.length}개 · 괘 ${keys.length} · 효 ${keys.length * 6} · 결손 없음`);
console.log(`연속 1~${keys[keys.length - 1]}:`, keys.every((v, i) => v === i + 1) ? 'OK' : '끊김');
console.log(`등급  ★★★ ${grades[3]} · ★★ ${grades[2]} · ★ ${grades[1]}`);
