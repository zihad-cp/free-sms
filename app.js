/* NexaSMS — app.js Production v9 */
'use strict';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const W   = 'https://sms-proxy.mojahidulislamzihad686.workers.dev';
const PMS = 15000; // Poll interval ms

// ─── DATA ──────────────────────────────────────────────────────────────────
const COUNTRIES = [
  {code:'ID',flag:'🇮🇩',name:'Indonesia',    region:'Asia'},
  {code:'TH',flag:'🇹🇭',name:'Thailand',     region:'Asia'},
  {code:'VN',flag:'🇻🇳',name:'Vietnam',      region:'Asia'},
  {code:'PH',flag:'🇵🇭',name:'Philippines',  region:'Asia'},
  {code:'MY',flag:'🇲🇾',name:'Malaysia',     region:'Asia'},
  {code:'KH',flag:'🇰🇭',name:'Cambodia',     region:'Asia'},
  {code:'IN',flag:'🇮🇳',name:'India',        region:'Asia'},
  {code:'KZ',flag:'🇰🇿',name:'Kazakhstan',   region:'Asia'},
  {code:'US',flag:'🇺🇸',name:'United States',region:'Americas'},
  {code:'CA',flag:'🇨🇦',name:'Canada',       region:'Americas'},
  {code:'MX',flag:'🇲🇽',name:'Mexico',       region:'Americas'},
  {code:'BR',flag:'🇧🇷',name:'Brazil',       region:'Americas'},
  {code:'AR',flag:'🇦🇷',name:'Argentina',    region:'Americas'},
  {code:'GB',flag:'🇬🇧',name:'United Kingdom',region:'Europe'},
  {code:'DE',flag:'🇩🇪',name:'Germany',      region:'Europe'},
  {code:'FR',flag:'🇫🇷',name:'France',       region:'Europe'},
  {code:'SE',flag:'🇸🇪',name:'Sweden',       region:'Europe'},
  {code:'NO',flag:'🇳🇴',name:'Norway',       region:'Europe'},
  {code:'NL',flag:'🇳🇱',name:'Netherlands',  region:'Europe'},
  {code:'PL',flag:'🇵🇱',name:'Poland',       region:'Europe'},
  {code:'UA',flag:'🇺🇦',name:'Ukraine',      region:'Europe'},
  {code:'RU',flag:'🇷🇺',name:'Russia',       region:'Europe'},
  {code:'AU',flag:'🇦🇺',name:'Australia',    region:'Oceania'},
  {code:'ZA',flag:'🇿🇦',name:'South Africa', region:'Africa'},
  {code:'NG',flag:'🇳🇬',name:'Nigeria',      region:'Africa'},
];

const SERVICES = [
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

// ─── STATE ─────────────────────────────────────────────────────────────────
const S = {
  country:  null,
  service:  null,
  numbers:  [],
  active:   null,
  pollTmr:  null,
  busy:     false,
  view:     'list',
  ctxIdx:   -1,
};

// ─── CANVAS ────────────────────────────────────────────────────────────────
function initCanvas() {
  const cv = document.getElementById('bgc');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const resize = () => { cv.width=window.innerWidth; cv.height=window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  const N = 50;
  const pts = Array.from({length:N}, () => ({
    x: Math.random()*cv.width,   y: Math.random()*cv.height,
    vx: (Math.random()-.5)*.2,   vy: (Math.random()-.5)*.2,
    r: Math.random()*1.2+.3,
    c: ['#6366f1','#818cf8','#22c55e','#a5b4fc'][Math.floor(Math.random()*4)],
  }));

  const D = 110;
  (function draw() {
    ctx.clearRect(0,0,cv.width,cv.height);
    for (const p of pts) {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=cv.width;  if(p.x>cv.width)p.x=0;
      if(p.y<0)p.y=cv.height; if(p.y>cv.height)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c; ctx.globalAlpha=.45; ctx.fill();
    }
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<D){
        ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=pts[i].c; ctx.globalAlpha=(1-d/D)*.07;
        ctx.lineWidth=.5; ctx.stroke();
      }
    }
    ctx.globalAlpha=1;
    requestAnimationFrame(draw);
  })();
}

// ─── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  buildSidebar();
  buildSvcChips();
  initCtxMenu();
  loadStats();
  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAll(); }
  });
});

// ─── STATS ─────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const r = await timedFetch(`${W}/countries`, 8000);
    const d = await r.json();
    const t = d.total || d.countries?.reduce((s,c)=>s+c.count,0) || 0;
    const e1 = document.getElementById('onlineText');
    const e2 = document.getElementById('hsNums');
    if (e1) e1.textContent = `${t}+ numbers online`;
    if (e2) e2.textContent = `${t}+`;
  } catch(_) {}
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────
function buildSidebar() {
  const regions = [...new Set(COUNTRIES.map(c=>c.region))];
  const el = document.getElementById('sbList');
  el.innerHTML = regions.map(r => `
    <div class="sb-region">${r}</div>
    ${COUNTRIES.filter(c=>c.region===r).map(c=>`
      <div class="ci${S.country?.code===c.code?' active':''}"
           id="ci_${c.code}"
           data-name="${c.name.toLowerCase()} ${r.toLowerCase()}"
           onclick="pickCountry('${c.code}')">
        <span class="ci-flag">${c.flag}</span>
        <div class="ci-label"><div class="ci-name">${c.name}</div></div>
        <span class="ci-arrow">›</span>
      </div>
    `).join('')}
  `).join('');
}

window.filterC = q => {
  const v = q.toLowerCase().trim();
  document.querySelectorAll('.ci').forEach(el =>
    el.classList.toggle('ci-hidden', !!v && !el.dataset.name.includes(v))
  );
  document.querySelector('.sb-close').style.display = v ? '' : 'none';
};

window.clearCSearch = () => {
  const inp = document.getElementById('cInp');
  if (inp) { inp.value=''; filterC(''); }
};

window.jumpRegion = region => {
  const first = COUNTRIES.find(c=>c.region===region);
  if (first) pickCountry(first.code);
};

// ─── SERVICE CHIPS ─────────────────────────────────────────────────────────
function buildSvcChips() {
  document.getElementById('svcChips').innerHTML = SERVICES.map(s => `
    <button class="sc${S.service===s.id?' on':''}"
            onclick="setSvc(${JSON.stringify(s.id)}, this)">
      ${s.icon?s.icon+' ':''}${s.name}
    </button>`).join('');
}

window.setSvc = (id, btn) => {
  S.service = id;
  document.querySelectorAll('.sc').forEach(b=>b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  updateBcSvc();
  // If in inbox, just update meta; otherwise re-render numbers
  if (S.active) {
    const meta = document.getElementById('ivMeta');
    if (meta) meta.textContent = svcMeta();
  } else if (S.numbers.length) {
    renderNumbers(S.numbers);
  }
};

function svcMeta() {
  const svc = S.service ? SERVICES.find(s=>s.id===S.service) : null;
  const c = S.country;
  return `${c?.flag||''} ${c?.name||''}`+(svc?` · ${svc.icon} ${svc.name}`:'');
}

// ─── BREADCRUMB ─────────────────────────────────────────────────────────────
function updateBc() {
  const bc = document.getElementById('bc');
  const bcC = document.getElementById('bcC');
  const bcSA = document.getElementById('bcSA');
  const bcS  = document.getElementById('bcS');
  if (!bc) return;

  if (!S.country) { bc.style.display='none'; return; }
  bc.style.display = 'flex';
  bcC.textContent = `${S.country.flag} ${S.country.name}`;
  updateBcSvc();
}

function updateBcSvc() {
  const bcSA = document.getElementById('bcSA');
  const bcS  = document.getElementById('bcS');
  if (!bcSA||!bcS) return;
  const svc = S.service ? SERVICES.find(s=>s.id===S.service) : null;
  if (svc && svc.id) {
    bcSA.style.display=''; bcS.style.display='';
    bcS.textContent = `${svc.icon} ${svc.name}`;
  } else {
    bcSA.style.display='none'; bcS.style.display='none';
  }
}

// ─── PICK COUNTRY ──────────────────────────────────────────────────────────
window.pickCountry = code => {
  S.country = COUNTRIES.find(c=>c.code===code);
  if (!S.country) return;

  // Update sidebar
  document.querySelectorAll('.ci').forEach(el=>el.classList.remove('active'));
  const el = document.getElementById('ci_'+code);
  if (el) { el.classList.add('active'); el.scrollIntoView({block:'nearest'}); }

  updateBc();
  closeInbox();
  showNumsView();
  fetchNums();
};

// ─── FETCH NUMBERS ─────────────────────────────────────────────────────────
async function fetchNums() {
  const list = document.getElementById('numsList');
  list.innerHTML = [68,56,50,56,60].map((h,i)=>
    `<div class="shim" style="height:${h}px;opacity:${1-i*0.18}"></div>`).join('');
  document.getElementById('nvTitle').textContent = `${S.country.flag} ${S.country.name}`;
  document.getElementById('nvBadge').textContent = '';

  const btn = document.getElementById('shuffleBtn');
  if (btn) btn.disabled = true;

  try {
    const r = await timedFetch(`${W}/numbers/${S.country.code}`, 13000);
    if (!r.ok) throw new Error(`Server error ${r.status}`);
    const d = await r.json();
    if (!d.ok || !Array.isArray(d.numbers) || !d.numbers.length)
      throw new Error('No numbers available right now');

    S.numbers = d.numbers;
    renderNumbers(S.numbers);
    document.getElementById('nvBadge').textContent = `${d.numbers.length} numbers`;

  } catch(e) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <h3>Could not load numbers</h3>
        <p>${xe(e.message)}</p>
        <br>
        <button class="tb-btn" onclick="fetchNums()" style="margin:0 auto">↻ Retry</button>
      </div>`;
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ─── RENDER NUMBERS ────────────────────────────────────────────────────────
function renderNumbers(nums) {
  const list = document.getElementById('numsList');
  if (!nums.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">📵</div><h3>No numbers</h3><p>Try another country or shuffle.</p></div>`;
    return;
  }

  const isGrid = S.view === 'grid';
  list.className = 'nums-list' + (isGrid?' gv':'');

  const svc = S.service ? SERVICES.find(s=>s.id===S.service) : null;
  const metaTxt = `${S.country.flag} ${S.country.name}${svc?` · ${svc.icon} ${svc.name}`:''}`;

  list.innerHTML = nums.map((n,i) => `
    <div class="nr${S.active?.number===n.number?' active':''}" id="nr_${i}" onclick="openInbox(${i})">
      <div class="nr-main">
        <span class="nr-flag">${n.flag||S.country.flag}</span>
        <div class="nr-info">
          <div class="nr-num">${xe(n.number)}</div>
          <div class="nr-meta">${metaTxt}</div>
        </div>
        <div class="nr-status">
          <span class="nr-online"><span class="nr-odot"></span>Online</span>
        </div>
      </div>
      <div class="nr-acts">
        <button class="nr-copy" onclick="event.stopPropagation();doCopyNum(${i})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </button>
        <button class="nr-menu" onclick="event.stopPropagation();openCtx(event,${i})" title="More">
          &#x22EF;
        </button>
      </div>
    </div>`).join('');
}

// ─── SHUFFLE ───────────────────────────────────────────────────────────────
window.doShuffle = async () => {
  if (!S.country) { toast('Select a country first','err'); return; }
  await fetchNums();
  toast('Numbers shuffled!','inf');
};

// ─── VIEW ──────────────────────────────────────────────────────────────────
window.setView = v => {
  S.view = v;
  document.getElementById('vbList').classList.toggle('active', v==='list');
  document.getElementById('vbGrid').classList.toggle('active', v==='grid');
  if (S.numbers.length && !S.active) renderNumbers(S.numbers);
};

// ─── OPEN INBOX ────────────────────────────────────────────────────────────
window.openInbox = i => {
  S.active = S.numbers[i];
  if (!S.active) return;
  stopPoll();

  // Highlight row
  document.querySelectorAll('.nr').forEach(r=>r.classList.remove('active'));
  const row = document.getElementById('nr_'+i);
  if (row) row.classList.add('active');

  // Fill header
  document.getElementById('ivNum').textContent  = S.active.number;
  document.getElementById('ivMeta').textContent = svcMeta();
  document.getElementById('nbVal').textContent  = S.active.number;

  // Show inbox
  document.getElementById('inboxView').style.display = '';
  document.getElementById('smsBadge').textContent    = '';
  document.getElementById('smsCont').innerHTML = shimHTML(2);

  // Reset copy button
  const cb = document.getElementById('copyBigBtn');
  if (cb) { cb.innerHTML=`<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Number`; cb.classList.remove('copied'); }

  // Scroll to inbox on mobile
  document.getElementById('inboxView').scrollIntoView({behavior:'smooth', block:'nearest'});

  // Fetch & poll
  doFetch();
  S.pollTmr = setInterval(doFetch, PMS);
};

window.closeInbox = () => {
  stopPoll();
  S.active = null;
  document.querySelectorAll('.nr').forEach(r=>r.classList.remove('active'));
  document.getElementById('inboxView').style.display = 'none';
};

window.openSrc = () => {
  if (!S.active) return;
  window.open(S.active.smsUrl || `https://sms24.me/en/numbers/${S.active.number.replace('+','')}`, '_blank');
};

// ─── COPY ──────────────────────────────────────────────────────────────────
window.copyActive = () => {
  if (!S.active) return;
  navigator.clipboard.writeText(S.active.number).then(() => {
    toast('Number copied!', 'ok');
    const cb = document.getElementById('copyBigBtn');
    if (cb) {
      cb.innerHTML = '✓ Copied!'; cb.classList.add('copied');
      setTimeout(()=>{
        cb.innerHTML = `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Number`;
        cb.classList.remove('copied');
      }, 2000);
    }
    // Also update inbox header copy button
    const ib = document.querySelector('.iv-btn-primary');
    if (ib) { const o=ib.innerHTML; ib.innerHTML='✓ Copied'; setTimeout(()=>{ib.innerHTML=o;},2000); }
  }).catch(()=>toast('Copy failed','err'));
};

window.doCopyNum = i => {
  const n = S.numbers[i];
  if (!n) return;
  navigator.clipboard.writeText(n.number).then(()=>toast('Copied: '+n.number,'ok'))
    .catch(()=>toast('Failed','err'));
};

window.triggerRefresh = () => { S.busy=false; doFetch(); };

// ─── FETCH SMS ─────────────────────────────────────────────────────────────
async function doFetch() {
  if (S.busy || !S.active) return;
  S.busy = true;

  const rb  = document.getElementById('ivRefresh');
  const ri  = document.getElementById('ivRefIcon');
  if (rb) rb.disabled = true;
  if (ri) ri.classList.add('spin');

  try {
    const r = await timedFetch(`${W}/sms/${encodeURIComponent(S.active.number)}`, 18000);
    if (!r.ok) throw new Error('HTTP '+r.status);
    const d = await r.json();
    const msgs = Array.isArray(d.messages) ? d.messages : [];
    renderSMS(msgs);
  } catch(e) {
    const sc = document.getElementById('smsCont');
    if (sc) sc.innerHTML = `
      <div class="wait-box">
        <div class="wb-title">Could not load SMS</div>
        <div class="wb-sub">${xe(e.message)}</div>
        <button class="tb-btn" onclick="triggerRefresh()" style="margin:10px auto 0">↻ Retry</button>
        <br>
        <a href="${S.active?.smsUrl||'#'}" target="_blank" rel="noopener" class="src-link">
          <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          View on sms24.me
        </a>
      </div>`;
  } finally {
    S.busy = false;
    if (rb) rb.disabled = false;
    if (ri) ri.classList.remove('spin');
  }
}

// ─── RENDER SMS ────────────────────────────────────────────────────────────
function renderSMS(msgs) {
  const sc = document.getElementById('smsCont');
  const badge = document.getElementById('smsBadge');
  if (!sc || !S.active) return;

  if (badge) {
    badge.textContent = msgs.length ? `${msgs.length} message${msgs.length>1?'s':''}` : '';
  }

  if (!msgs.length) {
    sc.innerHTML = `
      <div class="wait-box">
        <div class="wb-ico">📬</div>
        <div class="wb-title">Waiting for SMS</div>
        <div class="wb-sub">
          Enter <b>${xe(S.active.number)}</b> on your platform, then wait here.<br>
          Your OTP will appear automatically. <span class="blink">▋</span>
        </div>
        <div class="wb-note">Auto-refreshing every ${PMS/1000}s</div>
      </div>
      <a href="${S.active.smsUrl}" target="_blank" rel="noopener" class="src-link" style="display:flex;margin:0">
        <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Open inbox on sms24.me →
      </a>`;
    return;
  }

  sc.innerHTML = msgs.map(m => {
    const otp = extractOTP(m.body);
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
              <div class="otp-label">OTP CODE DETECTED</div>
              <div class="otp-digits">${otp}</div>
            </div>
            <button class="otp-copy" onclick="copyOTP(this,'${otp}')">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy OTP
            </button>
          </div>` : ''}
      </div>`;
  }).join('');
}

window.copyOTP = (btn, code) => {
  navigator.clipboard.writeText(code).then(()=>{
    const o=btn.innerHTML;
    btn.innerHTML='✓ Copied!'; btn.classList.add('copied');
    toast('OTP copied: '+code, 'ok');
    setTimeout(()=>{btn.innerHTML=o; btn.classList.remove('copied');},2500);
  }).catch(()=>toast('Copy failed','err'));
};

// ─── CONTEXT MENU ──────────────────────────────────────────────────────────
function initCtxMenu() {
  document.getElementById('ctx-copy').onclick = () => { doCopyNum(S.ctxIdx); closeAll(); };
  document.getElementById('ctx-inbox').onclick = () => { openInbox(S.ctxIdx); closeAll(); };
  document.getElementById('ctx-ext').onclick = () => {
    const n = S.numbers[S.ctxIdx];
    if (n) window.open(n.smsUrl,'_blank');
    closeAll();
  };
  document.getElementById('ctx-report').onclick = () => {
    toast('Number reported. Thank you!','inf');
    closeAll();
  };
}

window.openCtx = (e, i) => {
  e.preventDefault(); e.stopPropagation();
  S.ctxIdx = i;
  const menu = document.getElementById('ctxMenu');
  menu.classList.add('show');
  document.getElementById('overlay').classList.add('show');

  // Position smart
  let x=e.clientX, y=e.clientY;
  const mw=188, mh=152;
  if (x+mw>window.innerWidth)  x=window.innerWidth-mw-10;
  if (y+mh>window.innerHeight) y=window.innerHeight-mh-10;
  menu.style.left=x+'px'; menu.style.top=y+'px';
};

window.closeAll = () => {
  document.getElementById('ctxMenu')?.classList.remove('show');
  document.getElementById('overlay')?.classList.remove('show');
};

// ─── NAVIGATION ────────────────────────────────────────────────────────────
window.goHome = () => {
  stopPoll();
  S.country=null; S.active=null; S.numbers=[];
  document.querySelectorAll('.ci').forEach(el=>el.classList.remove('active'));
  document.getElementById('homeView').style.display  = '';
  document.getElementById('numsView').style.display  = 'none';
  document.getElementById('inboxView').style.display = 'none';
  document.getElementById('bc').style.display        = 'none';
};

function showNumsView() {
  document.getElementById('homeView').style.display  = 'none';
  document.getElementById('numsView').style.display  = '';
  document.getElementById('inboxView').style.display = 'none';
}

// ─── UTILS ─────────────────────────────────────────────────────────────────
function extractOTP(t) {
  const m = (t||'').match(/\b(\d{4,8})\b/);
  return m ? m[1] : null;
}

function xe(s) {
  return String(s||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function shimHTML(n) {
  return Array.from({length:n},(_,i)=>
    `<div class="shim" style="height:${64-i*6}px;opacity:${1-i*.25}"></div>`).join('');
}

async function timedFetch(url, ms) {
  const c = new AbortController();
  const t = setTimeout(()=>c.abort(), ms);
  try {
    const r = await fetch(url, {signal:c.signal});
    clearTimeout(t); return r;
  } catch(e) {
    clearTimeout(t);
    throw e.name==='AbortError' ? new Error('Request timed out') : e;
  }
}

function stopPoll() {
  if (S.pollTmr) { clearInterval(S.pollTmr); S.pollTmr=null; }
  S.busy = false;
}

// Toast system
function toast(msg, type='inf') {
  const wrap = document.getElementById('toasts');
  const icons = {ok:'✅', err:'❌', inf:'ℹ️'};
  const el = document.createElement('div');
  el.className = `t t-${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${xe(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(), 4500);
}

// ─── EXPOSE ────────────────────────────────────────────────────────────────
Object.assign(window, {
  filterC, clearCSearch, jumpRegion,
  setSvc, pickCountry, doShuffle, setView,
  openInbox, closeInbox, openSrc, copyActive,
  doCopyNum, triggerRefresh, copyOTP,
  openCtx, closeAll, goHome,
});
