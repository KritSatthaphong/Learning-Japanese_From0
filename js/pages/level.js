/*
 * level.js — หน้าด่าน: 1) เรียน → 2) แบบฝึกหัด → 3) ผลลัพธ์
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  function stepper(active) {
    var steps = ['เรียน', 'แบบฝึกหัด', 'ผลลัพธ์'];
    return h('ol', { class: 'stepper' }, steps.map(function (s, i) {
      return h('li', { class: i === active ? 'active' : i < active ? 'done' : '' }, (i + 1) + '. ' + s);
    }));
  }

  function header(level, active) {
    return h('div', { class: 'level-head' },
      h('a', { href: '#/home', class: 'back' }, '← เส้นทางเรียน'),
      h('h1', { class: 'page-title' }, 'ด่าน ' + level.id + ' · ', NS.ui.jp(level.title)),
      stepper(active));
  }

  function itemCard(it, big) {
    return h('button', { class: 'kana-card' + (big ? ' big' : ''), type: 'button',
      'aria-label': it.char + ' อ่านว่า ' + it.label + ' แตะเพื่อฟัง',
      onclick: function () { NS.speech.speak(it.sound); } },
      NS.ui.jp(it.char, 'kana-char'),
      h('span', { class: 'kana-romaji' }, it.label),
      big && it.tip ? h('span', { class: 'kana-tip' }, '💡 ' + it.tip) : null,
      big && it.note ? h('span', { class: 'kana-note' }, it.note) : null,
      big ? h('span', { class: 'muted small' }, '🔊 แตะการ์ดเพื่อฟังเสียง') : null);
  }

  NS.pages.level = function (root, args) {
    var P = NS.progress;
    var level = P.find(args[0]);
    if (!level) {
      root.appendChild(h('div', { class: 'card notice' }, 'ไม่พบด่านนี้ ', h('a', { href: '#/home' }, 'กลับหน้าแรก')));
      return;
    }
    if (!P.isReady(level)) {
      root.appendChild(header(level, 0));
      root.appendChild(h('div', { class: 'card notice' }, 'ด่านนี้จะสร้างในเฟส ' + level.soon));
      return;
    }
    if (!P.isUnlocked(level)) {
      root.appendChild(header(level, 0));
      root.appendChild(h('div', { class: 'card notice' }, '🔒 ด่านนี้ยังล็อกอยู่ ผ่านด่านก่อนหน้าก่อน (หรือเปิด "เปิดทุกด่าน" ในหน้าตั้งค่า)'));
      return;
    }

    var items = NS.content.levelItems(level);
    var view = 'card';
    var idx = 0;

    /* ---------- 1) เรียน ---------- */
    function learn() {
      root.innerHTML = '';
      root.appendChild(header(level, 0));
      if (level.intro) {
        root.appendChild(h('div', { class: 'card intro' }, level.intro.split('\n').map(function (line) { return h('p', null, line); })));
      }
      root.appendChild(h('div', { class: 'learn-tools' },
        NS.ui.segmented([{ value: 'card', label: 'ดูทีละใบ' }, { value: 'grid', label: 'ดูทั้งหมด' }], view,
          function (v) { view = v; learn(); }, 'รูปแบบการดู'),
        h('span', { class: 'muted small' }, items.length + ' รายการ')));

      if (view === 'card') {
        var it = items[idx];
        root.appendChild(itemCard(it, true));
        root.appendChild(h('div', { class: 'card-nav' },
          h('button', { class: 'btn btn-soft', type: 'button', disabled: idx === 0, onclick: function () { idx--; learn(); speakCurrent(); } }, '◀ ก่อนหน้า'),
          h('span', { class: 'muted' }, (idx + 1) + ' / ' + items.length),
          h('button', { class: 'btn btn-soft', type: 'button', disabled: idx === items.length - 1, onclick: function () { idx++; learn(); speakCurrent(); } }, 'ถัดไป ▶')));
        root.appendChild(h('div', { class: 'center' },
          NS.ui.speakBtn(it.sound, { label: '🐢 ฟังช้า', rate: 0.5, cls: 'btn-ghost' })));
      } else {
        root.appendChild(h('div', { class: 'kana-grid' }, items.map(function (x) { return itemCard(x, false); })));
        root.appendChild(h('p', { class: 'muted small center' }, 'แตะที่ตัวอักษรเพื่อฟังเสียง · ดูทริคจำได้ในโหมด "ดูทีละใบ"'));
      }

      root.appendChild(h('div', { class: 'sticky-cta' },
        h('button', { class: 'btn btn-primary btn-block btn-lg', type: 'button', onclick: startQuiz },
          idx === items.length - 1 || view === 'grid' ? 'เริ่มแบบฝึกหัด (10 ข้อ) →' : 'ข้ามไปทำแบบฝึกหัด →')));
    }

    function speakCurrent() { NS.speech.speak(items[idx].sound); }

    /* ---------- 2) แบบฝึกหัด ---------- */
    function startQuiz() {
      NS.store.markLearned(items.map(function (x) { return x.id; }));
      var qs = NS.kanaQuiz.build(level, 10);
      root.innerHTML = '';
      var holder = h('div');
      root.appendChild(header(level, 1));
      root.appendChild(holder);
      NS.quiz.run(holder, {
        questions: qs,
        onAnswer: function (q, ok) { NS.store.recordAnswer(level.stage, ok); },
        onExit: function () {
          NS.ui.modal({
            title: 'ออกจากแบบฝึกหัด?',
            body: 'คะแนนรอบนี้จะไม่ถูกบันทึก',
            actions: [
              { label: 'ทำต่อ', cls: 'btn-soft' },
              { label: 'ออก', cls: 'btn-danger', onClick: function () { learn(); } }
            ]
          });
        },
        onFinish: result
      });
    }

    /* ---------- 3) ผลลัพธ์ ---------- */
    function result(r) {
      var stars = P.starsFor(r.pct);
      var saved = NS.store.saveLevel(level.id, r.pct, stars);
      var passed = r.pct >= 80;
      var nxt = P.next(level);
      root.innerHTML = '';
      root.appendChild(header(level, 2));

      var box = h('section', { class: 'card result ' + (passed ? 'ok' : 'bad') },
        h('div', { class: 'result-score' }, r.correct + '/' + r.total),
        h('div', { class: 'result-pct' }, r.pct + '%'),
        h('div', { class: 'stars big', 'aria-label': stars + ' ดาว' }, [1, 2, 3].map(function (i) { return h('span', { class: i <= stars ? 'on' : '' }, '★'); })),
        h('p', { class: 'result-msg' }, passed
          ? (stars === 3 ? 'สมบูรณ์แบบ! 🎉' : 'ผ่านแล้ว! เก่งมาก 👏')
          : 'ยังไม่ผ่าน ต้องได้ 80% ขึ้นไป ลองอีกครั้งนะ 💪'),
        saved.firstPass && nxt && P.isReady(nxt) ? h('p', { class: 'unlock' }, '🔓 ปลดล็อกด่าน ' + nxt.id + ' แล้ว!') : null,
        h('p', { class: 'muted small' }, 'ได้ ' + (r.correct * 10) + ' XP · ดาว: 80% = 1 ดวง, 90% = 2 ดวง, 100% = 3 ดวง'));
      root.appendChild(box);

      if (r.wrong.length) {
        root.appendChild(h('section', { class: 'card' },
          h('h3', null, 'ข้อที่ตอบผิด (' + r.wrong.length + ')'),
          h('ul', { class: 'wrong-list' }, r.wrong.map(function (q) {
            return h('li', null, NS.ui.jp(q.item.char, 'wrong-char'), h('span', null, ' = ' + q.item.label),
              NS.ui.speakBtn(q.item.sound, { label: '🔊', cls: 'btn-ghost small', aria: 'ฟัง ' + q.item.char }));
          }))));
      }

      var actions = h('div', { class: 'stack' });
      if (passed && nxt && P.isReady(nxt) && P.isUnlocked(nxt)) {
        actions.appendChild(h('a', { class: 'btn btn-primary btn-block btn-lg', href: '#/level/' + nxt.id }, 'ไปด่านต่อไป: ' + nxt.id + ' →'));
      } else if (passed && nxt && !P.isReady(nxt)) {
        actions.appendChild(h('div', { class: 'card notice' }, 'ด่านต่อไป (' + nxt.id + ') จะมาในเฟส ' + nxt.soon));
      }
      actions.appendChild(h('button', { class: 'btn ' + (passed ? 'btn-soft' : 'btn-primary') + ' btn-block', type: 'button', onclick: startQuiz }, '↻ ทำแบบฝึกหัดอีกครั้ง'));
      actions.appendChild(h('button', { class: 'btn btn-soft btn-block', type: 'button', onclick: function () { idx = 0; learn(); } }, '📖 กลับไปเรียนซ้ำ'));
      actions.appendChild(h('a', { class: 'btn btn-ghost btn-block', href: '#/home' }, 'กลับหน้าเส้นทางเรียน'));
      root.appendChild(actions);
    }

    learn();
  };
})();
