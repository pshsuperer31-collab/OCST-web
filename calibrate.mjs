/**
 * OCST 판정 캘리브레이션
 *
 * 노션 "효별 궁리 분석(爻辭 構造)" DB 384효(64괘 완비)에서 뽑은
 * (효위치 × 正 × 應) 24셀 × 각 16효 집계를 OCST judge() 테이블로 변환한다.
 *
 * 셀이 24개인 이유: 中은 효위치로 결정되고 正은 효위치+자기음양으로 결정되므로
 * 자유변수는 효위치(6) × 자기음양(2) × 짝효음양(2) = 24. 표본이 아니라 전수다.
 *
 * 실행: node calibrate.mjs   → EMPIRIC 테이블을 stdout에 출력
 */

/* 노션 집계 원자료 — good=吉/元吉, bad=凶/无攸利, caut=悔/吝/厲, ok=无咎, none=점사어 없음 */
const RAW = [
  ['三','不正','無應',16, 0,5,5,4,6], ['三','不正','정응',16, 1,4,2,3,8],
  ['三','正','敵應',16, 4,2,9,2,4],  ['三','正','정응',16, 1,4,4,3,6],
  ['上','不正','敵應',16, 5,3,3,3,4], ['上','不正','정응',16, 5,4,2,5,4],
  ['上','正','無應',16, 2,6,1,4,6],  ['上','正','정응',16, 5,7,2,1,4],
  ['二','不正','敵應',16, 7,2,0,3,6], ['二','不正','정응',16, 7,1,0,4,5],
  ['二','正','無應',16, 7,2,1,2,4],  ['二','正','정응',16, 8,2,1,2,6],
  ['五','不正','無應',16, 6,0,3,1,8], ['五','不正','정응',16,11,2,0,1,4],
  ['五','正','敵應',16, 5,0,2,5,4],  ['五','正','정응',16, 8,1,0,2,6],
  ['初','不正','無應',16, 5,3,4,4,4], ['初','不正','정응',16, 4,4,2,5,3],
  ['初','正','敵應',16, 5,1,0,7,3],  ['初','正','정응',16, 6,1,1,5,4],
  ['四','不正','敵應',16, 6,1,1,4,5], ['四','不正','정응',16, 6,2,4,3,4],
  ['四','正','無應',16, 3,1,2,7,4],  ['四','正','정응',16, 4,0,0,5,8],
];

const POS = { '初':0, '二':1, '三':2, '四':3, '五':4, '上':5 };

/* (효위치, 正/不正, 應종류) → (i, 자기 陽여부, 짝 陽여부) */
function decode(posName, jeong, eung) {
  const i = POS[posName];
  const yangSeat = (i % 2 === 0);              // 初三五 = 陽자리
  const self = (jeong === '正') ? yangSeat : !yangSeat;
  const partner = (eung === '정응') ? !self : self;   // 敵應=양양, 無應=음음
  // 무결성 검사: 敵應은 둘 다 陽, 無應은 둘 다 陰이어야 한다
  if (eung === '敵應' && !(self && partner)) throw new Error('敵應 불일치: ' + posName + jeong);
  if (eung === '無應' && (self || partner))  throw new Error('無應 불일치: ' + posName + jeong);
  return { i, self, partner };
}

/* 순점수 — 판정어가 없는 효(none)는 중립으로 두고 분모에서 뺀다 */
function net(g, b, c, o) {
  const graded = g + b + c + o;
  if (!graded) return 0;
  return (g * 1 + o * 0.35 - c * 0.7 - b * 1) / graded;
}

const cells = RAW.map(r => {
  const [posName, jeong, eung, cnt, good, bad, caut, ok, none] = r;
  const d = decode(posName, jeong, eung);
  return { posName, jeong, eung, ...d, cnt, good, bad, caut, ok, none, net: net(good, bad, caut, ok) };
});

cells.sort((a, b) => b.net - a.net);

console.log('순위  자리 正   應     吉 凶 悔吝厲 无咎 (無)   순점수');
cells.forEach((c, k) => {
  console.log(
    String(k + 1).padStart(3) + '  ' + c.posName + '  ' + c.jeong.padEnd(3) + ' ' +
    c.eung.padEnd(4) + ' ' +
    String(c.good).padStart(3) + String(c.bad).padStart(3) + String(c.caut).padStart(5) +
    String(c.ok).padStart(6) + String(c.none).padStart(5) + '   ' + c.net.toFixed(3));
});

/* 자연 간격에서 4단으로 자른다 */
const gaps = [];
for (let k = 1; k < cells.length; k++) gaps.push({ k, gap: cells[k - 1].net - cells[k].net });
gaps.sort((a, b) => b.gap - a.gap);
console.log('\n가장 큰 간격 6개 (자를 후보 지점):');
gaps.slice(0, 6).forEach(g =>
  console.log('  ' + g.k + '번째 앞  간격 ' + g.gap.toFixed(3) +
    '   (' + cells[g.k - 1].posName + cells[g.k - 1].jeong + ' → ' + cells[g.k].posName + cells[g.k].jeong + ')'));

/* 위치별 평균 — 자리문법이 데이터로 확인되는지 */
console.log('\n자리별 평균 순점수:');
'初二三四五上'.split('').forEach(p => {
  const cs = cells.filter(c => c.posName === p);
  const m = cs.reduce((s, c) => s + c.net, 0) / cs.length;
  console.log('  ' + p + '  ' + m.toFixed(3));
});

/* 應의 효과 — 자리별로 정응 vs 비정응 */
console.log('\n應의 효과 (정응 평균 − 비정응 평균):');
'初二三四五上'.split('').forEach(p => {
  const y = cells.filter(c => c.posName === p && c.eung === '정응');
  const n = cells.filter(c => c.posName === p && c.eung !== '정응');
  const my = y.reduce((s, c) => s + c.net, 0) / y.length;
  const mn = n.reduce((s, c) => s + c.net, 0) / n.length;
  console.log('  ' + p + '  ' + (my - mn >= 0 ? '+' : '') + (my - mn).toFixed(3));
});

/* 판정 라벨 = 그 조건 16효에서 실제로 가장 많이 나온 판정어.
   임의 컷 없이 최빈값으로 정하고, 동수는 순점수 방향으로 가른다. */
const LABELS = {
  ji:   { key: 'ji',   name: '나아감',   cls: 'v-ji',    src: '吉' },
  mu:   { key: 'mu',   name: '허물없음', cls: 'v-mu',    src: '无咎' },
  ryeo: { key: 'ryeo', name: '조심',     cls: 'v-ryeo',  src: '悔吝厲' },
  hyung:{ key: 'hyung',name: '물러섬',   cls: 'v-hyung', src: '凶' },
};
/* 최빈값만 쓰면 吉5·凶4 같은 접전도 '나아감'이 된다.
   위험(凶+悔吝厲) 합을 확실히 넘을 때만 나아감을 준다. */
function classify(c) {
  if (c.good > c.bad + c.caut) return 'ji';        // 吉이 위험 합을 넘음
  if (c.bad >= c.good + c.ok)  return 'hyung';     // 凶이 무탈 합을 삼킴
  if (c.caut >= c.good && c.caut > c.bad) return 'ryeo';  // 悔吝厲가 주된 결
  return 'mu';                                     // 나머지는 无咎 자리
}

const T = {};
const tally = {};
cells.forEach(c => {
  const lab = classify(c);
  tally[lab] = (tally[lab] || 0) + 1;
  T[c.i] = T[c.i] || {};
  T[c.i][c.self ? 1 : 0] = T[c.i][c.self ? 1 : 0] || {};
  T[c.i][c.self ? 1 : 0][c.partner ? 1 : 0] = {
    g: c.good, b: c.bad, c: c.caut, o: c.ok, n: c.none,
    net: +c.net.toFixed(3), v: lab,
  };
});

console.log('\n판정 라벨 분포 (24셀 · 각 16효):');
Object.keys(LABELS).forEach(k =>
  console.log('  ' + LABELS[k].name.padEnd(5) + '(' + LABELS[k].src + ')  ' +
    (tally[k] || 0) + '셀 = ' + ((tally[k] || 0) * 16) + '효 · ' +
    Math.round((tally[k] || 0) / 24 * 100) + '%'));

console.log('\n/* EMPIRIC[효index][자기陽][짝陽] — 노션 384효 전수 집계 */');
console.log('const EMPIRIC = ' + JSON.stringify(T) + ';');
