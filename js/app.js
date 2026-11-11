/*
 * app.js — เริ่มต้นแอป: ธีม, ระบบเสียง, แถบเตือน, เปิดหน้าแรก
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var bannerClosed = false;

  function applyTheme() {
    var t = NS.store.settings().theme;
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }

  /* วิธีติดตั้งเสียงภาษาญี่ปุ่น */
  function voiceHelp() {
    return h('details', { class: 'help' },
      h('summary', null, 'วิธีแก้เมื่อไม่มีเสียงภาษาญี่ปุ่น'),
      h('ul', null,
        h('li', null, h('strong', null, 'ง่ายที่สุด: '), 'เปิดแอปด้วย Google Chrome หรือ Microsoft Edge (มีเสียงญี่ปุ่นออนไลน์ในตัว ต้องต่ออินเทอร์เน็ต)'),
        h('li', null, h('strong', null, 'Windows: '), 'Settings → Time & language → Speech → Add voices → เลือก Japanese (日本語) → ติดตั้งเสร็จแล้วปิด-เปิดเบราว์เซอร์ใหม่'),
        h('li', null, h('strong', null, 'Android: '), 'ตั้งค่า → การจัดการทั่วไป/ระบบ → ภาษา → เอาต์พุตการอ่านออกเสียง (Text-to-speech) → Google → ติดตั้งข้อมูลเสียง → ภาษาญี่ปุ่น'),
        h('li', null, h('strong', null, 'iPhone/iPad: '), 'Settings → Accessibility → Spoken Content → Voices → Japanese → ดาวน์โหลดเสียง (เช่น Kyoko)'),
        h('li', null, h('strong', null, 'Mac: '), 'System Settings → Accessibility → Spoken Content → System voice → Manage Voices → Japanese')));
  }

  function updateBanner() {
    var el = document.getElementById('banner');
    if (!el) return;
    el.innerHTML = '';
    if (bannerClosed) return;
    var s = NS.speech.status();
    var msg = null;
    if (s === 'unsupported') msg = '⚠️ เบราว์เซอร์นี้อ่านออกเสียงไม่ได้ แนะนำให้เปิดด้วย Google Chrome (คอม / Android) หรือ Safari (iPhone)';
    else if (s === 'novoice') msg = '⚠️ ไม่พบเสียงภาษาญี่ปุ่นในเครื่อง เสียงอาจเป็นสำเนียงอื่นหรือไม่มีเสียง';
    if (!msg) return;
    el.appendChild(h('div', { class: 'banner', role: 'status' },
      h('div', { class: 'banner-text' }, h('p', null, msg), voiceHelp()),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'ปิดข้อความเตือน', onclick: function () { bannerClosed = true; updateBanner(); } }, '✕')));
  }

  NS.app = { applyTheme: applyTheme, updateBanner: updateBanner, voiceHelp: voiceHelp };

  applyTheme();
  NS.speech.onChange(updateBanner);
  NS.speech.init();
  updateBanner();
  NS.router.start();
})();
