/**
 * 데이터 주입 — index.html의 세 데이터 상수를 소스 파일에서 갱신한다.
 *
 *   HEX64   ← hex64.json    64괘 binary·번호·이름
 *   EMPIRIC ← empiric.js    판정 실측 테이블 (calibrate.mjs가 생성)
 *   YAO     ← yao.json      384효 효사 (yao-b1~b4.json 병합본)
 *   GUA     ← gua.json      괘별 상황 서술 [라벨, 서술]
 *
 * 첫 주입 때는 `/*__NAME__*\/{}` 토큰을, 이후에는 이미 들어있는 값을 갈아끼운다.
 * 몇 번을 돌려도 결과가 같다.
 *
 * 실행: node inject.mjs
 */
import fs from 'fs';

const PATH = 'index.html';

const TARGETS = [
  { name: 'HEX64',   from: 'hex64.json',  read: f => fs.readFileSync(f, 'utf8').trim() },
  { name: 'EMPIRIC', from: 'empiric.js',  read: f => fs.readFileSync(f, 'utf8').replace(/^const EMPIRIC = /, '').replace(/;\s*$/, '') },
  { name: 'YAO',     from: 'yao.json',    read: f => fs.readFileSync(f, 'utf8').trim() },
  { name: 'GUA',     from: 'gua.json',    read: f => fs.readFileSync(f, 'utf8').trim() },
];

let html = fs.readFileSync(PATH, 'utf8');

for (const t of TARGETS) {
  if (!fs.existsSync(t.from)) { console.error(`✗ ${t.name}: ${t.from} 없음`); process.exit(1); }
  const value = t.read(t.from);

  // 'const NAME = ' 로 시작해 그 줄 끝의 ';' 까지가 교체 대상
  const re = new RegExp(`const ${t.name} = .*?;$`, 'm');
  if (!re.test(html)) { console.error(`✗ ${t.name}: index.html에서 선언을 못 찾음`); process.exit(1); }

  const before = html.match(re)[0].length;
  html = html.replace(re, `const ${t.name} = ${value};`);
  console.log(`✓ ${t.name.padEnd(7)} ${t.from.padEnd(12)} ${String(before).padStart(7)} → ${String(value.length + t.name.length + 12).padStart(7)} chars`);
}

fs.writeFileSync(PATH, html);
console.log(`\n${PATH} ${fs.statSync(PATH).size} bytes`);
