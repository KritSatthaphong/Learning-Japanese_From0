/*
 * writelog.js — บันทึกการคัด (ฝึกเขียน)
 * ------------------------------------------------------------
 * นับว่าคัดตัวอักษร/ประโยคไหนไปกี่ครั้ง และคะแนนดีที่สุด (ไม่เก็บวันที่)
 *   จำนวนครั้ง/คะแนน  → localStorage (state.writeLog)
 *   ภาพลายมือทุกครั้ง     → IndexedDB (ฐานข้อมูล nihongo-writing) ครอบ try/catch
 * นับเฉพาะการคัดจริงที่กด "✓ ตรวจ" ในหน้าฝึกเขียน
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  /*
   * IndexedDB 'nihongo-writing'
   *   v1: store 'samples' — เก็บ 6 ภาพล่าสุดต่อ key (เลิกใช้แล้ว)
   *   v2: store 'all'     — เก็บทุกภาพ 1 แถวต่อ 1 ครั้ง { kind, key, label, th, img, score } (id เพิ่มอัตโนมัติ = ลำดับ)
   *       ตอนอัปเกรดจะย้ายภาพจาก 'samples' มาไว้ที่ 'all' ให้
   */
  var DB_NAME = 'nihongo-writing', STORE = 'all';
  var dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      try {
        if (!window.indexedDB) { resolve(null); return; }
        var req = indexedDB.open(DB_NAME, 2);
        req.onupgradeneeded = function (e) {
          var db = req.result, tx = req.transaction;
          var all = db.objectStoreNames.contains(STORE) ? tx.objectStore(STORE) : db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
          if (e.oldVersion >= 1 && db.objectStoreNames.contains('samples')) {
            var old = tx.objectStore('samples');
            old.openCursor().onsuccess = function (ev) {
              var cur = ev.target.result;
              if (!cur) { try { db.deleteObjectStore('samples'); } catch (x) { /* ignore */ } return; }
              var key = String(cur.key), list = (cur.value || []).slice().reverse();   // เก่าก่อน
              list.forEach(function (sm) {
                all.add({ kind: key.indexOf('s:') === 0 ? 'sent' : 'char', key: key.slice(2), label: '', img: sm.img, score: sm.score });
              });
              cur.continue();
            };
          }
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
    return dbPromise;
  }

  /* อ่านทุกแถว (ใหม่สุดก่อน) กรองด้วย fn */
  function readAll(fn) {
    return openDB().then(function (db) {
      if (!db) return [];
      return new Promise(function (resolve) {
        var out = [];
        try {
          var req = db.transaction(STORE, 'readonly').objectStore(STORE).openCursor(null, 'prev');
          req.onsuccess = function () {
            var cur = req.result;
            if (!cur) { resolve(out); return; }
            if (!fn || fn(cur.value)) out.push(cur.value);
            cur.continue();
          };
          req.onerror = function () { resolve(out); };
        } catch (e) { resolve(out); }
      });
    });
  }

  function addSample(rec) {
    return openDB().then(function (db) {
      if (!db) return;
      try {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).add(rec);
        tx.onerror = function () { if (NS.ui) NS.ui.toast('เก็บภาพลายมือไม่ได้ (พื้นที่ในเครื่องอาจเต็ม)'); };
      } catch (e) { /* ignore */ }
    });
  }

  function log() {
    var s = NS.store.get();
    if (!s.writeLog || typeof s.writeLog !== 'object') s.writeLog = {};
    if (!s.writeLog.chars) s.writeLog.chars = {};
    if (!s.writeLog.sents) s.writeLog.sents = {};
    return s.writeLog;
  }

  function bump(map, key, score) {
    var r = map[key] || (map[key] = { n: 0, best: 0 });
    r.n++;
    if (score != null && score > r.best) r.best = score;
  }

  /* ตัวอักษรที่มีในตาราง (ใช้นับตัวอักษรที่อยู่ในประโยค) */
  var tableChars = null;
  function inTable(ch) {
    if (!tableChars) {
      tableChars = {};
      NS.KANA.forEach(function (k) { tableChars[k.hira] = true; tableChars[k.kata] = true; });
    }
    return !!tableChars[ch];
  }

  NS.writeLog = {
    /* บันทึกการคัดตัวอักษร 1 ครั้ง */
    recordChar: function (ch, score, img) {
      bump(log().chars, ch, score);
      NS.store.save();
      if (img) addSample({ kind: 'char', key: ch, label: ch, img: img, score: score });
    },

    /* บันทึกการคัดประโยค 1 ครั้ง (นับตัวอักษรแต่ละตัวในประโยคเข้าตารางด้วย) */
    recordSentence: function (id, text, score, img, th) {
      var L = log();
      bump(L.sents, id, score);
      var chars = Array.from(text);
      chars.forEach(function (ch, i) {
        if (inTable(ch)) bump(L.chars, ch, null);
        var pair = ch + (chars[i + 1] || '');
        if (/[ゃゅょャュョ]$/.test(pair) && inTable(pair)) bump(L.chars, pair, null);
      });
      NS.store.save();
      if (img) addSample({ kind: 'sent', key: id, label: text, th: th || '', img: img, score: score });
    },

    charCount: function (ch) { var r = log().chars[ch]; return r ? r.n : 0; },
    charRec: function (ch) { return log().chars[ch] || { n: 0, best: 0 }; },
    sentRec: function (id) { return log().sents[id] || { n: 0, best: 0 }; },

    /* ภาพลายมือทั้งหมดของตัว/ประโยคนี้ (ใหม่สุดก่อน) */
    samples: function (kind, key) { return readAll(function (r) { return r.kind === kind && r.key === key; }); },
    /* ภาพลายมือทั้งหมด (ใหม่สุดก่อน) */
    allSamples: function () { return readAll(null); },

    removeSample: function (id) {
      return openDB().then(function (db) {
        if (!db) return;
        try { db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id); } catch (e) { /* ignore */ }
      });
    },

    totals: function () {
      var L = log(), cn = 0, cu = 0, sn = 0, su = 0;
      Object.keys(L.chars).forEach(function (k) { cn += L.chars[k].n; cu++; });
      Object.keys(L.sents).forEach(function (k) { sn += L.sents[k].n; su++; });
      return { charWrites: cn, charsUsed: cu, sentWrites: sn, sentsUsed: su };
    },

    clearSamples: function () {
      return openDB().then(function (db) {
        if (!db) return;
        try { db.transaction(STORE, 'readwrite').objectStore(STORE).clear(); } catch (e) { /* ignore */ }
      });
    }
  };
})();
