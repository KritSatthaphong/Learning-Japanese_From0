/*
 * recorder.js — อัดเสียงตัวเอง (MediaRecorder) แล้วเก็บไฟล์ล่าสุดของแต่ละวลีใน IndexedDB
 * ทุกการเรียก IndexedDB ครอบด้วย try/catch — ถ้าเบราว์เซอร์ไม่ให้เก็บ ก็ยังอัดและฟังได้ แค่ไม่จำไว้
 * ไม่มีการส่งเสียงไปที่ไหน อยู่ในเครื่องนี้เท่านั้น
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var DB_NAME = 'nihongo-audio', STORE = 'rec', MAX_MS = 10000;
  var dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      try {
        if (!window.indexedDB) { resolve(null); return; }
        var req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
    return dbPromise;
  }

  function tx(mode, fn) {
    return openDB().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          var t = db.transaction(STORE, mode), store = t.objectStore(STORE);
          var req = fn(store);
          t.oncomplete = function () { resolve(req ? req.result : true); };
          t.onerror = function () { resolve(null); };
        } catch (e) { resolve(null); }
      });
    });
  }

  NS.audioDB = {
    save: function (id, rec) { return tx('readwrite', function (s) { return s.put(rec, id); }); },
    get: function (id) { return tx('readonly', function (s) { return s.get(id); }); },
    remove: function (id) { return tx('readwrite', function (s) { return s.delete(id); }); },
    clear: function () { return tx('readwrite', function (s) { return s.clear(); }); }
  };

  /* ---------- อัดเสียง ---------- */
  var current = null;
  NS.recorder = {
    supported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder),
    isRecording: function () { return !!current; },

    start: function () {
      if (current) return Promise.reject(new Error('busy'));
      return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        var mr = new MediaRecorder(stream), chunks = [];
        var stopped = new Promise(function (resolve) {
          mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
          mr.onstop = function () {
            stream.getTracks().forEach(function (t) { t.stop(); });
            var mime = mr.mimeType || 'audio/webm';
            resolve({ blob: new Blob(chunks, { type: mime }), mime: mime });
          };
        });
        mr.start();
        current = { mr: mr, stopped: stopped, timer: setTimeout(function () { NS.recorder.stop(); }, MAX_MS) };
        return stopped;
      });
    },

    stop: function () {
      if (!current) return Promise.resolve(null);
      var c = current; current = null;
      clearTimeout(c.timer);
      try { if (c.mr.state !== 'inactive') c.mr.stop(); } catch (e) { /* ignore */ }
      return c.stopped;
    },

    ext: function (mime) { return /mp4|aac/.test(mime) ? 'm4a' : /ogg/.test(mime) ? 'ogg' : 'webm'; },

    errorText: function (err) {
      var n = err && err.name;
      if (n === 'NotAllowedError' || n === 'SecurityError') return 'ไม่ได้รับอนุญาตให้ใช้ไมค์' + (NS.speech.isFile ? ' (เปิดจาก file:// ลองเปิดผ่าน localhost หรือ GitHub Pages)' : ' กดอนุญาตไมค์ที่ไอคอน 🔒 หน้าที่อยู่เว็บ');
      if (n === 'NotFoundError') return 'ไม่พบไมค์ในเครื่อง';
      return 'อัดเสียงไม่ได้: ' + (err && err.message || n || 'ไม่ทราบสาเหตุ');
    }
  };

  /*
   * แผงอัดเสียงฟังเทียบ: ① ฟังต้นแบบ → ② อัดเสียง → ③ ฟังเสียงฉัน → ④ ฟังต้นแบบอีกรอบ
   * ใช้ในหน้าฝึกพูดและในด่านขั้น 5
   */
  NS.recPanel = function (item, opts) {
    opts = opts || {};
    var audio = null, url = null, saved = null;
    var status = h('span', { class: 'muted small rec-status', 'aria-live': 'polite' });
    var btnRec = h('button', { class: 'btn btn-soft small', type: 'button', onclick: toggleRec }, '⏺ อัดเสียง');
    var btnMine = h('button', { class: 'btn btn-soft small', type: 'button', disabled: true, onclick: playMine }, '▶ เสียงฉัน');
    var dl = h('a', { class: 'btn btn-ghost small', hidden: true }, '⬇ ไฟล์เสียง');
    var wrap = h('div', { class: 'rec-panel' + (opts.compact ? ' compact' : '') },
      opts.compact ? null : h('div', { class: 'rec-title small' }, '🎙 อัดเสียงตัวเองแล้วฟังเทียบกับต้นแบบ'),
      h('div', { class: 'rec-steps' },
        NS.ui.speakBtn(item.sound, { label: '① 🔊 ต้นแบบ', cls: 'btn-ghost small' }),
        btnRec, btnMine,
        NS.ui.speakBtn(item.sound, { label: '🔁 ต้นแบบ', cls: 'btn-ghost small', aria: 'ฟังต้นแบบอีกรอบ' }),
        dl),
      status);
    // ตัวเลขลำดับขั้น
    btnRec.textContent = '② ⏺ อัด'; btnMine.textContent = '③ ▶ เสียงฉัน';

    if (!NS.recorder.supported) {
      btnRec.disabled = true;
      status.textContent = 'เบราว์เซอร์นี้อัดเสียงไม่ได้ (แนะนำ Chrome)';
    }

    function setBlob(rec) {
      saved = rec;
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(rec.blob);
      btnMine.disabled = false;
      dl.hidden = false;
      dl.href = url;
      dl.setAttribute('download', 'nihongo-' + item.id + '-' + (rec.date || NS.store.today()) + '.' + NS.recorder.ext(rec.mime));
      status.textContent = 'มีไฟล์เสียงล่าสุด (' + (rec.date || '') + ')';
    }

    NS.audioDB.get(item.id).then(function (rec) { if (rec && rec.blob) setBlob(rec); });

    function toggleRec() {
      if (NS.recorder.isRecording()) { NS.recorder.stop(); return; }
      NS.speech.stop();
      status.textContent = '🔴 กำลังอัด… พูดได้เลย (สูงสุด 10 วินาที) กดอีกครั้งเพื่อหยุด';
      btnRec.textContent = '⏹ หยุด';
      btnRec.classList.add('recording');
      NS.recorder.start().then(function (r) {
        btnRec.textContent = '② ⏺ อัดใหม่'; btnRec.classList.remove('recording');
        if (!r || !r.blob.size) { status.textContent = 'ไม่ได้เสียง ลองอีกครั้ง'; return; }
        var rec = { blob: r.blob, mime: r.mime, date: NS.store.today() };
        setBlob(rec);
        NS.audioDB.save(item.id, rec);
        playMine();
      }).catch(function (err) {
        btnRec.textContent = '② ⏺ อัด'; btnRec.classList.remove('recording');
        status.textContent = NS.recorder.errorText(err);
      });
    }

    function playMine() {
      if (!url) return;
      try {
        if (audio) audio.pause();
        audio = new Audio(url);
        audio.play().catch(function () { status.textContent = 'เล่นเสียงไม่ได้'; });
      } catch (e) { status.textContent = 'เล่นเสียงไม่ได้'; }
    }

    return wrap;
  };
})();
