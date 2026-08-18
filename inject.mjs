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

/* JSON은 파싱했다가 다시 찍어 한 줄로 만든다.
   소스 파일은 사람이 읽기 좋게 여러 줄이어도 되지만, 주입되는 값은
   반드시 한 줄이어야 한다 — 아래 교체 정규식이 한 줄 단위로 걸리므로. */
const compact = f => JSON.stringify(JSON.parse(fs.readFileSync(f, 'utf8')));

const TARGETS = [
  { name: 'HEX64',   from: 'hex64.json',  read: compact },
  { name: 'EMPIRIC', from: 'empiric.js',  read: f => fs.readFileSync(f, 'utf8').replace(/^const EMPIRIC = /, '').replace(/;\s*$/, '').trim() },
  { name: 'YAO',     from: 'yao.json',    read: compact },
  { name: 'GUA',     from: 'gua.json',    read: compact },
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
