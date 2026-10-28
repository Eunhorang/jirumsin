
/* ── 숫자·글자 도우미 ─────────────────────── */
const WAGE_MIN = 10320;   // 2026년 최저임금(시간당)
const RATE = 0.05;        // 기회비용 계산에 쓰는 연 수익률 가정
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const comma = n => Math.round(n).toLocaleString('ko-KR');
const norm = s => String(s || '').toLowerCase().replace(/[\s·.,'"!?()[\]{}~\-_/+]+/g, '');
const REASON_LABEL = Object.fromEntries(REASONS);
const SINCE_LABEL = Object.fromEntries(SINCE);

function krw(n) {
  n = Math.round(n || 0);
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  if (n < 10000) return `${sign}${comma(n)}원`;
  if (n < 1000000) {
    const man = Math.floor(n / 10000), rest = n % 10000;
    return `${sign}${man}만${rest ? ' ' + comma(rest) + '원' : ' 원'}`;
  }
  if (n < 1e8) return `${sign}${comma(Math.round(n / 10000))}만 원`;
  const eok = Math.floor(n / 1e8), man = Math.round((n % 1e8) / 10000);
  return `${sign}${comma(eok)}억${man ? ' ' + comma(man) + '만' : ''} 원`;
}
function fmtPct(p) {
  if (p >= 10) return String(Math.round(p));
  if (p >= 1) return String(Math.round(p * 10) / 10);
  if (p >= 0.1) return String(Math.round(p * 100) / 100);
  return String(Number(p.toPrecision(2)));
}
function restPct(p) {
  const dec = p >= 1 ? 1 : p >= 0.1 ? 2 : 3;
  return String(Number((100 - p).toFixed(dec)));
}
function oneIn(p) {
  const n = 100 / p;
  if (p >= 95) return '거의 모든 사람';
  if (n < 10) return `10명 중 약 ${Math.round(p / 10)}명`;
  return `약 ${comma(Number(n.toPrecision(2)))}명 중 1명`;
}
function hm(h) {
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}분`;
  if (h < 10) return `${Math.round(h * 10) / 10}시간`;
  return `${comma(h)}시간`;
}
function hasBatchim(word) {
  const s = String(word).trim().replace(/\([^)]*\)$/, '').trim();
  const ch = s[s.length - 1];
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) return (code - 0xAC00) % 28 !== 0;
  if (/[0-9]/.test(ch)) return '013678'.includes(ch);
  if (/[a-z]/i.test(ch)) return 'lmnrLMNR'.includes(ch);
  return false;
}
const j = (word, pair) => { const [a, b] = pair.split('/'); return hasBatchim(word) ? a : b; };
const ownVerb = t => ({ sub: '구독하고 있어요', invest: '보유하고 있어요', exp: '한 해에 경험해요' }[t] || '가지고 있어요');
const ownVerbShort = t => ({ sub: '구독하는', invest: '보유한', exp: '한 해에 경험하는' }[t] || '가진');
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ── 품목 찾기 ───────────────────────────── */
const KB = ITEMS.map(([id, kw, label, cat, own, low, high, kr, price, basis, extra]) =>
  ({ id, kws: kw.split('|').map(norm).filter(Boolean), label, cat, own, low, high, kr, price, basis, ...(extra || {}) }));
const WORDS = {
  invest: /주식|주가|종목|매수|투자|etf|코인|상장|공모|배당|채권|펀드|주주/,
  sub: /구독|멤버십|요금제|월정액|정기결제|이용권/,
  luxury: /명품|보석|주얼리|다이아|럭셔리|하이엔드|금반지|금목걸이/,
  exp: /여행|숙소|호텔|공연|콘서트|식사|코스요리|클래스|체험|티켓|항공/,
};
const isNear = (a, b) => (a === 'goods' && b === 'luxury') || (a === 'luxury' && b === 'goods');
function detectWords(n) {
  for (const t of ['invest', 'sub', 'luxury', 'exp']) if (WORDS[t].test(n)) return t;
  return null;
}
function classify(text, choice) {
  const n = norm(text);
  const hint = choice !== 'auto' ? choice : detectWords(n);
  let best = null;
  for (const e of KB) {
    let len = 0;
    for (const k of e.kws) if (k.length > len && n.includes(k)) len = k.length;
    if (!len) continue;
    const t = CATS[e.cat].type;
    let score = len * 10;
    if (hint) score += t === hint ? 6 : isNear(t, hint) ? 0 : -6;
    if (!best || score > best.score) best = { e, score };
  }
  let entry = best ? best.e : null;
  let type = choice !== 'auto' ? choice : entry ? CATS[entry.cat].type : hint || 'goods';
  if (entry && !(CATS[entry.cat].type === type || isNear(CATS[entry.cat].type, type))) entry = null;
  if (entry) type = CATS[entry.cat].type;
  return { entry, type, cat: entry ? entry.cat : GENERIC_CAT[type] };
}

/* ── 세계 보유율 ─────────────────────────── */
function ownGuess(type, price) {
  let pct;
  if (type === 'sub') { const m = price || 10000; pct = m < 5000 ? 5 : m < 15000 ? 3 : m < 40000 ? 1.2 : m < 100000 ? 0.6 : 0.2; }
  else if (type === 'exp') { const p = price || 300000; pct = p < 100000 ? 15 : p < 500000 ? 5 : p < 3000000 ? 2 : 0.5; }
  else {
    const p = price || 300000;
    const tiers = [[30000, 30], [100000, 15], [300000, 7], [1000000, 3], [3000000, 1.2], [10000000, 0.4], [30000000, 0.15], [100000000, 0.04], [Infinity, 0.01]];
    pct = tiers.find(([lim]) => p < lim)[1];
  }
  return { pct, low: pct / 3, high: pct * 2.5 };
}
function ownership(m, price) {
  const e = m.entry || (m.type === 'invest' ? KB.find(x => x.id === 'stock') : null);
  if (e) {
    const ratio = (e.high - e.low) / e.own;
    let conf = ratio <= .25 ? '높음' : ratio <= .8 ? '보통' : '낮음';
    if (/대략/.test(e.basis)) conf = '낮음';
    return { pct: e.own, low: e.low, high: e.high, kr: e.kr, basis: e.basis, conf, ref: e.label, broad: !m.entry };
  }
  const g = ownGuess(m.type, price);
  return { ...g, kr: null, conf: '낮음', ref: null, broad: true,
    basis: '사전에 없는 품목이라 가격대가 비슷한 물건의 보급률로 어림했어요. Claude 정밀 분석을 켜면 더 정확해져요.' };
}

/* ── 돈 계산 ────────────────────────────── */
function costParams(m) {
  const c = CATS[m.cat], e = m.entry || {};
  return {
    dep1: e.dep1 ?? c.dep1 ?? .4, depN: c.depN ?? .2, life: c.life ?? 3, uses: c.uses ?? 50, per: c.per || 'use',
    hiddenRatio: e.hidden ?? c.hidden ?? 0, hiddenT: e.hidden != null ? e.hiddenT : c.hiddenT || '', hiddenList: null,
    thrill: c.thrill ?? 14, usesM: c.usesM ?? 8, mdd: e.mdd ?? c.mdd ?? null, mddNote: e.note || null, fee: c.fee ?? 0,
  };
}
function computeMoney(a) {
  const c = a.cost, inp = a.input, wage = inp.wage || WAGE_MIN, m = { wage };
  if (a.type === 'sub') {
    const M = a.price, usesM = clamp(Math.round(inp.usesM || c.usesM || 8), 1, 60);
    Object.assign(m, { M, usesM, y1: M * 12, y5: M * 60, y10: M * 120, perUse: M / usesM, base: M * 12,
      fvSub: M * ((Math.pow(1 + RATE / 12, 120) - 1) / (RATE / 12)) });
    m.hours = m.y1 / wage;
  } else if (a.type === 'invest') {
    const A = a.price, mdd = clamp(c.mdd ?? .5, .05, .99);
    Object.assign(m, { A, mdd, after: A * (1 - mdd), recover: Math.round((1 / (1 - mdd) - 1) * 100), feeAmt: A * c.fee, base: A });
    m.hours = A / wage;
  } else {
    const P = a.price, life = Math.max(1, c.life);
    const hiddenTotal = c.hiddenList ? c.hiddenList.reduce((s, h) => s + h.v, 0) : P * c.hiddenRatio;
    const sold = c.dep1 < .99;
    const resale1 = sold ? P * (1 - c.dep1) : 0;
    const resaleEnd = sold ? P * (1 - c.dep1) * Math.pow(1 - c.depN, life - 1) : 0;
    const tco = P + hiddenTotal, gone = tco - resaleEnd;
    Object.assign(m, { P, life, hiddenTotal, resale1, resaleEnd, tco, gone, base: P,
      perDay: gone / (life * 365), perUse: gone / Math.max(1, c.uses * life), fv10: P * Math.pow(1 + RATE, 10) });
    m.hours = P / wage;
  }
  a.money = m;
}

/* ── 충동 지수 ───────────────────────────── */
const RS_PTS = { sale: 12, everyone: 12, stress: 16, reward: 10, limited: 16, rising: 18, sns: 12, upgrade: 6, need: -18, gift: -6 };
const SINCE_PTS = { today: 22, days: 10, weeks: 0, months: -12 };
const TYPE_PTS = { luxury: [8, '명품·보석은 충동이 큰 편'], invest: [6, '투자는 감정이 끼기 쉬움'], sub: [2, '구독은 해지를 미루기 쉬움'], exp: [-6, '경험 소비는 만족이 오래감'] };
const CAT_PTS = { gacha: [12, '뽑기 구조'], lev: [10, '레버리지 상품'], crypto: [6, '변동성이 큰 자산'], etf: [-14, '분산 투자 상품'] };
function levelOf(s, type) {
  const buy = type === 'invest' ? '매수' : '결제';
  if (s >= 70) return { key: 'stop', stamp: `${buy}\n중지`, head: '지름신이 강림했어요', line: `오늘은 ${buy} 버튼에서 손을 떼세요. 이 마음은 내일이면 꽤 식어 있을 거예요.` };
  if (s >= 50) return { key: 'hold', stamp: '72시간\n보류', head: '72시간만 재워 두세요', line: '사고 싶은 마음은 진짜예요. 사흘 뒤에도 같은 마음인지 확인해 봐요.' };
  if (s >= 30) return { key: 'think', stamp: '재고\n요망', head: '한 번 더 따져 볼 만해요', line: '충동이 크진 않아요. 아래 숫자들을 보고 결정해도 늦지 않아요.' };
  return { key: 'ok', stamp: '통과', head: '필요에 가까운 소비예요', line: '충동보다는 필요에 가까워 보여요. 최저가와 중고부터 확인하고 사세요.' };
}
function scoreAndLevel(a) {
  const inp = a.input, parts = [['기본값', 30]];
  for (const r of inp.reasons) if (RS_PTS[r]) parts.push([REASON_LABEL[r], RS_PTS[r]]);
  if (SINCE_PTS[inp.since]) parts.push([SINCE_LABEL[inp.since], SINCE_PTS[inp.since]]);
  if (inp.similar) parts.push(['비슷한 걸 이미 가지고 있음', 14]);
  if (TYPE_PTS[a.type]) parts.push([TYPE_PTS[a.type][1], TYPE_PTS[a.type][0]]);
  if (CAT_PTS[a.cat]) parts.push([CAT_PTS[a.cat][1], CAT_PTS[a.cat][0]]);
  const h = a.money.hours;
  if (h > 480) parts.push(['석 달 치 넘는 노동', 12]);
  else if (h > 160) parts.push(['한 달 치 넘는 노동', 8]);
  else if (h < 4) parts.push(['반나절도 안 되는 노동', -6]);
  a.score = clamp(Math.round(parts.reduce((s, p) => s + p[1], 0)), 3, 97);
  a.parts = parts;
  a.level = levelOf(a.score, a.type);
}

/* ── 구매 심리 ───────────────────────────── */
function localPsych(a) {
  const inp = a.input, s = {};
  const add = (k, v) => { s[k] = (s[k] || 0) + v; };
  for (const [k, v] of Object.entries(CATS[a.cat].psy || {})) add(k, v);
  for (const r of inp.reasons) for (const [k, v] of Object.entries(TRIG[r] || {})) add(k, v);
  if (inp.since === 'today') { add('fomo', 15); add('emotion', 10); }
  if (inp.since === 'days') add('fomo', 5);
  if (inp.similar) { add('upgrade', 20); add('adapt', 10); }
  const damp = inp.reasons.includes('need') ? .8 : 1;
  const list = Object.entries(s).map(([id, v]) => ({ id, n: PSY[id][0], s: clamp(Math.round(v * damp), 8, 95), d: PSY[id][1] }));
  list.sort((x, y) => y.s - x.s);
  const top = list.filter(x => x.s >= 25).slice(0, 4);
  return top.length >= 3 ? top : list.slice(0, 3);
}

/* ── 사면 안 되는 이유 ───────────────────── */
const R = {
  upgradeGap: a => (a.cat === 'phone' || a.cat === 'device') ? { t: '체감 차이는 광고보다 작아요', d: `새 모델과 1~2년 된 모델의 일상 사용 차이는 크지 않아요. ${a.input.similar ? '지금 기기가 멀쩡하다면 ' : ''}배터리 교체나 저장공간 정리로 충분할 수도 있어요.` } : null,
  dep: a => (a.money.P && a.cost.dep1 > .1 && a.cost.dep1 < .99) ? { t: `1년이면 ${Math.round(a.cost.dep1 * 100)}%가 사라져요`, d: `1년 뒤 되팔면 약 ${krw(a.money.resale1)}이에요. 새것의 값은 결제하는 순간부터 빠르게 떨어져요.` } : null,
  noresale: a => (a.money.P && a.cost.dep1 >= .99 && a.type === 'goods') ? { t: '되팔 수도 없어요', d: `쓰고 나면 돌려받을 수 있는 돈이 거의 없어요. ${krw(a.money.P)}이 그대로 사라져요.` } : null,
  thrill: a => (a.cost.thrill && a.type !== 'invest') ? { t: `설렘 유통기한은 약 ${a.cost.thrill}일`, d: `새것의 기쁨은 생각보다 빨리 익숙해져요. ${a.cost.thrill}일 뒤에도 지금처럼 갖고 싶을지 상상해 보세요.` } : null,
  hours: a => {
    const m = a.money;
    if (m.hours < 1) return null;
    const d = m.hours / 8, span = d < 1 ? hm(m.hours) : `하루 8시간씩 ${comma(Math.ceil(d))}일`;
    return { t: `${hm(m.hours)}을 일해야 해요`, d: `${a.type === 'sub' ? '1년 구독료를 벌려면' : '이 돈을 벌려면'} 시급 ${krw(m.wage)} 기준으로 ${span} 일해야 해요. 그 시간과 바꿀 만큼 가치가 있는지 따져 보세요.` };
  },
  opp: a => (a.type !== 'invest' && a.type !== 'sub' && a.money.base >= 100000) ? { t: `10년 뒤라면 ${krw(a.money.fv10)}`, d: `같은 돈을 연 5%로 10년 굴리면 약 ${krw(a.money.fv10)}이 돼요. 지금의 만족과 미래의 선택지를 같이 놓고 보세요.` } : null,
  similar: a => a.input.similar ? { t: '이미 비슷한 게 있어요', d: '지금 가진 것으로 해결되는 부분이 많다면, 같은 기능에 돈을 두 번 내는 셈이에요.' } : null,
  sale: a => ({ t: '할인은 덜 쓰는 거지 버는 게 아니에요', d: `얼마를 아꼈는지보다 ${krw(a.money.base)}을 쓴다는 사실이 중요해요. 사지 않으면 100% 할인이에요.` }),
  stress: () => ({ t: '기분은 결제보다 빨리 돌아와요', d: '스트레스로 하는 소비는 결제하는 순간이 만족의 꼭대기예요. 카드 명세서가 나올 때 다시 스트레스가 되기 쉬워요.' }),
  limited: () => ({ t: '"지금 아니면"은 판매 전략이에요', d: '품절 임박, 마감 세일, 한정판은 생각할 시간을 빼앗는 장치예요. 정말 필요하면 기회는 또 와요.' }),
  everyone: a => ({ t: `'다들'은 세계 기준 ${fmtPct(a.own.pct)}%예요`, d: `주변 사람이 다 가진 것처럼 보여도 전 세계에서는 약 ${fmtPct(a.own.pct)}%만 ${ownVerb(a.type)}. 비교하는 범위가 좁아서 생기는 착시예요.` }),
  sns: () => ({ t: '알고리즘은 당신의 지갑을 알아요', d: '추천 영상과 광고에 자주 보이면 원래 없던 욕구가 생겨요. 영상 속 모습은 잘 연출된 장면이에요.' }),
  reward: () => ({ t: '보상이 매번 결제일 필요는 없어요', d: '수고한 나를 챙기는 건 좋아요. 다만 보상이 늘 결제라면 다음 보상은 더 비싼 걸 원하게 돼요.' }),
  gift: () => ({ t: '선물은 크기보다 마음이에요', d: '받는 사람이 정말 원하는 물건인지 먼저 확인해 보세요. 비싼 선물은 받는 사람에게도 부담이 될 수 있어요.' }),
  ownRare: a => a.own.pct < 5 ? { t: `세계의 ${restPct(a.own.pct)}%는 없이 살아요`, d: `전 세계에서 이걸 ${ownVerbShort(a.type)} 사람은 ${oneIn(a.own.pct)}이에요. 없어도 아무 문제 없이 사는 게 인류의 기본값이에요.` } : null,
  ownCommon: a => a.own.pct >= 30 ? { t: '흔한 물건, 바꿔도 일상은 비슷해요', d: `세계 인구의 약 ${fmtPct(a.own.pct)}%가 ${ownVerb(a.type)}. 새로 사도 하루하루가 크게 달라지지는 않아요.` } : null,
  sub10: a => ({ t: `10년이면 ${krw(a.money.y10)}`, d: `월 ${krw(a.money.M)}은 작아 보여도 1년이면 ${krw(a.money.y1)}, 10년이면 ${krw(a.money.y10)}이에요. 요금 인상은 넣지도 않은 금액이에요.` }),
  subUse: a => ({ t: `한 번 쓸 때마다 ${krw(a.money.perUse)}`, d: `한 달에 ${a.money.usesM}번 쓴다면 1회당 ${krw(a.money.perUse)}이에요. 지난달에 실제로 몇 번 썼는지 확인해 보세요.` }),
  subInertia: () => ({ t: '구독은 잊어버릴 때 돈을 벌어요', d: '무료 체험 뒤 자동 결제, 찾기 어려운 해지 메뉴는 흔한 방식이에요. 가입하기 전에 해지할 날짜부터 정해 두세요.' }),
  mdd: a => ({ t: `과거 최대 -${Math.round(a.money.mdd * 100)}% 하락`, d: `${a.cost.mddNote ? a.cost.mddNote + '. ' : ''}같은 일이 생기면 ${krw(a.money.A)}이 ${krw(a.money.after)}이 되고, 원금을 되찾으려면 +${comma(a.money.recover)}%가 올라야 해요.` }),
  rising: a => a.input.reasons.includes('rising') ? { t: '오를 때 사고 싶은 건 모두 같아요', d: '많이 오른 뒤에 관심이 생기는 건 자연스럽지만, 개인 투자자가 손실을 보는 가장 흔한 패턴이기도 해요.' } : null,
  daytrade: () => ({ t: '개인 단타의 성적표', d: '브라질 연구(2019)에서 300일 넘게 데이트레이딩한 개인의 97%가 손실을 봤어요. 미국 대형주 액티브 펀드도 15년 동안 약 90%가 지수를 이기지 못했어요(S&P SPIVA).' }),
  etfOk: () => ({ t: '분산 투자 자체는 나쁘지 않아요', d: '지수 ETF를 정해진 날 나눠 사는 건 충동 매수와 거리가 먼 방법이에요. 다만 한 번에 큰돈을 넣거나 레버리지 상품을 고르는 건 다른 이야기예요.' }),
  levDecay: () => ({ t: '레버리지는 기다릴수록 불리해요', d: '오르내림이 반복되면 지수가 제자리여도 레버리지 상품은 가치가 깎여요. 오래 들고 있는 데는 맞지 않아요.' }),
  luxResale: () => ({ t: '되팔 때는 정가가 아니에요', d: '일부 인기 모델을 빼면 명품의 중고가는 정가보다 낮아요. "재테크"라는 말은 소수 모델에만 맞아요.' }),
  diamond: () => ({ t: '다이아몬드는 되팔기 어려워요', d: '소매가에 유통 마진이 크게 붙어 있어서, 되팔 때는 산 값의 절반도 받기 어려운 경우가 많아요.' }),
  goldVat: a => a.entryId === 'gold_bar'
    ? { t: '사는 순간 10%가 빠져요', d: '골드바를 살 때는 부가가치세 10%와 수수료가 붙어요. 금값이 그만큼 올라야 겨우 본전이에요.' }
    : { t: '공임비는 돌려받지 못해요', d: '금 장신구 값에는 디자인과 세공 비용이 붙어 있어요. 되팔 때는 금 시세만 쳐 줘요.' },
  carCost: a => ({ t: '차값보다 무서운 유지비', d: `보험료·자동차세·연료비·정비·주차비를 합치면 ${a.cost.life}년 동안 약 ${krw(a.money.hiddenTotal)}이 더 들어요.` }),
  hidden: a => (a.money.P && a.money.hiddenTotal >= a.money.P * .15 && a.cost.hiddenT) ? { t: '숨은 비용이 따라와요', d: `${a.cost.hiddenT} 같은 비용으로 ${a.type === 'exp' ? '' : a.cost.life + '년 동안 '}약 ${krw(a.money.hiddenTotal)}이 더 들어요.` } : null,
  gacha: () => ({ t: '확률은 당신 편이 아니에요', d: '뽑기는 원하는 게 나올 때까지 쓴 돈이 계속 늘어나는 구조예요. 서비스가 끝나면 아이템도 함께 사라져요.' }),
  expDebt: () => ({ t: '경험은 남지만 카드값도 남아요', d: '물건보다 경험이 만족을 오래 준다는 연구가 많아요. 그래도 할부로 떠나면 돌아온 뒤의 나에게 부담을 넘기게 돼요.' }),
  gearFirst: () => ({ t: '장비가 실력을 만들지 않아요', d: '취미를 시작하면서 비싼 장비부터 사면 몇 번 쓰고 보관만 하게 되기 쉬워요. 대여나 중고로 먼저 시작해 보세요.' }),
  kpopRandom: () => ({ t: '랜덤 포토카드는 뽑기예요', d: '원하는 멤버가 나올 때까지 여러 장 사게 만드는 구조예요. 응원은 스트리밍과 공연으로도 충분히 전해져요.' }),
  trendFade: () => ({ t: '유행은 카드값보다 빨리 지나가요', d: '유행하는 옷과 신발은 한두 시즌이면 손이 덜 가요. 오래 입을 수 있는 디자인인지 보세요.' }),
  beautyStock: () => ({ t: '다 쓰기 전에 사면 쌓여요', d: '화장품과 영양제는 유통기한이 있어요. 서랍 속에 쓰다 만 제품이 몇 개인지 먼저 세어 보세요.' }),
};
const USER_R = ['stress', 'limited', 'everyone', 'sale', 'sns', 'reward', 'gift'];
function localReasons(a) {
  const rs = CATS[a.cat].rs, inp = a.input;
  const order = [rs[0], ...USER_R.filter(r => inp.reasons.includes(r)), 'similar', ...rs.slice(1), 'ownRare', 'ownCommon', 'hours', 'opp'];
  const out = [], seen = new Set();
  for (const k of order) {
    if (seen.has(k) || !R[k]) continue;
    seen.add(k);
    const r = R[k](a);
    if (r) out.push(r);
    if (out.length === 4) break;
  }
  return out;
}

/* ── 미래의 나에게서 온 편지 ─────────────── */
function localLetter(a) {
  const n = a.name, L = ['안녕, 1년 뒤의 나야.'], gift = a.input.reasons.includes('gift');
  if (gift) L.push(`그때 ${n}${j(n, '을/를')} 고르느라 한참 고민했지. 돌아보면 기억에 남은 건 값보다 마음이었어.`);
  else {
    if (a.type === 'invest') L.push(`그때 ${n}${j(n, '을/를')} 살까 말까 차트를 몇 번이나 새로고침했지.`);
    else if (a.type === 'sub') L.push(`그때 ${n} 결제 버튼 앞에서 잠깐 멈췄던 거 기억나?`);
    else L.push(`그때 ${n}${j(n, '을/를')} 장바구니에 넣고 한참 고민했던 거 기억나?`);
    L.push(`솔직히 그때 갖고 싶었던 건 ${n}보다 '${a.want}' 쪽이었던 것 같아.`);
  }
  if (a.money.hours >= 8) L.push(a.type === 'sub' ? `1년 구독료만 해도 ${hm(a.money.hours)}을 일해야 버는 돈이었잖아.` : `그 돈은 ${hm(a.money.hours)}을 일해야 버는 돈이었잖아.`);
  if (a.level.key !== 'ok') L.push('딱 사흘만 기다려 줘. 그래도 필요하면 그때 사도 늦지 않으니까.');
  else L.push(a.type === 'invest' ? '정해 둔 원칙대로 하는 거라면 괜찮아. 남들이 몰릴 때 서두르지만 않으면 돼.' : '필요한 거라면 사도 괜찮아. 대신 최저가는 꼭 확인하고.');
  return L.join(' ');
}

/* ── 기본 추정 분석 ──────────────────────── */
function analyzeLocal(inp) {
  const m = classify(inp.item, inp.type);
  const e = m.entry, known = inp.price != null && inp.price > 0;
  const a = {
    source: 'local', input: inp, name: inp.item.trim(), entryId: e ? e.id : null, label: e ? e.label : null,
    type: m.type, cat: m.cat,
    price: known ? inp.price : (e && e.price) || DEFAULT_PRICE[m.type],
    priceSource: known ? 'user' : (e && e.price) ? 'kb' : 'default',
    cost: costParams(m), ai: {},
  };
  a.own = ownership(m, a.price);
  computeMoney(a);
  scoreAndLevel(a);
  a.line = a.level.line;
  a.psych = localPsych(a);
  a.want = inp.reasons.includes('gift') ? '마음을 제대로 전하는 것' : WANT[a.psych[0] && a.psych[0].id] || '새것의 신선함';
  a.reasons = localReasons(a);
  a.alts = CATS[a.cat].alts.slice(0, 4).map(([t, d]) => ({ t, d }));
  a.letter = localLetter(a);
  return a;
}
