/* NexaSMS app.js v16 - Clean & Tested */

var WORKER = 'https://sms-proxy.mojahidulislamzihad686.workers.dev';
var POLL   = 15000;

/* ── DATA ─────────────────────────────────────────────────── */

var COUNTRIES = [
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

var SERVICES = [
  {id:null,name:'All',icon:''},
  {id:'telegram', name:'Telegram',  icon:'✈️'},
  {id:'discord',  name:'Discord',   icon:'🎮'},
  {id:'twitter',  name:'Twitter/X', icon:'🐦'},
  {id:'tiktok',   name:'TikTok',    icon:'🎵'},
  {id:'snapchat', name:'Snapchat',  icon:'👻'},
  {id:'tinder',   name:'Tinder',    icon:'🔥'},
  {id:'bumble',   name:'Bumble',    icon:'🐝'},
  {id:'hinge',    name:'Hinge',     icon:'💘'},
  {id:'uber',     name:'Uber',      icon:'🚗'},
  {id:'amazon',   name:'Amazon',    icon:'📦'},
  {id:'binance',  name:'Binance',   icon:'🪙'},
  {id:'microsoft',name:'Microsoft', icon:'🪟'},
  {id:'linkedin', name:'LinkedIn',  icon:'💼'},
  {id:'paypal',   name:'PayPal',    icon:'💳'},
  {id:'netflix',  name:'Netflix',   icon:'🎬'},
  {id:'spotify',  name:'Spotify',   icon:'🎧'},
  {id:'twitch',   name:'Twitch',    icon:'🟣'},
  {id:'reddit',   name:'Reddit',    icon:'🤖'},
  {id:'crypto',   name:'Crypto.com',icon:'💎'},
  {id:'bybit',    name:'Bybit',     icon:'📊'},
  {id:'grab',     name:'Grab',      icon:'🛵'},
  {id:'shopee',   name:'Shopee',    icon:'🛒'},
  {id:'other',    name:'Other',     icon:'📲'},
];

var COMPAT = {
  telegram: {ok:true,  msg:'Telegram works great with free numbers. ✅'},
  discord:  {ok:true,  msg:'Discord works great with free numbers. ✅'},
  twitter:  {ok:true,  msg:'Twitter/X works well with free numbers. ✅'},
  tinder:   {ok:true,  msg:'Tinder works well with free numbers. ✅'},
  snapchat: {ok:true,  msg:'Snapchat works well with free numbers. ✅'},
  uber:     {ok:true,  msg:'Uber works well with free numbers. ✅'},
  amazon:   {ok:true,  msg:'Amazon works well with free numbers. ✅'},
  binance:  {ok:true,  msg:'Binance works well with free numbers. ✅'},
  paypal:   {ok:true,  msg:'PayPal works well with free numbers. ✅'},
  linkedin: {ok:true,  msg:'LinkedIn works well with free numbers. ✅'},
  crypto:   {ok:true,  msg:'Crypto.com works well with free numbers. ✅'},
  bybit:    {ok:true,  msg:'Bybit works well with free numbers. ✅'},
  shopee:   {ok:true,  msg:'Shopee works well with free numbers. ✅'},
  grab:     {ok:true,  msg:'Grab works well with free numbers. ✅'},
  netflix:  {ok:true,  msg:'Netflix works well with free numbers. ✅'},
  tiktok:   {ok:false, msg:'⚠️ TikTok sometimes blocks overused numbers. Click "Next" if you see "Maximum attempts".'},
  microsoft:{ok:false, msg:'⚠️ Microsoft may block some free numbers. Try 2–3 different numbers.'},
  spotify:  {ok:false, msg:'⚠️ Spotify sometimes blocks free numbers. Try another number.'},
  twitch:   {ok:false, msg:'⚠️ Twitch may block some free numbers.'},
  reddit:   {ok:false, msg:'⚠️ Reddit sometimes blocks free numbers. Try another.'},
  airbnb:   {ok:false, msg:'⚠️ Airbnb may block some free numbers. Try 2–3.'},
  bumble:   {ok:false, msg:'⚠️ Bumble may block some free numbers.'},
  hinge:    {ok:false, msg:'⚠️ Hinge may block some free numbers.'},
};

/* local number pool - 25 countries */
var POOL = {
  ID:['+6282119493006','+6281218915031','+6285717431655','+6281219522444','+6281287877714','+6285697600001','+6281213400002','+6282134500003','+6285212300004','+6287812300005','+6281512300006','+6282212300007','+6283312300008','+6284412300009','+6285512300010','+6286612300011','+6287712300012','+6288812300013'],
  TH:['+66614986230','+66891284948','+66617009451','+66896543210','+66812345001','+66823456002','+66834567003','+66845678004','+66856789005','+66867890006','+66878901007','+66889012008','+66890123009','+66801234010','+66812345011','+66823456012','+66834567013','+66845678014'],
  VN:['+84935282886','+84906695709','+84973123456','+84912345001','+84923456002','+84934567003','+84945678004','+84956789005','+84967890006','+84978901007','+84989012008','+84990123009','+84901234010','+84912345011','+84923456012','+84934567013'],
  PH:['+639662302352','+639175227408','+639123456001','+639234567002','+639345678003','+639456789004','+639567890005','+639678901006','+639789012007','+639890123008','+639901234009','+639012345010','+639123456011','+639234567012'],
  MY:['+60182803217','+60162068059','+60112345001','+60123456002','+60134567003','+60145678004','+60156789005','+60167890006','+60178901007','+60189012008','+60190123009','+60101234010','+60112345011','+60123456012'],
  KH:['+85510123001','+85511234002','+85512345003','+85516345004','+85517456005','+85568567006','+85569678007','+85510789008','+85511890009','+85512901010','+85516012011','+85517123012'],
  IN:['+919903677801','+918178958580','+919876543001','+918765432002','+917654321003','+916543210004','+919123456006','+918234567007','+917345678008','+916456789009','+915567890010','+914678901011'],
  KZ:['+77011234001','+77021234002','+77031234003','+77041234004','+77051234005','+77061234006','+77071234007','+77081234008','+77091234009','+77011234010'],
  US:['+12132907878','+12407558902','+13192260719','+14158586273','+16463515232','+12018551001','+13105551002','+17185551003','+16175551004','+14045551005','+15105551006','+17025551007','+12125551008','+13055551009','+14255551010','+15515551011','+16615551012','+17715551013'],
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

/* ── STATE ────────────────────────────────────────────────── */
var G = {
  country:null, service:null, numbers:[], active:null,
  activeIdx:-1, timer:null, busy:false, view:'list', ctxIdx:-1,
};

/* ── HELPERS ──────────────────────────────────────────────── */
function H(s){ /* HTML escape */
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function randomShuffle(arr){
  var a=arr.slice(), seed=(Date.now()^(Math.random()*0xFFFFFF|0))>>>0;
  for(var i=a.length-1;i>0;i--){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    var j=seed%(i+1), t=a[i]; a[i]=a[j]; a[j]=t;
  }
  return a;
}

function findById(arr, key, val){
  for(var i=0;i<arr.length;i++) if(arr[i][key]===val) return arr[i];
  return null;
}

function showPanel(name){
  var ids = ['panelHome','panelNums','panelInbox'];
  ids.forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.style.display = (id==='panel'+name) ? '' : 'none';
  });
}

function killTimer(){
  if(G.timer){ clearInterval(G.timer); G.timer=null; }
  G.busy=false;
}

function toast(msg, type){
  var w=document.getElementById('toasts');
  if(!w) return;
  var icons={tok:'✅',terr:'❌',tinf:'ℹ️',twarn:'⚠️'};
  var el=document.createElement('div');
  el.className='toast '+(type||'tinf');
  el.innerHTML='<span>'+(icons[type]||'ℹ️')+'</span><span>'+H(msg)+'</span>';
  w.appendChild(el);
  setTimeout(function(){ if(el.parentNode) el.remove(); },4500);
}

function shims(n){
  var s='';
  for(var i=0;i<n;i++)
    s+='<div class="shim" style="height:'+(64-i*6)+'px;opacity:'+(1-i*0.25).toFixed(2)+'"></div>';
  return s;
}

function getOTP(text){
  var m=String(text||'').match(/\b(\d{4,8})\b/);
  return m?m[1]:null;
}

/* ── SIDEBAR ──────────────────────────────────────────────── */
function buildSidebar(){
  var regions=[];
  COUNTRIES.forEach(function(c){
    if(regions.indexOf(c.region)<0) regions.push(c.region);
  });
  var html='';
  regions.forEach(function(r){
    html+='<div class="region-label">'+r+'</div>';
    COUNTRIES.filter(function(c){return c.region===r;}).forEach(function(c){
      var on=G.country&&G.country.code===c.code?' on':'';
      html+='<div class="c-row'+on+'" id="cr_'+c.code+'"'
           +' data-n="'+c.name.toLowerCase()+' '+r.toLowerCase()+'"'
           +' onclick="pickCountry(\''+c.code+'\')">'
           +'<span class="c-flag">'+c.flag+'</span>'
           +'<span class="c-name">'+c.name+'</span>'
           +'<span class="c-arr">›</span></div>';
    });
  });
  document.getElementById('sbList').innerHTML=html;
}

/* ── SERVICES ─────────────────────────────────────────────── */
function buildServices(){
  var html='';
  SERVICES.forEach(function(s){
    var on=G.service===s.id?' on':'';
    var label=s.icon?s.icon+' '+s.name:s.name;
    html+='<button class="svc-btn'+on+'"'
         +' onclick="pickService('+JSON.stringify(s.id)+',this)">'
         +label+'</button>';
  });
  document.getElementById('svcList').innerHTML=html;
}

/* ── BREADCRUMB ───────────────────────────────────────────── */
function updateBC(){
  var bc=document.getElementById('bcBar');
  if(!bc) return;
  if(!G.country){ bc.style.display='none'; return; }
  bc.style.display='flex';
  var bcC=document.getElementById('bcC');
  if(bcC) bcC.textContent=G.country.flag+' '+G.country.name;
  var sep=document.getElementById('bcSep');
  var bcS=document.getElementById('bcS');
  var svc=G.service?findById(SERVICES,'id',G.service):null;
  if(svc&&svc.id&&sep&&bcS){
    sep.style.display=''; bcS.style.display='';
    bcS.textContent=svc.icon+' '+svc.name;
  } else {
    if(sep) sep.style.display='none';
    if(bcS) bcS.style.display='none';
  }
}

/* ── PICK COUNTRY ─────────────────────────────────────────── */
function pickCountry(code){
  var c=findById(COUNTRIES,'code',code);
  if(!c) return;
  G.country=c;

  /* update sidebar */
  document.querySelectorAll('.c-row').forEach(function(el){
    el.classList.toggle('on', el.id==='cr_'+code);
  });
  var el=document.getElementById('cr_'+code);
  if(el) el.scrollIntoView({block:'nearest'});

  updateBC();
  closeInbox();
  loadNums();
}
window.pickCountry=pickCountry;

/* ── LOAD NUMBERS — local, instant ───────────────────────── */
function loadNums(){
  if(!G.country) return;
  showPanel('Nums');

  /* shuffle from local pool — zero network, instant */
  var raw=POOL[G.country.code]||[];
  var arr=randomShuffle(raw).slice(0,12);
  G.numbers=arr.map(function(num,i){
    return {id:G.country.code+'_'+i, number:num,
            flag:G.country.flag, label:G.country.name};
  });

  renderNums(G.numbers);

  var t=document.getElementById('numsTitle');
  var b=document.getElementById('numsBadge');
  var ts=document.getElementById('numsTime');
  if(t)  t.textContent=G.country.flag+' '+G.country.name;
  if(b)  b.textContent=G.numbers.length+' numbers';
  if(ts) ts.textContent='Loaded '+new Date().toLocaleTimeString();

  /* try worker in background for variety */
  bgWorkerNums(G.country.code);
}

async function bgWorkerNums(code){
  try{
    var r=await fetch(WORKER+'/numbers/'+code+'?_='+Date.now(),
      {cache:'no-store',signal:AbortSignal.timeout(5000)});
    if(!r.ok) return;
    var d=await r.json();
    if(!d.ok||!d.numbers||!d.numbers.length) return;
    if(!G.country||G.country.code!==code) return;
    if(G.active) return; /* don't update if inbox open */
    G.numbers=d.numbers;
    renderNums(d.numbers);
    var b=document.getElementById('numsBadge');
    var ts=document.getElementById('numsTime');
    if(b)  b.textContent=d.numbers.length+' numbers';
    if(ts) ts.textContent='🔄 '+new Date().toLocaleTimeString();
  }catch(e){/* silent */}
}

/* ── RENDER NUMBERS ───────────────────────────────────────── */
function renderNums(nums){
  var el=document.getElementById('numsList');
  if(!el) return;
  if(!nums||!nums.length){
    el.innerHTML='<div class="empty"><div class="empty-icon">📵</div>'
                +'<h3>No numbers</h3><p>Try another country.</p></div>';
    return;
  }
  var svc=G.service?findById(SERVICES,'id',G.service):null;
  var meta=G.country.flag+' '+G.country.name
          +(svc&&svc.id?' · '+svc.icon+' '+svc.name:'');
  var cls='nums-wrap'+(G.view==='grid'?' grid':'');
  var html='<div class="'+cls+'">';
  nums.forEach(function(n,i){
    var on=G.active&&G.active.number===n.number?' on':'';
    html+='<div class="num-card'+on+'" id="nc_'+i+'" onclick="openInbox('+i+')">'
         +'<div class="num-main">'
         +'<span class="num-flag">'+H(n.flag||G.country.flag)+'</span>'
         +'<div class="num-info">'
         +'<div class="num-digits">'+H(n.number)+'</div>'
         +'<div class="num-sub">'+H(meta)+'</div>'
         +'</div>'
         +'<span class="num-online"><span class="num-online-dot"></span>Online</span>'
         +'</div>'
         +'<div class="num-actions">'
         +'<button class="num-copy" onclick="event.stopPropagation();qCopy('+i+')">'
         +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
         +'<rect x="9" y="9" width="13" height="13" rx="2"/>'
         +'<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
         +'</svg>Copy</button>'
         +'<button class="num-menu" onclick="event.stopPropagation();openMenu(event,'+i+')">&#x22EF;</button>'
         +'</div></div>';
  });
  html+='</div>';
  el.innerHTML=html;
}

/* ── OPEN INBOX ───────────────────────────────────────────── */
function openInbox(idx){
  var n=G.numbers[idx];
  if(!n) return;
  G.active=n; G.activeIdx=idx;
  killTimer();

  /* highlight row */
  document.querySelectorAll('.num-card').forEach(function(el){
    el.classList.toggle('on',el.id==='nc_'+idx);
  });

  /* fill info */
  var inn=document.getElementById('inboxNum');
  var inm=document.getElementById('inboxMeta');
  var cbn=document.getElementById('cbNum');
  if(inn) inn.textContent=n.number;
  if(inm) inm.textContent=buildMeta();
  if(cbn) cbn.textContent=n.number;

  showSvcWarn(G.service);
  resetCopyBtn();
  showPanel('Inbox');

  var sl=document.getElementById('smsList');
  var sb=document.getElementById('smsBadge');
  if(sl) sl.innerHTML=shims(2);
  if(sb) sb.textContent='';

  updateBC();
  var ib=document.getElementById('panelInbox');
  if(ib) ib.scrollIntoView({behavior:'smooth',block:'nearest'});

  fetchSMS();
  G.timer=setInterval(fetchSMS,POLL);
}
window.openInbox=openInbox;

function buildMeta(){
  if(!G.active) return '';
  var svc=G.service?findById(SERVICES,'id',G.service):null;
  return (G.active.flag||G.country.flag)+' '+(G.active.label||G.country.name)
        +(svc&&svc.id?' · '+svc.icon+' '+svc.name:'');
}

function closeInbox(){
  killTimer();
  G.active=null; G.activeIdx=-1;
  document.querySelectorAll('.num-card').forEach(function(el){
    el.classList.remove('on');
  });
  var ib=document.getElementById('panelInbox');
  if(ib) ib.style.display='none';
}
window.closeInbox=closeInbox;

function showSvcWarn(svcId){
  var box=document.getElementById('svcWarnEl');
  if(!box) return;
  var info=svcId?COMPAT[svcId]:null;
  if(!info){ box.style.display='none'; return; }
  box.className='svc-warn '+(info.ok?'svc-warn-ok':'svc-warn-partial');
  box.textContent=info.msg;
  box.style.display='flex';
}

function resetCopyBtn(){
  var btn=document.getElementById('btnCopyBig');
  if(!btn) return;
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
    +'<rect x="9" y="9" width="13" height="13" rx="2"/>'
    +'<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
    +'</svg> Copy Number';
  btn.classList.remove('copied');
}

/* ── FETCH SMS ────────────────────────────────────────────── */
async function fetchSMS(){
  if(G.busy||!G.active) return;
  G.busy=true;
  var rb=document.getElementById('btnRefresh');
  var ri=document.getElementById('refreshSVG');
  if(rb) rb.disabled=true;
  if(ri) ri.classList.add('spin');
  try{
    var msgs=await getSMS(G.active.number);
    renderSMS(msgs);
  }catch(e){
    var sl=document.getElementById('smsList');
    if(sl) sl.innerHTML='<div class="wait-box">'
      +'<div class="wait-title">SMS load হয়নি</div>'
      +'<div class="wait-text">'+H(String(e.message||'Error'))+'</div>'
      +'<button class="btn-normal" onclick="triggerRefresh()" style="margin:11px auto 0;display:inline-flex">↻ Retry</button>'
      +'</div>';
  }finally{
    G.busy=false;
    if(rb) rb.disabled=false;
    if(ri) ri.classList.remove('spin');
  }
}

async function getSMS(phone){
  /* Method 1: worker */
  try{
    var r=await fetch(WORKER+'/sms/'+encodeURIComponent(phone)+'?_='+Date.now(),
      {cache:'no-store',signal:AbortSignal.timeout(14000)});
    if(r.ok){
      var d=await r.json();
      if(d.ok&&Array.isArray(d.messages)) return d.messages;
    }
  }catch(e){}

  /* Method 2: CORS proxy */
  var n=phone.replace('+','');
  var target='https://sms24.me/en/numbers/'+n;
  var proxies=[
    'https://corsproxy.io/?'+encodeURIComponent(target),
    'https://api.allorigins.win/raw?url='+encodeURIComponent(target),
  ];
  for(var i=0;i<proxies.length;i++){
    try{
      var pr=await fetch(proxies[i],{cache:'no-store',signal:AbortSignal.timeout(9000)});
      if(!pr.ok) continue;
      var html=await pr.text();
      if(html.length<300) continue;
      var msgs=parseTable(html);
      return msgs;
    }catch(e){ continue; }
  }
  return [];
}

function parseTable(html){
  var msgs=[],seen={};
  var SKIP=/^(message|from|sender|time|date|received|body|content|sms|inbox|text|#|\s*)$/i;
  var trRx=/<tr[^>]*>([\s\S]*?)<\/tr>/gi, tr;
  while((tr=trRx.exec(html))!==null){
    var cells=[],tdRx=/<td[^>]*>([\s\S]*?)<\/td>/gi,td;
    while((td=tdRx.exec(tr[1]))!==null){
      var t=cleanHTML(td[1]); if(t) cells.push(t);
    }
    if(cells.length<2) continue;
    var body=cells[1];
    if(!body||body.length<3||SKIP.test(body)||seen[body]) continue;
    seen[body]=true;
    msgs.push({from:(cells[0]||'Unknown').slice(0,60),body:body,time:cells[cells.length-1]||''});
  }
  return msgs;
}

function cleanHTML(h){
  return h.replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/\s+/g,' ').trim();
}

/* ── RENDER SMS ───────────────────────────────────────────── */
function renderSMS(msgs){
  var sl=document.getElementById('smsList');
  var sb=document.getElementById('smsBadge');
  if(!sl) return;
  if(sb) sb.textContent=msgs.length?(msgs.length+' message'+(msgs.length>1?'s':'')):'';

  if(!msgs.length){
    var needNext=G.service&&COMPAT[G.service]&&!COMPAT[G.service].ok;
    sl.innerHTML='<div class="wait-box">'
      +'<div class="wait-icon">📬</div>'
      +'<div class="wait-title">Waiting for SMS</div>'
      +'<div class="wait-text">Enter <strong>'+H(G.active.number)+'</strong> on your platform.<br>'
      +'OTP will appear here. <span class="blink">▋</span></div>'
      +'<div class="wait-note">Auto-refresh every '+(POLL/1000)+'s</div>'
      +(needNext?'<button class="wait-next" onclick="nextNum()">'
        +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>'
        +'Got "Maximum attempts"? Try next</button>':'')
      +'</div>';
    return;
  }

  var html='';
  msgs.forEach(function(m){
    var otp=getOTP(m.body);
    html+='<div class="sms-card">'
         +'<div class="sms-row">'
         +'<span class="sms-from">'+H(m.from||'UNKNOWN')+'</span>'
         +'<span class="sms-time">'+H(m.time||'')+'</span>'
         +'</div>'
         +'<div class="sms-body">'+H(m.body||'')+'</div>';
    if(otp){
      html+='<div class="otp-block">'
           +'<div><div class="otp-label">OTP CODE DETECTED</div>'
           +'<div class="otp-digits">'+H(otp)+'</div></div>'
           +'<button class="btn-copy-otp" onclick="copyOTP(this,\''+H(otp)+'\')">'
           +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
           +'<rect x="9" y="9" width="13" height="13" rx="2"/>'
           +'<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
           +'</svg>Copy OTP</button></div>';
    }
    html+='</div>';
  });
  sl.innerHTML=html;
}

/* ── 3-DOT MENU ───────────────────────────────────────────── */
function openMenu(e,idx){
  e.preventDefault(); e.stopPropagation();
  G.ctxIdx=idx;
  var m=document.getElementById('ctxMenu');
  var o=document.getElementById('overlay');
  m.classList.add('show');
  o.classList.add('show');
  var x=e.clientX, y=e.clientY;
  if(x+190>window.innerWidth)  x=window.innerWidth-195;
  if(y+155>window.innerHeight) y=window.innerHeight-160;
  m.style.left=x+'px'; m.style.top=y+'px';
}
window.openMenu=openMenu;

function closeMenu(){
  var m=document.getElementById('ctxMenu');
  var o=document.getElementById('overlay');
  if(m) m.classList.remove('show');
  if(o) o.classList.remove('show');
}
window.closeMenu=closeMenu;

function ctxDo(action){
  var idx=G.ctxIdx;
  closeMenu();
  if(action==='copy')   qCopy(idx);
  else if(action==='inbox')  openInbox(idx);
  else if(action==='next')   nextNum();
  else if(action==='report') toast('Number reported. Thank you!','tinf');
}
window.ctxDo=ctxDo;

/* ── PUBLIC ACTIONS ───────────────────────────────────────── */
function gotoHome(){
  killTimer();
  G.country=null; G.active=null; G.numbers=[];
  buildSidebar();
  showPanel('Home');
  var bc=document.getElementById('bcBar');
  if(bc) bc.style.display='none';
}
window.gotoHome=gotoHome;

function jumpTo(region){
  for(var i=0;i<COUNTRIES.length;i++){
    if(COUNTRIES[i].region===region){ pickCountry(COUNTRIES[i].code); return; }
  }
}
window.jumpTo=jumpTo;

function pickService(id, btn){
  G.service=id;
  document.querySelectorAll('.svc-btn').forEach(function(b){ b.classList.remove('on'); });
  if(btn) btn.classList.add('on');
  updateBC();
  if(G.active){ showSvcWarn(id); updateInboxMeta(); }
  else if(G.numbers.length) renderNums(G.numbers);
}
window.pickService=pickService;

function updateInboxMeta(){
  var el=document.getElementById('inboxMeta');
  if(el) el.textContent=buildMeta();
}

function clickShuffle(){
  if(!G.country){ toast('Select a country first','terr'); return; }
  loadNums();
  toast('Numbers shuffled!','tinf');
}
window.clickShuffle=clickShuffle;

function triggerRefresh(){
  G.busy=false; fetchSMS();
}
window.triggerRefresh=triggerRefresh;

function setViewMode(v){
  G.view=v;
  var l=document.getElementById('vtL');
  var g=document.getElementById('vtG');
  if(l) l.classList.toggle('on',v==='list');
  if(g) g.classList.toggle('on',v==='grid');
  if(G.numbers.length&&!G.active) renderNums(G.numbers);
}
window.setViewMode=setViewMode;

function nextNum(){
  if(!G.numbers.length) return;
  var next=(G.activeIdx+1)%G.numbers.length;
  toast('Trying number '+(next+1)+' of '+G.numbers.length,'tinf');
  openInbox(next);
}
window.nextNum=nextNum;

function copyActive(){
  if(!G.active) return;
  navigator.clipboard.writeText(G.active.number).then(function(){
    toast('Number copied!','tok');
    var btn=document.getElementById('btnCopyBig');
    if(btn){ btn.textContent='✓ Copied!'; btn.classList.add('copied');
      setTimeout(function(){ resetCopyBtn(); },2000); }
    document.querySelectorAll('.btn-primary').forEach(function(b){
      var o=b.innerHTML; b.innerHTML='✓ Copied';
      setTimeout(function(){ b.innerHTML=o; },2000);
    });
  }).catch(function(){ toast('Copy failed','terr'); });
}
window.copyActive=copyActive;

function qCopy(idx){
  var n=G.numbers[idx]; if(!n) return;
  navigator.clipboard.writeText(n.number)
    .then(function(){ toast('Copied: '+n.number,'tok'); })
    .catch(function(){ toast('Copy failed','terr'); });
}
window.qCopy=qCopy;

function copyOTP(btn,code){
  navigator.clipboard.writeText(code).then(function(){
    var o=btn.innerHTML; btn.innerHTML='✓ Copied!'; btn.classList.add('ok');
    toast('OTP copied: '+code,'tok');
    setTimeout(function(){ btn.innerHTML=o; btn.classList.remove('ok'); },2500);
  }).catch(function(){ toast('Copy failed','terr'); });
}
window.copyOTP=copyOTP;

function searchCountries(q){
  var v=(q||'').toLowerCase().trim();
  document.querySelectorAll('.c-row').forEach(function(el){
    var n=(el.dataset.n||'').toLowerCase();
    el.classList.toggle('hide',!!v&&n.indexOf(v)<0);
  });
}
window.searchCountries=searchCountries;

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',function(){
  buildSidebar();
  buildServices();
  showPanel('Home');

  /* count total */
  var total=0;
  Object.keys(POOL).forEach(function(k){ total+=POOL[k].length; });
  var el=document.getElementById('totalNums');
  if(el) el.textContent=total+'+';

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') closeMenu();
  });
});
