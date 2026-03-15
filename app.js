/* FreeSMS.live — app.js v4 (Final) */
'use strict';

const W = 'https://sms-proxy.mojahidulislamzihad686.workers.dev';

/* ── DATA ── */
const COUNTRIES = [
  { code:'ID', flag:'🇮🇩', name:'Indonesia',     sub:'10+ numbers' },
  { code:'TH', flag:'🇹🇭', name:'Thailand',      sub:'10+ numbers' },
  { code:'VN', flag:'🇻🇳', name:'Vietnam',       sub:'10+ numbers' },
  { code:'MX', flag:'🇲🇽', name:'Mexico',        sub:'10+ numbers' },
  { code:'US', flag:'🇺🇸', name:'United States', sub:'15+ numbers' },
];

const SERVICES = [
  { id:'google',    name:'Google / Gmail', icon:'🔍' },
  { id:'whatsapp',  name:'WhatsApp',       icon:'💬' },
  { id:'telegram',  name:'Telegram',       icon:'✈️' },
  { id:'facebook',  name:'Facebook',       icon:'📘' },
  { id:'instagram', name:'Instagram',      icon:'📷' },
  { id:'twitter',   name:'Twitter / X',    icon:'🐦' },
  { id:'tiktok',    name:'TikTok',         icon:'🎵' },
  { id:'discord',   name:'Discord',        icon:'🎮' },
  { id:'snapchat',  name:'Snapchat',       icon:'👻' },
  { id:'tinder',    name:'Tinder',         icon:'🔥' },
  { id:'uber',      name:'Uber',           icon:'🚗' },
  { id:'paypal',    name:'PayPal',         icon:'💳' },
  { id:'amazon',    name:'Amazon',         icon:'📦' },
  { id:'binance',   name:'Binance',        icon:'🪙' },
  { id:'microsoft', name:'Microsoft',      icon:'🪟' },
  { id:'other',     name:'Other',          icon:'📱' },
];

/* ── STATE ── */
let cSel  = null;   // selected country object
let sSel  = null;   // selected service object
let nSel  = null;   // selected number object
let nums  = [];     // fetched numbers array
let timer = null;   // poll timer
let busy  = false;  // loading flag

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  buildCountries();
  buildServices();
  show(1);

  // Step bar click
  document.getElementById('stepBar').addEventListener('click', e => {
    const t = e.target.closest('.st');
    if (t && t.classList.contains('go')) {
      const n = parseInt(t.dataset.step);
      if (n === 1) back1();
      else if (n === 2) back2();
      else if (n === 3) back3();
    }
  });
});

/* ── SHOW STEP ── */
function show(n) {
  ['s1','s2','s3','panel'].forEach(id => document.getElementById(id).classList.add('dn'));
  document.getElementById('s' + n).classList.remove('dn');
  [1,2,3].forEach(i => {
    const t = document.getElementById('tab' + i);
    t.className = 'st';
    const can = (i===1&&cSel)||(i===2&&sSel)||(i===3&&nSel);
    if (i < n && can) t.classList.add('done','go');
    else if (i === n) t.classList.add('active');
  });
}

/* ── BACK ── */
function back1() { kill(); cSel=null; sSel=null; nSel=null; nums=[]; buildCountries(); show(1); }
function back2() { kill(); sSel=null; nSel=null; show(2); }
function back3() { kill(); nSel=null; show(3); if (nums.length) buildNums(nums); }

/* ── COUNTRIES ── */
function buildCountries() {
  document.getElementById('cgrid').innerHTML = COUNTRIES.map(c => `
    <div class="ccard${cSel?.code===c.code?' on':''}"
         onclick="pickCountry('${c.code}')">
      <span class="cflag">${c.flag}</span>
      <div><div class="cname">${c.name}</div><div class="csub">${c.sub}</div></div>
    </div>`).join('');
}

function pickCountry(code) {
  cSel = COUNTRIES.find(c => c.code === code);
  buildCountries();
  document.getElementById('s2lbl').textContent = `— ${cSel.flag} ${cSel.name} · service বেছে নাও`;
  show(2);
}

/* ── SERVICES ── */
function buildServices() {
  document.getElementById('sgrid').innerHTML = SERVICES.map(s => `
    <div class="scard${sSel?.id===s.id?' on':''}"
         onclick="pickService('${s.id}')">
      <div class="sicon">${s.icon}</div>
      <div class="sname">${s.name}</div>
    </div>`).join('');
}

function pickService(id) {
  sSel = SERVICES.find(s => s.id === id);
  buildServices();
  document.getElementById('s3lbl').textContent =
    `— ${cSel.flag} ${cSel.name} · ${sSel.icon} ${sSel.name}`;
  show(3);
  loadNums();
}

/* ── LOAD NUMBERS ── */
async function loadNums() {
  const el = document.getElementById('nlist');
  el.innerHTML = shims(3);
  try {
    const r = await tFetch(`${W}/numbers/${cSel.code}`, 13000);
    const d = await r.json();
    if (!d.ok || !Array.isArray(d.numbers) || !d.numbers.length) throw new Error('No numbers found');
    nums = d.numbers;
    buildNums(nums);
  } catch(e) {
    el.innerHTML = box('⚠️',
      `Numbers load হয়নি।<br><small>${xe(e.message)}</small><br><br>
       <button class="gbtn" onclick="loadNums()" style="font-size:11px;padding:8px 16px">
         ↻ আবার চেষ্টা
       </button>`);
  }
}

function buildNums(list) {
  const el = document.getElementById('nlist');
  if (!list.length) {
    el.innerHTML = box('📵',
      `এই দেশে এখন number নেই।<br>
       <button class="backbtn" onclick="back1()" style="margin:8px auto 0;display:inline-flex">
         ← দেশ বদলাও
       </button>`);
    return;
  }
  el.innerHTML = `<div class="nlist">` + list.map((n, i) => `
    <div class="ncard">
      <div class="ninfo">
        <div class="nnum">${xe(n.number)}</div>
        <div class="nmeta">${n.flag||cSel.flag} ${n.label||cSel.name} · ${sSel.icon} ${sSel.name}</div>
      </div>
      <button class="gbtn" data-i="${i}" onclick="pickNum(${i})">Get Number →</button>
    </div>`).join('') + `</div>`;
}

/* ── PICK NUMBER ── */
function pickNum(i) {
  nSel = nums[i];
  if (!nSel) return;
  kill();

  // Disable all Get buttons
  document.querySelectorAll('.gbtn').forEach(b => b.disabled = true);

  // Hide steps, all tabs done
  ['s1','s2','s3'].forEach(id => document.getElementById(id).classList.add('dn'));
  [1,2,3].forEach(i => {
    const t = document.getElementById('tab' + i);
    t.className = 'st done go';
  });

  // Build panel
  const panel = document.getElementById('panel');
  panel.classList.remove('dn');
  panel.innerHTML = `
    <div class="spanel">
      <div class="sph">
        <div>
          <div style="font-size:10px;color:var(--txt2);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">তোমার number</div>
          <div class="sp-num">${xe(nSel.number)}</div>
          <div class="sp-meta">${nSel.flag||cSel.flag} ${nSel.label||cSel.name}</div>
          <div class="sp-tags">
            <span class="tag tag-svc">${sSel.icon} ${sSel.name}</span>
            <span class="tag tag-live"><span class="dot" style="width:5px;height:5px;margin:0"></span>&nbsp;Live</span>
          </div>
        </div>
        <div class="spa">
          <button class="rbtn" id="rbtn" onclick="doRefresh()">
            <span id="ric">↻</span> Refresh
          </button>
          <div class="navbtns">
            <button class="navbtn" onclick="back3()">← অন্য number</button>
            <button class="navbtn" onclick="back2()">← Service বদলাও</button>
            <button class="navbtn" onclick="back1()">← দেশ বদলাও</button>
          </div>
        </div>
      </div>
      <div id="smsc">${shims(2)}</div>
    </div>`;

  fetchSMS();
  timer = setInterval(fetchSMS, 15000);
}

/* ── FETCH SMS ── */
async function fetchSMS() {
  if (busy) return;
  busy = true;

  const rb  = document.getElementById('rbtn');
  const ric = document.getElementById('ric');
  const sc  = document.getElementById('smsc');

  if (rb)  rb.disabled = true;
  if (ric) ric.className = 'spin';

  try {
    const r = await tFetch(`${W}/sms/${encodeURIComponent(nSel.id)}`, 15000);
    const d = await r.json();
    const m = Array.isArray(d.messages) ? d.messages : [];
    if (sc) renderSMS(sc, m);
  } catch(e) {
    if (sc) sc.innerHTML = `
      <div class="waitbox">
        <div class="waittxt">SMS load হয়নি।<br>
          <button class="gbtn" onclick="doRefresh()" style="font-size:11px;padding:8px 16px;margin-top:10px">
            ↻ আবার চেষ্টা
          </button>
        </div>
      </div>`;
  } finally {
    busy = false;
    if (rb)  rb.disabled = false;
    if (ric) { ric.className = ''; ric.textContent = '↻'; }
  }
}

function doRefresh() { busy = false; fetchSMS(); }

/* ── RENDER SMS ── */
function renderSMS(el, msgs) {
  if (!msgs.length) {
    el.innerHTML = `
      <div class="waitbox">
        <div style="font-size:34px;margin-bottom:13px">📬</div>
        <div class="waittxt">
          <strong style="color:var(--ac3)">${xe(nSel.number)}</strong> এ এখনো SMS আসেনি।<br>
          এই number টা <strong>${sSel.name}</strong> এ দাও।<br>
          SMS আসলে এখানে দেখাবে <span class="cur">▋</span>
        </div>
        <div class="arnote">প্রতি ১৫ সেকেন্ডে auto-refresh হচ্ছে</div>
      </div>`;
    return;
  }

  el.innerHTML = `<div class="smsl">` +
    msgs.map(m => {
      const otp = getOTP(m.body);
      return `
        <div class="smsc">
          <div class="smsh">
            <span class="smsf">${xe(m.from||'Unknown')}</span>
            <span class="smst">${xe(m.time||'')}</span>
          </div>
          <div class="smsb">${xe(m.body||'')}</div>
          ${otp ? `
            <div class="otpbox">
              <div>
                <div class="otpl">OTP Code</div>
                <div class="otpn">${otp}</div>
              </div>
              <button class="cpbtn" onclick="doCopy(this,'${otp}')">Copy</button>
            </div>` : ''}
        </div>`;
    }).join('') + `</div>`;
}

/* ── UTILS ── */
function getOTP(t) { const m=(t||'').match(/\b(\d{4,8})\b/); return m?m[1]:null; }

function xe(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function shims(n) {
  return Array.from({length:n},(_,i)=>
    `<div class="shim" style="height:${78-i*9}px;opacity:${1-i*0.28}"></div>`).join('');
}

function box(icon, html) {
  return `<div class="sbox"><div class="sbox-icon">${icon}</div><div class="sbox-txt">${html}</div></div>`;
}

async function tFetch(url, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(url,{signal:c.signal}); clearTimeout(t); return r; }
  catch(e) { clearTimeout(t); throw e.name==='AbortError'?new Error('Timeout'):e; }
}

function kill() { if(timer){clearInterval(timer);timer=null;} busy=false; }

function doCopy(btn, code) {
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '✓ Copied'; btn.classList.add('ok');
    toast('OTP copied!','ok');
    setTimeout(() => { btn.textContent='Copy'; btn.classList.remove('ok'); }, 2000);
  }).catch(() => toast('Copy failed','err'));
}

function toast(msg, cls='') {
  const el = document.getElementById('toast');
  el.textContent = msg; el.className = `toast show ${cls}`;
  setTimeout(() => { el.className='toast'; }, 3000);
}

// Expose for HTML onclick attributes
window.pickCountry = pickCountry;
window.pickService = pickService;
window.pickNum     = pickNum;
window.loadNums    = loadNums;
window.doRefresh   = doRefresh;
window.doCopy      = doCopy;
window.back1       = back1;
window.back2       = back2;
window.back3       = back3;
window.resetAll    = back1;
