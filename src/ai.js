
/* ── Claude 정밀 분석 (artifact sample 기능) ─ */
const ai = { fn: null, blocked: false, ctl: null, chatCtl: null, chatBusy: false, turns: [] };
const AI_GONE = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];

function initAI() {
  const use = window.claude && typeof window.claude.use === 'function' ? window.claude.use('sample') : null;
  Promise.resolve(use).catch(() => null).then(fn => {
    ai.fn = typeof fn === 'function' ? fn : null;
    updateAIControls();
    if (current && $('#status') && /기본 추정|통계/.test($('#status').textContent)) setStatus(current.example ? 'example' : 'local');
  });
}
const aiOn = () => !!ai.fn && !ai.blocked && !!$('#ai-on') && $('#ai-on').checked;
function updateAIControls() {
  const can = !!ai.fn && !ai.blocked;
  $('#ai-wrap').hidden = !can;
  $('#ai-note').hidden = can;
  if (ai.blocked) $('#ai-note').textContent = 'Claude를 쓸 수 없어서 기본 추정 모드로 분석해요.';
}

function setStatus(kind, info, retry) {
  const el = $('#status'), a = current;
  if (!el || !a) return;
  const stop = '<button class="btn btn-sm" type="button" data-act="stop">멈추기</button>';
  const T = {
    example: `<span class="flag">예시</span><span class="grow">'${esc(a.name)}'${j(a.name, '을/를')} 예로 든 분석이에요. 위 신고서에 사고 싶은 걸 적어 보세요.</span>`,
    local: `<span class="grow">앱에 담긴 통계와 계산으로 분석했어요.${ai.fn && !ai.blocked ? ' Claude 정밀 분석을 켜면 보유율과 심리를 더 자세히 추정해요.' : ''}</span>`,
    'ai-wait': `<span class="spin" aria-hidden="true"></span><span class="grow"><b>Claude가 분석하고 있어요.</b> 보통 20~60초 걸려요. 그동안 기본 추정을 먼저 보여 드려요.</span>${stop}`,
    'ai-stream': `<span class="spin" aria-hidden="true"></span><span class="grow"><b>Claude 분석이 도착하는 중이에요.</b> 8개 항목 중 ${info}개를 바꿨어요.</span>${stop}`,
    'ai-done': '<span class="flag">Claude</span><span class="grow">Claude 분석으로 바꿨어요. 보유율과 가격은 추정치예요.</span>',
    'ai-partial': '<span class="grow">분석을 멈췄어요. 도착한 항목까지만 Claude 분석으로 바꿨어요.</span>',
    'ai-off': '<span class="grow">Claude를 쓸 수 없어서 기본 추정으로 보여 드려요.</span>',
    'ai-empty': '<span class="grow">Claude의 답을 읽지 못해서 기본 추정으로 보여 드려요.</span><button class="btn btn-sm" type="button" data-act="retry">다시 시도</button>',
    'ai-error': `<span class="grow">${esc(info)}</span>${retry ? '<button class="btn btn-sm" type="button" data-act="retry">다시 시도</button>' : ''}`,
  };
  el.innerHTML = T[kind] || T.local;
}

function aiPrompt(a) {
  const inp = a.input;
  const price = inp.price ? `${comma(inp.price)}원${inp.type === 'sub' ? ' (월 요금)' : inp.type === 'invest' ? ' (투자 금액)' : ''}` : '입력 안 함';
  return `당신은 '지름신 퇴치소'라는 웹앱의 소비 분석가입니다. 사용자가 사고 싶어 하는 대상을 정직하고 냉정하게 분석해서 충동구매를 막도록 돕습니다. 오늘은 2026년입니다.

원칙
- 숫자는 근거 있는 추정만 씁니다. 확실하지 않으면 범위를 넓히고 신뢰도를 '낮음'으로 둡니다.
- 보유율(pct)은 세계 인구 약 83억 명 가운데 지금 이것을 가지고 있는(구독 중인, 보유한, 한 해에 경험하는) 사람의 비율(%)입니다. 기기·계정 수와 사람 수를 구분하고, 계산 근거를 basis에 짧게 적습니다.
- 사용자를 비난하지 말고 친한 친구처럼 솔직하게 씁니다. 정말 필요한 소비로 보이면 그렇다고 인정합니다.
- 주식·코인 같은 투자는 특정 종목을 사라거나 팔라고 권하지 않고, 행동 편향과 위험 관리 관점으로만 씁니다.
- 모든 글은 자연스러운 한국어 해요체로 씁니다. 편지만 반말로 씁니다.

사용자 입력
- 대상: ${inp.item}
- 사용자가 고른 종류: ${inp.type === 'auto' ? '자동 판단' : TYPE_NAME[inp.type]}
- 가격: ${price}
- 사고 싶은 이유: ${inp.reasons.map(r => REASON_LABEL[r]).join(', ') || '고르지 않음'}
- 갖고 싶었던 기간: ${SINCE_LABEL[inp.since] || '모름'}
- 비슷한 것 보유: ${inp.similar ? '예' : '아니오'}
- 시급 기준: ${comma(inp.wage || WAGE_MIN)}원

출력 형식
아래 8줄을 이 순서대로, 한 줄에 JSON 객체 하나씩 출력하세요. 코드 블록, 설명, 빈 줄은 쓰지 마세요.
{"k":"meta","name":"대상의 정확한 이름","type":"goods|sub|luxury|invest|exp","price":숫자,"priceNote":"가격 근거"}
{"k":"own","pct":숫자,"low":숫자,"high":숫자,"kr":숫자 또는 null,"subject":"보유율을 잰 대상(예: 아이폰)","basis":"추정 근거 1~2문장","conf":"낮음|보통|높음"}
{"k":"verdict","line":"핵심을 찌르는 한 줄(40자 이내)","want":"이 사람이 사실 원하는 것(20자 이내 명사구)"}
{"k":"reasons","items":[{"t":"제목(22자 이내)","d":"설명 2문장"}]}
{"k":"psych","items":[{"n":"심리 효과 이름","s":0~100 정수,"d":"이 사람에게 해당하는 이유 1~2문장"}]}
{"k":"cost","dep1":0~1,"depN":0~1,"life":년,"uses":연간 사용 횟수,"thrill":설렘이 이어지는 날 수,"mdd":0~1 또는 null,"mddNote":"과거 최대 하락 시기와 폭 또는 null","hidden":[{"t":"숨은 비용 항목","v":원}]}
{"k":"alts","items":[{"t":"대안(18자 이내)","d":"설명 1문장"}]}
{"k":"letter","text":"1년 뒤의 내가 지금의 나에게 쓰는 짧은 편지(반말, 4~5문장, 서명 없이)"}

필드 규칙
- type: 물건 goods, 구독 sub(price는 월 요금), 명품·보석 luxury, 주식·코인 등 투자 invest(price는 투자 금액), 여행·식사·공연 같은 경험 exp.
- price: 사용자가 가격을 넣었으면 그 값을 그대로 쓰고, 없으면 2026년 한국의 보통 가격(원)을 추정합니다.
- reasons는 정확히 4개, psych는 3~4개, alts는 3~4개입니다. hidden은 사용 기간 전체에 드는 금액이며 0~3개입니다.
- dep1은 1년 뒤 중고로 팔 때 사라지는 가치 비율, depN은 그 뒤 해마다 줄어드는 비율입니다. 구독·경험은 dep1=1, 투자는 dep1=0입니다.
- 투자라면 mdd에 이 자산이 과거에 겪은 최대 하락폭(고점 대비 비율)을 넣고, 아니면 null입니다.`;
}

const numIn = (v, lo, hi) => (typeof v === 'number' && isFinite(v) && v >= lo && v <= hi) ? v : null;
const str = (v, max = 400) => (typeof v === 'string' && v.trim()) ? v.trim().slice(0, max) : null;
function recompute(a) {
  computeMoney(a);
  scoreAndLevel(a);
  if (!a.ai.verdict) a.line = a.level.line;
}
function applyAI(a, o) {
  switch (o.k) {
    case 'meta': {
      let changed = false;
      const p = numIn(o.price, 100, 1e11);
      if (a.priceSource !== 'user' && p) { a.price = p; a.priceSource = 'ai'; changed = true; }
      if (a.input.type === 'auto' && !a.entryId && ['goods', 'sub', 'luxury', 'invest', 'exp'].includes(o.type) && o.type !== a.type) {
        a.type = o.type; a.cat = GENERIC_CAT[o.type]; a.cost = costParams({ cat: a.cat, entry: null }); changed = true;
      }
      if (changed) { recompute(a); renderVerdict(a, false); renderReceipt(a); renderCurve(a); renderActions(a); flash('sec-receipt'); }
      a.ai.meta = true;
      return true;
    }
    case 'own': {
      const pct = numIn(o.pct, 0.00001, 100);
      if (pct == null) return false;
      const low = numIn(o.low, 0, 100), high = numIn(o.high, 0, 100);
      a.own = {
        pct, low: Math.min(low ?? pct / 2, pct), high: Math.max(high ?? Math.min(100, pct * 2), pct), kr: numIn(o.kr, 0, 100),
        basis: str(o.basis) || '추정 근거를 받지 못했어요.', conf: ['낮음', '보통', '높음'].includes(o.conf) ? o.conf : '보통',
        ref: str(o.subject, 40), broad: false,
      };
      a.ai.own = true; renderOwn(a, true); flash('sec-own');
      return true;
    }
    case 'verdict': {
      const line = str(o.line, 90), want = str(o.want, 40);
      if (!line && !want) return false;
      if (line) a.line = line;
      if (want) a.want = want;
      a.ai.verdict = true; renderVerdict(a, false); renderPsych(a); flash('sec-verdict');
      return true;
    }
    case 'reasons': {
      const it = (Array.isArray(o.items) ? o.items : []).map(x => ({ t: str(x && x.t, 40), d: str(x && x.d, 320) })).filter(x => x.t && x.d).slice(0, 5);
      if (it.length < 2) return false;
      a.reasons = it; a.ai.reasons = true; renderReasons(a); flash('sec-reasons');
      return true;
    }
    case 'psych': {
      const it = (Array.isArray(o.items) ? o.items : [])
        .map(x => ({ n: str(x && x.n, 30), s: clamp(Math.round(Number(x && x.s) || 0), 5, 99), d: str(x && x.d, 320) }))
        .filter(x => x.n && x.d).slice(0, 4).sort((p, q) => q.s - p.s);
      if (it.length < 2) return false;
      a.psych = it; a.ai.psych = true; renderPsych(a); flash('sec-psych');
      return true;
    }
    case 'cost': {
      const c = a.cost;
      if (a.type !== 'sub' && a.type !== 'invest') {
        const d1 = numIn(o.dep1, 0, 1), dn = numIn(o.depN, 0, 1), life = numIn(o.life, 0.1, 60), uses = numIn(o.uses, 1, 100000);
        if (d1 != null) c.dep1 = d1;
        if (dn != null) c.depN = dn;
        if (life) c.life = Math.max(1, Math.round(life));
        if (uses) c.uses = Math.round(uses);
        const hid = (Array.isArray(o.hidden) ? o.hidden : []).map(h => ({ t: str(h && h.t, 30), v: numIn(h && h.v, 0, 1e11) })).filter(h => h.t && h.v != null).slice(0, 3);
        if (hid.length) c.hiddenList = hid;
      }
      const th = numIn(o.thrill, 1, 3650);
      if (th) c.thrill = Math.round(th);
      if (a.type === 'invest') {
        const mdd = numIn(o.mdd, .02, .99);
        if (mdd) { c.mdd = mdd; c.mddNote = str(o.mddNote, 90) || c.mddNote; }
      }
      a.ai.cost = true; recompute(a);
      renderVerdict(a, false); renderReceipt(a); renderCurve(a); renderActions(a); flash('sec-receipt');
      return true;
    }
    case 'alts': {
      const it = (Array.isArray(o.items) ? o.items : []).map(x => ({ t: str(x && x.t, 30), d: str(x && x.d, 200) })).filter(x => x.t && x.d).slice(0, 4);
      if (it.length < 2) return false;
      a.alts = it; a.ai.alts = true; renderAlts(a); flash('sec-alts');
      return true;
    }
    case 'letter': {
      const t = str(o.text, 700);
      if (!t) return false;
      a.letter = t; a.ai.letter = true; renderLetter(a); flash('sec-letter');
      return true;
    }
  }
  return false;
}
function applyLine(a, ln) {
  const s = ln.trim().replace(/^```(json)?/, '').replace(/```$/, '').trim();
  if (!s.startsWith('{') || current !== a) return false;
  try { return applyAI(a, JSON.parse(s)); } catch (e) { return false; }
}

async function runAI(a) {
  if (!aiOn()) return;
  if (ai.ctl) ai.ctl.abort();
  const ctl = new AbortController();
  ai.ctl = ctl;
  let pending = '', got = 0;
  setStatus('ai-wait');
  const eat = ({ delta }) => {
    const lines = (pending + delta).split('\n');
    pending = lines.pop();
    for (const ln of lines) if (applyLine(a, ln)) got++;
    if (got && current === a) setStatus('ai-stream', got);
  };
  try {
    await ai.fn(aiPrompt(a), { onText: eat, signal: ctl.signal, modelTier: 'default' });
    if (pending.trim() && applyLine(a, pending)) got++;
    if (current !== a) return;
    setStatus(got ? 'ai-done' : 'ai-empty');
    if (got) showChat(a);
  } catch (e) {
    if (current !== a) return;
    const code = e && e.code;
    if (code === 'cancelled') { setStatus(got ? 'ai-partial' : 'local'); return; }
    if (AI_GONE.includes(code)) { ai.blocked = true; updateAIControls(); setStatus('ai-off'); return; }
    if (code === 'refused') {
      const fresh = analyzeLocal(a.input);
      fresh.decided = a.decided;
      renderResult(fresh, 'local');
      setStatus('ai-error', 'Claude가 이 요청에는 답하지 않았어요. 기본 추정 결과를 보여 드려요.');
      return;
    }
    const msg = {
      rate_limited: 'Claude 요청이 많아요. 잠시 뒤에 다시 시도해 주세요.',
      session_expired: 'Claude 로그인이 만료됐어요. 다시 로그인한 뒤 시도해 주세요.',
      prompt_too_large: '입력이 너무 길어요. 조금 줄여서 다시 시도해 주세요.',
    }[code] || (got ? 'Claude 분석이 중간에 끊겼어요. 받은 부분까지만 반영했어요.' : 'Claude 분석을 받지 못했어요. 기본 추정 결과를 보여 드려요.');
    setStatus('ai-error', msg, code !== 'session_expired');
  } finally {
    if (ai.ctl === ctl) ai.ctl = null;
  }
}

/* ── 지름신과 담판 짓기 ───────────────────── */
function showChat(a) {
  const sec = $('#sec-chat');
  if (!sec || !ai.fn || ai.blocked) return;
  ai.turns = [];
  sec.hidden = false;
  sec.innerHTML = `
    <div class="sec-h"><h3>지름신과 담판 짓기</h3><span class="src ai">Claude</span></div>
    <p class="lead">그래도 사야 하는 이유가 있다면 적어 보세요. Claude가 냉정한 친구처럼 따져 보고 설득 점수를 매겨요.</p>
    <div class="msgs" id="msgs"></div>
    <form class="chat-form" id="chat-form">
      <label class="sr-only" for="chat-in">사야 하는 이유</label>
      <textarea class="input" id="chat-in" rows="2" maxlength="400" placeholder="예: 지금 폰 배터리가 반나절도 못 가요"></textarea>
      <button class="btn" type="submit" id="chat-go">따져 보기</button>
    </form>`;
  $('#chat-form').addEventListener('submit', ev => { ev.preventDefault(); sendChat(a); });
}
function chatRules(a) {
  return `당신은 '지름신 퇴치소'의 냉정하지만 다정한 친구입니다. 사용자는 ${a.name}(${krw(a.price)}${a.type === 'sub' ? ', 월 요금' : ''})${j(a.name, '을/를')} 사고 싶어 합니다.
앞선 분석 요약: 충동 지수 ${a.score}/100, 세계 보유율 약 ${fmtPct(a.own.pct)}%, 사실 원하는 것으로 보이는 것: ${a.want}.
사용자가 사야 하는 이유를 말하면 그 논리를 3~5문장으로 따져 보세요. 타당한 부분은 인정하고, 약한 부분은 구체적으로 짚고, 더 싼 방법이 있으면 제안하세요. 마지막 줄에 "설득 점수: N/10"을 붙이세요. 투자 상품이면 사라거나 팔라고 권하지 마세요. 자연스러운 한국어 해요체로, 마크다운 없이 쓰세요.`;
}
async function sendChat(a) {
  const box = $('#chat-in'), text = box.value.trim();
  if (!text || ai.chatBusy || !ai.fn) return;
  ai.turns.push({ role: 'user', content: text });
  box.value = '';
  const msgs = $('#msgs');
  msgs.insertAdjacentHTML('beforeend', `<div class="msg me">${esc(text)}</div><div class="msg ai">생각하는 중…</div>`);
  const bubble = msgs.lastElementChild;
  ai.chatBusy = true; $('#chat-go').disabled = true;
  const ctl = new AbortController();
  ai.chatCtl = ctl;
  try {
    const { text: reply } = await ai.fn([{ role: 'user', content: chatRules(a) }, ...ai.turns.slice(-8)], {
      cache: false, signal: ctl.signal, modelTier: 'default', onText: ({ text: t }) => { bubble.textContent = t; },
    });
    bubble.textContent = reply;
    ai.turns.push({ role: 'assistant', content: reply });
  } catch (e) {
    ai.turns.pop();
    const code = e && e.code;
    bubble.textContent = (e && e.text) || ({ rate_limited: '요청이 많아요. 잠시 뒤에 다시 보내 주세요.', cancelled: '멈췄어요.', not_granted: 'Claude 사용이 허락되지 않았어요.' }[code] || '답을 받지 못했어요. 다시 보내 주세요.');
    if (AI_GONE.includes(code)) { ai.blocked = true; updateAIControls(); }
  } finally {
    ai.chatBusy = false;
    const b = $('#chat-go');
    if (b) b.disabled = false;
  }
}
