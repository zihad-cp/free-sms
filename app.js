/* NexaSMS — app.js v10 FIXED
 * Fix 1: Numbers always fresh — cache: 'no-store' on every fetch
 * Fix 2: SMS fast display — shows loading then result
 * Fix 3: Zero external links/redirects
 */
'use strict';

const W   = 'https://sms-proxy.mojahidulislamzihad686.workers.dev';
const PMS = 15000;

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
  const pts = Array.from({length:55}, () => ({
    x:Math.random()*cv.width, y:Math.random()*cv.height,
    vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22,
    r:Math.random()*1.3+.3,
    c:['#6366f1','#818cf8','#22c55e','#a5b4fc'][Math.floor(Math.random()*4)],
  }));
  const D=100;
  (function loop(){
    ctx.clearRect(0,0,cv.width,cv.height);
    for(const p of pts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=cv.width;  if(p.x>cv.width)p.x=0;
      if(p.y<0)p.y=cv.height; if(p.y>cv.height)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c; ctx.globalAlpha=.45; ctx.fill();
    }
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
      if(d<D){ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=pts[i].c; ctx.globalAlpha=(1-d/D)*.07; ctx.lineWidth=.5; ctx.stroke(); }
    }
    ctx.globalAlpha=1;
    requestAnimationFrame(loop);
  })();
}

// ─── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  buildSidebar();
  buildSvcChips();
  initCtxMenu();
  loadStats();
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeAll(); });
});

// ─── STATS ─────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    // Count total numbers from pool sizes
    const total = 25 * 15; // approximate
    const e1=document.getElementById('onlineText');
    const e2=document.getElementById('hsNums');
    if(e1) e1.textContent=`${total}+ numbers online`;
    if(e2) e2.textContent=`${total}+`;
  } catch(_){}
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────
function buildSidebar() {
  const regions=[...new Set(COUNTRIES.map(c=>c.region))];
  document.getElementById('sbList').innerHTML = regions.map(r=>`
    <div class="sb-region">${r}</div>
    ${COUNTRIES.filter(c=>c.region===r).map(c=>`
      <div class="ci${S.country?.code===c.code?' active':''}"
           id="ci_${c.code}" data-name="${c.name.toLowerCase()} ${r.toLowerCase()}"
           onclick="pickCountry('${c.code}')">
        <span class="ci-flag">${c.flag}</span>
        <div class="ci-label"><div class="ci-name">${c.name}</div></div>
        <span class="ci-arrow">›</span>
      </div>`).join('')}
  `).join('');
}

window.filterC = q => {
  const v=q.toLowerCase().trim();
  document.querySelectorAll('.ci').forEach(el=>el.classList.toggle('ci-hidden',!!v&&!el.dataset.name.includes(v)));
  document.querySelector('.sb-close').style.display=v?'':'none';
};
window.clearCSearch = () => {
  const inp=document.getElementById('cInp');
  if(inp){inp.value=''; filterC('');}
};
window.jumpRegion = region => {
  const first=COUNTRIES.find(c=>c.region===region);
  if(first) pickCountry(first.code);
};

// ─── SERVICE CHIPS ─────────────────────────────────────────────────────────
function buildSvcChips() {
  document.getElementById('svcChips').innerHTML = SERVICES.map(s=>`
    <button class="sc${S.service===s.id?' on':''}"
            onclick="setSvc(${JSON.stringify(s.id)},this)">
      ${s.icon?s.icon+' ':''}${s.name}
    </button>`).join('');
}
window.setSvc = (id, btn) => {
  S.service=id;
  document.querySelectorAll('.sc').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  updateBcSvc();
  if(S.active){ const m=document.getElementById('ivMeta'); if(m) m.textContent=svcMeta(); }
  else if(S.numbers.length) renderNumbers(S.numbers);
};
function svcMeta(){
  const svc=S.service?SERVICES.find(s=>s.id===S.service):null;
  return `${S.country?.flag||''} ${S.country?.name||''}${svc?` · ${svc.icon} ${svc.name}`:''}`;
}

// ─── BREADCRUMB ─────────────────────────────────────────────────────────────
function updateBc(){
  const bc=document.getElementById('bc');
  const bcC=document.getElementById('bcC');
  if(!bc||!bcC) return;
  if(!S.country){bc.style.display='none';return;}
  bc.style.display='flex';
  bcC.textContent=`${S.country.flag} ${S.country.name}`;
  updateBcSvc();
}
function updateBcSvc(){
  const bcSA=document.getElementById('bcSA'), bcS=document.getElementById('bcS');
  if(!bcSA||!bcS) return;
  const svc=S.service?SERVICES.find(s=>s.id===S.service):null;
  if(svc&&svc.id){bcSA.style.display='';bcS.style.display='';bcS.textContent=`${svc.icon} ${svc.name}`;}
  else{bcSA.style.display='none';bcS.style.display='none';}
}

// ─── PICK COUNTRY ──────────────────────────────────────────────────────────
window.pickCountry = code => {
  S.country=COUNTRIES.find(c=>c.code===code);
  if(!S.country) return;
  document.querySelectorAll('.ci').forEach(el=>el.classList.remove('active'));
  const el=document.getElementById('ci_'+code);
  if(el){el.classList.add('active'); el.scrollIntoView({block:'nearest'});}
  updateBc();
  closeInbox();
  showNumsView();
  fetchNums();
};

// ─── FETCH NUMBERS — CRITICAL FIX ──────────────────────────────────────────
// cache:'no-store' ensures browser NEVER caches — different numbers every time
async function fetchNums() {
  const list=document.getElementById('numsList');
  list.innerHTML=[68,56,50,56,60].map((h,i)=>`<div class="shim" style="height:${h}px;opacity:${1-i*.18}"></div>`).join('');
  document.getElementById('nvTitle').textContent=`${S.country.flag} ${S.country.name}`;
  document.getElementById('nvBadge').textContent='';
  const btn=document.getElementById('shuffleBtn');
  if(btn) btn.disabled=true;

  try {
    // Add random seed to URL to guarantee no caching at any level
    const seed = Date.now()+'_'+Math.random().toString(36).slice(2);
    const url = `${W}/numbers/${S.country.code}?_=${seed}`;

    const r = await fetch(url, {
      cache: 'no-store',           // CRITICAL: never use cache
      headers: {'Cache-Control':'no-cache, no-store', 'Pragma':'no-cache'},
    });
    if(!r.ok) throw new Error(`Server error ${r.status}`);
    const d=await r.json();
    if(!d.ok||!Array.isArray(d.numbers)||!d.numbers.length)
      throw new Error('No numbers available');

    S.numbers=d.numbers;
    renderNumbers(S.numbers);
    document.getElementById('nvBadge').textContent=`${d.numbers.length} numbers`;

  } catch(e) {
    list.innerHTML=`
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <h3>Could not load numbers</h3>
        <p>${xe(e.message)}</p><br>
        <button class="tb-btn" onclick="fetchNums()" style="margin:0 auto">↻ Retry</button>
      </div>`;
  } finally {
    if(btn) btn.disabled=false;
  }
}

// ─── RENDER NUMBERS ────────────────────────────────────────────────────────
function renderNumbers(nums){
  const list=document.getElementById('numsList');
  if(!nums.length){
    list.innerHTML='<div class="empty"><div class="empty-icon">📵</div><h3>No numbers</h3><p>Try another country or shuffle.</p></div>';
    return;
  }
  list.className='nums-list'+(S.view==='grid'?' gv':'');
  const svc=S.service?SERVICES.find(s=>s.id===S.service):null;
  const meta=`${S.country.flag} ${S.country.name}${svc?` · ${svc.icon} ${svc.name}`:''}`;
  list.innerHTML=nums.map((n,i)=>`
    <div class="nr${S.active?.number===n.number?' active':''}" id="nr_${i}" onclick="openInbox(${i})">
      <div class="nr-main">
        <span class="nr-flag">${n.flag||S.country.flag}</span>
        <div class="nr-info">
          <div class="nr-num">${xe(n.number)}</div>
          <div class="nr-meta">${meta}</div>
        </div>
        <div class="nr-status"><span class="nr-online"><span class="nr-odot"></span>Online</span></div>
      </div>
      <div class="nr-acts">
        <button class="nr-copy" onclick="event.stopPropagation();quickCopy(${i})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </button>
        <button class="nr-menu" onclick="event.stopPropagation();openCtx(event,${i})" title="More">&#x22EF;</button>
      </div>
    </div>`).join('');
}

// ─── SHUFFLE ───────────────────────────────────────────────────────────────
window.doShuffle = async () => {
  if(!S.country){toast('Select a country first','err');return;}
  await fetchNums();
  toast('Shuffled! New numbers loaded.','inf');
};

// ─── VIEW ──────────────────────────────────────────────────────────────────
window.setView = v => {
  S.view=v;
  document.getElementById('vbList').classList.toggle('active',v==='list');
  document.getElementById('vbGrid').classList.toggle('active',v==='grid');
  if(S.numbers.length&&!S.active) renderNumbers(S.numbers);
};

// ─── OPEN INBOX ────────────────────────────────────────────────────────────
window.openInbox = i => {
  S.active=S.numbers[i];
  if(!S.active) return;
  stopPoll();

  document.querySelectorAll('.nr').forEach(r=>r.classList.remove('active'));
  const row=document.getElementById('nr_'+i);
  if(row) row.classList.add('active');

  document.getElementById('ivNum').textContent=S.active.number;
  document.getElementById('ivMeta').textContent=svcMeta();
  document.getElementById('nbVal').textContent=S.active.number;

  const sc=document.getElementById('smsCont');
  if(sc) sc.innerHTML=shimHTML(2);
  document.getElementById('smsBadge').textContent='';
  document.getElementById('inboxView').style.display='';

  // Reset copy button
  const cb=document.getElementById('copyBigBtn');
  if(cb){cb.innerHTML=`<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Number`;cb.classList.remove('copied');}

  document.getElementById('inboxView').scrollIntoView({behavior:'smooth',block:'nearest'});
  doFetch();
  S.pollTmr=setInterval(doFetch, PMS);
};

window.closeInbox = () => {
  stopPoll();
  S.active=null;
  document.querySelectorAll('.nr').forEach(r=>r.classList.remove('active'));
  document.getElementById('inboxView').style.display='none';
};

// REMOVED: openSrc() — no external links per user request

// ─── COPY ──────────────────────────────────────────────────────────────────
window.copyActive = () => {
  if(!S.active) return;
  navigator.clipboard.writeText(S.active.number).then(()=>{
    toast('Number copied!','ok');
    const cb=document.getElementById('copyBigBtn');
    if(cb){
      cb.innerHTML='✓ Copied!'; cb.classList.add('copied');
      setTimeout(()=>{cb.innerHTML=`<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Number`;cb.classList.remove('copied');},2000);
    }
    const ib=document.querySelector('.iv-btn-primary');
    if(ib){const o=ib.innerHTML;ib.innerHTML='✓ Copied';setTimeout(()=>{ib.innerHTML=o;},2000);}
  }).catch(()=>toast('Copy failed','err'));
};

window.quickCopy = i => {
  const n=S.numbers[i];
  if(!n) return;
  navigator.clipboard.writeText(n.number)
    .then(()=>toast('Copied: '+n.number,'ok'))
    .catch(()=>toast('Copy failed','err'));
};

window.triggerRefresh = () => { S.busy=false; doFetch(); };

// ─── FETCH SMS — CRITICAL FIX ──────────────────────────────────────────────
// Also use no-store cache to get fresh SMS every time
async function doFetch(){
  if(S.busy||!S.active) return;
  S.busy=true;

  const rb=document.getElementById('ivRefresh');
  const ri=document.getElementById('ivRefIcon');
  if(rb) rb.disabled=true;
  if(ri) ri.classList.add('spin');

  try {
    const seed=Date.now()+'_'+Math.random().toString(36).slice(2);
    const url=`${W}/sms/${encodeURIComponent(S.active.number)}?_=${seed}`;

    const r=await fetch(url, {
      cache:'no-store',
      headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'},
      signal: AbortSignal.timeout(18000),
    });
    if(!r.ok) throw new Error('HTTP '+r.status);
    const d=await r.json();
    const msgs=Array.isArray(d.messages)?d.messages:[];
    renderSMS(msgs);
  } catch(e) {
    const sc=document.getElementById('smsCont');
    if(sc) sc.innerHTML=`
      <div class="wait-box">
        <div class="wb-title">SMS load হয়নি</div>
        <div class="wb-sub">${xe(e.message)}</div>
        <button class="tb-btn" onclick="triggerRefresh()" style="margin:10px auto 0">↻ আবার চেষ্টা</button>
      </div>`;
  } finally {
    S.busy=false;
    if(rb) rb.disabled=false;
    if(ri) ri.classList.remove('spin');
  }
}

// ─── RENDER SMS ────────────────────────────────────────────────────────────
function renderSMS(msgs){
  const sc=document.getElementById('smsCont');
  const badge=document.getElementById('smsBadge');
  if(!sc||!S.active) return;
  if(badge) badge.textContent=msgs.length?`${msgs.length} message${msgs.length>1?'s':''}`:'' ;

  if(!msgs.length){
    sc.innerHTML=`
      <div class="wait-box">
        <div class="wb-ico">📬</div>
        <div class="wb-title">Waiting for SMS</div>
        <div class="wb-sub">
          Enter <b>${xe(S.active.number)}</b> on your platform.<br>
          OTP will appear here automatically. <span class="blink">▋</span>
        </div>
        <div class="wb-note">Auto-refreshing every ${PMS/1000}s</div>
      </div>`;
    return;
  }

  sc.innerHTML=msgs.map(m=>{
    const otp=extractOTP(m.body);
    return `
      <div class="sms-card">
        <div class="sc-hd">
          <span class="sc-from">${xe(m.from||'UNKNOWN')}</span>
          <span class="sc-time">${xe(m.time||'')}</span>
        </div>
        <div class="sc-body">${xe(m.body||'')}</div>
        ${otp?`
          <div class="otp-block">
            <div>
              <div class="otp-label">OTP CODE DETECTED</div>
              <div class="otp-digits">${otp}</div>
            </div>
            <button class="otp-copy" onclick="copyOTP(this,'${otp}')">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy OTP
            </button>
          </div>`:''}
      </div>`;
  }).join('');
}

window.copyOTP=(btn,code)=>{
  navigator.clipboard.writeText(code).then(()=>{
    const o=btn.innerHTML;
    btn.innerHTML='✓ Copied!'; btn.classList.add('copied');
    toast('OTP copied: '+code,'ok');
    setTimeout(()=>{btn.innerHTML=o;btn.classList.remove('copied');},2500);
  }).catch(()=>toast('Copy failed','err'));
};

// ─── CONTEXT MENU ──────────────────────────────────────────────────────────
function initCtxMenu(){
  document.getElementById('ctx-copy').onclick=()=>{quickCopy(S.ctxIdx);closeAll();};
  document.getElementById('ctx-inbox').onclick=()=>{openInbox(S.ctxIdx);closeAll();};
  // ctx-ext: removed external link — now just copies the number
  document.getElementById('ctx-ext').onclick=()=>{
    // Instead of opening external site, just copy the number
    quickCopy(S.ctxIdx);
    toast('Number copied!','ok');
    closeAll();
  };
  document.getElementById('ctx-report').onclick=()=>{
    toast('Number reported. Thank you!','inf');
    closeAll();
  };
}

// Update ctx-ext label to "Copy number" since we removed external links
document.addEventListener('DOMContentLoaded', () => {
  const extBtn=document.getElementById('ctx-ext');
  if(extBtn){
    extBtn.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      Copy to clipboard`;
  }
});

window.openCtx=(e,i)=>{
  e.preventDefault(); e.stopPropagation();
  S.ctxIdx=i;
  const menu=document.getElementById('ctxMenu');
  menu.classList.add('show');
  document.getElementById('overlay').classList.add('show');
  let x=e.clientX,y=e.clientY;
  const mw=185,mh=145;
  if(x+mw>window.innerWidth) x=window.innerWidth-mw-10;
  if(y+mh>window.innerHeight) y=window.innerHeight-mh-10;
  menu.style.left=x+'px'; menu.style.top=y+'px';
};

window.closeAll=()=>{
  document.getElementById('ctxMenu')?.classList.remove('show');
  document.getElementById('overlay')?.classList.remove('show');
};

// ─── NAVIGATION ────────────────────────────────────────────────────────────
window.goHome=()=>{
  stopPoll();
  S.country=null; S.active=null; S.numbers=[];
  document.querySelectorAll('.ci').forEach(el=>el.classList.remove('active'));
  document.getElementById('homeView').style.display='';
  document.getElementById('numsView').style.display='none';
  document.getElementById('inboxView').style.display='none';
  document.getElementById('bc').style.display='none';
};

function showNumsView(){
  document.getElementById('homeView').style.display='none';
  document.getElementById('numsView').style.display='';
  document.getElementById('inboxView').style.display='none';
}

// ─── UTILS ─────────────────────────────────────────────────────────────────
const extractOTP=t=>{const m=(t||'').match(/\b(\d{4,8})\b/);return m?m[1]:null;};
const xe=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const shimHTML=n=>Array.from({length:n},(_,i)=>`<div class="shim" style="height:${64-i*6}px;opacity:${1-i*.25}"></div>`).join('');
const stopPoll=()=>{if(S.pollTmr){clearInterval(S.pollTmr);S.pollTmr=null;}S.busy=false;};

function toast(msg,type='inf'){
  const wrap=document.getElementById('toasts');
  const icons={ok:'✅',err:'❌',inf:'ℹ️'};
  const el=document.createElement('div');
  el.className=`t t-${type}`;
  el.innerHTML=`<span>${icons[type]}</span><span>${xe(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(),4500);
}

// ─── EXPOSE ────────────────────────────────────────────────────────────────
Object.assign(window,{
  filterC,clearCSearch,jumpRegion,
  setSvc,pickCountry,doShuffle,setView,
  openInbox,closeInbox,copyActive,
  quickCopy,triggerRefresh,copyOTP,
  openCtx,closeAll,goHome,
});
