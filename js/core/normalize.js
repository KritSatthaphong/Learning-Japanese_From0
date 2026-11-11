/*
 * normalize.js — เทียบข้อความที่ถอดเสียงได้ กับวลีเป้าหมาย
 * ------------------------------------------------------------
 * ก่อนเทียบ: แปลงตัวเต็ม/ครึ่งความกว้าง (NFKC), คาตากานะ → ฮิรางานะ, ตัดช่องว่างและเครื่องหมายวรรคตอน
 * เทียบกับทุกรูปเขียนที่มีในข้อมูล (รูปมีคันจิ jp, คานะล้วน kana, รูปอื่น alt)
 * เพราะระบบถอดเสียงอาจให้ผลเป็นคันจิหรือฮิรางานะต่างจากที่เก็บไว้
 * คะแนน = ความคล้าย (1 - ระยะ Levenshtein / ความยาวที่ยาวกว่า)
 *   ≥ 80% = ตรง, ≥ 50% = ใกล้เคียง, น้อยกว่านั้น = ไม่ตรง
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};

  function toHira(s) {
    return s.replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); });
  }

  function clean(s) {
    s = String(s || '');
    try { s = s.normalize('NFKC'); } catch (e) { /* เบราว์เซอร์เก่า */ }
    return toHira(s).toLowerCase().replace(/[\s、。，,.．！!？?・「」『』（）()…:：;；"'“”]/g, '');
  }

  function lev(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }

  function similarity(a, b) {
    a = clean(a); b = clean(b);
    if (!a && !b) return 1;
    return 1 - lev(a, b) / Math.max(a.length, b.length);
  }

  function formsOf(item) {
    var seen = {}, out = [];
    [item.jp, item.char, item.kana].concat(item.alt || []).forEach(function (f) {
      var c = clean(f);
      if (c && !seen[c]) { seen[c] = true; out.push(f); }
    });
    return out;
  }

  function verdictOf(score) { return score >= 0.8 ? 'match' : score >= 0.5 ? 'close' : 'miss'; }

  /* heardList = ข้อความที่ถอดได้ (หลายตัวเลือก), item = วลีเป้าหมาย */
  function judge(heardList, item) {
    var best = { score: 0, heard: heardList[0] || '', form: '' };
    formsOf(item).forEach(function (f) {
      heardList.forEach(function (h) {
        var sc = similarity(h, f);
        if (sc > best.score) best = { score: sc, heard: h, form: f };
      });
    });
    best.verdict = verdictOf(best.score);
    best.pct = Math.round(best.score * 100);
    return best;
  }

  var LABEL = { match: '✅ ตรง', close: '🟡 ใกล้เคียง', miss: '❌ ไม่ตรง' };

  NS.normalize = { toHira: toHira, clean: clean, lev: lev, similarity: similarity, judge: judge, verdictOf: verdictOf, LABEL: LABEL };
})();
