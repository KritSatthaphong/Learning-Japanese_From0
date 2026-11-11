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
      S.stopListening();
    },

    /* ---------- ถอดเสียงพูด (SpeechRecognition ja-JP) ---------- */
    recogSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    isFile: location.protocol === 'file:',
    _rec: null,

    /* ฟัง 1 ประโยค คืนค่า Promise { ok, alternatives: [...] } หรือ { ok: false, error, message } */
    listen: function () {
      var R = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!R) return Promise.resolve({ ok: false, error: 'unsupported', message: S.errorText('unsupported') });
      S.stop();
      return new Promise(function (resolve) {
        var done = false, guard = null;
        function finish(r) { if (!done) { done = true; clearTimeout(guard); S._rec = null; resolve(r); } }
        // กันค้าง: ถ้าระบบถอดเสียงเงียบไปนานเกิน 15 วินาที ให้จบเอง
        guard = setTimeout(function () { S.stopListening(); finish({ ok: false, error: 'no-speech', message: S.errorText('no-speech') }); }, 15000);
        try {
          var rec = new R();
          rec.lang = 'ja-JP';
          rec.interimResults = false;
          rec.continuous = false;
          rec.maxAlternatives = 5;
          rec.onresult = function (e) {
            var res = e.results[0], alts = [];
            for (var i = 0; i < res.length; i++) alts.push(res[i].transcript);
            finish({ ok: true, alternatives: alts });
          };
          rec.onerror = function (e) { finish({ ok: false, error: e.error, message: S.errorText(e.error) }); };
          rec.onend = function () { finish({ ok: false, error: 'no-speech', message: S.errorText('no-speech') }); };
          S._rec = rec;
          rec.start();
        } catch (err) {
          finish({ ok: false, error: 'start', message: S.errorText('start') + ' (' + err.message + ')' });
        }
      });
    },

    stopListening: function () {
      try { if (S._rec) S._rec.stop(); } catch (e) { /* ignore */ }
    },

    errorText: function (code) {
      var fileTip = S.isFile ? ' — ตอนนี้เปิดจากไฟล์ (file://) ซึ่ง Chrome มักไม่ให้ใช้ไมค์ ให้เปิดผ่าน localhost หรือ GitHub Pages แทน' : '';
      return ({
        unsupported: 'เบราว์เซอร์นี้ถอดเสียงพูดไม่ได้ แนะนำ Google Chrome (คอม / Android)',
        'not-allowed': 'ไม่ได้รับอนุญาตให้ใช้ไมค์ กดอนุญาตไมค์ที่ไอคอน 🔒 หน้าที่อยู่เว็บ' + fileTip,
        'service-not-allowed': 'เบราว์เซอร์ไม่อนุญาตให้ใช้ระบบถอดเสียง' + fileTip,
        'no-speech': 'ไม่ได้ยินเสียง ลองพูดดังขึ้น หรือใกล้ไมค์มากขึ้น',
        'audio-capture': 'ไม่พบไมค์ ตรวจว่าเสียบไมค์ หรืออนุญาตไมค์ในการตั้งค่าเครื่องแล้ว',
        network: 'ระบบถอดเสียงของ Chrome ต้องต่ออินเทอร์เน็ต ลองตรวจการเชื่อมต่อ',
        aborted: 'หยุดฟังแล้ว',
        start: 'เริ่มฟังไม่ได้'
      })[code] || ('เกิดข้อผิดพลาด: ' + code);
    }
  };
})();
