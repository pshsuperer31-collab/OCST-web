/**
 * 궁리등급 재조정 — 384효를 전수로 읽고 아래 둘만 손댄다.
 *   1(★)  = 판정의 근거가 후대 주석·고사·이문에 있고 구조로는 안 나오는 효
 *   2(★★) = 판정은 구조에서 나오나 장면이 전해오는 물상·고사 풀이에 기대는 효
 * 실행: node regrade.mjs && node merge-notes.mjs && node inject.mjs
 */
import fs from 'fs';

// [괘, 효(0=初 … 5=上), 새 등급, 근거]
const CHANGES = [
  [29, 3, 1, '樽酒簋貳·用缶·納約自牖 — 기물 이미지가 象이 아니라 주석 풀이'],
  [36, 4, 1, '箕子 — 미친 체하며 밝음을 감췄다는 고사가 판정의 근거'],
  [42, 2, 1, '中行이 효위의 中이 아니라 처신을 가리킨다는 새김에 의존'],
  [46, 3, 1, '王用亨于岐山 — 주나라 발흥 일화에 기댐'],
  [53, 5, 1, '陸을 逵의 오기로 보는 교감설 위에 선 판정'],
  [57, 4, 1, '先庚三日·後庚三日 — 干支 曆數 주석'],
  [23, 4, 2, '貫魚·宮人 물상 풀이'],
  [26, 3, 2, '童牛之牿 물상 풀이'],
  [26, 4, 2, '豶豕之牙 물상 풀이'],
  [44, 4, 2, '杞와 瓜를 임금·初六에 배당하는 것은 주석 계보'],
  [49, 1, 2, '巳日과 己日의 이문'],
  [54, 4, 2, '帝乙歸妹 고사'],
  [54, 5, 2, '광주리와 양을 종묘 제사 기물로 보는 풀이'],
  [56, 5, 2, '喪牛于易 — 34괘 六五와 같이 易의 새김이 갈림'],
  [63, 2, 2, '高宗의 鬼方 정벌 고사'],
  [64, 3, 2, '震의 鬼方 정벌 고사'],
];

const FILES = fs.readdirSync('.').filter(f => /^yao-notes-b\d+\.json$/.test(f)).sort();
const loaded = FILES.map(f => [f, JSON.parse(fs.readFileSync(f, 'utf8'))]);

let hit = 0;
for (const [gua, yao, grade, why] of CHANGES) {
  const entry = loaded.find(([, d]) => d[gua]);
  if (!entry) { console.error('✗ 괘 없음:', gua); process.exit(1); }
  const row = entry[1][gua][yao];
  if (!row) { console.error('✗ 효 없음:', gua, yao); process.exit(1); }
  console.log(`${String(gua).padStart(2)}-${'初二三四五上'[yao]}  ${row[1]} → ${grade}  ${why}`);
  row[1] = grade;
  hit++;
}
for (const [f, d] of loaded) fs.writeFileSync(f, JSON.stringify(d, null, 0).replace(/\],\[/g, '],\n['));
console.log(`\n${hit}개 조정 · 파일 ${FILES.length}개 갱신`);
