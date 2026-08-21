/**
 * 상황 한 줄 검색 벤치마크.
 * ★문장은 검색어를 보고 쓴 것이 아니라 상황을 먼저 쓰고 기대 카드를 나중에 달았다 —
 *   끼워맞추면 개선이 실제인지 알 수 없다.
 * HELDOUT은 CASES로 고친 뒤에 새로 쓴 것이라, 두 적중률이 비슷해야 개선이 일반화된 것.
 * 실행: node search-bench.mjs
 */
import fs from 'fs';
const q = JSON.parse(fs.readFileSync('qsets.json', 'utf8'));

const CASES = [
 ['해외로 나가서 개원해보고 싶은데 막막하다', ['abroad']],
 ['지금 회사를 계속 다녀야 할지 모르겠다', ['endure','move']],
 ['동업 제안이 들어왔는데 받을지 말지', ['offer','together']],
 ['아버지 가업을 이어받아야 하나', ['inherit']],
 ['몇 년째 준비만 하고 시작을 못 하고 있다', ['delay','start']],
 ['부모님 요양원 보내는 게 맞을까', ['caretake','sharecare']],
 ['친구가 돈을 빌려달라는데', ['lend']],
 ['팀장이 자꾸 내 일을 떠넘긴다', ['unfair','lessrole']],
 ['후배가 내 자리를 노리는 것 같다', ['intrude']],
 ['오래 사귄 사람과 헤어질까', ['relation','cutoff']],
 ['담배를 끊고 싶은데 번번이 실패한다', ['quit','habit']],
 ['운동을 시작해야 하는데 미루기만 한다', ['body','habit']],
 ['회사가 어려워지는 게 눈에 보인다', ['decay']],
 ['아무리 얘기해도 위에서 안 듣는다', ['unheard']],
 ['갑자기 권고사직 통보를 받았다', ['suddenly']],
 ['뭐부터 정리해야 할지 모르겠다', ['wherefirst']],
 ['유학을 갈까 말까', ['learn','abroad']],
 ['좋은 선생님 밑에서 제대로 배우고 싶다', ['master','learn']],
 ['새 팀에 합류하자는 제안이 왔다', ['joinin','offer']],
 ['들어온 지 얼마 안 됐는데 겉도는 느낌이다', ['settlein','rightplace']],
 ['이 모임이 나랑 안 맞는 것 같다', ['rightplace']],
 ['애들 학원비를 어디까지 대줘야 하나', ['howmuch']],
 ['형과 부모님 부양을 나누는 문제', ['sharecare','family']],
 ['더는 못 버티겠어서 손을 놓고 싶다', ['caregoff','rest']],
 ['몸이 계속 신호를 보내는데 무시하고 있다', ['bodysign']],
 ['병원 가서 검사를 받아야 하나', ['treat']],
 ['대출을 받아서 확장할까', ['borrow','scaleup','invest']],
 ['손해가 커지는데 못 접고 있다', ['sunk']],
 ['가게를 접을까 넘길까', ['handover']],
 ['이 일을 계속 밀고 나갈까', ['push']],
 ['아무리 해도 반응이 없다', ['nofruit']],
 ['방식을 바꿔야 할 것 같다', ['rework']],
 ['작품을 세상에 내놓을까', ['publish']],
 ['이 소식을 알려야 하나 덮어야 하나', ['announce']],
 ['직원을 더 뽑을까', ['hire']],
 ['이제 남한테 맡기고 싶다', ['entrust']],
 ['아무도 안 나서서 내가 해야 할 판이다', ['sortout','takelead']],
 ['동호회를 하나 만들어볼까', ['found']],
 ['부탁을 자꾸 하는데 거절하고 싶다', ['refuse']],
 ['그 사람과 좀 거리를 두고 싶다', ['distance']],
 ['맡은 역할을 줄이고 싶다', ['lessrole']],
 ['아예 연락을 끊을까', ['cutoff']],
 ['이상한 소문이 도는 것 같다', ['rumor']],
 ['거래처와 금액 문제로 다투는 중이다', ['dispute']],
 ['틀어진 사이를 회복하고 싶다', ['mend']],
 ['사업 망하고 다시 일어설 수 있을까', ['comeback']],
 ['신뢰를 잃었는데 되찾을 수 있을까', ['credit']],
 ['먼저 사과할까', ['apologize']],
 ['도와달라고 말해도 될까', ['askhelp']],
 ['마음을 고백할까', ['confess']],
 ['정치 얘기로 가족과 자꾸 부딪힌다', ['disagree','family']],
 ['나라가 걱정돼서 뭐라도 해야 할 것 같다', ['decay','speakup']],
 ['목소리를 내야 하나 조용히 있어야 하나', ['speakup','announce']],
 ['오래 매달렸는데 지쳐간다', ['keepon']],
 ['욱하는 성격을 고치고 싶다', ['temper']],
 ['이직할까 남을까', ['move']],
 ['지금 시작하기엔 이른가', ['delay','waitmore']],
 ['접었던 일을 다시 해볼까', ['again']],
 ['큰돈을 넣을지 말지', ['invest']],
 ['묵은 문제를 이제 손볼 때인가', ['oldmess']],
];

/* ★검증용 — 위 60개로 고친 뒤에 새로 쓴 문장. 여기 적중률이 위와 비슷해야 개선이 진짜다. */
const HELDOUT = [
 ['프랜차이즈 제안이 왔는데 고민된다', ['offer']],
 ['남편이랑 자꾸 싸운다', ['conflict']],
 ['아이 진로에 개입해야 할까', ['family']],
 ['오래 준비한 시험을 포기할까', ['stop','sunk']],
 ['새 기술을 익혀야 할 것 같다', ['learn','deepen']],
 ['직장 상사가 부당한 지시를 한다', ['unfair']],
 ['사업이 잘 되는데 더 벌릴까', ['scaleup']],
 ['은퇴를 언제 할지 고민이다', ['stop','handover']],
 ['부모님이 편찮으신데 내가 모셔야 하나', ['caretake']],
 ['갑자기 큰 병 진단을 받았다', ['suddenly']],
 ['오해가 생겼는데 해명할까', ['rumor']],
 ['팀에서 내가 총대를 메야 할 상황이다', ['takelead']],
 ['요즘 사람들이 내 말을 안 믿는다', ['credit','unheard']],
 ['이 조직에 계속 있어도 되나', ['rightplace','endure']],
 ['옛 동료가 같이 하자고 한다', ['together','offer']],
 ['몸이 예전 같지 않다', ['bodysign']],
 ['새로운 곳에 정착하는 중인데 힘들다', ['settlein']],
 ['습관을 바꾸고 싶은데 잘 안 된다', ['habit']],
 ['아무도 이 문제를 손대지 않는다', ['sortout']],
 ['사과를 먼저 할까 말까', ['apologize']],
];

/* ★한글은 어간 끝에 받침이 붙으면 다른 글자가 된다 — "어려워지"가 "어려워진다"에 없다.
   그래서 한 음절씩만 종성을 떼어낸 변형들을 만들어 함께 맞춰본다.
   전체 종성을 한꺼번에 떼면 "맡긴다"가 "마기다"로 망가지므로 반드시 한 음절씩. */
function variants(t){
  const out = [t];
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c >= 0xAC00 && c <= 0xD7A3) {
      const j = (c - 0xAC00) % 28;
      if (j) out.push(t.slice(0, i) + String.fromCharCode(c - j) + t.slice(i + 1));
    }
  }
  return out;
}
function hit(vs, k){ return vs.some(v => v.indexOf(k) >= 0); }

/* index.html의 suggest()와 같은 논리 */
function suggest(text){
  const t = (text || '').replace(/\s/g, '');
  if (t.length < 2) return [];
  const vs = variants(t);
  return q.cards
    .map(c => ({ c, n: (c.kw || []).reduce((w, k) => w + (hit(vs, k) ? k.length : 0), 0) }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map(x => x.c);
}

/* 카드를 못 집었을 때 영역이라도 맞히는가 */
function suggestArea(text){
  const t = (text || '').replace(/\s/g, '');
  if (t.length < 2) return [];
  const vs = variants(t);
  return Object.keys(q.areaKw)
    .map(a => ({ a, n: q.areaKw[a].reduce((w, k) => w + (hit(vs, k) ? k.length : 0), 0) }))
    .filter(x => x.n > 0).sort((x, y) => y.n - x.n).slice(0, 2).map(x => x.a);
}
function areasOf(keys){
  const set = new Set();
  keys.forEach(k => { const c = q.cards.find(x => x.k === k); (c ? c.area : []).forEach(a => set.add(a)); });
  return [...set];
}

function score(set, label){
  let top1 = 0, top3 = 0, miss = 0;
  const misses = [], wrong = [];
  for (const [text, want] of set) {
    const got = suggest(text).map(c => c.k);
    if (!got.length) { miss++; misses.push(text); continue; }
    if (want.includes(got[0])) top1++;
    if (got.some(k => want.includes(k))) top3++;
    else wrong.push(`${text} → ${got.join(' / ')} (기대 ${want.join('|')})`);
  }
  /* 카드를 못 집은 문장에서 영역이라도 맞혔는지 */
  let areaSave = 0;
  for (const [text, want] of set) {
    const got = suggest(text).map(c => c.k);
    if (got.some(k => want.includes(k))) continue;      // 이미 카드로 잡힘
    const ga = suggestArea(text), wa = areasOf(want);
    if (ga.some(a => wa.includes(a))) areaSave++;
  }
  const n = set.length, pct = v => (v / n * 100).toFixed(0) + '%';
  console.log(`\n[${label}] 문장 ${n}개`);
  console.log(`  1등 적중 ${top1} (${pct(top1)})  ·  3등 안 ${top3} (${pct(top3)})`);
  console.log(`  못 찾음 ${miss} (${pct(miss)})  ·  빗나감 ${wrong.length} (${pct(wrong.length)})`);
  console.log(`  ★카드는 놓쳤지만 영역은 맞힘 ${areaSave} (${pct(areaSave)})  →  카드+영역 ${top3 + areaSave} (${pct(top3 + areaSave)})`);
  if (misses.length) console.log('  못 찾음: ' + misses.join(' / '));
  if (wrong.length)  console.log('  빗나감:\n    ' + wrong.join('\n    '));
}

/* ★두 번째 검증용 — 검색어를 대폭 고친 뒤에 새로 쓴 문장.
   앞의 HELDOUT은 실패를 보고 일부 고쳤으므로 더 이상 순수한 검증이 아니다. */
const HELDOUT2 = [
 ['원장을 그만두고 다른 일을 찾아볼까', ['move','stop']],
 ['후배한테 자리를 물려주려는데', ['handover','entrust']],
 ['계약 조건이 영 마음에 안 든다', ['dispute','offer']],
 ['애가 학교에서 문제를 일으켰다', ['family']],
 ['처음 해보는 분야라 겁이 난다', ['start','learn']],
 ['자꾸 미안하다는 말만 하게 된다', ['apologize']],
 ['강의를 하나 열어볼까', ['publish','found']],
 ['동료가 자꾸 선을 넘는다', ['refuse','distance']],
 ['몇 년 만에 연락이 왔다', ['mend','relation']],
 ['지방으로 내려가 볼까', ['move','abroad']],
 ['요즘 잠을 못 잔다', ['bodysign','rest']],
 ['큰 계약을 따냈는데 감당이 될까', ['scaleup','offer']],
 ['회비를 걷는 일을 떠맡았다', ['unfair','lessrole']],
 ['스승이 되어달라는 부탁을 받았다', ['favor']],
 ['세미나를 매달 하고 있는데 지친다', ['keepon','rest']],
 ['새 장비에 큰돈을 써야 한다', ['invest']],
 ['온라인으로 옮겨볼까', ['rework','move']],
 ['오래된 거래처와 정리할 때가 된 것 같다', ['cutoff','handover']],
 ['자꾸 화가 치밀어 오른다', ['temper']],
 ['아무 계획 없이 그만뒀다', ['stop','wherefirst']],
];

/* ★★세 번째 검증 — 영역 검색어까지 다 만든 뒤에 새로 쓴 문장.
   앞의 HELDOUT2는 실패 목록을 보고 영역 어휘를 넣었으므로 더 이상 순수하지 않다.
   이 셋을 보고는 아무것도 고치지 않는다 — 그래야 실제 수치다. */
const HELDOUT3 = [
 ['논문을 마무리해야 하는데 손이 안 간다', ['push','delay']],
 ['임대료가 올라서 버겁다', ['sunk','handover','move']],
 ['며느리와 사이가 불편하다', ['family','relation']],
 ['논쟁에 끼어들까 말까', ['speakup','disagree']],
 ['자격증 시험에 또 떨어졌다', ['learn','again']],
 ['형이 유산 문제로 연락을 끊었다', ['cutoff','family']],
 ['밤마다 술을 마시게 된다', ['quit']],
 ['진료 시간을 줄이고 싶다', ['lessrole','rest']],
 ['낯선 도시로 발령이 났다', ['abroad','move']],
 ['후배가 조언을 구해왔다', ['favor','askhelp']],
 ['예약이 계속 줄어든다', ['nofruit','decay']],
 ['새 원장을 들일까', ['hire']],
 ['블로그를 다시 써볼까', ['again','publish']],
 ['학회에 들어갈까', ['joinin']],
 ['아버지가 편찮아 병원에 모시고 다닌다', ['caretake','treat']],
 ['소득이 반으로 줄었다', ['sunk','decay']],
 ['오래된 친구에게 서운하다', ['conflict','relation']],
 ['강연 요청이 들어왔다', ['offer','favor']],
 ['체중이 계속 는다', ['body']],
 ['임상 공부를 더 해야 할 것 같다', ['learn','deepen']],
];

score(CASES,  '고치며 본 60개');
score(HELDOUT, '한 번 본 20개');
score(HELDOUT2, '두 번째 20개 (영역어휘 튜닝됨)');
score(HELDOUT3, '★★세 번째 20개 — 아무것도 안 고침');
