/*
 * speech.js — อ่านออกเสียงภาษาญี่ปุ่นด้วย speechSynthesis ที่มีในเบราว์เซอร์ (ฟรี ไม่ต้องใช้ API key)
 * (ส่วนถอดเสียงพูดและอัดเสียงจะเพิ่มในเฟส 5)
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};

  var supported = ('speechSynthesis' in window) && ('SpeechSynthesisUtterance' in window);
  var voice = null;
  var voiceCount = 0;
  var checked = false;
  var listeners = [];

  function pickVoice() {
    if (!supported) return;
    var vs = [];
    try { vs = window.speechSynthesis.getVoices() || []; } catch (e) { vs = []; }
    voiceCount = vs.length;
    var ja = vs.filter(function (v) { return /^ja([-_]|$)/i.test(v.lang || ''); });
    voice = ja.find(function (v) { return /google/i.test(v.name); }) ||
            ja.find(function (v) { return v.localService; }) ||
            ja[0] || null;
    listeners.forEach(function (fn) { fn(); });
  }

  var S = NS.speech = {
    supported: supported,

    init: function () {
      if (!supported) { checked = true; return; }
      pickVoice();
      try {
        if (window.speechSynthesis.addEventListener) {
          window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
        } else {
          window.speechSynthesis.onvoiceschanged = pickVoice;
        }
      } catch (e) { /* ignore */ }
      // บางเบราว์เซอร์โหลดรายชื่อเสียงช้า รอสักครู่แล้วค่อยสรุปผล
      setTimeout(function () { checked = true; pickVoice(); }, 2000);
    },

    onChange: function (fn) { listeners.push(fn); },

    /*
     * สถานะ: 'unsupported' = เบราว์เซอร์ไม่มีระบบเสียง
     *        'checking'    = กำลังตรวจ
     *        'novoice'     = มีระบบเสียงแต่ไม่พบเสียงญี่ปุ่น
     *        'unknown'     = เบราว์เซอร์ไม่บอกรายชื่อเสียง (มักยังพูดได้ เช่น Android บางรุ่น)
     *        'ok'          = พบเสียงญี่ปุ่น
     */
    status: function () {
      if (!supported) return 'unsupported';
      if (voice) return 'ok';
      if (!checked) return 'checking';
      if (voiceCount === 0) return 'unknown';
      return 'novoice';
    },

    voiceName: function () { return voice ? voice.name : ''; },

    speak: function (text, opts) {
      opts = opts || {};
      if (!supported) {
        if (NS.ui) NS.ui.toast('เบราว์เซอร์นี้อ่านออกเสียงไม่ได้ ลองเปิดด้วย Google Chrome');
        return Promise.resolve(false);
      }
      return new Promise(function (resolve) {
        try {
          var synth = window.speechSynthesis;
          synth.cancel();
          var u = new SpeechSynthesisUtterance(text);
          u.lang = 'ja-JP';
          if (voice) u.voice = voice;
          u.rate = opts.rate || (NS.store ? NS.store.settings().rate : 0.85);
          u.onend = function () { resolve(true); };
          u.onerror = function () { resolve(false); };
          synth.speak(u);
          // Chrome บางเวอร์ชันค้างในสถานะ pause
          if (synth.paused) synth.resume();
        } catch (e) {
          resolve(false);
        }
      });
    },

    stop: function () {
      try { if (supported) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
  };
})();
