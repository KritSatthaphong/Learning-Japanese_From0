/*
 * writelog.js — บันทึกการคัด (ฝึกเขียน)
 * ------------------------------------------------------------
 * นับว่าคัดตัวอักษร/ประโยคไหนไปกี่ครั้ง และคะแนนดีที่สุด (ไม่เก็บวันที่)
 *   จำนวนครั้ง/คะแนน  → localStorage (state.writeLog)
 *   ภาพลายมือ 6 ครั้งล่าสุด → IndexedDB (ฐานข้อมูล nihongo-writing) ครอบ try/catch
 * นับเฉพาะการคัดจริงที่กด "✓ ตรวจ" ในหน้าฝึกเขียน
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var DB_NAME = 'nihongo-writing', STORE = 'samples', KEEP = 6;
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

  function getSamples(key) {
    return openDB().then(function (db) {
      if (!db) return [];
      return new Promise(function (resolve) {
        try {
          var req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
          req.onsuccess = function () { resolve(req.result || []); };
          req.onerror = function () { resolve([]); };
        } catch (e) { resolve([]); }
      });
    });
  }

  function addSample(key, sample) {
    return getSamples(key).then(function (list) {
      list = [sample].concat(list).slice(0, KEEP);
      return openDB().then(function (db) {
        if (!db) return;
        try { db.transaction(STORE, 'readwrite').objectStore(STORE).put(list, key); } catch (e) { /* ignore */ }
      });
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
    KEEP: KEEP,

    /* บันทึกการคัดตัวอักษร 1 ครั้ง */
    recordChar: function (ch, score, img) {
      bump(log().chars, ch, score);
      NS.store.save();
      if (img) addSample('c:' + ch, { img: img, score: score });
    },

    /* บันทึกการคัดประโยค 1 ครั้ง (นับตัวอักษรแต่ละตัวในประโยคเข้าตารางด้วย) */
    recordSentence: function (id, text, score, img) {
      var L = log();
      bump(L.sents, id, score);
      var chars = Array.from(text);
      chars.forEach(function (ch, i) {
        if (inTable(ch)) bump(L.chars, ch, null);
        var pair = ch + (chars[i + 1] || '');
        if (/[ゃゅょャュョ]$/.test(pair) && inTable(pair)) bump(L.chars, pair, null);
      });
      NS.store.save();
      if (img) addSample('s:' + id, { img: img, score: score });
    },

    charCount: function (ch) { var r = log().chars[ch]; return r ? r.n : 0; },
    charRec: function (ch) { return log().chars[ch] || { n: 0, best: 0 }; },
    sentRec: function (id) { return log().sents[id] || { n: 0, best: 0 }; },
    samples: function (kind, key) { return getSamples((kind === 'sent' ? 's:' : 'c:') + key); },

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
