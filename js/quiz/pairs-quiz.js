/*
 * pairs-quiz.js — ฟังแยกเสียงที่คล้ายกัน: ฟังเสียง 1 คำ แล้วเลือกจาก 2 ตัวเลือก
 * และหน้ารายการคู่คำ (ใช้ทั้งในด่านเสริม 2-B และหน้า "ฟังแยกเสียง" ในแถบทบทวน)
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var shuffle = NS.ui.shuffle;

  function catOf(id) { return NS.PAIR_CATS.find(function (c) { return c.id === id; }) || { title: id, desc: '' }; }

  function pairsIn(cat) {
    return NS.PAIRS.filter(function (p) { return !cat || cat === 'all' || p.cat === cat; });
  }

  function side(w, key) {
    return { id: 'pair-' + w.romaji, char: w.kana, label: w.romaji, th: w.th, sound: w.kana, key: key };
  }

  function build(cat, n) {
    n = n || 10;
    var pool = pairsIn(cat);
    var picks = [];
    while (picks.length < n && pool.length) picks = picks.concat(shuffle(pool));
    picks = picks.slice(0, n);
    return picks.map(function (p) {
      var a = side(p.a, 'a'), b = side(p.b, 'b');
      var target = Math.random() < 0.5 ? a : b;
      var c = catOf(p.cat);
      return {
        type: 'pair', item: target, answerId: target.id,
        label: 'ได้ยินคำไหน?',
        prompt: { audio: target.sound },
        choices: shuffle([a, b]).map(function (s) {
          return { id: s.id, label: s.char, jp: true, sub: s.label + ' · ' + s.th };
        }),
        reveal: {
          title: target.char + ' (' + target.label + ')',
          detail: c.title + ': ' + p.a.kana + ' = ' + p.a.th + '  ↔  ' + p.b.kana + ' = ' + p.b.th,
          speak: target.sound
        }
      };
    });
  }

  /* ปุ่มคำหนึ่งฝั่ง: แตะแล้วฟัง */
  function wordBtn(w) {
    return h('button', { class: 'pair-word', type: 'button', 'aria-label': 'ฟัง ' + w.kana,
      onclick: function () { NS.speech.speak(w.kana); } },
      NS.ui.jp(w.kana, 'pair-kana'),
      h('span', { class: 'pair-romaji' }, w.romaji),
      h('span', { class: 'pair-th' }, w.th));
  }

  /* รายการคู่คำแยกตามหมวด */
  function list(cat) {
    var cats = NS.PAIR_CATS.filter(function (c) { return !cat || cat === 'all' || c.id === cat; });
    return h('div', { class: 'pairs-list' }, cats.map(function (c) {
      return h('section', { class: 'card pair-cat' },
        h('h3', null, c.title), h('p', { class: 'muted small' }, c.desc),
        pairsIn(c.id).map(function (p) {
          return h('div', { class: 'pair-row' }, wordBtn(p.a), h('span', { class: 'pair-vs', 'aria-hidden': 'true' }, '↔'), wordBtn(p.b));
        }));
    }));
  }

  function forItem(it) {
    var p = NS.PAIRS.find(function (x) { return 'pair-' + x.a.romaji === it.id || 'pair-' + x.b.romaji === it.id; });
    var a = side(p.a, 'a'), b = side(p.b, 'b');
    var target = it.id === a.id ? a : b;
    var c = catOf(p.cat);
    return {
      type: 'pair', item: target, answerId: target.id, label: 'ได้ยินคำไหน?',
      prompt: { audio: target.sound },
      choices: shuffle([a, b]).map(function (s) { return { id: s.id, label: s.char, jp: true, sub: s.label + ' · ' + s.th }; }),
      reveal: { title: target.char + ' (' + target.label + ')', detail: c.title + ': ' + p.a.kana + ' = ' + p.a.th + '  ↔  ' + p.b.kana + ' = ' + p.b.th, speak: target.sound }
    };
  }

  NS.pairsQuiz = { build: build, list: list, forItem: forItem };
})();
