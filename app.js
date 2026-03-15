/* ============================================================
   FreeSMS.live — Application Logic v2 (Fixed)
   ============================================================ */

'use strict';

const WORKER = 'https://sms-proxy.mojahidulislamzihad686.workers.dev';

/* ── STATIC DATA ── */

const SERVICES = [
  { id:'google',    name:'Google',      icon:'🔍' },
  { id:'gmail',     name:'Gmail',       icon:'📧' },
  { id:'whatsapp',  name:'WhatsApp',    icon:'💬' },
  { id:'telegram',  name:'Telegram',    icon:'✈️' },
  { id:'facebook',  name:'Facebook',    icon:'📘' },
  { id:'instagram', name:'Instagram',   icon:'📷' },
  { id:'twitter',   name:'Twitter/X',   icon:'🐦' },
  { id:'tiktok',    name:'TikTok',      icon:'🎵' },
  { id:'discord',   name:'Discord',     icon:'🎮' },
  { id:'snapchat',  name:'Snapchat',    icon:'👻' },
  { id:'tinder',    name:'Tinder',      icon:'🔥' },
  { id:'uber',      name:'Uber',        icon:'🚗' },
  { id:'paypal',    name:'PayPal',      icon:'💳' },
  { id:'amazon',    name:'Amazon',      icon:'📦' },
  { id:'binance',   name:'Binance',     icon:'🪙' },
  { id:'linkedin',  name:'LinkedIn',    icon:'💼' },
  { id:'microsoft', name:'Microsoft',   icon:'🪟' },
  { id:'other',     name:'Other',       icon:'📱' },
];

const COUNTRIES_UI = [
  { code:'ID', flag:'🇮🇩', name:'Indonesia',     sub:'10+ numbers' },
  { code:'TH', flag:'🇹🇭', name:'Thailand',      sub:'10+ numbers' },
  { code:'VN', flag:'🇻🇳', name:'Vietnam',       sub:'10+ numbers' },
  { code:'MX', flag:'🇲🇽', name:'Mexico',        sub:'10+ numbers' },
  { code:'US', flag:'🇺🇸', name:'United States', sub:'15+ numbers' },
];

/* ── STATE ── */

const state = {
  step:      1,
  country:   null,
  service:   null,
  numbers:   [],
  number:    null,
  pollTimer: null,
  loading:   false,
};

/* ── INIT ── */

document.addEventListener('DOMContentLoaded', () => {
  renderCountries();
  goStep(1);

  document.getElementById('stepBar').addEventListener('click', e => {
    const tab = e.target.closest('[data-step]');
    if (!tab || !tab.classList.contains('clickable')) return;
    goStep(parseInt(tab.dataset.step, 10));
  });
});

/* ── NAVIGATION ── */

function goStep(n) {
  if (n === 2 && !state.country) { goStep(1); return; }
  if (n === 3 && !state.service) { goStep(state.country ? 2 : 1); return; }

  stopPolling();
  state.step = n;

  ['step1','step2','step3','smsPanel'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('step' + n).classList.remove('hidden');

  [1,2,3].forEach(i => {
    const tab = document.getElementById('tab' + i);
    tab.className = 'step-tab';
    const canClick =
      (i === 1 && state.country) ||
      (i === 2 && state.service) ||
      (i === 3 && state.number);
    if (i < n && canClick) tab.classList.add('done','clickable');
    else if (i === n)      tab.classList.add('active');
  });

  if (n === 3 && state.numbers.length > 0) renderNumbers(state.numbers);
}

function goHome() {
  stopPolling();
  Object.assign(state, { step:1, country:null, service:null, numbers:[], number:null, pollTimer:null, loading:false });
  renderCountries();
  goStep(1);
}

/* ── COUNTRIES ── */

function renderCountries() {
  document.getElementById('countryGrid').innerHTML = COUNTRIES_UI.map(c => `
    <div class="country-card ${state.country?.code === c.code ? 'sel' : ''}"
         onclick="App.selectCountry('${c.code}')" role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')App.selectCountry('${c.code}')">
      <span class="cc-flag">${c.flag}</span>
      <div>
        <div class="cc-name">${c.name}</div>
        <div class="cc-sub">${c.sub}</div>
      </div>
    </div>
  `).join('');
}

async function selectCountry(code) {
  const c = COUNTRIES_UI.find(x => x.code === code);
  if (!c) return;
  state.country = c;
  renderCountries();
  document.getElementById('step2Lbl').textContent =
    `— ${c.flag} ${c.name} — কোন service এর জন্য?`;
  renderServices();
  goStep(2);
}

/* ── SERVICES ── */

function renderServices() {
  document.getElementById('serviceGrid').innerHTML = SERVICES.map(s => `
    <div class="service-card ${state.service?.id === s.id ? 'sel' : ''}"
         onclick="App.selectService('${s.id}')" role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')App.selectService('${s.id}')">
      <div class="sc-icon">${s.icon}</div>
      <div class="sc-name">${s.name}</div>
    </div>
  `).join('');
}

async function selectService(id) {
  const s = SERVICES.find(x => x.id === id);
  if (!s) return;
  state.service = s;
  renderServices();
  document.getElementById('step3Lbl').textContent =
    `— ${state.country.flag} ${state.country.name} · ${s.icon} ${s.name}`;
  goStep(3);
  await fetchNumbers();
}

/* ── FETCH NUMBERS ── */

async function fetchNumbers() {
  const el = document.getElementById('numList');
  el.innerHTML = shimmerHTML(3);

  try {
    const res  = await fetchWithTimeout(`${WORKER}/numbers/${state.country.code}`, 12000);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.numbers)) throw new Error(data.error || 'No numbers returned');
    state.numbers = data.numbers;
    renderNumbers(data.numbers);
  } catch (e) {
    el.innerHTML = stateHTML('⚠️',
      `Numbers load হয়নি।<br>
       <small>${esc(e.message)}</small><br><br>
       <button class="get-btn" onclick="App.fetchNumbers()"
               style="font-size:11px;padding:8px 16px">↻ আবার চেষ্টা করো</button>`);
  }
}

/* ── RENDER NUMBERS ── */

function renderNumbers(numbers) {
  const el = document.getElementById('numList');
  if (!numbers.length) {
    el.innerHTML = stateHTML('📵',
      `${state.country.flag} ${state.country.name} তে এখন কোনো number নেই।<br>
       অন্য দেশ try করো।<br><br>
       <button class="back-btn" onclick="App.goStep(1)"
               style="margin:0 auto;display:inline-flex">← দেশ পরিবর্তন করো</button>`);
    return;
  }

  el.innerHTML = `<div class="num-list">` +
    numbers.map(n => `
      <div class="num-card" id="card_${n.id}">
        <div class="num-info">
          <div class="num-number">${esc(n.number)}</div>
          <div class="num-meta">
            ${n.flag || state.country.flag} ${n.label || state.country.name}
            &nbsp;·&nbsp; ${state.service.icon} ${state.service.name}
          </div>
        </div>
        <button class="get-btn" id="btn_${n.id}"
                onclick="App.getNumber('${n.id}')">
          Get Number →
        </button>
      </div>
    `).join('') + `</div>`;
}

/* ── GET NUMBER ── */

async function getNumber(id) {
  const num = state.numbers.find(n => n.id === id);
  if (!num) return;
  state.number = num;

  // Disable all buttons to prevent double-click
  document.querySelectorAll('.get-btn').forEach(b => { b.disabled = true; });

  // Hide step panels
  ['step1','step2','step3'].forEach(i =>
    document.getElementById('step' + i).classList.add('hidden')
  );

  // Mark all tabs as done & clickable
  [1,2,3].forEach(i => {
    const tab = document.getElementById('tab' + i);
    tab.className = 'step-tab done clickable';
  });

  // Show SMS panel
  const panel = document.getElementById('smsPanel');
  panel.classList.remove('hidden');
  renderSMSPanelShell();
  await loadSMS();

  stopPolling();
  state.pollTimer = setInterval(loadSMS, 15000);
}

/* ── SMS PANEL SHELL ── */

function renderSMSPanelShell() {
  const n = state.number;
  const s = state.service;
  const c = state.country;

  document.getElementById('smsPanel').innerHTML = `
    <div class="sms-panel">
      <div class="sms-panel-head">
        <div>
          <div style="font-size:10px;color:var(--txt2);text-transform:uppercase;
                      letter-spacing:1px;margin-bottom:5px">তোমার number</div>
          <div class="panel-number">${esc(n.number)}</div>
          <div class="panel-meta">${n.flag || c.flag} ${n.label || c.name}</div>
          <div class="panel-badges">
            <span class="badge badge-svc">${s.icon} ${s.name}</span>
            <span class="badge badge-live">
              <span class="dot" style="width:5px;height:5px"></span>Live
            </span>
          </div>
        </div>
        <div class="panel-actions">
          <button class="refresh-btn" id="refreshBtn" onclick="App.loadSMS()">
            <span id="refreshIcon">↻</span>&nbsp;Refresh
          </button>
          <div class="panel-nav">
            <button class="panel-nav-btn" onclick="App.goStep(3)">← অন্য number</button>
            <button class="panel-nav-btn" onclick="App.goStep(2)">← Service বদলাও</button>
            <button class="panel-nav-btn" onclick="App.goStep(1)">← দেশ বদলাও</button>
          </div>
        </div>
      </div>
      <div id="smsContent">${shimmerHTML(2)}</div>
    </div>
  `;
}

/* ── LOAD SMS ── */

async function loadSMS() {
  if (state.loading) return;
  state.loading = true;

  const btn     = document.getElementById('refreshBtn');
  const icon    = document.getElementById('refreshIcon');
  const content = document.getElementById('smsContent');

  if (btn)  btn.disabled  = true;
  if (icon) { icon.className = 'spin'; icon.textContent = '↻'; }

  try {
    const numId = state.number.id;
    const res   = await fetchWithTimeout(`${WORKER}/sms/${encodeURIComponent(numId)}`, 14000);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data  = await res.json();
    const msgs  = Array.isArray(data.messages) ? data.messages : [];
    if (content) renderSMSMessages(content, msgs);
  } catch (e) {
    if (content) content.innerHTML = `
      <div class="waiting-box">
        <div class="waiting-text">
          SMS load হয়নি।<br>
          <button class="get-btn" onclick="App.loadSMS()"
                  style="font-size:11px;padding:8px 16px;margin-top:12px">
            ↻ আবার চেষ্টা করো
          </button>
        </div>
      </div>`;
  } finally {
    state.loading = false;
    if (btn)  btn.disabled  = false;
    if (icon) { icon.className = ''; icon.textContent = '↻'; }
  }
}

/* ── RENDER SMS MESSAGES ── */

function renderSMSMessages(el, messages) {
  if (!messages.length) {
    el.innerHTML = `
      <div class="waiting-box">
        <div style="font-size:36px;margin-bottom:14px">📬</div>
        <div class="waiting-text">
          <strong style="color:var(--ac3)">${esc(state.number.number)}</strong>
          এ এখনো কোনো SMS আসেনি।<br>
          এই number টা ${state.service.icon}
          <strong>${state.service.name}</strong> এ দাও।<br>
          SMS আসলে এখানে দেখাবে <span class="cursor">▋</span>
        </div>
        <div class="auto-refresh-note">প্রতি ১৫ সেকেন্ডে auto-refresh হচ্ছে</div>
      </div>`;
    return;
  }

  el.innerHTML = `<div class="sms-list">` +
    messages.map(m => {
      const otp = extractOTP(m.body);
      // Unique id for copy button
      const btnId = 'copy_' + Math.random().toString(36).slice(2);
      return `
        <div class="sms-card">
          <div class="sms-head">
            <span class="sms-from">${esc(m.from || 'Unknown')}</span>
            <span class="sms-time">${esc(m.time || '')}</span>
          </div>
          <div class="sms-body">${esc(m.body || '')}</div>
          ${otp ? `
            <div class="otp-box">
              <div>
                <div class="otp-lbl">OTP Code</div>
                <div class="otp-code" id="otp_${btnId}">${otp}</div>
              </div>
              <button class="copy-btn" id="${btnId}"
                      onclick="App.copyOTP(this,'${otp}')">
                Copy
              </button>
            </div>` : ''}
        </div>`;
    }).join('') + `</div>`;
}

/* ── HELPERS ── */

function extractOTP(text) {
  if (!text) return null;
  const m = text.match(/\b(\d{4,8})\b/);
  return m ? m[1] : null;
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shimmerHTML(count) {
  return Array.from({ length: count }, (_, i) =>
    `<div class="shimmer" style="height:${80-i*10}px;opacity:${1-i*0.25}"></div>`
  ).join('');
}

function stateHTML(icon, text) {
  return `<div class="state-box"><div class="state-icon">${icon}</div><div class="state-text">${text}</div></div>`;
}

async function fetchWithTimeout(url, ms = 12000) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e.name === 'AbortError' ? new Error('Request timed out') : e;
  }
}

function stopPolling() {
  if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
}

function copyOTP(btn, code) {
  navigator.clipboard.writeText(code)
    .then(() => {
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      showToast('OTP copied!', 'ok');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    })
    .catch(() => showToast('Copy failed', 'err'));
}

function showToast(msg, cls = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast show ${cls}`;
  setTimeout(() => { el.className = 'toast'; }, 3000);
}

/* ── EXPOSE ── */
const App = {
  goHome, goStep,
  selectCountry, selectService,
  getNumber, loadSMS, fetchNumbers,
  copyOTP,
};
