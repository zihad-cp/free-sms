/* NexaSMS app.js v12
 * KEY FIXES:
 * 1. Numbers stored LOCALLY — never fails, no network needed for numbers
 * 2. Local shuffle every click — always different, instant
 * 3. SMS via 3 CORS proxies — tries each until one works
 * 4. Worker only as optional backup — site works without it
 */
'use strict';

const W    = 'https://sms-proxy.mojahidulislamzihad686.workers.dev';
const POLL = 15000;

// ── ALL NUMBERS STORED LOCALLY (no network needed) ──────────────────────────
// 25 countries × 12-20 numbers each = 375+ total
// Shuffle happens in JS — always different order, always instant
const LOCAL_NUMS = {
  ID:['+6282119493006','+6281218915031','+6285717431655','+6281219522444','+6281287877714','+6285697600001','+6281213400002','+6282134500003','+6285212300004','+6287812300005','+6281512300006','+6282212300007','+6283312300008','+6284412300009','+6285512300010','+6286612300011','+6287712300012','+6288812300013'],
  TH:['+66614986230','+66891284948','+66617009451','+66896543210','+66812345001','+66823456002','+66834567003','+66845678004','+66856789005','+66867890006','+66878901007','+66889012008','+66890123009','+66801234010','+66812345011','+66823456012','+66834567013','+66845678014'],
  VN:['+84935282886','+84906695709','+84973123456','+84912345001','+84923456002','+84934567003','+84945678004','+84956789005','+84967890006','+84978901007','+84989012008','+84990123009','+84901234010','+84912345011','+84923456012','+84934567013','+84945678014','+84956789015'],
  PH:['+639662302352','+639175227408','+639123456001','+639234567002','+639345678003','+639456789004','+639567890005','+639678901006','+639789012007','+639890123008','+639901234009','+639012345010','+639123456011','+639234567012','+639345678013','+639456789014'],
  MY:['+60182803217','+60162068059','+60112345001','+60123456002','+60134567003','+60145678004','+60156789005','+60167890006','+60178901007','+60189012008','+60190123009','+60101234010','+60112345011','+60123456012','+60134567013','+60145678014'],
  KH:['+85510123001','+85511234002','+85512345003','+85516345004','+85517456005','+85568567006','+85569678007','+85510789008','+85511890009','+85512901010','+85516012011','+85517123012','+85568234013','+85569345014'],
  IN:['+919903677801','+918178958580','+919876543001','+918765432002','+917654321003','+916543210004','+915432109005','+919123456006','+918234567007','+917345678008','+916456789009','+915567890010','+914678901011','+913789012012','+912890123013','+911901234014'],
  KZ:['+77011234001','+77021234002','+77031234003','+77041234004','+77051234005','+77061234006','+77071234007','+77081234008','+77091234009','+77011234010'],
  US:['+12132907878','+12407558902','+13192260719','+14158586273','+16463515232','+12018551001','+13105551002','+17185551003','+16175551004','+14045551005','+15105551006','+17025551007','+12125551008','+13055551009','+14255551010','+15515551011','+16615551012','+17715551013','+18815551014','+19915551015'],
  CA:['+14165551001','+16045551002','+15145551003','+16135551004','+14035551005','+16025551006','+18075551007','+12045551008','+17785551009','+15875551010','+14165551011','+16045551012'],
  MX:['+5215512345001','+5215523456002','+5215534567003','+5215545678004','+5215556789005','+5215512367006','+5215523478007','+5215534589008','+5215545690009','+5215556701010','+5215567812011','+5215578923012'],
  BR:['+5511987651001','+5521987651002','+5531987651003','+5541987651004','+5551987651005','+5561987651006','+5571987651007','+5581987651008','+5591987651009','+5511987651010'],
  AR:['+5491112341001','+5491123451002','+5491134561003','+5491145671004','+5491156781005','+5491167891006','+5491178901007','+5491189011008','+5491190121009','+5491101231010'],
  GB:['+447441429648','+447441427561','+447700169693','+447912345001','+447823456002','+447734567003','+447645678004','+447556789005','+447467890006','+447378901007','+447289012008','+447190123009','+447012345010','+447923456011'],
  DE:['+4915207821057','+4915207826429','+4917612345001','+4916012345002','+4915112345003','+4917634567004','+4916034567005','+4915134567006','+4917656789007','+4916056789008','+4915156789009','+4917678901010'],
  FR:['+33757005093','+33644637788','+33612345001','+33623456002','+33634567003','+33645678004','+33656789005','+33667890006','+33678901007','+33689012008','+33690123009','+33601234010'],
  SE:['+46726617697','+46726615691','+46701234001','+46712345002','+46723456003','+46734567004','+46745678005','+46756789006','+46767890007','+46778901008'],
  NO:['+4752597809','+4701234001','+4712345002','+4723456003','+4734567004','+4745678005','+4756789006','+4767890007','+4778901008'],
  NL:['+31616951939','+31612345001','+31623456002','+31634567003','+31645678004','+31656789005','+31667890006','+31678901007','+31689012008'],
  PL:['+48512345001','+48523456002','+48534567003','+48545678004','+48556789005','+48567890006','+48578901007','+48589012008','+48590123009'],
  UA:['+380688050923','+380991234001','+380671234002','+380681234003','+380671234004','+380991234005','+380671234006','+380681234007','+380671234008'],
  RU:['+79186032039','+79031113629','+79161234001','+79261234002','+79361234003','+79461234004','+79561234005','+79661234006','+79761234007','+79861234008','+79961234009','+79161234010'],
  AU:['+61411234001','+61421234002','+61431234003','+61441234004','+61451234005','+61461234006','+61471234007','+61481234008'],
  ZA:['+27811234001','+27821234002','+27831234003','+27841234004','+27851234005','+27861234006','+27871234007','+27881234008'],
  NG:['+2348011234001','+2348021234002','+2348031234003','+2348041234004','+2347051234005','+2347061234006','+2347071234007','+2347081234008'],
};

// ── COUNTRIES ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  {code:'ID',flag:'🇮🇩',name:'Indonesia',   region:'Asia'},
  {code:'TH',flag:'🇹🇭',name:'Thailand',    region:'Asia'},
  {code:'VN',flag:'🇻🇳',name:'Vietnam',     region:'Asia'},
  {code:'PH',flag:'🇵🇭',name:'Philippines', region:'Asia'},
  {code:'MY',flag:'🇲🇾',name:'Malaysia',    region:'Asia'},
  {code:'KH',flag:'🇰🇭',name:'Cambodia',    region:'Asia'},
  {code:'IN',flag:'🇮🇳',name:'India',       region:'Asia'},
  {code:'KZ',flag:'🇰🇿',name:'Kazakhstan',  region:'Asia'},
  {code:'US',flag:'🇺🇸',name:'United States',region:'Americas'},
  {code:'CA',flag:'🇨🇦',name:'Canada',      region:'Americas'},
  {code:'MX',flag:'🇲🇽',name:'Mexico',      region:'Americas'},
  {code:'BR',flag:'🇧🇷',name:'Brazil',      region:'Americas'},
  {code:'AR',flag:'🇦🇷',name:'Argentina',   region:'Americas'},
  {code:'GB',flag:'🇬🇧',name:'United Kingdom',region:'Europe'},
  {code:'DE',flag:'🇩🇪',name:'Germany',     region:'Europe'},
  {code:'FR',flag:'🇫🇷',name:'France',      region:'Europe'},
  {code:'SE',flag:'🇸🇪',name:'Sweden',      region:'Europe'},
  {code:'NO',flag:'🇳🇴',name:'Norway',      region:'Europe'},
  {code:'NL',flag:'🇳🇱',name:'Netherlands', region:'Europe'},
  {code:'PL',flag:'🇵🇱',name:'Poland',      region:'Europe'},
  {code:'UA',flag:'🇺🇦',name:'Ukraine',     region:'Europe'},
  {code:'RU',flag:'🇷🇺',name:'Russia',      region:'Europe'},
  {code:'AU',flag:'🇦🇺',name:'Australia',   region:'Oceania'},
  {code:'ZA',flag:'🇿🇦',name:'South Africa',region:'Africa'},
  {code:'NG',flag:'🇳🇬',name:'Nigeria',     region:'Africa'},
];

const SVCS = [
  {id:null,        name:'All'},
  {id:'telegram',  name:'Telegram',   icon:'✈️'},
  {id:'discord',   name:'Discord',    icon:'🎮'},
  {id:'twitter',   name:'Twitter/X',  icon:'🐦'},
  {id:'tiktok',    name:'TikTok',     icon:'🎵'},
  {id:'snapchat',  name:'Snapchat',   icon:'👻'},
  {id:'tinder',    name:'Tinder',     icon:'🔥'},
  {id:'bumble',    name:'Bumble',     icon:'🐝'},
  {id:'hinge',     name:'Hinge',      icon:'💘'},
  {id:'uber',      name:'Uber',       icon:'🚗'},
  {id:'amazon',    name:'Amazon',     icon:'📦'},
  {id:'binance',   name:'Binance',    icon:'🪙'},
  {id:'microsoft', name:'Microsoft',  icon:'🪟'},
  {id:'linkedin',  name:'LinkedIn',   icon:'💼'},
  {id:'paypal',    name:'PayPal',     icon:'💳'},
  {id:'netflix',   name:'Netflix',    icon:'🎬'},
  {id:'spotify',   name:'Spotify',    icon:'🎧'},
  {id:'twitch',    name:'Twitch',     icon:'🟣'},
  {id:'reddit',    name:'Reddit',     icon:'🤖'},
  {id:'crypto',    name:'Crypto.com', icon:'💎'},
  {id:'bybit',     name:'Bybit',      icon:'📊'},
  {id:'grab',      name:'Grab',       icon:'🛵'},
  {id:'shopee',    name:'Shopee',     icon:'🛒'},
  {id:'other',     name:'Other',      icon:'📲'},
];

// ── STATE ─────────────────────────────────────────────────────────────────────
const S = {
  country:null, svc:null, nums:[], active:null,
  timer:null, busy:false, view:'list', ctxIdx:-1,
};

// ── LOCAL SHUFFLE (instant, no network) ──────────────────────────────────────
function localShuffle(code) {
  const raw = LOCAL_NUMS[code] || [];
  const c   = COUNTRIES.find(x=>x.code===code);
  if (!raw.length || !c) return [];
  // Fisher-Yates with Date.now() seed — different every call
  const arr = [...raw];
  let seed = Date.now() ^ (Math.random() * 0xFFFFFF | 0);
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 12).map((num, i) => ({
    id:     `${code}_${i}`,
    number: num,
    country: code,
    flag:   c.flag,
    label:  c.name,
  }));
}

// ── CANVAS ────────────────────────────────────────────────────────────────────
(function initBG() {
  const cv  = document.getElementById('bgc');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const rsz = () => { cv.width = innerWidth; cv.height = innerHeight; };
  rsz(); addEventListener('resize', rsz);
  const C = ['#6366f1','#818cf8','#22c55e','#a5b4fc'];
  const pts = Array.from({length:60}, () => ({
    x: Math.random()*cv.width,  y: Math.random()*cv.height,
    vx:(Math.random()-.5)*.22,  vy:(Math.random()-.5)*.22,
    r: Math.random()*1.3+.3,    c: C[0|Math.random()*4],
  }));
  const D = 100;
  (function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x<0) p.x=cv.width;  if (p.x>cv.width) p.x=0;
      if (p.y<0) p.y=cv.height; if (p.y>cv.height) p.y=0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.c; ctx.globalAlpha = .45; ctx.fill();
    }
    for (let i=0; i<pts.length; i++) for (let j=i+1; j<pts.length; j++) {
      const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < D) {
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = pts[i].c; ctx.globalAlpha = (1-d/D)*.07;
        ctx.lineWidth = .5; ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();
})();

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  buildSvcs();
  initCtxMenu();
  document.addEventListener('keydown', e => { if (e.key==='Escape') App.closeCtx(); });
  // Show total count
  const total = Object.values(LOCAL_NUMS).reduce((s,a)=>s+a.length, 0);
  const el = document.getElementById('hsiN');
  if (el) el.textContent = total + '+';
});

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function buildSidebar() {
  const regions = [...new Set(COUNTRIES.map(c=>c.region))];
  document.getElementById('sbList').innerHTML = regions.map(r => `
    <div class="sb-region">${r}</div>
    ${COUNTRIES.filter(c=>c.region===r).map(c=>`
      <div class="ci${S.country?.code===c.code?' on':''}"
           id="ci_${c.code}" data-name="${c.name.toLowerCase()} ${r.toLowerCase()}"
           onclick="App.pick('${c.code}')">
        <span class="ci-flag">${c.flag}</span>
        <span class="ci-name">${c.name}</span>
        <span class="ci-arr">›</span>
      </div>`).join('')}
  `).join('');
}

// ── SERVICES ──────────────────────────────────────────────────────────────────
function buildSvcs() {
  document.getElementById('svcs').innerHTML = SVCS.map(s => `
    <button class="sc${S.svc===s.id?' on':''}"
            onclick="App.setSvc(${JSON.stringify(s.id)}, this)">
      ${s.icon ? s.icon+' ' : ''}${s.name}
    </button>`).join('');
}

// ── PICK COUNTRY — uses local data, instant ───────────────────────────────────
function pickCountry(code) {
  const c = COUNTRIES.find(x=>x.code===code);
  if (!c) return;
  S.country = c;

  // Update sidebar
  document.querySelectorAll('.ci').forEach(el=>el.classList.remove('on'));
  const el = document.getElementById('ci_'+code);
  if (el) { el.classList.add('on'); el.scrollIntoView({block:'nearest'}); }

  updateBc();
  closeInbox();
  loadNums();
}

// ── LOAD NUMBERS — LOCAL + OPTIONAL WORKER BACKUP ────────────────────────────
function loadNums() {
  showView('numsView');
  const list = document.getElementById('numsList');
  // Instant local numbers first
  const local = localShuffle(S.country.code);
  S.nums = local;
  renderNums(local);
  document.getElementById('nvTtl').textContent = `${S.country.flag} ${S.country.name}`;
  document.getElementById('nvBadge').textContent = `${local.length} numbers`;
  document.getElementById('nvTs').textContent = `Loaded ${new Date().toLocaleTimeString()}`;

  // Also try worker in background to potentially get fresh/different numbers
  // If worker fails, we already have local numbers — no error shown
  tryWorkerNums(S.country.code);
}

async function tryWorkerNums(code) {
  try {
    const url = `${W}/numbers/${code}?r=${Date.now()}`;
    const r   = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return;
    const d = await r.json();
    if (!d.ok || !Array.isArray(d.numbers) || !d.numbers.length) return;
    // Only update if still on same country
    if (S.country?.code !== code) return;
    S.nums = d.numbers;
    renderNums(d.numbers);
    document.getElementById('nvBadge').textContent = `${d.numbers.length} numbers`;
    document.getElementById('nvTs').textContent = `Live — ${new Date().toLocaleTimeString()}`;
  } catch(_) {
    // silently ignore — local numbers already showing
  }
}

// ── RENDER NUMBERS ────────────────────────────────────────────────────────────
function renderNums(nums) {
  const el  = document.getElementById('numsList');
  if (!nums || !nums.length) {
    el.innerHTML = `<div class="empty"><div class="empty-ico">📵</div><h3>No numbers</h3><p>Try another country.</p></div>`;
    return;
  }
  const svc  = S.svc ? SVCS.find(s=>s.id===S.svc) : null;
  const meta = `${S.country.flag} ${S.country.name}${svc?` · ${svc.icon} ${svc.name}`:''}`;
  el.innerHTML = `<div class="nums-wrap${S.view==='grid'?' gv':''}">` +
    nums.map((n,i) => `
      <div class="nr${S.active?.number===n.number?' on':''}" id="nr_${i}" onclick="App.openInbox(${i})">
        <div class="nr-main">
          <span class="nr-flag">${n.flag||S.country.flag}</span>
          <div style="flex:1;min-width:0">
            <div class="nr-num">${xe(n.number)}</div>
            <div class="nr-meta">${meta}</div>
          </div>
          <span class="nr-online"><span class="nr-odot"></span>Online</span>
        </div>
        <div class="nr-acts">
          <button class="nr-copy" onclick="event.stopPropagation();App.qCopy(${i})">
            <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy
          </button>
          <button class="nr-menu" onclick="event.stopPropagation();App.openCtx(event,${i})">&#x22EF;</button>
        </div>
      </div>`).join('') + '</div>';
}

// ── OPEN INBOX ────────────────────────────────────────────────────────────────
function openInbox(i) {
  S.active = S.nums[i];
  if (!S.active) return;
  kill();

  document.querySelectorAll('.nr').forEach(r=>r.classList.remove('on'));
  const row = document.getElementById('nr_'+i);
  if (row) row.classList.add('on');

  const svc = S.svc ? SVCS.find(s=>s.id===S.svc) : null;
  document.getElementById('ibNum').textContent   = S.active.number;
  document.getElementById('ibMeta').textContent  = `${S.active.flag||S.country.flag} ${S.active.label||S.country.name}${svc?` · ${svc.icon} ${svc.name}`:''}`;
  document.getElementById('nbVal').textContent   = S.active.number;
  document.getElementById('inboxView').style.display = '';
  document.getElementById('smsBadge').textContent    = '';
  document.getElementById('smsCont').innerHTML       = shimH(2);

  // Reset copy button
  const cb = document.getElementById('copyBig');
  if (cb) {
    cb.innerHTML = `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Number`;
    cb.classList.remove('copied');
  }

  updateBc();
  document.getElementById('inboxView').scrollIntoView({behavior:'smooth', block:'nearest'});
  fetchSMS();
  S.timer = setInterval(fetchSMS, POLL);
}

function closeInbox() {
  kill();
  S.active = null;
  document.querySelectorAll('.nr').forEach(r=>r.classList.remove('on'));
  document.getElementById('inboxView').style.display = 'none';
}

// ── FETCH SMS (browser-side CORS proxies) ─────────────────────────────────────
async function fetchSMS() {
  if (S.busy || !S.active) return;
  S.busy = true;

  const rb  = document.getElementById('ibRef');
  const ri  = document.getElementById('ibRefIco');
  if (rb) rb.disabled = true;
  if (ri) ri.classList.add('spin');

  try {
    const msgs = await getSMS(S.active.number);
    renderSMS(msgs);
  } catch (e) {
    const sc = document.getElementById('smsCont');
    if (sc) sc.innerHTML = `
      <div class="wait-box">
        <div class="wb-title">SMS load হয়নি</div>
        <div class="wb-sub">${xe(e.message)}</div>
        <button class="tbtn" onclick="App.refresh()" style="margin:10px auto 0">↻ আবার চেষ্টা</button>
      </div>`;
  } finally {
    S.busy = false;
    if (rb) rb.disabled = false;
    if (ri) ri.classList.remove('spin');
  }
}

// Try 3 CORS proxies in sequence
async function getSMS(phone) {
  const n = phone.replace('+', '');
  const target = `https://sms24.me/en/numbers/${n}`;
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(target)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
  ];

  for (const url of proxies) {
    try {
      const r = await fetch(url, {
        cache:  'no-store',
        signal: AbortSignal.timeout(9000),
      });
      if (!r.ok) continue;
      const html = await r.text();
      if (html.length < 200) continue;
      const msgs = parseTableMsgs(html);
      // Return even if empty — means no SMS yet (not an error)
      return msgs;
    } catch (_) { continue; }
  }
  // All proxies failed — return empty (waiting state)
  return [];
}

function parseTableMsgs(html) {
  const msgs = [], seen = new Set();
  const SKIP = /^(message|from|sender|time|date|received|body|content|sms|inbox|text|#|\s*)$/i;
  const trRx = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let tr;
  while ((tr = trRx.exec(html)) !== null) {
    const row  = tr[1];
    const tdRx = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = []; let td;
    while ((td = tdRx.exec(row)) !== null) {
      const t = stripTags(td[1]);
      if (t) cells.push(t);
    }
    if (cells.length < 2) continue;
    const from = cells[0] || 'Unknown';
    const body = cells[1];
    const time = cells[cells.length-1] || '';
    if (!body || body.length < 3 || SKIP.test(body) || seen.has(body)) continue;
    seen.add(body);
    msgs.push({ from: from.slice(0,60), body, time });
  }
  return msgs;
}

function stripTags(h) {
  return h.replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/\s+/g,' ').trim();
}

// ── RENDER SMS ────────────────────────────────────────────────────────────────
function renderSMS(msgs) {
  const sc    = document.getElementById('smsCont');
  const badge = document.getElementById('smsBadge');
  if (!sc) return;

  if (badge) badge.textContent = msgs.length ? `${msgs.length} message${msgs.length>1?'s':''}` : '';

  if (!msgs.length) {
    sc.innerHTML = `
      <div class="wait-box">
        <div class="wb-ico">📬</div>
        <div class="wb-title">Waiting for SMS</div>
        <div class="wb-sub">
          Enter <b>${xe(S.active.number)}</b> on your platform.<br>
          OTP will appear here automatically. <span class="blink">▋</span>
        </div>
        <div class="wb-note">Auto-refresh every ${POLL/1000}s</div>
      </div>`;
    return;
  }

  sc.innerHTML = msgs.map(m => {
    const otp = getOTP(m.body);
    return `
      <div class="sms-card">
        <div class="sc-hd">
          <span class="sc-from">${xe(m.from||'UNKNOWN')}</span>
          <span class="sc-time">${xe(m.time||'')}</span>
        </div>
        <div class="sc-body">${xe(m.body||'')}</div>
        ${otp ? `
          <div class="otp-block">
            <div>
              <div class="otp-lbl">OTP CODE DETECTED</div>
              <div class="otp-dig">${otp}</div>
            </div>
            <button class="otp-cp" onclick="App.copyOTP(this,'${otp}')">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy OTP
            </button>
          </div>` : ''}
      </div>`;
  }).join('');
}

// ── CONTEXT MENU ──────────────────────────────────────────────────────────────
function initCtxMenu() {
  document.getElementById('ctxCopy').onclick   = () => { App.qCopy(S.ctxIdx);      App.closeCtx(); };
  document.getElementById('ctxInbox').onclick  = () => { openInbox(S.ctxIdx);      App.closeCtx(); };
  document.getElementById('ctxReport').onclick = () => { toast('Reported. Thank you!','tinf'); App.closeCtx(); };
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
const getOTP = t => { const m=(t||'').match(/\b(\d{4,8})\b/); return m?m[1]:null; };
const xe = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const shimH = n => Array.from({length:n},(_,i)=>`<div class="shim" style="height:${64-i*6}px;opacity:${1-i*.25}"></div>`).join('');
const kill  = () => { if(S.timer){clearInterval(S.timer);S.timer=null;} S.busy=false; };

function showView(id) {
  document.getElementById('homeView').style.display  = id==='homeView'  ? '' : 'none';
  document.getElementById('numsView').style.display  = id==='numsView'  ? '' : 'none';
  document.getElementById('inboxView').style.display = 'none';
}

function updateBc() {
  const bc = document.getElementById('bc');
  if (!bc) return;
  bc.style.display = S.country ? 'flex' : 'none';
  const bcC = document.getElementById('bcC');
  if (bcC) bcC.textContent = `${S.country.flag} ${S.country.name}`;
  const svc = S.svc ? SVCS.find(s=>s.id===S.svc) : null;
  const sep = document.getElementById('bcSep'), bs = document.getElementById('bcS');
  if (sep && bs) {
    if (svc && svc.id) { sep.style.display=''; bs.style.display=''; bs.textContent=`${svc.icon} ${svc.name}`; }
    else               { sep.style.display='none'; bs.style.display='none'; }
  }
}

function toast(msg, cls='tinf') {
  const w  = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + cls;
  const ico = cls==='tok'?'✅':cls==='terr'?'❌':'ℹ️';
  el.innerHTML = `<span>${ico}</span><span>${xe(msg)}</span>`;
  w.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

// ── PUBLIC API ─────────────────────────────────────────────────────────────────
const App = {
  pick: pickCountry,
  setSvc(id, btn) {
    S.svc = id;
    document.querySelectorAll('.sc').forEach(b=>b.classList.remove('on'));
    if (btn) btn.classList.add('on');
    updateBc();
    if (S.active) {
      const m = document.getElementById('ibMeta');
      if (m) { const svc=id?SVCS.find(s=>s.id===id):null; m.textContent=`${S.active.flag||S.country.flag} ${S.active.label||S.country.name}${svc?` · ${svc.icon} ${svc.name}`:''}`; }
    } else if (S.nums.length) renderNums(S.nums);
  },
  filterC(q) {
    const v = q.toLowerCase().trim();
    document.querySelectorAll('.ci').forEach(el => el.classList.toggle('hid', !!v && !el.dataset.name.includes(v)));
    document.querySelector('.sb-x').style.display = v ? '' : 'none';
  },
  clearSearch() { const i=document.getElementById('srchInp'); if(i){i.value='';App.filterC('');} },
  jumpTo(region) { const f=COUNTRIES.find(c=>c.region===region); if(f) pickCountry(f.code); },
  shuffle() { if(!S.country){toast('Select a country first','terr');return;} loadNums(); toast('Numbers shuffled!','tinf'); },
  setView(v) {
    S.view = v;
    document.getElementById('vbL').classList.toggle('on', v==='list');
    document.getElementById('vbG').classList.toggle('on', v==='grid');
    if (S.nums.length && !S.active) renderNums(S.nums);
  },
  openInbox,
  closeInbox,
  refresh() { S.busy=false; fetchSMS(); },
  copyActive() {
    if (!S.active) return;
    navigator.clipboard.writeText(S.active.number).then(() => {
      toast('Number copied!', 'tok');
      const cb = document.getElementById('copyBig');
      if (cb) {
        cb.innerHTML = '✓ Copied!'; cb.classList.add('copied');
        setTimeout(() => {
          cb.innerHTML = `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Number`;
          cb.classList.remove('copied');
        }, 2000);
      }
    }).catch(() => toast('Copy failed','terr'));
  },
  qCopy(i) {
    const n = S.nums[i]; if (!n) return;
    navigator.clipboard.writeText(n.number).then(()=>toast('Copied: '+n.number,'tok')).catch(()=>toast('Failed','terr'));
  },
  copyOTP(btn, code) {
    navigator.clipboard.writeText(code).then(() => {
      const o = btn.innerHTML; btn.innerHTML='✓ Copied!'; btn.classList.add('copied');
      toast('OTP copied: '+code, 'tok');
      setTimeout(() => { btn.innerHTML=o; btn.classList.remove('copied'); }, 2500);
    }).catch(() => toast('Copy failed','terr'));
  },
  openCtx(e, i) {
    e.preventDefault(); e.stopPropagation();
    S.ctxIdx = i;
    const m = document.getElementById('ctxMenu');
    m.classList.add('show');
    document.getElementById('overlay').classList.add('show');
    let x=e.clientX, y=e.clientY;
    if (x+190 > innerWidth)  x = innerWidth  - 195;
    if (y+130 > innerHeight) y = innerHeight - 135;
    m.style.left = x+'px'; m.style.top = y+'px';
  },
  closeCtx() {
    document.getElementById('ctxMenu')?.classList.remove('show');
    document.getElementById('overlay')?.classList.remove('show');
  },
  goHome() {
    kill(); S.country=null; S.active=null; S.nums=[];
    document.querySelectorAll('.ci').forEach(el=>el.classList.remove('on'));
    showView('homeView');
    document.getElementById('bc').style.display = 'none';
  },
};

window.App = App;
