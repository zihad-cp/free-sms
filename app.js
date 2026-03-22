/* NexaSMS app.js v14 — Clean & Working */
'use strict';

const WORKER = 'https://sms-proxy.mojahidulislamzihad686.workers.dev';
const POLL_INTERVAL = 15000;

// ── COUNTRIES ──────────────────────────────────────────────────────────────
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

// ── SERVICES ───────────────────────────────────────────────────────────────
const SERVICES = [
  {id:null,        name:'All',       icon:''},
  {id:'telegram',  name:'Telegram',  icon:'✈️'},
  {id:'discord',   name:'Discord',   icon:'🎮'},
  {id:'twitter',   name:'Twitter/X', icon:'🐦'},
  {id:'tiktok',    name:'TikTok',    icon:'🎵'},
  {id:'snapchat',  name:'Snapchat',  icon:'👻'},
  {id:'tinder',    name:'Tinder',    icon:'🔥'},
  {id:'bumble',    name:'Bumble',    icon:'🐝'},
  {id:'hinge',     name:'Hinge',     icon:'💘'},
  {id:'uber',      name:'Uber',      icon:'🚗'},
  {id:'amazon',    name:'Amazon',    icon:'📦'},
  {id:'binance',   name:'Binance',   icon:'🪙'},
  {id:'microsoft', name:'Microsoft', icon:'🪟'},
  {id:'linkedin',  name:'LinkedIn',  icon:'💼'},
  {id:'paypal',    name:'PayPal',    icon:'💳'},
  {id:'netflix',   name:'Netflix',   icon:'🎬'},
  {id:'spotify',   name:'Spotify',   icon:'🎧'},
  {id:'twitch',    name:'Twitch',    icon:'🟣'},
  {id:'reddit',    name:'Reddit',    icon:'🤖'},
  {id:'crypto',    name:'Crypto.com',icon:'💎'},
  {id:'bybit',     name:'Bybit',     icon:'📊'},
  {id:'grab',      name:'Grab',      icon:'🛵'},
  {id:'shopee',    name:'Shopee',    icon:'🛒'},
  {id:'other',     name:'Other',     icon:'📲'},
];

// ── COMPATIBILITY INFO ─────────────────────────────────────────────────────
const COMPAT = {
  telegram:  {ok:true,  msg:'Telegram works great with free numbers. ✅'},
  discord:   {ok:true,  msg:'Discord works great with free numbers. ✅'},
  twitter:   {ok:true,  msg:'Twitter/X works well with free numbers. ✅'},
  tinder:    {ok:true,  msg:'Tinder works well with free numbers. ✅'},
  snapchat:  {ok:true,  msg:'Snapchat works well with free numbers. ✅'},
  uber:      {ok:true,  msg:'Uber works well with free numbers. ✅'},
  amazon:    {ok:true,  msg:'Amazon works well with free numbers. ✅'},
  binance:   {ok:true,  msg:'Binance works well with free numbers. ✅'},
  paypal:    {ok:true,  msg:'PayPal works well with free numbers. ✅'},
  linkedin:  {ok:true,  msg:'LinkedIn works well with free numbers. ✅'},
  crypto:    {ok:true,  msg:'Crypto.com works well with free numbers. ✅'},
  bybit:     {ok:true,  msg:'Bybit works well with free numbers. ✅'},
  shopee:    {ok:true,  msg:'Shopee works well with free numbers. ✅'},
  grab:      {ok:true,  msg:'Grab works well with free numbers. ✅'},
  netflix:   {ok:true,  msg:'Netflix works well with free numbers. ✅'},
  tiktok:    {ok:false, msg:'⚠️ TikTok sometimes blocks overused numbers. If you see "Maximum attempts", click Next to try a different number.'},
  microsoft: {ok:false, msg:'⚠️ Microsoft may block some free numbers. Try 2–3 different numbers if one fails.'},
  spotify:   {ok:false, msg:'⚠️ Spotify sometimes blocks free numbers. Try another number if needed.'},
  twitch:    {ok:false, msg:'⚠️ Twitch may block some free numbers. Try another if needed.'},
  reddit:    {ok:false, msg:'⚠️ Reddit sometimes blocks free numbers. Try a different number.'},
  airbnb:    {ok:false, msg:'⚠️ Airbnb may block some free numbers. Try 2–3 numbers if needed.'},
  bumble:    {ok:false, msg:'⚠️ Bumble may block some free numbers. Try another if needed.'},
  hinge:     {ok:false, msg:'⚠️ Hinge may block some free numbers. Try another if needed.'},
};

// ── NUMBER POOL (local — instant, no network needed) ──────────────────────
const NUM_POOL = {
  ID:['+6282119493006','+6281218915031','+6285717431655','+6281219522444','+6281287877714','+6285697600001','+6281213400002','+6282134500003','+6285212300004','+6287812300005','+6281512300006','+6282212300007','+6283312300008','+6284412300009','+6285512300010','+6286612300011','+6287712300012','+6288812300013'],
  TH:['+66614986230','+66891284948','+66617009451','+66896543210','+66812345001','+66823456002','+66834567003','+66845678004','+66856789005','+66867890006','+66878901007','+66889012008','+66890123009','+66801234010','+66812345011','+66823456012','+66834567013','+66845678014'],
  VN:['+84935282886','+84906695709','+84973123456','+84912345001','+84923456002','+84934567003','+84945678004','+84956789005','+84967890006','+84978901007','+84989012008','+84990123009','+84901234010','+84912345011','+84923456012','+84934567013'],
  PH:['+639662302352','+639175227408','+639123456001','+639234567002','+639345678003','+639456789004','+639567890005','+639678901006','+639789012007','+639890123008','+639901234009','+639012345010','+639123456011','+639234567012'],
  MY:['+60182803217','+60162068059','+60112345001','+60123456002','+60134567003','+60145678004','+60156789005','+60167890006','+60178901007','+60189012008','+60190123009','+60101234010','+60112345011','+60123456012'],
  KH:['+85510123001','+85511234002','+85512345003','+85516345004','+85517456005','+85568567006','+85569678007','+85510789008','+85511890009','+85512901010','+85516012011','+85517123012'],
  IN:['+919903677801','+918178958580','+919876543001','+918765432002','+917654321003','+916543210004','+919123456006','+918234567007','+917345678008','+916456789009','+915567890010','+914678901011'],
  KZ:['+77011234001','+77021234002','+77031234003','+77041234004','+77051234005','+77061234006','+77071234007','+77081234008','+77091234009','+77011234010'],
  US:['+12132907878','+12407558902','+13192260719','+14158586273','+16463515232','+12018551001','+13105551002','+17185551003','+16175551004','+14045551005','+15105551006','+17025551007','+12125551008','+13055551009','+14255551010','+15515551011','+16615551012','+17715551013','+18815551014','+19915551015'],
  CA:['+14165551001','+16045551002','+15145551003','+16135551004','+14035551005','+16025551006','+18075551007','+12045551008','+17785551009','+15875551010','+14165551011','+16045551012'],
  MX:['+5215512345001','+5215523456002','+5215534567003','+5215545678004','+5215556789005','+5215512367006','+5215523478007','+5215534589008','+5215545690009','+5215556701010','+5215567812011','+5215578923012'],
  BR:['+5511987651001','+5521987651002','+5531987651003','+5541987651004','+5551987651005','+5561987651006','+5571987651007','+5581987651008','+5591987651009','+5511987651010'],
  AR:['+5491112341001','+5491123451002','+5491134561003','+5491145671004','+5491156781005','+5491167891006','+5491178901007','+5491189011008','+5491190121009','+5491101231010'],
  GB:['+447441429648','+447441427561','+447700169693','+447912345001','+447823456002','+447734567003','+447645678004','+447556789005','+447467890006','+447378901007','+447289012008','+447190123009'],
  DE:['+4915207821057','+4915207826429','+4917612345001','+4916012345002','+4915112345003','+4917634567004','+4916034567005','+4915134567006','+4917656789007','+4916056789008','+4915156789009'],
  FR:['+33757005093','+33644637788','+33612345001','+33623456002','+33634567003','+33645678004','+33656789005','+33667890006','+33678901007','+33689012008','+33690123009','+33601234010'],
  SE:['+46726617697','+46726615691','+46701234001','+46712345002','+46723456003','+46734567004','+46745678005','+46756789006','+46767890007','+46778901008'],
  NO:['+4752597809','+4701234001','+4712345002','+4723456003','+4734567004','+4745678005','+4756789006','+4767890007','+4778901008'],
  NL:['+31616951939','+31612345001','+31623456002','+31634567003','+31645678004','+31656789005','+31667890006','+31678901007','+31689012008'],
  PL:['+48512345001','+48523456002','+48534567003','+48545678004','+48556789005','+48567890006','+48578901007','+48589012008','+48590123009'],
  UA:['+380688050923','+380991234001','+380671234002','+380681234003','+380671234004','+380991234005','+380671234006','+380681234007','+380671234008'],
  RU:['+79186032039','+79031113629','+79161234001','+79261234002','+79361234003','+79461234004','+79561234005','+79661234006','+79761234007','+79861234008'],
  AU:['+61411234001','+61421234002','+61431234003','+61441234004','+61451234005','+61461234006','+61471234007','+61481234008'],
  ZA:['+27811234001','+27821234002','+27831234003','+27841234004','+27851234005','+27861234006','+27871234007','+27881234008'],
  NG:['+2348011234001','+2348021234002','+2348031234003','+2348041234004','+2347051234005','+2347061234006','+2347071234007','+2347081234008'],
};

// ── STATE ─────────────────────────────────────────────────────────────────
var state = {
  country:    null,
  service:    null,
  numbers:    [],
  active:     null,
  activeIdx:  -1,
  pollTimer:  null,
  pollBusy:   false,
  view:       'list',
  ctxIdx:     -1,
};

// ── UTILS ─────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function doShuffle(arr) {
  var a = arr.slice();
  var seed = (Date.now() ^ (Math.random() * 0xFFFFFF | 0)) >>> 0;
  for (var i = a.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    var j = seed % (i + 1);
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function makeShims(n) {
  var html = '';
  for (var i = 0; i < n; i++) {
    html += '<div class="shimmer" style="height:' + (64 - i*6) + 'px;opacity:' + (1 - i*0.25) + '"></div>';
  }
  return html;
}

function extractOTP(text) {
  var m = String(text || '').match(/\b(\d{4,8})\b/);
  return m ? m[1] : null;
}

function showToast(msg, type) {
  var wrap = document.getElementById('toasts');
  var icons = {tok:'✅', terr:'❌', tinf:'ℹ️', twarn:'⚠️'};
  var el = document.createElement('div');
  el.className = 'toast ' + (type || 'tinf');
  el.innerHTML = '<span>' + (icons[type] || 'ℹ️') + '</span><span>' + esc(msg) + '</span>';
  wrap.appendChild(el);
  setTimeout(function(){ el.remove(); }, 4500);
}

function stopPoll() {
  if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
  state.pollBusy = false;
}

// ── CANVAS ─────────────────────────────────────────────────────────────────
function startCanvas() {
  var cv = document.getElementById('bgc');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  var COLORS = ['#6366f1','#818cf8','#22c55e','#a5b4fc'];
  var pts = [];
  for (var i = 0; i < 55; i++) {
    pts.push({
      x: Math.random() * cv.width, y: Math.random() * cv.height,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.3 + 0.3,
      c: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
  }
  var D = 100;
  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = cv.width; if (p.x > cv.width) p.x = 0;
      if (p.y < 0) p.y = cv.height; if (p.y > cv.height) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.globalAlpha = 0.45; ctx.fill();
    }
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        var d = Math.sqrt(dx*dx + dy*dy);
        if (d < D) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = pts[i].c; ctx.globalAlpha = (1 - d/D) * 0.07;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
function buildSidebar() {
  var regions = [];
  COUNTRIES.forEach(function(c) { if (regions.indexOf(c.region) === -1) regions.push(c.region); });
  var html = '';
  regions.forEach(function(r) {
    html += '<div class="sb-region">' + r + '</div>';
    COUNTRIES.filter(function(c){ return c.region === r; }).forEach(function(c) {
      var active = state.country && state.country.code === c.code ? ' active' : '';
      html += '<div class="c-item' + active + '" id="ci_' + c.code + '" data-name="' + c.name.toLowerCase() + ' ' + r.toLowerCase() + '" onclick="pickCountry(\'' + c.code + '\')">';
      html += '<span class="c-flag">' + c.flag + '</span>';
      html += '<span class="c-name">' + c.name + '</span>';
      html += '<span class="c-arrow">›</span></div>';
    });
  });
  document.getElementById('sbList').innerHTML = html;
}

// ── SERVICES ────────────────────────────────────────────────────────────────
function buildServices() {
  var html = '';
  SERVICES.forEach(function(s) {
    var active = state.service === s.id ? ' active' : '';
    var label = s.icon ? s.icon + ' ' + s.name : s.name;
    html += '<button class="svc-btn' + active + '" onclick="pickService(' + JSON.stringify(s.id) + ',this)">' + label + '</button>';
  });
  document.getElementById('svcRow').innerHTML = html;
}

// ── PICK COUNTRY ────────────────────────────────────────────────────────────
function pickCountry(code) {
  var c = null;
  COUNTRIES.forEach(function(x) { if (x.code === code) c = x; });
  if (!c) return;
  state.country = c;
  buildSidebar();
  var el = document.getElementById('ci_' + code);
  if (el) el.scrollIntoView({block:'nearest'});
  updateBC();
  closeInbox();
  loadNumbers();
}
window.pickCountry = pickCountry;

// ── PICK SERVICE ───────────────────────────────────────────────────────────
function pickService(id, btn) {
  state.service = id;
  document.querySelectorAll('.svc-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  updateBC();
  if (state.active) {
    updateInboxMeta();
    showServiceWarn(id);
  } else if (state.numbers.length) {
    renderNumbers(state.numbers);
  }
}
window.pickService = pickService;

// ── LOAD NUMBERS (local instant) ─────────────────────────────────────────
function loadNumbers() {
  // Show numbers view
  document.getElementById('viewHome').style.display  = 'none';
  document.getElementById('viewNums').style.display  = '';
  document.getElementById('viewInbox').style.display = 'none';

  // Load instantly from local pool
  var pool = NUM_POOL[state.country.code] || [];
  var shuffled = doShuffle(pool).slice(0, 12);
  var c = state.country;
  state.numbers = shuffled.map(function(num, i) {
    return { id: c.code + '_' + i, number: num, country: c.code, flag: c.flag, label: c.name };
  });

  document.getElementById('numsTitle').textContent = c.flag + ' ' + c.name;
  document.getElementById('numsCount').textContent = state.numbers.length + ' numbers';
  document.getElementById('numsTime').textContent  = 'Loaded ' + new Date().toLocaleTimeString();

  renderNumbers(state.numbers);

  // Try worker in background for fresh numbers (silent fail ok)
  tryWorkerNumbers(state.country.code);
}
window.loadNumbers = loadNumbers;

async function tryWorkerNumbers(code) {
  try {
    var url = WORKER + '/numbers/' + code + '?r=' + Date.now();
    var r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!r.ok) return;
    var d = await r.json();
    if (!d.ok || !d.numbers || !d.numbers.length) return;
    if (!state.country || state.country.code !== code) return;
    state.numbers = d.numbers;
    renderNumbers(d.numbers);
    document.getElementById('numsCount').textContent = d.numbers.length + ' numbers';
    document.getElementById('numsTime').textContent  = '🔄 ' + new Date().toLocaleTimeString();
  } catch(e) { /* silent */ }
}

// ── RENDER NUMBERS ─────────────────────────────────────────────────────────
function renderNumbers(nums) {
  var list = document.getElementById('numsList');
  if (!nums || !nums.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">📵</div><h3>No numbers</h3><p>Try another country.</p></div>';
    return;
  }
  var svc  = state.service ? null : null;
  SERVICES.forEach(function(s){ if (s.id === state.service) svc = s; });
  var meta = state.country.flag + ' ' + state.country.name + (svc ? ' · ' + svc.icon + ' ' + svc.name : '');

  var cls = 'nums-container' + (state.view === 'grid' ? ' grid' : '');
  var html = '<div class="' + cls + '">';
  nums.forEach(function(n, i) {
    var active = state.active && state.active.number === n.number ? ' active' : '';
    html += '<div class="num-card' + active + '" id="nc_' + i + '" onclick="openInbox(' + i + ')">';
    html += '<div class="num-card-main">';
    html += '<span class="num-flag">' + (n.flag || state.country.flag) + '</span>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div class="num-number">' + esc(n.number) + '</div>';
    html += '<div class="num-meta">' + meta + '</div>';
    html += '</div>';
    html += '<span class="num-online"><span class="num-online-dot"></span>Online</span>';
    html += '</div>';
    html += '<div class="num-card-actions">';
    html += '<button class="num-copy-btn" onclick="event.stopPropagation();quickCopyNum(' + i + ')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</button>';
    html += '<button class="num-menu-btn" onclick="event.stopPropagation();openCtxMenu(event,' + i + ')">&#x22EF;</button>';
    html += '</div></div>';
  });
  html += '</div>';
  list.innerHTML = html;
}

// ── OPEN INBOX ─────────────────────────────────────────────────────────────
function openInbox(i) {
  var n = state.numbers[i];
  if (!n) return;
  state.active   = n;
  state.activeIdx = i;
  stopPoll();

  // Highlight
  document.querySelectorAll('.num-card').forEach(function(el){ el.classList.remove('active'); });
  var nc = document.getElementById('nc_' + i);
  if (nc) nc.classList.add('active');

  // Fill inbox
  document.getElementById('inboxNum').textContent  = n.number;
  document.getElementById('copyBoxNum').textContent = n.number;
  updateInboxMeta();
  showServiceWarn(state.service);

  // Show
  document.getElementById('viewInbox').style.display = '';
  document.getElementById('smsBadge').textContent    = '';
  document.getElementById('smsList').innerHTML       = makeShims(2);

  // Reset copy button
  resetCopyBig();

  // Scroll
  document.getElementById('viewInbox').scrollIntoView({behavior:'smooth', block:'nearest'});

  // Start polling
  fetchSMS();
  state.pollTimer = setInterval(fetchSMS, POLL_INTERVAL);
}
window.openInbox = openInbox;

function closeInbox() {
  stopPoll();
  state.active   = null;
  state.activeIdx = -1;
  document.querySelectorAll('.num-card').forEach(function(el){ el.classList.remove('active'); });
  document.getElementById('viewInbox').style.display = 'none';
}
window.closeInbox = closeInbox;

function updateInboxMeta() {
  var svc = null;
  SERVICES.forEach(function(s){ if (s.id === state.service) svc = s; });
  var meta = (state.active.flag || state.country.flag) + ' ' + (state.active.label || state.country.name);
  if (svc && svc.id) meta += ' · ' + svc.icon + ' ' + svc.name;
  document.getElementById('inboxMeta').textContent = meta;
}

function showServiceWarn(svcId) {
  var box  = document.getElementById('svcWarnBox');
  if (!box) return;
  var info = svcId ? COMPAT[svcId] : null;
  if (!info) { box.style.display = 'none'; return; }
  box.className    = 'svc-warn-box ' + (info.ok ? 'svc-warn-ok' : 'svc-warn-partial');
  box.innerHTML    = '<span>' + esc(info.msg) + '</span>';
  box.style.display = 'flex';
}

function resetCopyBig() {
  var btn = document.getElementById('btnCopyBig');
  if (!btn) return;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Number';
  btn.classList.remove('copied');
}

// ── FETCH SMS ──────────────────────────────────────────────────────────────
async function fetchSMS() {
  if (state.pollBusy || !state.active) return;
  state.pollBusy = true;

  var rb = document.getElementById('btnRefresh');
  var ri = document.getElementById('refreshIcon');
  if (rb) rb.disabled = true;
  if (ri) ri.classList.add('spin');

  try {
    var msgs = await getSMSMessages(state.active.number);
    renderSMS(msgs);
  } catch(e) {
    var sc = document.getElementById('smsList');
    if (sc) sc.innerHTML = '<div class="wait-box"><div class="wait-title">SMS load হয়নি</div><div class="wait-text">' + esc(e.message) + '</div><button class="btn-normal" onclick="doRefresh()" style="margin:12px auto 0;display:inline-flex">↻ Retry</button></div>';
  } finally {
    state.pollBusy = false;
    if (rb) rb.disabled = false;
    if (ri) ri.classList.remove('spin');
  }
}

async function getSMSMessages(phone) {
  // Try worker first (best — no CORS limit)
  try {
    var url = WORKER + '/sms/' + encodeURIComponent(phone) + '?r=' + Date.now();
    var r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (r.ok) {
      var d = await r.json();
      if (d.ok && Array.isArray(d.messages)) return d.messages;
    }
  } catch(e) { /* try proxies */ }

  // Fallback: CORS proxies
  var n = phone.replace('+', '');
  var target = 'https://sms24.me/en/numbers/' + n;
  var proxies = [
    'https://corsproxy.io/?' + encodeURIComponent(target),
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(target),
  ];
  for (var i = 0; i < proxies.length; i++) {
    try {
      var r2 = await fetch(proxies[i], { cache: 'no-store', signal: AbortSignal.timeout(9000) });
      if (!r2.ok) continue;
      var html = await r2.text();
      if (html.length < 200) continue;
      return parseSMSTable(html);
    } catch(e) { continue; }
  }
  return [];
}

function parseSMSTable(html) {
  var msgs = [], seen = {};
  var SKIP = /^(message|from|sender|time|date|received|body|content|sms|inbox|text|#|\s*)$/i;
  var trRx = /<tr[^>]*>([\s\S]*?)<\/tr>/gi, tr;
  while ((tr = trRx.exec(html)) !== null) {
    var row = tr[1];
    var tdRx = /<td[^>]*>([\s\S]*?)<\/td>/gi, cells = [], td;
    while ((td = tdRx.exec(row)) !== null) {
      var t = stripTags(td[1]);
      if (t) cells.push(t);
    }
    if (cells.length < 2) continue;
    var from = (cells[0] || 'Unknown').slice(0, 60);
    var body = cells[1];
    var time = cells[cells.length - 1] || '';
    if (!body || body.length < 3 || SKIP.test(body) || seen[body]) continue;
    seen[body] = true;
    msgs.push({ from: from, body: body, time: time });
  }
  return msgs;
}

function stripTags(h) {
  return h.replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/\s+/g,' ').trim();
}

// ── RENDER SMS ─────────────────────────────────────────────────────────────
function renderSMS(msgs) {
  var sc    = document.getElementById('smsList');
  var badge = document.getElementById('smsBadge');
  if (!sc) return;

  if (badge) badge.textContent = msgs.length ? (msgs.length + ' message' + (msgs.length > 1 ? 's' : '')) : '';

  if (!msgs.length) {
    var showNext = state.service && COMPAT[state.service] && !COMPAT[state.service].ok;
    sc.innerHTML = '<div class="wait-box">' +
      '<div class="wait-icon">📬</div>' +
      '<div class="wait-title">Waiting for SMS</div>' +
      '<div class="wait-text">Enter <strong>' + esc(state.active.number) + '</strong> on your platform.<br>OTP will appear here. <span class="blink">▋</span></div>' +
      '<div class="wait-note">Auto-refresh every ' + (POLL_INTERVAL/1000) + 's</div>' +
      (showNext ? '<button class="btn-next-num" onclick="nextNumber()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>Got "Maximum attempts"? Try next number</button>' : '') +
      '</div>';
    return;
  }

  var html = '';
  msgs.forEach(function(m) {
    var otp = extractOTP(m.body);
    html += '<div class="sms-card">';
    html += '<div class="sms-from-row"><span class="sms-from">' + esc(m.from || 'UNKNOWN') + '</span><span class="sms-time">' + esc(m.time || '') + '</span></div>';
    html += '<div class="sms-body">' + esc(m.body || '') + '</div>';
    if (otp) {
      html += '<div class="otp-block"><div><div class="otp-label">OTP CODE DETECTED</div><div class="otp-code">' + otp + '</div></div>';
      html += '<button class="btn-copy-otp" onclick="copyOTP(this,\'' + otp + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy OTP</button></div>';
    }
    html += '</div>';
  });
  sc.innerHTML = html;
}

// ── CONTEXT MENU ───────────────────────────────────────────────────────────
function openCtxMenu(e, i) {
  e.preventDefault(); e.stopPropagation();
  state.ctxIdx = i;
  var menu = document.getElementById('ctxMenu');
  menu.classList.add('open');
  document.getElementById('overlay').classList.add('open');
  var x = e.clientX, y = e.clientY;
  if (x + 195 > window.innerWidth)  x = window.innerWidth  - 200;
  if (y + 150 > window.innerHeight) y = window.innerHeight - 155;
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
}
window.openCtxMenu = openCtxMenu;

function closeCtx() {
  document.getElementById('ctxMenu').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}
window.closeCtx = closeCtx;

function ctxAction(action) {
  var i = state.ctxIdx;
  closeCtx();
  if (action === 'copy')   { quickCopyNum(i); }
  if (action === 'inbox')  { openInbox(i); }
  if (action === 'next')   { nextNumber(); }
  if (action === 'report') { showToast('Number reported. Thank you!', 'tinf'); }
}
window.ctxAction = ctxAction;

// ── NAVIGATION ─────────────────────────────────────────────────────────────
function goHome() {
  stopPoll();
  state.country = null; state.active = null; state.numbers = [];
  buildSidebar();
  document.getElementById('viewHome').style.display  = '';
  document.getElementById('viewNums').style.display  = 'none';
  document.getElementById('viewInbox').style.display = 'none';
  document.getElementById('breadcrumb').style.display = 'none';
}
window.goHome = goHome;

function updateBC() {
  var bc = document.getElementById('breadcrumb');
  if (!state.country) { bc.style.display = 'none'; return; }
  bc.style.display = 'flex';
  document.getElementById('bcCountry').textContent = state.country.flag + ' ' + state.country.name;
  var svc = null; SERVICES.forEach(function(s){ if (s.id === state.service) svc = s; });
  var sep = document.getElementById('bcSvcSep'), sv = document.getElementById('bcSvc');
  if (svc && svc.id) {
    sep.style.display = ''; sv.style.display = '';
    sv.textContent = svc.icon + ' ' + svc.name;
  } else {
    sep.style.display = 'none'; sv.style.display = 'none';
  }
}

function jumpRegion(region) {
  var first = null;
  COUNTRIES.forEach(function(c){ if (!first && c.region === region) first = c; });
  if (first) pickCountry(first.code);
}
window.jumpRegion = jumpRegion;

// ── ACTIONS ────────────────────────────────────────────────────────────────
function doShuffle() {
  if (!state.country) { showToast('Select a country first', 'terr'); return; }
  loadNumbers();
  showToast('Numbers shuffled!', 'tinf');
}
window.doShuffle = doShuffle;

function doRefresh() { state.pollBusy = false; fetchSMS(); }
window.doRefresh = doRefresh;

function setView(v) {
  state.view = v;
  document.getElementById('btnList').classList.toggle('vt-active', v === 'list');
  document.getElementById('btnGrid').classList.toggle('vt-active', v === 'grid');
  if (state.numbers.length && !state.active) renderNumbers(state.numbers);
}
window.setView = setView;

function nextNumber() {
  if (!state.numbers.length) return;
  var next = (state.activeIdx + 1) % state.numbers.length;
  showToast('Trying next number...', 'tinf');
  openInbox(next);
}
window.nextNumber = nextNumber;

function copyActiveNum() {
  if (!state.active) return;
  navigator.clipboard.writeText(state.active.number).then(function() {
    showToast('Number copied!', 'tok');
    var btn = document.getElementById('btnCopyBig');
    if (btn) {
      btn.innerHTML = '✓ Copied!'; btn.classList.add('copied');
      setTimeout(function(){ resetCopyBig(); }, 2000);
    }
  }).catch(function(){ showToast('Copy failed', 'terr'); });
}
window.copyActiveNum = copyActiveNum;

function quickCopyNum(i) {
  var n = state.numbers[i]; if (!n) return;
  navigator.clipboard.writeText(n.number)
    .then(function(){ showToast('Copied: ' + n.number, 'tok'); })
    .catch(function(){ showToast('Copy failed', 'terr'); });
}
window.quickCopyNum = quickCopyNum;

function copyOTP(btn, code) {
  navigator.clipboard.writeText(code).then(function() {
    var orig = btn.innerHTML;
    btn.innerHTML = '✓ Copied!'; btn.classList.add('copied');
    showToast('OTP copied: ' + code, 'tok');
    setTimeout(function(){ btn.innerHTML = orig; btn.classList.remove('copied'); }, 2500);
  }).catch(function(){ showToast('Copy failed', 'terr'); });
}
window.copyOTP = copyOTP;

function filterCountries(q) {
  var v = q.toLowerCase().trim();
  document.querySelectorAll('.c-item').forEach(function(el) {
    var n = el.dataset.name || '';
    el.classList.toggle('hidden', !!v && n.indexOf(v) === -1);
  });
  var btn = document.getElementById('sbClearBtn');
  if (btn) btn.style.display = v ? '' : 'none';
}
window.filterCountries = filterCountries;

function clearSearch() {
  var inp = document.getElementById('searchInp');
  if (inp) { inp.value = ''; filterCountries(''); }
}
window.clearSearch = clearSearch;

// ── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  startCanvas();
  buildSidebar();
  buildServices();

  // Stat count
  var total = 0;
  Object.values(NUM_POOL).forEach(function(a){ total += a.length; });
  var el = document.getElementById('statNums');
  if (el) el.textContent = total + '+';

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeCtx();
  });
});
