/*
 * pairs.js — หน้า "ฟังแยกเสียงที่คล้ายกัน" (แถบทบทวน) เลือกหมวดแล้วฝึกได้ไม่จำกัด
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  NS.pages.pairs = function (root) {
    var cat = 'all';

    function home() {
      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/review', class: 'back' }, '← ทบทวน'));
      root.appendChild(h('h1', { class: 'page-title' }, 'ฟังแยกเสียงที่คล้ายกัน'));
      root.appendChild(h('p', { class: 'muted' }, 'เสียงต่างกันนิดเดียว แต่ความหมายเปลี่ยนไปเลย ฟังแล้วเลือกคำที่ได้ยินจาก 2 ตัวเลือก'));
      root.appendChild(NS.ui.segmented(
        [{ value: 'all', label: 'ทั้งหมด' }].concat(NS.PAIR_CATS.map(function (c) { return { value: c.id, label: c.title }; })),
        cat, function (v) { cat = v; home(); }, 'เลือกหมวด'));
      root.appendChild(h('div', { class: 'sticky-cta' },
        h('button', { class: 'btn btn-primary btn-block btn-lg', type: 'button', onclick: start }, '▶ เริ่มฝึก 10 ข้อ')));
      root.appendChild(h('h2', { class: 'section-title' }, 'คู่คำทั้งหมด (แตะเพื่อฟัง)'));
      root.appendChild(NS.pairsQuiz.list(cat));
    }

    function start() {
      root.innerHTML = '';
      var holder = h('div');
      root.appendChild(h('h1', { class: 'page-title' }, 'ฟังแยกเสียง'));
      root.appendChild(holder);
      NS.quiz.run(holder, {
        questions: NS.pairsQuiz.build(cat, 10),
        onAnswer: function (q, ok) { NS.store.recordAnswer('pairs', ok); },
        onExit: home,
        onFinish: function (r) {
          root.innerHTML = '';
          root.appendChild(h('h1', { class: 'page-title' }, 'ผลการฝึกฟัง'));
          root.appendChild(NS.quiz.resultCard(r, { noStars: true }));
          if (r.wrong.length) root.appendChild(NS.quiz.wrongList(r.wrong));
          root.appendChild(h('div', { class: 'stack' },
            h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: start }, '↻ ฝึกอีก 10 ข้อ'),
            h('button', { class: 'btn btn-soft btn-block', type: 'button', onclick: home }, 'กลับไปเลือกหมวด')));
        }
      });
    }

    home();
  };
})();
