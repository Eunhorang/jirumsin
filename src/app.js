
/* ── 기록 저장 (이 브라우저에만) ─────────── */
const STORE_KEY = 'jirumsin.v1';
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (s && typeof s === 'object') {
      const arr = v => Array.isArray(v) ? v.filter(x => x && typeof x === 'object') : [];
      return { jar: arr(s.jar), bought: arr(s.bought), wait: arr(s.wait), goal: s.goal && typeof s.goal === 'object' ? s.goal : null };
    }
  } catch (e) { /* 저장소를 쓸 수 없으면 빈 기록으로 시작 */ }
  return { jar: [], bought: [], wait: [], goal: null };
}
let state = loadState();
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* 저장 실패는 조용히 넘김 */ }
  updateBadges();
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const digits = s => { const n = Number(String(s || '').replace(/[^0-9]/g, '')); return n > 0 ? n : null; };
const fmtDate = t => { const d = new Date(t); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
const shortWon = n => n >= 1e8 ? `${Math.round(n / 1e7) / 10}억` : n >= 1e4 ? `${comma(Math.round(n / 1e4))}만` : comma(n);
const jarTotal = () => state.jar.reduce((s, x) => s + (Number(x.amount) || 0), 0);

let toastTimer = 0;
function toast(msg) {
  const t = $('#toast'), bar = $('#actions');
  // 화면 아래에 붙은 결정 바를 가리지 않도록 그 위로 띄운다
  const r = bar && bar.offsetParent ? bar.getBoundingClientRect() : null;
  t.style.bottom = r && r.top < innerHeight && r.bottom > innerHeight - 70 ? `${Math.round(innerHeight - r.top + 10)}px` : '';
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
// 화면에는 버튼 글자로만 보이는 변화를 화면 읽기 프로그램에도 알린다
function say(msg) {
  const el = $('#sr-say');
  el.textContent = '';
  setTimeout(() => { el.textContent = msg; }, 60);
}
// 목록을 다시 그려도 키보드 포커스가 사라지지 않게, 같은 항목의 같은 버튼(없으면 이웃 항목)으로 돌려놓는다
function keepFocus(box, render) {
  const f = document.activeElement, item = box.contains(f) && f.closest('[data-id]');
  if (!item) { render(); return; }
  const at = $$('[data-id]', box).indexOf(item), key = f.dataset.w || f.dataset.j;
  render();
  const items = $$('[data-id]', box), same = items.find(x => x.dataset.id === item.dataset.id);
  const target = (same && key && $(`[data-w="${key}"], [data-j="${key}"]`, same))
    || $('button', same || items[Math.min(at, items.length - 1)] || box.querySelector('.empty') || box);
  if (target) target.focus();
}
function coinDrop(btn) {
  if (!btn || reduceMotion()) return;
  const r = btn.getBoundingClientRect(), c = document.createElement('span');
  c.className = 'coin';
  c.style.left = `${r.left + window.scrollX + r.width / 2 - 11}px`;
  c.style.top = `${r.top + window.scrollY - 6}px`;
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 950);
}
function copyText(t) {
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = t; ta.setAttribute('readonly', ''); ta.className = 'sr-only';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    toast(ok ? '결과를 복사했어요.' : '복사가 막혀 있어요. 결과를 직접 선택해서 복사해 주세요.');
  };
  try { navigator.clipboard.writeText(t).then(() => toast('결과를 복사했어요.'), fallback); } catch (e) { fallback(); }
}

/* ── 익명 사용 통계 (GitHub Pages판에만) ─── */
// Umami 스크립트는 src/web-head.html에만 있어서 아티팩트판에는 없다. 피드백 버튼과 통계 안내도 이 값을 보고 Pages판에만 보인다.
const HAS_STATS = !!document.querySelector('script[data-website-id]');
// window.umami가 없거나(아티팩트, 광고 차단) ?notrack=1로 이 브라우저를 뺐으면 아무것도 보내지 않는다.
// 입력한 품목 이름, 정확한 금액, 시급, 저금통 목표 이름은 보내지 않는다. 금액은 아래 구간으로만 보낸다.
function track(name, data) {
  try {
    if (!window.umami || localStorage.getItem('umami.disabled')) return;
    window.umami.track(name, data);
  } catch (e) { /* 통계가 실패해도 앱은 그대로 동작한다 */ }
}
// 만 원 단위: 3만 미만 · 3만~10만 · 10만~50만 · 50만~200만 · 200만 이상
const priceBand = won => won < 3e4 ? 'under3' : won < 1e5 ? '3to10' : won < 5e5 ? '10to50' : won < 2e6 ? '50to200' : 'over200';

/* ── 지름 신고서 ─────────────────────────── */
// 예시 칩이 채운 값. 다른 물건을 적기 시작하면 이 값 그대로인 칸만 비운다.
let exFill = null;
// 보통 가격과 크게 달라 한 번 확인을 받은 금액. 같은 금액으로 다시 내면 그대로 분석한다.
let priceOk = null;
// 직접 고른 종류가 이름으로 짐작한 종류와 다를 때 화면 읽기 프로그램에 읽어 줄 안내
let typeNote = '';
function buildForm() {
  $('#examples').innerHTML = EXAMPLES.map((x, i) => `<button class="ex" type="button" data-ex="${i}">${esc(x.item)}</button>`).join('');
  $('#type-seg').innerHTML = TYPES.map(([v, l], i) => `<label class="pick"><input type="radio" name="type" value="${v}"${i === 0 ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('');
  $('#reasons').innerHTML = REASONS.map(([v, l]) => `<label class="pick${v === 'need' ? ' is-need' : ''}" data-r="${v}"${v === 'rising' ? ' hidden' : ''}><input type="checkbox" name="reason" value="${v}"><span>${esc(l)}</span></label>`).join('');
  $('#since-seg').innerHTML = SINCE.map(([v, l], i) => `<label class="pick"><input type="radio" name="since" value="${v}"${i === 1 ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('');
}
function readForm() {
  return {
    item: $('#item').value.trim(),
    price: digits($('#price').value),
    type: ($('input[name="type"]:checked') || {}).value || 'auto',
    reasons: $$('input[name="reason"]:checked').filter(x => !x.closest('[hidden]')).map(x => x.value),
    since: ($('input[name="since"]:checked') || {}).value || 'days',
    similar: $('#similar').checked,
    wage: digits($('#wage').value) || WAGE_MIN,
  };
}
function fillForm(x) {
  $('#item').value = x.item;
  $('#price').value = x.price ? comma(x.price) : '';
  $$('input[name="type"]').forEach(r => { r.checked = r.value === (x.type || 'auto'); });
  $$('input[name="reason"]').forEach(c => { c.checked = (x.reasons || []).includes(c.value); });
  $$('input[name="since"]').forEach(r => { r.checked = r.value === (x.since || 'days'); });
  $('#similar').checked = !!x.similar;
  exFill = { item: x.item, price: $('#price').value, type: x.type || 'auto', reasons: [...(x.reasons || [])].sort().join(), since: x.since || 'days', similar: !!x.similar };
  priceOk = null;
  $('#ex-note').hidden = true;
  clearItemError();
  syncTypeUI();
}
// 예시와 다른 물건을 적기 시작하면, 예시의 가격·종류·이유가 남아 엉뚱한 분석이 나오지 않게 예시 값 그대로인 칸만 비우고 알린다
function clearExample() {
  if (!exFill) return;
  const text = $('#item').value.trim();
  const was = classify(exFill.item, 'auto').entry, now = text ? classify(text, 'auto').entry : null;
  if (was && now && was.id === now.id) return; // 같은 물건을 고쳐 적는 중이면 그대로 둔다
  const x = exFill, gone = [], pick = (name, v) => $(`input[name="${name}"][value="${v}"]`);
  exFill = null;
  if (x.price && $('#price').value === x.price) { $('#price').value = ''; gone.push('가격'); }
  if (x.type !== 'auto' && pick('type', x.type).checked) { pick('type', 'auto').checked = true; gone.push('종류'); }
  const boxes = $$('input[name="reason"]');
  if (x.reasons && boxes.filter(c => c.checked).map(c => c.value).sort().join() === x.reasons) { boxes.forEach(c => { c.checked = false; }); gone.push('이유'); }
  if (x.since !== SINCE[1][0] && pick('since', x.since).checked) { pick('since', SINCE[1][0]).checked = true; gone.push('시기'); }
  if (x.similar && $('#similar').checked) { $('#similar').checked = false; gone.push('보유 여부'); }
  if (!gone.length) return;
  const msg = `예시로 채운 ${gone.join('·')}${j(gone[gone.length - 1], '은/는')} 지웠어요. 내 상황에 맞게 다시 채워 주세요.`;
  const note = $('#ex-note');
  note.textContent = msg;
  note.hidden = false;
  say(msg);
}
function syncTypeUI() {
  const choice = ($('input[name="type"]:checked') || {}).value || 'auto';
  const text = $('#item').value.trim();
  const m = text ? classify(text, choice) : null;
  const type = choice !== 'auto' ? choice : m ? m.type : 'goods';
  $('#price-label').textContent = type === 'sub' ? '월 요금' : type === 'invest' ? '투자 금액' : '가격';
  $('#price-hint').classList.remove('is-check');
  $('#price-hint').textContent = type === 'invest' ? '얼마를 넣을지 적어 주세요. 비우면 100만 원으로 계산해요.'
    : type === 'sub' ? '한 달 요금이에요. 비우면 보통 요금으로 계산해요.' : '비워 두면 보통 가격으로 계산해요.';
  // 직접 고른 종류가 이름으로 짐작한 종류와 크게 다르면, 고른 것은 그대로 두고 바꿀 길을 알려 준다
  const guess = text && choice !== 'auto' ? classify(text, 'auto') : null;
  const off = guess && (guess.entry || detectWords(norm(text))) && guess.type !== choice && !isNear(guess.type, choice);
  typeNote = '';
  if (off) {
    const what = TYPE_NAME[guess.type] + (guess.entry ? ` · ${guess.entry.label}` : '');
    const to = TYPES.find(([v]) => v === guess.type)[1], mine = TYPES.find(([v]) => v === choice)[1];
    $('#type-hint').innerHTML = `자동 감지로는 ${esc(what)}${j(what, '이에요/예요')}. <button class="link-btn" type="button" data-type="${guess.type}">${esc(to)}${j(to, '으로/로')} 바꾸기</button>`;
    typeNote = `종류를 ${mine}${j(mine, '으로/로')} 골랐는데, 자동 감지로는 ${what}${j(what, '이에요/예요')}. 종류에서 바꿀 수 있어요.`;
  } else {
    $('#type-hint').textContent = choice !== 'auto' ? ''
      : m ? `자동 감지: ${TYPE_NAME[m.type]}${m.entry ? ` · ${m.entry.label}` : ''}` : '이름을 적으면 종류를 알아서 찾아요.';
  }
  $('[data-r="rising"]').hidden = type !== 'invest';
}
// 사전에 있는 물건인데 적은 금액이 보통 가격의 10배를 넘거나 10분의 1도 안 되면, 0을 잘못 누르지 않았는지 분석 전에 한 번 묻는다
function checkPrice(inp) {
  if (!inp.price || inp.price === priceOk) return true;
  const m = classify(inp.item, inp.type), e = m.entry;
  if (!e || !e.price || m.type === 'invest') return true;
  const r = inp.price / e.price;
  if (r <= 10 && r >= 0.1) return true;
  priceOk = inp.price;
  const hint = $('#price-hint');
  hint.textContent = `${e.label}의 보통 가격은 ${m.type === 'sub' ? '월 ' : ''}${krw(e.price)}쯤이에요. 적은 ${krw(inp.price)}이 맞으면 '지름신 퇴치하기'를 한 번 더 눌러 주세요.`;
  hint.classList.add('is-check');
  $('#price').focus(); // 가격 칸이 이 안내를 설명으로 달고 있어서, 포커스가 가면 화면 읽기 프로그램도 읽는다
  return false;
}
function bindMoney(input) {
  input.addEventListener('input', () => { const n = digits(input.value); input.value = n ? comma(n) : ''; });
}
function clearItemError() {
  const item = $('#item');
  item.removeAttribute('aria-invalid'); item.removeAttribute('aria-describedby');
  $('#item-err').hidden = true;
}
function markStale(ev) {
  if (ev.target.id === 'ai-on' || !current || current.example) return;
  const st = $('#status');
  // Claude 분석이 도착하는 중이면 진행 안내를 덮지 않는다. 같은 안내를 거듭 읽어 주지 않게 한 번만 바꾼다.
  if (!st || ['stale', 'ai-wait', 'ai-stream'].includes(st.dataset.kind)) return;
  setStatus('stale');
}
function analyze(inp, opts = {}) {
  if (ai.ctl) ai.ctl.abort();
  if (ai.chatCtl) ai.chatCtl.abort();
  const a = analyzeLocal(inp);
  a.example = !!opts.example;
  renderResult(a, opts.example ? 'example' : 'local');
  if (!opts.example) {
    track('analyze', { cat: a.type, item: a.entryId || 'other', price: priceBand(a.price), priced: a.priceSource === 'user' ? 'yes' : 'no', verdict: a.level.key });
    if (aiOn()) runAI(a);
    $('#sec-verdict h2').focus({ preventScroll: true });
    $('#result').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  }
  return a;
}

/* ── 보류함 ─────────────────────────────── */
function leftText(ms) {
  if (ms <= 0) return '다 기다렸어요';
  const h = Math.floor(ms / 3600e3), mnt = Math.floor(ms % 3600e3 / 60e3);
  if (h >= 48) return `${Math.floor(h / 24)}일 ${h % 24}시간 남음`;
  if (h >= 1) return `${h}시간 ${mnt}분 남음`;
  return `${Math.max(1, mnt)}분 남음`;
}
const holdLabel = h => h >= 168 ? h / 24 + '일' : h + '시간';
function addWait(a, hours) {
  const now = Date.now(), w = { id: uid(), name: a.name, amount: Math.round(saveAmount(a)), type: a.type, at: now, until: now + hours * 3600e3 };
  state.wait.unshift(w);
  saveState();
  return w.id;
}
function renderWait() {
  const el = $('#wait-list'), now = Date.now();
  if (!state.wait.length) {
    el.innerHTML = `<div class="empty"><p>보류함이 비어 있어요.</p><p>분석 결과에서 '보류함에 넣기'를 누르면 여기서 시간을 재요.</p><button class="btn" type="button" data-go="analyze">분석하러 가기</button></div>`;
    return;
  }
  el.innerHTML = state.wait.map(w => {
    const total = Math.max(1, w.until - w.at), left = w.until - now, ready = left <= 0, prog = clamp(1 - left / total, 0, 1);
    const dsc = `aria-describedby="wt-${esc(w.id)}"`;
    return `<article class="wcard${ready ? ' ready' : ''}" data-id="${esc(w.id)}">
      <div><h3 id="wt-${esc(w.id)}">${esc(w.name)}</h3><p class="meta">${krw(w.amount)}${w.type === 'sub' ? ' (1년 치)' : ''} · ${fmtDate(w.at)}에 보류</p></div>
      <div class="clock">${leftText(left)}</div>
      <div class="progress" role="img" aria-label="기다린 시간 ${Math.round(prog * 100)}%"><i style="width:${(prog * 100).toFixed(1)}%"></i></div>
      <div class="btns">${ready
        ? `<p class="ask">다 기다렸어요. 아직도 사고 싶나요?</p><button class="btn btn-save" type="button" data-w="resist" ${dsc}>아니요, 참을래요</button><button class="btn" type="button" data-w="buy" ${dsc}>네, 살게요</button><button class="btn btn-ghost" type="button" data-w="extend" ${dsc}>7일 더 기다리기</button>`
        : `<button class="btn btn-save btn-sm" type="button" data-w="resist" ${dsc}>지금 포기하고 저금하기</button><button class="btn btn-ghost btn-sm" type="button" data-w="remove" ${dsc}>보류 취소</button>`}</div>
    </article>`;
  }).join('');
}
function onWaitClick(ev) {
  const b = ev.target.closest('[data-w]');
  if (!b) return;
  const id = b.closest('[data-id]').dataset.id, w = state.wait.find(x => x.id === id);
  if (!w) return;
  const act = b.dataset.w;
  if (act === 'remove' && !b.dataset.confirm) {
    b.dataset.confirm = '1'; b.textContent = '한 번 더 누르면 취소돼요';
    say('한 번 더 누르면 보류가 취소돼요.');
    // 확인 문구를 화면 읽기 프로그램으로 다 듣고 다시 누를 수 있게 넉넉히 기다린다
    setTimeout(() => { if (b.isConnected) { delete b.dataset.confirm; b.textContent = '보류 취소'; } }, 8000);
    return;
  }
  track('wait_action', { action: act });
  if (act === 'resist') {
    state.wait = state.wait.filter(x => x !== w);
    state.jar.unshift({ id: uid(), name: w.name, amount: w.amount, at: Date.now() });
    coinDrop(b); toast(`잘 참았어요! ${krw(w.amount)}을 저금했어요.`);
  } else if (act === 'buy') {
    state.wait = state.wait.filter(x => x !== w);
    state.bought.unshift({ id: uid(), name: w.name, amount: w.amount, at: Date.now() });
    toast('기다린 끝에 내린 결정이라면 괜찮아요.');
  } else if (act === 'extend') {
    w.at = Date.now(); w.until = Date.now() + 168 * 3600e3;
    toast('7일 더 기다려 볼게요.');
  } else if (act === 'remove') {
    state.wait = state.wait.filter(x => x !== w);
    toast('보류를 취소했어요.');
  }
  saveState(); keepFocus($('#wait-list'), renderWait);
}

/* ── 저금통 ─────────────────────────────── */
function jarSVG(level, coins) {
  const lv = clamp(level, 0, 1), top = 62, bottom = 198, fillY = bottom - (bottom - top) * lv;
  const body = 'M46 50 Q46 60 36 68 Q26 78 26 98 L26 182 Q26 198 42 198 L128 198 Q144 198 144 182 L144 98 Q144 78 134 68 Q124 60 124 50 Z';
  let pile = '';
  for (let i = 0; i < Math.min(coins, 30); i++) {
    const row = Math.floor(i / 6), col = i % 6;
    pile += `<circle class="jar-coin" cx="${40 + col * 18 + (row % 2) * 9}" cy="${188 - row * 13}" r="8"/>`;
  }
  return `<svg class="jar-svg" viewBox="0 0 170 210" role="img" aria-label="저금통이 ${Math.round(lv * 100)}% 찼어요">
    <defs><clipPath id="jar-clip"><path d="${body}"/></clipPath></defs>
    <g clip-path="url(#jar-clip)"><rect class="jar-fill" x="0" y="${fillY.toFixed(1)}" width="170" height="${(210 - fillY).toFixed(1)}"/>${pile}</g>
    <path class="jar-glass" d="${body}"/>
    <rect class="jar-lid" x="40" y="34" width="90" height="18" rx="4"/>
    <rect class="jar-slot" x="70" y="40" width="30" height="5" rx="2"/>
  </svg>`;
}
let goalEditing = false;
function renderJar() {
  const total = jarTotal(), n = state.jar.length, b = state.bought.length, g = state.goal;
  // 통과 판정에서 산 것(필요한 소비)은 참은 비율에 넣지 않는다
  const need = state.bought.filter(x => x.need).length, rated = n + b - need;
  const level = g && g.amount ? total / g.amount : Math.min(1, Math.log10(total / 10000 + 1) / 3);
  const goalHTML = g && !goalEditing
    ? `<p><b>${esc(g.name)}</b>까지 ${Math.min(100, Math.round(total / g.amount * 100))}%${total < g.amount ? ` · ${krw(g.amount - total)} 남음` : ' · 목표를 이뤘어요!'}</p>
       <div class="goal-bar" role="img" aria-label="목표 달성률 ${Math.min(100, Math.round(total / g.amount * 100))}%"><i style="width:${Math.min(100, total / g.amount * 100).toFixed(1)}%"></i></div>
       <p><button class="link-btn" type="button" data-j="goal-edit">목표 바꾸기</button></p>`
    : `<form class="goal-form" id="goal-form">
         <label class="sr-only" for="goal-name">목표 이름</label><input class="input" id="goal-name" maxlength="30" placeholder="모아서 하고 싶은 것 (예: 제주 여행)" value="${g ? esc(g.name) : ''}">
         <label class="sr-only" for="goal-amt">목표 금액</label><span class="money sm"><input id="goal-amt" type="text" inputmode="numeric" placeholder="1,000,000" value="${g ? comma(g.amount) : ''}"><span>원</span></span>
         <button class="btn btn-sm" type="submit">목표 정하기</button></form>`;
  const rows = [...state.jar.map(x => ({ ...x, kind: 'jar' })), ...state.bought.map(x => ({ ...x, kind: 'bought' }))].sort((p, q) => q.at - p.at);
  $('#jar-view').innerHTML = `
    <div class="jar-top">
      ${jarSVG(level, n)}
      <div class="jar-info">
        <p class="eyebrow">지금까지 참은 돈</p>
        <p class="jar-total">${krw(total)}</p>
        <p class="jar-stats">참은 횟수 ${n}번 · 산 기록 ${b}번${rated ? ` · 참은 비율 ${Math.round(n / rated * 100)}%${need ? '(필요해서 산 건 빼고)' : ''}` : ''}</p>
        ${goalHTML}
      </div>
    </div>
    ${total > 0 ? `<div class="panel-swap">${swapHTML(total, '참은 돈이면')}</div>` : ''}
    <div class="sec">
      <div class="sec-h"><h3>기록</h3></div>
      ${rows.length ? `<ul class="ledger">${rows.map(x => `
        <li data-id="${esc(x.id)}" data-kind="${x.kind}">
          <span class="nm" id="lg-${esc(x.id)}">${esc(x.name)}</span>
          <span class="dt">${fmtDate(x.at)} · ${x.kind === 'jar' ? '참았어요' : x.need ? '필요해서 샀어요' : '샀어요'}</span>
          <span class="amt${x.kind === 'jar' ? '' : ' spent'}">${x.kind === 'jar' ? '+' : ''}${krw(x.amount)}</span>
          <button class="link-btn x" type="button" data-j="del" aria-describedby="lg-${esc(x.id)}">지우기</button>
        </li>`).join('')}</ul>`
        : `<div class="empty"><p>아직 기록이 없어요.</p><p>분석 결과에서 '참았어요'를 누르면 그 금액이 여기에 쌓여요.</p><button class="btn" type="button" data-go="analyze">분석하러 가기</button></div>`}
    </div>`;
  const amt = $('#goal-amt');
  if (amt) bindMoney(amt);
}
function onJarClick(ev) {
  const b = ev.target.closest('[data-j]');
  if (!b) return;
  if (b.dataset.j === 'goal-edit') { goalEditing = true; renderJar(); const n = $('#goal-name'); if (n) n.focus(); return; }
  if (b.dataset.j === 'del') {
    if (!b.dataset.confirm) {
      b.dataset.confirm = '1'; b.textContent = '정말 지울까요?';
      say('한 번 더 누르면 기록이 지워져요.');
      setTimeout(() => { if (b.isConnected) { delete b.dataset.confirm; b.textContent = '지우기'; } }, 8000);
      return;
    }
    const li = b.closest('li'), id = li.dataset.id, key = li.dataset.kind === 'jar' ? 'jar' : 'bought';
    state[key] = state[key].filter(x => x.id !== id);
    saveState(); keepFocus($('#jar-view'), renderJar); toast('기록을 지웠어요.');
  }
}
function onJarSubmit(ev) {
  if (ev.target.id !== 'goal-form') return;
  ev.preventDefault();
  const name = $('#goal-name').value.trim(), amount = digits($('#goal-amt').value);
  if (!name || !amount) { toast('목표 이름과 금액을 모두 적어 주세요.'); return; }
  state.goal = { name, amount };
  track('jar_goal_set');
  goalEditing = false;
  saveState(); renderJar(); $('[data-j="goal-edit"]').focus(); toast('목표를 정했어요. 참을 때마다 가까워져요.');
}

/* ── 화면 전환·배지 ─────────────────────── */
function updateBadges() {
  $('#wait-badge').textContent = state.wait.length ? String(state.wait.length) : '';
  const total = jarTotal();
  $('#jar-badge').textContent = total ? shortWon(total) : '';
}
function showView(v) {
  if (!['analyze', 'wait', 'jar'].includes(v)) v = 'analyze';
  const opened = $(`#view-${v}`).hidden; // 이미 보던 탭을 다시 누른 건 열기로 세지 않는다
  $$('.tab').forEach(t => { const on = t.dataset.view === v; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
  $$('.view').forEach(s => { s.hidden = s.id !== 'view-' + v; });
  if (v === 'wait') { renderWait(); if (opened) track('open_wait'); }
  if (v === 'jar') { renderJar(); if (opened) track('open_jar'); }
  if (v === 'analyze' && current) {
    const d = current.decided;
    // 보류함·저금통에서 그 기록을 이미 정리했다면 결정 바 문구도 맞춰 둔다
    if (d && !d.closed && !state[d.key].some(x => x.id === d.id)) {
      d.closed = true; d.msg = d.key === 'wait' ? '보류함에서 정리했어요.' : '저금통에서 기록을 지웠어요.';
      renderActions(current);
    }
    requestAnimationFrame(() => drawCrowd(current, false));
  }
}
// 버튼으로 화면을 옮겼다면 키보드 포커스도 그 화면 첫머리로 옮긴다
function focusView(v) {
  const el = v === 'analyze' ? $('#item') : $(`#view-${v} h2`);
  if (el) el.focus({ preventScroll: true });
}

/* ── 시작 ───────────────────────────────── */
function start() {
  document.documentElement.lang = 'ko';
  $('#stats-note').hidden = !HAS_STATS;
  buildForm();
  bindMoney($('#price'));
  bindMoney($('#wage'));
  // 품목·종류·가격 중 하나라도 바꾸면, 앞서 확인받은 금액은 잊고 다음 제출 때 다시 본다
  $('#item').addEventListener('input', () => { clearItemError(); priceOk = null; clearExample(); syncTypeUI(); });
  // 품목을 다 적고 나왔을 때 고른 종류와 맞지 않으면 화면 읽기 프로그램에도 알린다
  $('#item').addEventListener('change', () => { if (typeNote) say(typeNote); });
  $('#price').addEventListener('input', () => { priceOk = null; if ($('#price-hint').classList.contains('is-check')) syncTypeUI(); });
  $('#type-seg').addEventListener('change', () => { priceOk = null; syncTypeUI(); });
  // 결과를 낸 뒤 신고서를 고치면, 아래 결과가 고치기 전 입력으로 낸 것임을 알린다
  $('#form').addEventListener('input', markStale);
  $('#form').addEventListener('change', markStale);
  $('#type-hint').addEventListener('click', ev => {
    const b = ev.target.closest('[data-type]');
    if (!b) return;
    const r = $(`input[name="type"][value="${b.dataset.type}"]`);
    r.checked = true;
    priceOk = null;
    markStale({ target: r }); // 코드로 바꾼 선택은 change가 오지 않으니 직접 알린다
    syncTypeUI();
    r.focus(); // 누른 링크가 사라지니 포커스를 새로 고른 종류로 옮긴다
  });
  $('#examples').addEventListener('click', ev => {
    const b = ev.target.closest('[data-ex]');
    if (!b) return;
    const x = EXAMPLES[Number(b.dataset.ex)];
    fillForm(x);
    analyze(readForm());
  });
  $('#form').addEventListener('submit', ev => {
    ev.preventDefault();
    const inp = readForm();
    if (!inp.item) {
      // 알림은 몇 초 뒤 사라지니, 오류 문장을 입력칸 아래에 남기고 입력칸의 설명으로 이어 둔다
      const item = $('#item');
      item.setAttribute('aria-invalid', 'true'); item.setAttribute('aria-describedby', 'item-err');
      $('#item-err').hidden = false;
      item.focus();
      return;
    }
    if (!checkPrice(inp)) return;
    if ($('#price-hint').classList.contains('is-check')) syncTypeUI(); // 확인을 받았으니 안내 문구를 원래대로 돌린다
    $('#ex-note').hidden = true;
    analyze(inp);
  });
  $('#result').addEventListener('click', ev => {
    const b = ev.target.closest('[data-act]');
    if (!b || !current) return;
    const a = current, act = b.dataset.act;
    if (act === 'resist' || act === 'hold' || act === 'bought') track('decide', { action: act });
    else if (act === 'copy' || act === 'card') track('share', { how: act });
    // 결정을 기록하고 결정 바를 다시 그린다. 키보드로 눌렀다면 포커스를 바 안에 돌려놓는다.
    const settle = (d, msg) => {
      const refocus = document.activeElement === b;
      a.decided = d;
      renderActions(a);
      if (refocus) $('#actions button').focus();
      toast(msg);
    };
    if (act === 'resist') {
      const x = { id: uid(), name: a.name, amount: Math.round(saveAmount(a)), at: Date.now() };
      state.jar.unshift(x);
      saveState(); coinDrop(b);
      settle({ key: 'jar', id: x.id, go: 'jar', msg: `${a.type === 'sub' ? '1년 치 ' : ''}${krw(x.amount)}을 저금했어요.` }, `저금통에 ${krw(x.amount)}을 넣었어요.`);
    } else if (act === 'hold') {
      const h = Number($('#hold-dur').value) || 72;
      settle({ key: 'wait', id: addWait(a, h), go: 'wait', msg: `${holdLabel(h)} 동안 보류 중이에요.` }, `${holdLabel(h)} 동안 보류함에 넣어 둘게요.`);
    } else if (act === 'buy') {
      const p = $('#buy-panel');
      p.hidden = !p.hidden;
      // 점검 창을 닫는 클릭은 결정이 아니므로 열 때만 센다
      if (!p.hidden) { track('decide', { action: 'buy' }); p.scrollIntoView({ block: 'nearest', behavior: reduceMotion() ? 'auto' : 'smooth' }); }
    } else if (act === 'bought') {
      const x = { id: uid(), name: a.name, amount: Math.round(saveAmount(a)), at: Date.now() };
      if (a.level.key === 'ok') x.need = true; // 통과 판정에서 산 건 '필요해서 샀어요'로 남기고 참은 비율에서 뺀다
      state.bought.unshift(x);
      saveState();
      settle({ key: 'bought', id: x.id, go: 'jar', msg: '구매를 기록했어요.' }, '구매 기록을 남겼어요. 잘 쓰세요!');
    } else if (act === 'undo') {
      const d = a.decided;
      if (!d) return;
      if (!state[d.key].some(x => x.id === d.id)) { toast('보류함이나 저금통에서 이미 정리한 기록이라 되돌릴 게 없어요.'); return; }
      state[d.key] = state[d.key].filter(x => x.id !== d.id);
      saveState();
      settle(null, '결정을 되돌렸어요.');
    } else if (act === 'vote') {
      // 한 분석에 한 번만 보낸다. 다시 그려도 a.voted가 남아 있어 '고마워요!'로 보인다.
      if (a.voted) return;
      const refocus = document.activeElement === b;
      a.voted = b.dataset.vote === 'down' ? 'down' : 'up';
      track('feedback', { vote: a.voted });
      renderFeedback(a);
      if (refocus) $('#feedback .fb-done').focus();
    } else if (act === 'copy') copyText(summaryText(a));
    else if (act === 'card') openCard(a, b);
    else if (act === 'stop') { if (ai.ctl) ai.ctl.abort(); }
    else if (act === 'retry') runAI(a);
  });
  $('#wait-list').addEventListener('click', onWaitClick);
  $('#jar-view').addEventListener('click', onJarClick);
  $('#jar-view').addEventListener('submit', onJarSubmit);
  document.addEventListener('click', ev => {
    const g = ev.target.closest('[data-go]');
    if (g) { showView(g.dataset.go); window.scrollTo({ top: 0 }); focusView(g.dataset.go); }
    const t = ev.target.closest('.tab');
    if (t) showView(t.dataset.view);
    // 주소의 #analyze가 그대로면 hashchange가 오지 않으니 로고는 직접 첫 화면으로 돌린다
    if (ev.target.closest('#brand')) showView('analyze');
  });
  $('.tabs').addEventListener('keydown', ev => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(ev.key)) return;
    const tabs = $$('.tab'), i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    ev.preventDefault();
    const next = ev.key === 'Home' ? tabs[0] : ev.key === 'End' ? tabs[tabs.length - 1]
      : tabs[(i + (ev.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus(); showView(next.dataset.view);
  });
  window.addEventListener('hashchange', () => showView(location.hash.slice(1)));
  let rz = 0;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (current) { drawCrowd(current, false); renderCurve(current); } }, 150); });
  const mq = window.matchMedia && matchMedia('(prefers-color-scheme: dark)');
  if (mq && mq.addEventListener) mq.addEventListener('change', () => current && drawCrowd(current, false));
  new MutationObserver(() => current && drawCrowd(current, false)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  setInterval(() => { updateBadges(); if (!$('#view-wait').hidden) keepFocus($('#wait-list'), renderWait); }, 30000);

  syncTypeUI();
  initAI();
  initCard();
  const ex = EXAMPLES[0];
  analyze({ item: ex.item, price: ex.price, type: 'auto', reasons: ex.reasons, since: ex.since, similar: !!ex.similar, wage: WAGE_MIN }, { example: true });
  updateBadges();
  showView(location.hash.slice(1));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
