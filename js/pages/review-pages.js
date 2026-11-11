/*
 * review-pages.js — หน้า "ทบทวนตามรอบ (SRS)" และ "สมุดคำผิด"
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var MAX_SESSION = 20;

  function thaiDate(k) {
    var M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    var p = k.split('-').map(Number);
    return p[2] + ' ' + M[p[1] - 1];
  }

  /* เล่นแบบฝึกหัดชุดหนึ่ง แล้วแสดงผล */
  function session(root, title, questions, opts) {
    root.innerHTML = '';
    var holder = h('div');
    root.appendChild(h('h1', { class: 'page-title' }, title));
    root.appendChild(holder);
    NS.quiz.run(holder, {
      questions: questions,
      onAnswer: function (q, ok) {
        NS.store.recordAnswer(opts.stage, ok);
        if (opts.srs) NS.srs.answer(q.item.id, ok);
      },
      onExit: opts.back,
      onFinish: function (r) {
        root.innerHTML = '';
        root.appendChild(h('h1', { class: 'page-title' }, title + ' · ผลลัพธ์'));
        root.appendChild(NS.quiz.resultCard(r, { noStars: true }));
        if (r.wrong.length) root.appendChild(NS.quiz.wrongList(r.wrong));
        root.appendChild(h('div', { class: 'stack' },
          h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: opts.back }, 'กลับ'),
          h('a', { class: 'btn btn-ghost btn-block', href: '#/review' }, 'ไปหน้าทบทวน')));
      }
    });
  }

  /* ---------- ทบทวนตามรอบ ---------- */
  NS.pages.srs = function (root) {
    function home() {
      NS.srs.sync();
      var due = NS.srs.dueList();
      var boxes = NS.srs.boxes();
      var total = boxes.reduce(function (a, b) { return a + b; }, 0);
      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/review', class: 'back' }, '← ทบทวน'));
      root.appendChild(h('h1', { class: 'page-title' }, 'ทบทวนตามรอบ (SRS)'));
      root.appendChild(h('p', { class: 'muted' }, 'ทุกอย่างที่เรียนแล้วจะวนกลับมาให้ทบทวนตอนที่ใกล้จะลืม ตอบถูกเลื่อนกล่องขึ้น (ทบทวนห่างขึ้น) ตอบผิดกลับกล่อง 1'));

      root.appendChild(h('section', { class: 'card srs-hero' },
        h('div', { class: 'srs-due' }, h('strong', null, String(due.length)), h('span', { class: 'muted' }, 'รายการที่ถึงรอบวันนี้')),
        due.length
          ? h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: start },
              '▶ เริ่มทบทวน ' + Math.min(due.length, MAX_SESSION) + ' ข้อ' + (due.length > MAX_SESSION ? ' (ทำเป็นรอบละ ' + MAX_SESSION + ')' : ''))
          : h('p', { class: 'notice ok' }, total
              ? '🎉 วันนี้ทบทวนครบแล้ว' + (NS.srs.nextDue() ? ' · รอบถัดไป ' + thaiDate(NS.srs.nextDue()) : '')
              : 'ยังไม่มีรายการ — เรียนด่านแรกในแถบ "เรียน" ก่อน แล้วสิ่งที่เรียนจะเข้ามาที่นี่อัตโนมัติ')));

      root.appendChild(h('section', { class: 'card' },
        h('h2', { class: 'section-title flush' }, 'กล่องทบทวน (' + total + ' รายการ)'),
        h('div', { class: 'boxes' }, boxes.map(function (n, i) {
          return h('div', { class: 'box-col' },
            h('div', { class: 'box-bar' }, h('div', { class: 'box-fill', style: 'height:' + (total && n ? Math.max(4, Math.round(n / total * 100)) : 0) + '%' })),
            h('strong', null, String(n)),
            h('small', { class: 'muted' }, 'กล่อง ' + (i + 1)),
            h('small', { class: 'muted' }, 'ทุก ' + NS.srs.INTERVALS[i] + ' วัน'));
        }))));
    }
    function start() {
      var ids = NS.srs.dueList().slice(0, MAX_SESSION);
      session(root, 'ทบทวนตามรอบ', NS.reviewQuiz.fromIds(NS.ui.shuffle(ids)), { stage: 'review', srs: true, back: home });
    }
    home();
  };

  /* ---------- สมุดคำผิด ---------- */
  NS.pages.mistakes = function (root) {
    function home() {
      var list = NS.mistakes.list();
      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/review', class: 'back' }, '← ทบทวน'));
      root.appendChild(h('h1', { class: 'page-title' }, 'สมุดคำผิด'));
      root.appendChild(h('p', { class: 'muted' }, 'รวมทุกข้อที่เคยตอบผิด เรียงจากผิดบ่อยที่สุด ตอบถูก 3 ครั้งติดกันจะหายจากสมุดเอง'));
      if (!list.length) {
        root.appendChild(h('p', { class: 'card notice ok' }, '🎉 ไม่มีคำผิดค้างอยู่เลย'));
        return;
      }
      root.appendChild(h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: start },
        '▶ ฝึกเฉพาะข้อที่ผิด (' + Math.min(list.length, 10) + ' ข้อ)'));
      root.appendChild(h('ul', { class: 'mistake-list' }, list.map(function (x) {
        var it = x.item;
        return h('li', { class: 'card mistake' },
          h('button', { class: 'mistake-main', type: 'button', onclick: function () { NS.speech.speak(it.sound); }, 'aria-label': 'ฟัง ' + it.char },
            NS.ui.jp(it.char, 'mistake-char'),
            h('span', { class: 'mistake-info' },
              h('span', null, [it.label, it.th].filter(Boolean).join(' · ')),
              h('small', { class: 'muted' }, 'ผิด ' + x.m.count + ' ครั้ง · ตอบถูกติดกัน ',
                h('span', { class: 'dots', 'aria-label': x.m.streak + ' จาก 3' }, [0, 1, 2].map(function (i) { return h('span', { class: i < x.m.streak ? 'on' : '' }, '●'); }))))),
          h('button', { class: 'icon-btn small', type: 'button', 'aria-label': 'เอาออกจากสมุด', title: 'เอาออกจากสมุด',
            onclick: function () { NS.mistakes.remove(x.id); home(); } }, '✕'));
      })));
    }
    function start() {
      var ids = NS.ui.shuffle(NS.mistakes.list().slice(0, 10).map(function (x) { return x.id; }));
      session(root, 'ฝึกข้อที่ผิด', NS.reviewQuiz.fromIds(ids), { stage: 'review', back: home });
    }
    home();
  };
})();
