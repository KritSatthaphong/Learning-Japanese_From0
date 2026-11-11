/*
 * vocab-quiz.js — สร้างคำถามสำหรับด่านคำศัพท์ 3 แบบ
 *   1) ดูคำ → เลือกความหมาย
 *   2) ฟังเสียง → เลือกความหมาย
 *   3) ดูความหมาย → เลือกคำญี่ปุ่น
 * ตัวเลือกหลอกมาจากด่านนี้ และอย่างน้อย 1 คำจากด่านคำศัพท์ก่อนหน้า
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var shuffle = NS.ui.shuffle;
  var TYPES = ['w2th', 'a2th', 'th2w'];

  function distractors(it, same, prev, k) {
    var usedTh = {}; usedTh[it.th] = true;
    var usedKana = {}; usedKana[it.char] = true;
    var out = [];
    function tryAdd(c) {
      if (!c || out.length >= k || usedTh[c.th] || usedKana[c.char]) return false;
      usedTh[c.th] = true; usedKana[c.char] = true; out.push(c); return true;
    }
    var p = shuffle(prev);
    while (p.length && !tryAdd(p.shift())) { /* เอาจากด่านก่อนหน้า 1 คำ */ }
    shuffle(same.filter(function (c) { return c.id !== it.id; })).forEach(tryAdd);
    p.forEach(tryAdd);
    return out;
  }

  function makeQuestion(it, type, same, prev) {
    var opts = shuffle([it].concat(distractors(it, same, prev, 3)));
    var reveal = {
      title: it.char + (it.kanji ? ' (' + it.kanji + ')' : '') + ' = ' + it.th,
      detail: [it.label, it.note].filter(Boolean).join(' · '),
      speak: it.sound
    };
    var base = { type: type, item: it, reveal: reveal, answerId: it.id };
    if (type === 'w2th') {
      return Object.assign(base, {
        label: 'คำนี้แปลว่าอะไร?',
        prompt: { text: it.char, jp: true },
        choices: opts.map(function (c) { return { id: c.id, label: c.th, jp: false }; })
      });
    }
    if (type === 'a2th') {
      return Object.assign(base, {
        label: 'ฟังแล้วเลือกความหมาย',
        prompt: { audio: it.sound },
        choices: opts.map(function (c) { return { id: c.id, label: c.th, jp: false }; })
      });
    }
    return Object.assign(base, {
      label: 'คำไหนแปลว่า "' + it.th + '"?',
      prompt: { text: it.th, jp: false, th: true },
      choices: opts.map(function (c) { return { id: c.id, label: c.char, jp: true }; })
    });
  }

  function build(level, n) {
    n = n || 10;
    var same = NS.content.vocabItems(level);
    var prev = NS.content.vocabBefore(level);
    if (!same.length) return [];
    var picks = [];
    while (picks.length < n) picks = picks.concat(shuffle(same));
    picks = picks.slice(0, n);
    var types = [];
    while (types.length < n) types = types.concat(shuffle(TYPES));
    return picks.map(function (it, i) { return makeQuestion(it, types[i], same, prev); });
  }

  function forItem(it) {
    var level = NS.progress.find(it.level);
    return makeQuestion(it, TYPES[Math.floor(Math.random() * TYPES.length)], NS.content.vocabItems(level), NS.content.vocabBefore(level));
  }

  NS.vocabQuiz = { build: build, forItem: forItem };
})();
