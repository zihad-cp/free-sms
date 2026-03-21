/* NexaSMS app.js v11 — Final Fixed */
'use strict';

// Worker URL — only for numbers (shuffle)
const W = 'https://sms-proxy.mojahidulislamzihad686.workers.dev';
// SMS fetch from browser directly — more reliable than worker
const POLL = 15000;

// ── DATA ────────────────────────────────────────────────────────────────────
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

// ── STATE ────────────────────────────────────────────────────────────────────
const S = {
  country:null, svc:null, nums:[], active:null,
  timer:null, busy:false, view:'list', ctxIdx:-1,
};

// ── CANVAS ────────────────────────────────────────────────────────────────────
(function initBG(){
  const cv=document.getElementById('bgc');
  if(!cv) return;
  const ctx=cv.getContext('2d');
  const rsz=()=>{cv.width=innerWidth;cv.height=innerHeight};
  rsz(); addEventListener('resize',rsz);
  const pts=Array.from({length:55},()=>({
    x:Math.random()*cv.width, y:Math.random()*cv.height,
    vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22,
    r:Math.random()*1.3+.3,
    c:['#6366f1','#818cf8','#22c55e','#a5b4fc'][0|Math.random()*4],
  }));
  const D=100;
  (function loop(){
    ctx.clearRect(0,0,cv.width,cv.height);
    for(const p of pts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=cv.width; if(p.x>cv.width)p.x=0;
      if(p.y<0)p.y=cv.height; if(p.y>cv.height)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c; ctx.globalAlpha=.45; ctx.fill();
    }
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<D){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=pts[i].c;ctx.globalAlpha=(1-d/D)*.07;ctx.lineWidth=.5;ctx.stroke();}
    }
    ctx.globalAlpha=1; requestAnimationFrame(loop);
  })();
})();

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  buildSvcs();
  initCtx();
  document.addEventListener('keydown', e => { if(e.key==='Escape') App.closeCtx(); });
});

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function buildSidebar(){
  const regions=[...new Set(COUNTRIES.map(c=>c.region))];
  document.getElementById('sbList').innerHTML=regions.map(r=>`
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

// ── SERVICES ─────────────────────────────────────────────────────────────────
function buildSvcs(){
  document.getElementById('svcs').innerHTML=SVCS.map(s=>`
    <button class="sc${S.svc===s.id?' on':''}"
            onclick="App.setSvc(${JSON.stringify(s.id)},this)">
      ${s.icon?s.icon+' ':''}${s.name}
    </button>`).join('');
}

// ── FETCH NUMBERS — no-store cache ────────────────────────────────────────────
async function loadNums(){
  show('numsView');
  const list=document.getElementById('numsList');
  list.innerHTML=`<div class="nums-wrap">${[68,56,50,56,60].map((h,i)=>`<div class="shim" style="height:${h}px;opacity:${1-i*.18}"></div>`).join('')}</div>`;
  document.getElementById('nvTtl').textContent=`${S.country.flag} ${S.country.name}`;
  document.getElementById('nvBadge').textContent='';
  document.getElementById('nvTs').textContent='';

  const btn=document.getElementById('shuffleBtn');
  if(btn) btn.disabled=true;

  try {
    // Unique URL every time = no caching possible
    const url=`${W}/numbers/${S.country.code}?r=${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const r=await fetch(url,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store'}});
    if(!r.ok) throw new Error('Server error '+r.status);
    const d=await r.json();
    if(!d.ok||!d.numbers?.length) throw new Error('No numbers');
    S.nums=d.numbers;
    renderNums(S.nums);
    document.getElementById('nvBadge').textContent=`${d.numbers.length} numbers`;
    document.getElementById('nvTs').textContent=`Loaded at ${new Date().toLocaleTimeString()}`;
  } catch(e){
    list.innerHTML=`<div class="empty"><div class="empty-ico">⚠️</div><h3>Failed to load</h3><p>${xe(e.message)}</p><br><button class="tbtn" onclick="App.reshuffle()" style="margin:0 auto">↻ Retry</button></div>`;
  } finally {
    if(btn) btn.disabled=false;
  }
}

function renderNums(nums){
  const el=document.getElementById('numsList');
  if(!nums.length){
    el.innerHTML='<div class="empty"><div class="empty-ico">📵</div><h3>No numbers</h3><p>Try another country.</p></div>';
    return;
  }
  const svc=S.svc?SVCS.find(s=>s.id===S.svc):null;
  const meta=`${S.country.flag} ${S.country.name}${svc?` · ${svc.icon} ${svc.name}`:''}`;
  el.innerHTML=`<div class="nums-wrap${S.view==='grid'?' gv':''}">` +
    nums.map((n,i)=>`
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy
          </button>
          <button class="nr-menu" onclick="event.stopPropagation();App.openCtx(event,${i})">&#x22EF;</button>
        </div>
      </div>`).join('') + '</div>';
}

// ── INBOX ─────────────────────────────────────────────────────────────────────
function openInbox(i){
  S.active=S.nums[i];
  if(!S.active) return;
  kill();

  document.querySelectorAll('.nr').forEach(r=>r.classList.remove('on'));
  const row=document.getElementById('nr_'+i);
  if(row) row.classList.add('on');

  document.getElementById('ibNum').textContent=S.active.number;
  const svc=S.svc?SVCS.find(s=>s.id===S.svc):null;
  document.getElementById('ibMeta').textContent=`${S.active.flag||S.country.flag} ${S.active.label||S.country.name}${svc?` · ${svc.icon} ${svc.name}`:''}`;
  document.getElementById('nbVal').textContent=S.active.number;
  document.getElementById('inboxView').style.display='';
  document.getElementById('smsBadge').textContent='';
  document.getElementById('smsCont').innerHTML=shimH(2);

  const cb=document.getElementById('copyBig');
  if(cb){cb.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Number`;cb.classList.remove('copied');}

  updateBc();
  document.getElementById('inboxView').scrollIntoView({behavior:'smooth',block:'nearest'});
  fetchSMS();
  S.timer=setInterval(fetchSMS,POLL);
}

function closeInbox(){
  kill();
  S.active=null;
  document.querySelectorAll('.nr').forEach(r=>r.classList.remove('on'));
  document.getElementById('inboxView').style.display='none';
}

// ── SMS FETCH — browser does it directly via CORS proxies ────────────────────
async function fetchSMS(){
  if(S.busy||!S.active) return;
  S.busy=true;

  const rb=document.getElementById('ibRef');
  const ri=document.getElementById('ibRefIco');
  if(rb) rb.disabled=true;
  if(ri) ri.classList.add('spin');

  try {
    const msgs=await getSMSFromBrowser(S.active.number);
    renderSMS(msgs);
  } catch(e){
    const sc=document.getElementById('smsCont');
    if(sc) sc.innerHTML=`<div class="wait-box"><div class="wb-title">Could not load SMS</div><div class="wb-sub">${xe(e.message)}</div><button class="tbtn" onclick="App.refresh()" style="margin:10px auto 0">↻ Retry</button></div>`;
  } finally {
    S.busy=false;
    if(rb) rb.disabled=false;
    if(ri) ri.classList.remove('spin');
  }
}

// Browser-side SMS fetch using CORS proxies
async function getSMSFromBrowser(phone){
  const n=phone.replace('+','');
  const PROXIES=[
    `https://corsproxy.io/?${encodeURIComponent('https://sms24.me/en/numbers/'+n)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://sms24.me/en/numbers/'+n)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent('https://sms24.me/en/numbers/'+n)}`,
  ];

  for(const url of PROXIES){
    try{
      const r=await fetch(url,{signal:AbortSignal.timeout(8000),cache:'no-store'});
      if(!r.ok) continue;
      const html=await r.text();
      if(html.length<100) continue;
      const msgs=parseTable(html);
      if(msgs.length||html.length>500) return msgs;
    } catch{ continue; }
  }
  return [];
}

function parseTable(html){
  const msgs=[],seen=new Set();
  const SKIP=/^(message|from|sender|time|date|received|body|content|sms|inbox|text|#|\s*)$/i;
  const trRx=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let tr;
  while((tr=trRx.exec(html))!==null){
    const row=tr[1];
    const tdRx=/<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells=[]; let td;
    while((td=tdRx.exec(row))!==null){
      const t=strip(td[1]);
      if(t) cells.push(t);
    }
    if(cells.length<2) continue;
    const from=cells[0]||'Unknown', body=cells[1], time=cells[cells.length-1]||'';
    if(!body||body.length<3||SKIP.test(body)||seen.has(body)) continue;
    seen.add(body);
    msgs.push({from:from.slice(0,50),body,time});
  }
  return msgs;
}

function strip(h){
  return h.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&')
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
}

function renderSMS(msgs){
  const sc=document.getElementById('smsCont');
  const badge=document.getElementById('smsBadge');
  if(!sc) return;
  if(badge) badge.textContent=msgs.length?`${msgs.length} message${msgs.length>1?'s':''}`:'' ;

  if(!msgs.length){
    sc.innerHTML=`<div class="wait-box"><div class="wb-ico">📬</div><div class="wb-title">Waiting for SMS</div><div class="wb-sub">Enter <b>${xe(S.active.number)}</b> on your platform.<br>OTP will appear here. <span class="blink">▋</span></div><div class="wb-note">Auto-refresh every ${POLL/1000}s</div></div>`;
    return;
  }

  sc.innerHTML=msgs.map(m=>{
    const otp=getOTP(m.body);
    return `<div class="sms-card">
      <div class="sc-hd"><span class="sc-from">${xe(m.from||'UNKNOWN')}</span><span class="sc-time">${xe(m.time||'')}</span></div>
      <div class="sc-body">${xe(m.body||'')}</div>
      ${otp?`<div class="otp-block"><div><div class="otp-lbl">OTP CODE</div><div class="otp-dig">${otp}</div></div><button class="otp-cp" onclick="App.copyOTP(this,'${otp}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy OTP</button></div>`:''}
    </div>`;
  }).join('');
}

// ── CONTEXT MENU ─────────────────────────────────────────────────────────────
function initCtx(){
  document.getElementById('ctxCopy').onclick=()=>{App.qCopy(S.ctxIdx);App.closeCtx();};
  document.getElementById('ctxInbox').onclick=()=>{openInbox(S.ctxIdx);App.closeCtx();};
  document.getElementById('ctxReport').onclick=()=>{toast('Number reported. Thank you!','tinf');App.closeCtx();};
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
const getOTP=t=>{const m=(t||'').match(/\b(\d{4,8})\b/);return m?m[1]:null;};
const xe=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const shimH=n=>Array.from({length:n},(_,i)=>`<div class="shim" style="height:${64-i*6}px;opacity:${1-i*.25}"></div>`).join('');
const kill=()=>{if(S.timer){clearInterval(S.timer);S.timer=null;}S.busy=false;};

function show(id){
  ['homeView','numsView','inboxView'].forEach(v=>{
    const el=document.getElementById(v);
    if(el) el.style.display=v===id?'':'none';
  });
  if(id==='numsView') document.getElementById('inboxView').style.display='none';
}

function updateBc(){
  const bc=document.getElementById('bc');
  const bcC=document.getElementById('bcC');
  if(!bc||!bcC) return;
  bc.style.display=S.country?'flex':'none';
  if(S.country) bcC.textContent=`${S.country.flag} ${S.country.name}`;
  const svc=S.svc?SVCS.find(s=>s.id===S.svc):null;
  const sep=document.getElementById('bcSep'),bs=document.getElementById('bcS');
  if(sep&&bs&&svc&&svc.id){sep.style.display='';bs.style.display='';bs.textContent=`${svc.icon} ${svc.name}`;}
  else{if(sep)sep.style.display='none';if(bs)bs.style.display='none';}
}

function toast(msg,cls){
  const w=document.getElementById('toasts');
  const el=document.createElement('div');
  el.className='toast '+cls;
  el.textContent=msg;
  w.appendChild(el);
  setTimeout(()=>el.remove(),4500);
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────
const App = {
  pick(code){
    S.country=COUNTRIES.find(c=>c.code===code);
    if(!S.country) return;
    document.querySelectorAll('.ci').forEach(el=>el.classList.remove('on'));
    const el=document.getElementById('ci_'+code);
    if(el){el.classList.add('on');el.scrollIntoView({block:'nearest'});}
    updateBc();
    closeInbox();
    loadNums();
  },
  setSvc(id,btn){
    S.svc=id;
    document.querySelectorAll('.sc').forEach(b=>b.classList.remove('on'));
    if(btn) btn.classList.add('on');
    updateBc();
    if(S.active){const m=document.getElementById('ibMeta');if(m)m.textContent=S.country.flag+' '+S.country.name;}
    else if(S.nums.length) renderNums(S.nums);
  },
  filterC(q){
    const v=q.toLowerCase().trim();
    document.querySelectorAll('.ci').forEach(el=>el.classList.toggle('hid',!!v&&!el.dataset.name.includes(v)));
    document.querySelector('.sb-x').style.display=v?'':'none';
  },
  clearSearch(){
    const inp=document.getElementById('srchInp');
    if(inp){inp.value='';App.filterC('');}
  },
  jumpTo(region){
    const first=COUNTRIES.find(c=>c.region===region);
    if(first) App.pick(first.code);
  },
  shuffle(){if(!S.country){toast('Select a country first','terr');return;} loadNums(); toast('Numbers shuffled!','tinf');},
  reshuffle(){loadNums();},
  setView(v){
    S.view=v;
    document.getElementById('vbL').classList.toggle('on',v==='list');
    document.getElementById('vbG').classList.toggle('on',v==='grid');
    if(S.nums.length&&!S.active) renderNums(S.nums);
  },
  openInbox,
  closeInbox,
  refresh(){S.busy=false;fetchSMS();},
  copyActive(){
    if(!S.active) return;
    navigator.clipboard.writeText(S.active.number).then(()=>{
      toast('Copied!','tok');
      const cb=document.getElementById('copyBig');
      if(cb){cb.innerHTML='✓ Copied!';cb.classList.add('copied');setTimeout(()=>{cb.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Number`;cb.classList.remove('copied');},2000);}
    }).catch(()=>toast('Failed','terr'));
  },
  qCopy(i){
    const n=S.nums[i];
    if(!n) return;
    navigator.clipboard.writeText(n.number).then(()=>toast('Copied: '+n.number,'tok')).catch(()=>toast('Failed','terr'));
  },
  copyOTP(btn,code){
    navigator.clipboard.writeText(code).then(()=>{
      const o=btn.innerHTML;btn.innerHTML='✓ Copied!';btn.classList.add('copied');
      toast('OTP copied: '+code,'tok');
      setTimeout(()=>{btn.innerHTML=o;btn.classList.remove('copied');},2500);
    }).catch(()=>toast('Failed','terr'));
  },
  openCtx(e,i){
    e.preventDefault();e.stopPropagation();
    S.ctxIdx=i;
    const m=document.getElementById('ctxMenu');
    m.classList.add('show');
    document.getElementById('overlay').classList.add('show');
    let x=e.clientX,y=e.clientY;
    const mw=175,mh=130;
    if(x+mw>innerWidth) x=innerWidth-mw-10;
    if(y+mh>innerHeight) y=innerHeight-mh-10;
    m.style.left=x+'px';m.style.top=y+'px';
  },
  closeCtx(){
    document.getElementById('ctxMenu')?.classList.remove('show');
    document.getElementById('overlay')?.classList.remove('show');
  },
  goHome(){
    kill();S.country=null;S.active=null;S.nums=[];
    document.querySelectorAll('.ci').forEach(el=>el.classList.remove('on'));
    show('homeView');
    document.getElementById('bc').style.display='none';
  },
};

window.App = App;
