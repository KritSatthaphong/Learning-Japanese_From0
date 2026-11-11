/*
 * kana-quiz.js — สร้างคำถามสำหรับด่านตัวอักษร 3 แบบ
 *   1) ดูตัวอักษร → เลือกโรมันจิ
 *   2) ดูโรมันจิ → เลือกตัวอักษร
 *   3) ฟังเสียง → เลือกตัวอักษร
 * ตัวเลือกหลอกมาจากด่านนี้ และอย่างน้อย 1 ตัวจากด่านก่อนหน้า (ทบทวนไปในตัว)
 * ไม่ให้มีตัวเลือกที่เสียงเหมือนกัน (เช่น お กับ を) อยู่ในข้อเดียวกัน
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var shuffle = NS.ui.shuffle;

  var TYPES = ['char2rom', 'rom2char', 'audio2char'];

  function distractors(it, same, prev, k) {
    var usedSound = {}; usedSound[it.soundKey] = true;
    var usedChar = {}; usedChar[it.char] = true;
    var out = [];
    function tryAdd(c) {
      if (!c || out.length >= k) return false;
      if (usedSound[c.soundKey] || usedChar[c.char]) return false;
      usedSound[c.soundKey] = true; usedChar[c.char] = true;
      out.push(c);
      return true;
    }
    if (it.near) tryAdd(it.near);
    var s = shuffle(same.filter(function (c) { return c.id !== it.id; }));
    var p = shuffle(prev);
    // เว้นที่ 1 ช่องให้ตัวจากด่านก่อนหน้า
    while (p.length && !tryAdd(p.shift())) { /* หาไปเรื่อยๆ จนได้ 1 ตัว */ }
    s.forEach(tryAdd);
    p.forEach(tryAdd);
    return out;
  }

  function makeQuestion(it, type, same, prev) {
    var opts = shuffle([it].concat(distractors(it, same, prev, 3)));
    var reveal = {
      title: it.char + ' = ' + it.label,
      detail: [it.tip, it.note].filter(Boolean).join(' · '),
      speak: it.sound
    };
    if (type === 'char2rom') {
      return {
        type: type, item: it, reveal: reveal, answerId: it.id,
        label: 'ตัวนี้อ่านว่าอะไร?',
        prompt: { text: it.char, jp: true },
        choices: opts.map(function (c) { return { id: c.id, label: c.label, jp: false }; })
      };
    }
    if (type === 'rom2char') {
      return {
        type: type, item: it, reveal: reveal, answerId: it.id,
        label: 'ตัวไหนอ่านว่า "' + it.label + '"?',
        prompt: { text: it.label, jp: false },
        choices: opts.map(function (c) { return { id: c.id, label: c.char, jp: true }; })
      };
    }
    return {
      type: type, item: it, reveal: reveal, answerId: it.id,
      label: 'ฟังเสียง แล้วเลือกตัวที่ได้ยิน',
      prompt: { audio: it.sound },
      choices: opts.map(function (c) { return { id: c.id, label: c.char, jp: true }; })
    };
  }

  function build(level, n) {
    n = n || 10;
    var same = NS.content.levelItems(level).filter(function (x) { return x.quiz; });
    var prev = NS.content.prevItems(level).filter(function (x) { return x.quiz; });
    if (!same.length) return [];

    // เลือกรายการให้ครอบคลุมทุกตัวก่อน แล้วค่อยวนซ้ำถ้าไม่พอ
    var picks = [];
    while (picks.length < n) picks = picks.concat(shuffle(same));
    picks = picks.slice(0, n);

    var types = [];
    while (types.length < n) types = types.concat(shuffle(TYPES));

    return picks.map(function (it, idx) { return makeQuestion(it, types[idx], same, prev); });
  }

  NS.kanaQuiz = { build: build };
})();
