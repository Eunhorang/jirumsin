
/* ── 영수증 이미지 ─────────────────────────
   SNS에 올리기 좋게 결제 전 영수증을 폭 1080px 그림으로 그린다. 화면의 밝은·어두운 모드와 상관없이 늘 같은 색으로 그린다.
   claude.ai 안에서는 downloads 기능으로 저장하고, 그 밖에서는 일반 다운로드와 휴대폰 공유 시트를 쓴다. */
const APP_URL = 'http://jirumsin.com/'; // jirumsin.com의 HTTPS 인증서가 나오면 https로 바꾼다
const CARD_C = { bg: '#F2D04B', paper: '#FFFFFF', ink: '#1A1D24', ink2: '#4C5361', ink3: '#5F6673', red: '#C42A20', mark: '#FFE36B' };
const CARD_F = {
  mono: '"Nanum Gothic Coding", ui-monospace, Menlo, monospace',
  display: '"Black Han Sans", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
  body: '"IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
};
const cardDownloads = window.claude && typeof window.claude.use === 'function'
  ? Promise.resolve(window.claude.use('downloads')).catch(() => null) : Promise.resolve(null);
const card = { file: null, url: '', text: '', busy: false };

// 그릴 글자가 든 글꼴 조각(한글 글꼴은 여러 조각으로 나뉘어 있다)을 미리 불러온다. 늦으면 기본 글꼴로 그린다.
function cardFonts(text) {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const want = [`400 52px ${CARD_F.display}`, `400 28px ${CARD_F.mono}`, `700 28px ${CARD_F.mono}`, `700 34px ${CARD_F.body}`, `500 30px ${CARD_F.body}`];
  return Promise.race([
    Promise.all(want.map(f => document.fonts.load(f, text))).catch(() => null),
    new Promise(r => setTimeout(r, 4000)),
  ]);
}
function rrect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
// 폭에 맞춰 줄을 나눈다(띄어쓰기에서 먼저 끊는다). max줄을 넘으면 말줄임표로 끝낸다.
function wrapText(g, text, maxW, max) {
  const lines = [];
  let cur = '';
  for (const ch of String(text)) {
    if (cur && g.measureText(cur + ch).width > maxW) {
      const cut = cur.lastIndexOf(' ');
      if (cut > 0 && ch !== ' ') { lines.push(cur.slice(0, cut)); cur = cur.slice(cut + 1) + ch; }
      else { lines.push(cur.trimEnd()); cur = ch === ' ' ? '' : ch; }
    } else cur += ch;
  }
  if (cur.trim()) lines.push(cur.trim());
  if (lines.length > max) {
    lines.length = max;
    let l = lines[max - 1];
    while (l && g.measureText(l + '…').width > maxW) l = l.slice(0, -1);
    lines[max - 1] = l + '…';
  }
  return lines;
}

async function makeCard(a) {
  const C = CARD_C, F = CARD_F, W = 1080, PX = 96, PW = 888, IX = PX + 56, IW = PW - 112, TOP = 188;
  const rows = receiptRows(a).filter(r => r[0] !== 'ctl'), o = a.own, stamp = a.level.stamp.split('\n');
  const tiles = swapTiles(a.type === 'sub' ? a.money.y1 : a.money.base);
  const t = {
    meta: `지름신 퇴치소 · No.${receiptNo(a)} · ${nowStamp()}`,
    item: `품목 · ${a.name}`,
    foot: `참으면 ${krw(saveAmount(a))}을 지켜요.`,
    own: `전 세계에서 ${oneIn(o.pct)}${o.pct < 50 ? '만' : '이'} ${ownVerbShort(a.type)} ${o.ref || a.name}`,
    swap: tiles.length ? `${a.type === 'sub' ? '1년 구독료면' : '이 돈이면'} ${tiles[0].n} ${comma(tiles[0].c)}${tiles[0].u}` : '',
    url: APP_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  };
  await cardFonts(['지름신 퇴치소 결제 전 영수증 이 영수증은 결제되지 않았습니다. 나도 지름신 퇴치하기…', ...stamp, ...Object.values(t), ...rows.flat()].join(''));

  const cv = document.createElement('canvas'), g = cv.getContext('2d');
  cv.width = W; cv.height = 2800;
  const font = (w, px, fam) => { g.font = `${w} ${px}px ${fam}`; };
  const put = (s, x, y, align = 'left', color = C.ink) => { g.fillStyle = color; g.textAlign = align; g.fillText(s, x, y); };
  const spaced = (s, cx, y, gap) => {
    const chars = [...s], ws = chars.map(ch => g.measureText(ch).width);
    let x = cx - (ws.reduce((p, q) => p + q, 0) + gap * (chars.length - 1)) / 2;
    chars.forEach((ch, i) => { put(ch, x, y); x += ws[i] + gap; });
  };
  g.fillStyle = C.bg; g.fillRect(0, 0, W, cv.height);

  // 머리: 앱의 도장 로고와 이름
  g.save(); g.translate(PX + 36, 100); g.rotate(-5 * Math.PI / 180);
  rrect(g, -36, -36, 72, 72, 8); g.fillStyle = C.red; g.fill();
  rrect(g, -29, -29, 58, 58, 5); g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.stroke();
  font(400, 24, F.display); put('퇴', 0, -3, 'center', '#fff'); put('치', 0, 23, 'center', '#fff');
  g.restore();
  font(400, 50, F.display); put('지름신 퇴치소', PX + 96, 118);

  // 영수증 내용은 [높이, 그리기] 목록으로 먼저 만들고, 전체 높이를 안 뒤에 종이를 깐다
  const items = [], add = (h, draw) => items.push([h, draw]);
  const dash = y => { g.save(); g.strokeStyle = C.ink3; g.lineWidth = 2; g.setLineDash([7, 7]); g.beginPath(); g.moveTo(IX, y); g.lineTo(IX + IW, y); g.stroke(); g.restore(); };
  const dbl = y => { g.fillStyle = C.ink; g.fillRect(IX, y - 4, IW, 2); g.fillRect(IX, y + 2, IW, 2); };
  const row = (y, l, v, cls) => {
    const grand = cls === 'grand', weight = grand || cls === 'total' ? 700 : 400;
    let px = grand ? 31 : 27;
    font(weight, px, F.mono);
    while (px > 18 && g.measureText(l).width + g.measureText(v).width + 40 > IW) font(weight, px -= 2, F.mono);
    const base = y + (grand ? 38 : 32), lw = g.measureText(l).width, vw = g.measureText(v).width;
    if (grand) { g.fillStyle = C.mark; g.fillRect(IX + IW - vw - 10, base - px, vw + 20, px + 12); }
    put(l, IX, base);
    put(v, IX + IW, base, 'right', cls === 'minus' ? C.red : cls === 'plus' ? C.ink2 : C.ink);
    const from = IX + lw + 12, to = IX + IW - vw - (grand ? 22 : 12);
    if (to - from > 14) {
      g.save(); g.strokeStyle = C.ink3; g.globalAlpha = .5; g.lineWidth = 2; g.setLineDash([2, 6]);
      g.beginPath(); g.moveTo(from, base - 6); g.lineTo(to, base - 6); g.stroke(); g.restore();
    }
  };
  add(58, y => { font(700, 38, F.mono); spaced('결제 전 영수증', W / 2, y + 42, 10); });
  add(38, y => { font(400, 21, F.mono); put(t.meta, W / 2, y + 26, 'center', C.ink3); });
  add(26, y => dash(y + 13));
  font(700, 28, F.mono);
  for (const l of wrapText(g, t.item, IW, 2)) add(42, y => { font(700, 28, F.mono); put(l, IX, y + 31); });
  add(26, y => dash(y + 13));
  for (const [k, l, v, cls] of rows) {
    if (k === 'rule') add(26, y => dash(y + 13));
    else if (k === 'dbl') add(30, y => dbl(y + 15));
    else if (k === 'sub') {
      font(400, 21, F.mono);
      for (const s of wrapText(g, l, IW - 28, 3)) add(32, y => { font(400, 21, F.mono); put(s, IX + 28, y + 23, 'left', C.ink3); });
    } else add(cls === 'grand' ? 54 : 44, y => row(y, l, v, cls));
  }
  add(22, () => {});
  add(84, y => { g.fillStyle = C.ink; const s = IW / 300; for (const [x, w] of barcodeBars(a.name)) g.fillRect(IX + x * s, y, w * s, 84); });
  add(18, () => {});
  add(32, y => { font(400, 21, F.mono); put('이 영수증은 결제되지 않았습니다.', W / 2, y + 24, 'center', C.ink3); });
  add(40, y => { font(700, 27, F.mono); put(t.foot, W / 2, y + 31, 'center', C.red); });

  // 종이와 아래쪽 톱니
  const padT = 48, padB = 44, paperH = padT + items.reduce((s, [h]) => s + h, 0) + padB, teeth = 37, step = PW / teeth;
  g.save();
  g.shadowColor = 'rgba(42, 23, 8, .22)'; g.shadowBlur = 28; g.shadowOffsetY = 10;
  g.beginPath(); g.moveTo(PX, TOP); g.lineTo(PX + PW, TOP); g.lineTo(PX + PW, TOP + paperH);
  for (let i = teeth; i > 0; i--) { g.lineTo(PX + (i - .5) * step, TOP + paperH + 14); g.lineTo(PX + (i - 1) * step, TOP + paperH); }
  g.closePath(); g.fillStyle = C.paper; g.fill();
  g.restore();
  let y = TOP + padT;
  for (const [h, draw] of items) { draw(y); y += h; }

  // 판정 도장: 영수증 오른쪽 위 모서리에 걸쳐 찍는다
  g.save(); g.translate(PX + PW - 130, TOP - 6); g.rotate(-10 * Math.PI / 180);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .92;
  font(400, 52, F.display);
  const sw = Math.max(...stamp.map(s => g.measureText(s).width)) + 60, sh = stamp.length * 56 + 40;
  g.strokeStyle = C.red; g.lineWidth = 7; rrect(g, -sw / 2, -sh / 2, sw, sh, 14); g.stroke();
  g.lineWidth = 2.5; rrect(g, -sw / 2 + 10, -sh / 2 + 10, sw - 20, sh - 20, 8); g.stroke();
  stamp.forEach((s, i) => put(s, 0, -sh / 2 + 66 + i * 56, 'center', C.red));
  g.restore();

  // 아래: 세계 보유율, 이 돈이면, 앱 주소
  y = TOP + paperH + 14 + 58;
  font(700, 34, F.body);
  for (const l of wrapText(g, t.own, PW, 2)) { put(l, W / 2, y + 36, 'center'); y += 48; }
  if (t.swap) { font(500, 29, F.body); put(t.swap, W / 2, y + 34, 'center', C.ink2); y += 46; }
  y += 36;
  font(400, 40, F.display); put('나도 지름신 퇴치하기', W / 2, y + 42, 'center'); y += 56;
  font(700, 25, F.mono); put(t.url, W / 2, y + 30, 'center', C.ink2); y += 42;

  const out = document.createElement('canvas');
  out.width = W; out.height = Math.ceil(y + 56);
  out.getContext('2d').drawImage(cv, 0, 0);
  return new Promise((res, rej) => out.toBlob(b => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));
}

async function openCard(a, btn) {
  if (card.busy) return;
  card.busy = true;
  const label = btn.textContent;
  btn.textContent = '이미지를 만드는 중…'; btn.setAttribute('aria-busy', 'true');
  try {
    const blob = await makeCard(a);
    const safe = a.name.replace(/[\\/:*?"<>|\s]+/g, ' ').trim().slice(0, 40) || '분석';
    card.file = new File([blob], `지름신 영수증 ${safe}.png`, { type: 'image/png' });
    if (card.url) URL.revokeObjectURL(card.url);
    card.url = URL.createObjectURL(blob);
    card.text = `[지름신 퇴치소] ${a.name}: ${a.level.head}\n나도 해 보기 ${APP_URL}`;
    const grand = receiptRows(a).find(r => r[3] === 'grand'), img = $('#card-img');
    img.src = card.url;
    img.alt = `${a.name} 결제 전 영수증 그림. 판정 ${a.level.stamp.replace('\n', ' ')}${grand ? `, ${grand[1]} ${grand[2]}` : ''}.`;
    $('#card-share').hidden = !(navigator.canShare && navigator.canShare({ files: [card.file] }));
    $('#card-msg').textContent = '';
    $('#card-dialog').showModal();
  } catch (e) {
    toast('이미지를 만들지 못했어요. 잠시 뒤에 다시 해 주세요.');
  } finally {
    card.busy = false;
    btn.textContent = label; btn.removeAttribute('aria-busy');
  }
}
function initCard() {
  const dlg = $('#card-dialog'), msg = $('#card-msg');
  $('#card-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', ev => { if (ev.target === dlg) dlg.close(); });
  // 공유 시트는 누른 순간에만 열 수 있어서, 기다리는 일 없이 바로 부른다
  $('#card-share').addEventListener('click', () => {
    navigator.share({ files: [card.file], title: '지름신 퇴치소', text: card.text })
      .catch(e => { if (!e || e.name !== 'AbortError') msg.textContent = '여기서는 바로 공유할 수 없어요. 이미지를 저장해서 올려 주세요.'; });
  });
  $('#card-save').addEventListener('click', async () => {
    const dl = await cardDownloads;
    if (dl) {
      try {
        const r = await dl.save({ filename: card.file.name, data: card.file });
        if (r && r.status === 'saved') msg.textContent = '이미지를 저장했어요.';
      } catch (e) {
        const code = e && e.code;
        if (code !== 'declined') msg.textContent = code === 'rate_limited' ? '저장 창이 이미 열려 있어요. 잠시 뒤에 다시 눌러 주세요.' : '여기서는 저장할 수 없어요. 이미지를 길게 누르거나 오른쪽 클릭해서 저장해 주세요.';
      }
      return;
    }
    const link = document.createElement('a');
    link.href = card.url; link.download = card.file.name;
    document.body.appendChild(link); link.click(); link.remove();
  });
}
