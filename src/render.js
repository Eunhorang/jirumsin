
/* ── 결과 그리기 ─────────────────────────── */
let current = null;
const pad = n => String(n).padStart(2, '0');
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const srcBadge = (a, key) => a.ai[key] ? '<span class="src ai">Claude 분석</span>' : '<span class="src">기본 추정</span>';
const saveAmount = a => a.type === 'sub' ? a.money.y1 : a.money.base;
const NEG_VERB = { sub: '구독하지 않아요', invest: '갖고 있지 않아요', exp: '하지 않아요' };

function renderResult(a, status) {
  current = a;
  $('#result').innerHTML = `
    <div class="status" id="status" role="status"></div>
    <div class="rgrid">
      <div class="a-verdict" id="sec-verdict"></div>
      <div class="a-own" id="sec-own"></div>
      <section class="a-receipt" id="sec-receipt" aria-label="진짜 비용"></section>
      <section class="a-psych sec" id="sec-psych"></section>
      <section class="a-reasons sec" id="sec-reasons"></section>
      <section class="a-curve sec" id="sec-curve"></section>
      <section class="a-alts sec" id="sec-alts"></section>
      <section class="a-letter sec" id="sec-letter"></section>
      <section class="a-chat sec" id="sec-chat" hidden></section>
    </div>
    <div class="actions" id="actions"></div>
    <div class="buy-panel" id="buy-panel" hidden></div>`;
  renderVerdict(a, true); renderOwn(a, true); renderReceipt(a); renderPsych(a); renderReasons(a);
  renderCurve(a); renderAlts(a); renderLetter(a); renderActions(a);
  setStatus(status || 'local');
}
function flash(id) {
  const el = document.getElementById(id);
  if (!el || reduceMotion()) return;
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}

function renderVerdict(a, hit) {
  const L = a.level, refocus = !!document.activeElement.closest('#sec-verdict h2');
  $('#sec-verdict').innerHTML = `
  <div class="charm">
    <div class="stamp${hit ? ' hit' : ''}" aria-hidden="true">${esc(L.stamp).replace('\n', '<br>')}</div>
    <div class="charm-body">
      <p class="eyebrow">지름신 판정 · ${esc(TYPE_NAME[a.type])}</p>
      <h2 tabindex="-1">${esc(L.head)}</h2>
      <p class="line">${esc(a.line)}</p>
      <div class="meter" role="img" aria-label="충동 지수 100점 만점에 ${a.score}점">
        <div class="meter-top"><span>충동 지수</span><b class="num">${a.score}</b></div>
        <div class="meter-track"><div class="meter-fill" style="width:${a.score}%"></div></div>
        <div class="meter-scale" aria-hidden="true"><span>합리적</span><span>고민</span><span>보류</span><span>지름신</span></div>
      </div>
      <details class="why-score"><summary>점수는 이렇게 나왔어요</summary>
        <ul>${a.parts.map(([l, p]) => `<li>${esc(l)} ${p > 0 ? '+' : ''}${p}</li>`).join('')}</ul></details>
    </div>
  </div>`;
  // Claude 분석이 판정을 다시 그려도 읽던 자리를 잃지 않게 한다
  if (refocus) $('#sec-verdict h2').focus({ preventScroll: true });
}

function ownSentence(a) {
  const o = a.own, who = `전 세계에서 <b>${oneIn(o.pct)}</b>${o.pct < 50 ? '만' : '이'}`;
  const what = esc(o.ref || a.name), obj = j(o.ref || a.name, '을/를');
  if (a.type === 'exp') return `한 해 동안 ${who} ${what}${obj} 경험해요.`;
  return `${who} ${what}${obj} ${ownVerb(a.type)}.`;
}
function crowdScale(p) { return p >= 2 ? 100 : p >= 0.2 ? 1000 : 10000; }
function renderOwn(a, animate) {
  const o = a.own, scale = crowdScale(o.pct), k = Math.min(scale, Math.round(o.pct / 100 * scale));
  const place = { 100: '세계가 100명의 마을이라면', 1000: '1,000명이 모인 공연장이라면', 10000: '10,000명이 모인 경기장이라면' }[scale];
  const verb = a.type === 'exp' ? '한 해에 경험하고' : ownVerb(a.type).replace('있어요', '있고');
  const cap = k >= 1
    ? `${place} ${comma(k)}명${o.pct < 50 ? '만' : '이'} ${verb}, 나머지 ${comma(scale - k)}명은 ${NEG_VERB[a.type] || '없이 살아요'}.`
    : `${place}, 1명도 없을 가능성이 커요. ${oneIn(o.pct)}꼴이에요.`;
  const broad = o.broad && o.ref ? ` <span class="hint">(${esc(o.ref)} 전체 기준)</span>` : '';
  $('#sec-own').innerHTML = `
  <section class="own" aria-labelledby="own-h">
    <div class="sec-h"><p class="eyebrow" id="own-h">전 세계 보유율 추정</p>${srcBadge(a, 'own')}</div>
    <div class="own-head">
      <div class="own-big"><span class="n num">${fmtPct(o.pct)}</span><span class="u">%</span></div>
      <p class="own-sub">${ownSentence(a)}${broad}</p>
    </div>
    <figure class="crowd"><canvas id="crowd" aria-hidden="true"></canvas><figcaption>${esc(cap)}</figcaption></figure>
    <dl class="facts">
      <div><dt>한국 추정</dt><dd>${o.kr != null ? '약 ' + fmtPct(o.kr) + '%' : '자료 부족'}</dd></div>
      <div><dt>추정 범위</dt><dd>${fmtPct(o.low)}~${fmtPct(o.high)}%</dd></div>
      <div><dt>신뢰도</dt><dd>${esc(o.conf)}</dd></div>
    </dl>
    <p class="basis">근거 · ${esc(o.basis)}</p>
    <p class="perspective">세계 인구의 약 10%는 하루 3달러(구매력 기준)보다 적은 돈으로 살아요. 세계은행이 2025년에 정한 극빈 기준선이에요.</p>
  </section>`;
  drawCrowd(a, animate);
}

let crowdAnim = 0;
function person(g, x, y, s) {
  g.beginPath(); g.arc(x, y - s * .17, s * .15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(x, y + s * .3, s * .27, s * .25, 0, Math.PI, Math.PI * 2); g.fill();
}
function drawCrowd(a, animate) {
  const cv = $('#crowd');
  if (!cv || !a) return;
  const p = a.own.pct, scale = crowdScale(p);
  const w = cv.parentElement.clientWidth || 600;
  const cols = scale === 100 ? 20 : scale === 1000 ? 50 : (w < 520 ? 100 : 125);
  const cell = w / cols, h = Math.ceil((scale / cols) * cell);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px';
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const css = getComputedStyle(document.documentElement);
  const dot = css.getPropertyValue('--dot').trim() || '#c4c9d1', red = css.getPropertyValue('--red').trim() || '#c42a20';
  const k = Math.min(scale, Math.round(p / 100 * scale));
  const rnd = mulberry32(hash(a.name + scale)), picks = new Set();
  while (picks.size < k) picks.add(Math.floor(rnd() * scale));
  const shape = (i, color) => {
    const x = (i % cols) * cell + cell / 2, y = Math.floor(i / cols) * cell + cell / 2;
    g.fillStyle = color;
    if (scale === 100) person(g, x, y, cell);
    else { g.beginPath(); g.arc(x, y, cell * (scale === 1000 ? .34 : .32), 0, Math.PI * 2); g.fill(); }
  };
  for (let i = 0; i < scale; i++) shape(i, dot);
  const list = [...picks];
  cancelAnimationFrame(crowdAnim);
  if (!animate || reduceMotion()) { list.forEach(i => shape(i, red)); return; }
  const t0 = performance.now();
  const step = now => {
    const n = Math.ceil(list.length * Math.min(1, (now - t0) / 700));
    for (let q = 0; q < n; q++) shape(list[q], red);
    if (n < list.length) crowdAnim = requestAnimationFrame(step);
  };
  crowdAnim = requestAnimationFrame(step);
}

function barcode(seed) {
  const r = mulberry32(hash(seed));
  let x = 0, bars = '';
  while (x < 296) {
    const w = 1 + Math.floor(r() * 3);
    if (r() > .42) bars += `<rect x="${x}" y="0" width="${w}" height="46"/>`;
    x += w + 1;
  }
  return `<svg viewBox="0 0 300 46" preserveAspectRatio="none" aria-hidden="true" fill="currentColor">${bars}</svg>`;
}
function swapTiles(amount) {
  const order = amount < 50000 ? ['coffee', 'subway', 'gukbap', 'chicken', 'movie', 'book']
    : amount < 1000000 ? ['coffee', 'chicken', 'gukbap', 'movie', 'book', 'jeju']
    : amount < 10000000 ? ['chicken', 'gukbap', 'movie', 'jeju', 'rent', 'trip']
    : ['chicken', 'jeju', 'rent', 'trip', 'coffee', 'gukbap'];
  let tiles = order.map(k => UNITS[k]).map(([n, u, p]) => ({ n, u, c: Math.floor(amount / p) })).filter(x => x.c >= 1);
  if (tiles.length % 2) tiles = tiles.slice(0, -1);
  return tiles;
}
function swapHTML(amount, head) {
  const tiles = swapTiles(amount);
  if (!tiles.length) return '';
  return `<div><p class="swap-h">${esc(head)}</p>
    <div class="swap">${tiles.map(t => `<div><b class="num">${comma(t.c)}<small>${esc(t.u)}</small></b><span>${esc(t.n)}</span></div>`).join('')}</div>
    <p class="swap-note">2026년 대략적인 가격 기준이에요.</p></div>`;
}
function renderReceipt(a) {
  const m = a.money, c = a.cost, now = new Date();
  const when = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const line = (l, v, cls = '') => `<div class="rc-line ${cls}"><span class="l">${esc(l)}</span><span class="d"></span><span class="v">${esc(v)}</span></div>`;
  const sub = t => `<div class="rc-sub">${esc(t)}</div>`;
  const rule = '<hr class="rc-rule">', dbl = '<hr class="rc-rule double">';
  const priceNote = a.priceSource === 'user' ? '' : sub(a.priceSource === 'ai' ? 'Claude가 추정한 보통 가격이에요' : '입력이 없어 보통 가격으로 계산했어요');
  let body = `<div class="rc-item">품목 · ${esc(a.name)}</div>${rule}`;
  if (a.type === 'sub') {
    body += line('월 요금', comma(m.M)) + priceNote + line('1년', comma(m.y1)) + line('5년', comma(m.y5)) + line('10년', comma(m.y10)) + rule
      + `<label class="rc-ctl" for="uses-m">한 달에 몇 번 쓰나요? <b id="uses-m-out">${m.usesM}번</b><input type="range" id="uses-m" min="1" max="30" value="${Math.min(30, m.usesM)}"></label>`
      + line(`이용 1회당 (월 ${m.usesM}회)`, comma(m.perUse)) + line('1년 치 노동 시간', hm(m.hours))
      + line('10년 동안 대신 모으면', comma(m.fvSub)) + sub('매달 같은 돈을 연 5%로 모았을 때') + dbl
      + line('10년 총 구독료', comma(m.y10), 'grand');
  } else if (a.type === 'invest') {
    body += line('투자 금액', comma(m.A)) + priceNote
      + line(`과거 최대 하락 (-${Math.round(m.mdd * 100)}%)`, '-' + comma(m.A * m.mdd), 'minus') + (c.mddNote ? sub(c.mddNote) : '') + dbl
      + line('최악의 경우 평가액', comma(m.after), 'grand')
      + line('원금 회복에 필요한 상승', '+' + comma(m.recover) + '%')
      + line(`왕복 거래 비용 (약 ${Math.round(c.fee * 1000) / 10}%)`, comma(m.feeAmt))
      + line('노동 시간', hm(m.hours)) + rule + sub('투자 권유가 아닌 위험 점검표예요');
  } else {
    const hiddenRows = c.hiddenList ? c.hiddenList.map(h => sub(`${h.t} ${comma(h.v)}`)).join('') : (c.hiddenT ? sub(c.hiddenT) : '');
    body += line('판매가', comma(m.P)) + priceNote;
    if (m.hiddenTotal > 0) body += line(`숨은 비용 (${a.type === 'exp' ? '함께 드는 돈' : m.life + '년'})`, '+' + comma(m.hiddenTotal), 'plus') + hiddenRows;
    body += rule + line('총비용', comma(m.tco), 'total');
    if (m.resaleEnd > 0) body += line(`${m.life}년 뒤 되팔면`, '-' + comma(m.resaleEnd), 'minus');
    body += dbl + line('실제로 사라지는 돈', comma(m.gone), 'grand');
    if (c.per === 'day') body += line(`하루당 (${m.life}년)`, comma(m.perDay));
    else if (a.type !== 'exp') body += line(`1회 사용당 (연 ${c.uses}회)`, comma(m.perUse));
    body += rule + line(`노동 시간 (시급 ${comma(m.wage)})`, hm(m.hours)) + line('10년 뒤 이 돈 (연 5%)', comma(m.fv10));
  }
  $('#sec-receipt').innerHTML = `
    <div class="receipt">
      <p class="rc-title">결제 전 영수증</p>
      <p class="rc-meta">지름신 퇴치소 · No.${String(hash(a.name)).slice(-6)} · ${when}</p>
      ${rule}${body}
      <div class="barcode">${barcode(a.name)}</div>
      <p class="rc-foot">이 영수증은 결제되지 않았습니다.<br>참으면 ${krw(saveAmount(a))}을 지켜요.</p>
    </div>
    ${swapHTML(a.type === 'sub' ? m.y1 : m.base, a.type === 'sub' ? '1년 구독료면' : '이 돈이면')}`;
  const r = $('#uses-m');
  if (r) r.addEventListener('input', () => {
    a.input.usesM = Number(r.value); computeMoney(a); renderReceipt(a);
    const again = $('#uses-m'); if (again) again.focus();
  });
}

function renderPsych(a) {
  $('#sec-psych').innerHTML = `
    <div class="sec-h"><h3>지금 당신의 지름신은</h3>${srcBadge(a, 'psych')}</div>
    <p class="want">사실 원하는 건 ${esc(a.name)}보다 <mark>${esc(a.want)}</mark>일지도 몰라요.</p>
    <ul class="psy">${a.psych.map(p => `
      <li><div class="psy-top"><b>${esc(p.n)}</b><span>${p.s}</span></div>
        <div class="bar" role="img" aria-label="${esc(p.n)} 100점 만점에 ${p.s}점"><i class="${p.s >= 60 ? 'hot' : ''}" style="width:${p.s}%"></i></div>
        <p>${esc(p.d)}</p></li>`).join('')}</ul>`;
}
function renderReasons(a) {
  $('#sec-reasons').innerHTML = `
    <div class="sec-h"><h3>${a.level.key === 'ok' ? '사기 전에 따져 볼 점' : '사면 안 되는 이유'}</h3>${srcBadge(a, 'reasons')}</div>
    <ol class="reasons">${a.reasons.map(r => `<li><h4>${esc(r.t)}</h4><p>${esc(r.d)}</p></li>`).join('')}</ol>`;
}
function curveSVG(thrill) {
  const W = 640, H = 230, L = 20, Rr = 20, T = 30, B = 40, span = Math.max(60, Math.round(thrill * 3)), tau = thrill / 2.3;
  const f = t => .22 + .72 * Math.exp(-t / tau);
  const x = t => L + (t / span) * (W - L - Rr), y = v => T + (1 - v) * (H - T - B);
  let d = '';
  for (let i = 0; i <= 80; i++) { const t = span * i / 80; d += `${i ? 'L' : 'M'}${x(t).toFixed(1)},${y(f(t)).toFixed(1)}`; }
  const tx = x(thrill), ty = y(f(thrill)), base = y(.22), floor = y(0);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="설렘은 결제한 날 가장 크고, 약 ${thrill}일 뒤 평소 기분에 가까워져요.">
    <line class="cv-grid" x1="${L}" y1="${floor}" x2="${W - Rr}" y2="${floor}"/>
    <line class="cv-base" x1="${L}" y1="${base}" x2="${W - Rr}" y2="${base}"/>
    <text class="cv-text" x="${W - Rr}" y="${base - 8}" text-anchor="end">평소 기분</text>
    <path class="cv-area" d="${d}L${x(span)},${floor}L${x(0)},${floor}Z"/>
    <path class="cv-line" d="${d}"/>
    <line class="cv-grid" x1="${tx}" y1="${ty}" x2="${tx}" y2="${floor}" stroke-dasharray="3 3"/>
    <circle class="cv-dot" cx="${tx}" cy="${ty}" r="6"/>
    <text class="cv-label" x="${tx + 12}" y="${ty - 12}">D+${thrill} 설렘 유통기한</text>
    <circle class="cv-dot" cx="${x(0)}" cy="${y(f(0))}" r="5"/>
    <text class="cv-text" x="${x(0) + 12}" y="${y(f(0)) + 4}">결제한 날</text>
    <text class="cv-text" x="${L}" y="${H - 14}">D+0</text>
    <text class="cv-text" x="${W - Rr}" y="${H - 14}" text-anchor="end">D+${span}</text>
  </svg>`;
}
function renderCurve(a) {
  const el = $('#sec-curve');
  if (a.type === 'invest') {
    const m = a.money, mine = Math.round(m.mdd * 100);
    const losses = [...new Set([10, 20, 30, 50, mine, 80])].filter(v => v < 100).sort((p, q) => p - q);
    el.innerHTML = `
      <div class="sec-h"><h3>떨어지면 얼마나 올라야 할까</h3>${srcBadge(a, 'cost')}</div>
      <div class="ladder" role="table" aria-label="하락률별 원금 회복에 필요한 상승률">
        ${losses.map(Lp => { const g = (1 / (1 - Lp / 100) - 1) * 100; return `
          <div class="ladder-row${Lp === mine ? ' me' : ''}" role="row"><span class="neg" role="cell">-${Lp}%</span>
            <div class="bar" role="cell"><i class="${g >= 100 ? 'hot' : ''}" style="width:${Math.min(g, 400) / 4}%"></i></div>
            <span class="pos" role="cell">+${comma(g)}%</span></div>`; }).join('')}
      </div>
      <p class="curve-note">손실은 같은 크기의 상승으로 메워지지 않아요. 반 토막이 나면 두 배가 올라야 겨우 원금이에요. 노란 줄이 이 종목의 과거 최대 하락이에요.</p>`;
    return;
  }
  const t = a.cost.thrill;
  const note = a.type === 'exp' ? '경험은 물건보다 만족이 오래가는 편이에요. 다만 할부라면 설렘이 끝난 뒤에도 결제는 계속돼요.'
    : a.type === 'sub' ? '구독은 처음 며칠 몰아 쓰고 나면 손이 덜 가기 쉬워요. 그래도 결제는 매달 똑같이 나가요.'
    : `새것의 기쁨은 보통 몇 주 안에 익숙해져요. ${t}일쯤 지나면 이 물건은 '원래 있던 물건'이 돼요.`;
  el.innerHTML = `<div class="sec-h"><h3>설렘 유통기한</h3>${srcBadge(a, 'cost')}</div><div class="curve">${curveSVG(t)}</div><p class="curve-note">${esc(note)}</p>`;
}
function renderAlts(a) {
  $('#sec-alts').innerHTML = `
    <div class="sec-h"><h3>사기 전에 해 볼 것</h3>${srcBadge(a, 'alts')}</div>
    <div class="alts">${a.alts.map(x => `<div class="alt"><b>${esc(x.t)}</b><p>${esc(x.d)}</p></div>`).join('')}</div>`;
}
function renderLetter(a) {
  $('#sec-letter').innerHTML = `
    <div class="sec-h"><h3>1년 뒤의 나에게서 온 편지</h3>${srcBadge(a, 'letter')}</div>
    <div class="letter">${esc(a.letter)}<span class="sign">— 1년 뒤의 나</span></div>`;
}
const BUY_CHECKS = {
  invest: ['전부 잃어도 생활에 지장 없는 돈이에요', '왜 사는지, 언제 팔지 적어 뒀어요', '전체 자산에서 이 비중이 적당해요', '빌린 돈이 아니에요'],
  sub: ['해지할 날짜를 달력에 적었어요', '겹치는 구독을 정리했어요', '한 달에 네 번 넘게 쓸 거예요'],
  other: ['최저가와 중고 시세를 비교했어요', '할부 없이 낼 수 있는 돈이에요', '반품·환불 기한을 확인했어요', '비슷한 물건을 정리하거나 팔 계획이 있어요'],
};
function renderActions(a) {
  const bar = $('#actions'), d = a.decided;
  bar.classList.toggle('is-static', !!a.example);
  bar.classList.toggle('is-done', !!d);
  // 한 분석에는 결정을 하나만 남긴다. 이미 정했으면 결과와 되돌리기만 보여 준다.
  bar.innerHTML = d ? `
    <p class="grow"><b>${esc(a.name)}</b> · ${esc(d.msg)}</p>
    <button class="btn" type="button" data-go="${d.go}">${d.go === 'wait' ? '보류함 보기' : '저금통 보기'}</button>
    ${d.closed ? '' : '<button class="btn btn-ghost" type="button" data-act="undo">되돌리기</button>'}
    <button class="btn btn-ghost" type="button" data-act="copy">결과 복사</button>` : `
    <p class="grow"><b>${esc(a.name)}</b>, 어떻게 할까요?</p>
    <button class="btn btn-save" type="button" data-act="resist">참았어요 · ${a.type === 'sub' ? '1년 치 ' : ''}${krw(saveAmount(a))} 저금</button>
    <div class="hold"><label class="sr-only" for="hold-dur">보류 기간</label>
      <select id="hold-dur"><option value="24">24시간</option><option value="72" selected>72시간</option><option value="168">7일</option><option value="720">30일</option></select>
      <button class="btn" type="button" data-act="hold">보류함에 넣기</button></div>
    <button class="btn btn-ghost" type="button" data-act="buy">그래도 살래요</button>
    <button class="btn btn-ghost" type="button" data-act="copy">결과 복사</button>`;
  const checks = BUY_CHECKS[a.type] || BUY_CHECKS.other;
  const panel = $('#buy-panel');
  panel.hidden = true;
  panel.innerHTML = `
    <h3 class="sec-h">사기 전 마지막 점검</h3>
    <p class="lead">필요한 소비라면 괜찮아요. 아래만 확인하고 사세요.</p>
    <ul>${checks.map((t, i) => `<li><label class="check"><input type="checkbox" id="chk-${i}"> ${esc(t)}</label></li>`).join('')}</ul>
    <div><button class="btn" type="button" data-act="bought">샀다고 기록하기</button></div>`;
}
function summaryText(a) {
  const o = a.own;
  return [
    `[지름신 퇴치소] ${a.name} · ${krw(a.price)}${a.type === 'sub' ? '/월' : ''}`,
    `충동 지수 ${a.score}/100 — ${a.level.head}`,
    `전 세계 보유율 약 ${fmtPct(o.pct)}% (${oneIn(o.pct)})`,
    `사실 원하는 것: ${a.want}`,
    ...a.reasons.map((r, i) => `${i + 1}. ${r.t}`),
    `참으면 ${krw(saveAmount(a))}을 지켜요.`,
  ].join('\n');
}
