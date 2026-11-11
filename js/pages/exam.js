/*
 * exam.js — สอบวัดระดับเพื่อข้ามขั้น
 * 15 ข้อจากทุกด่านในขั้นนั้น ได้ ≥ 90% (14 ข้อขึ้นไป) → ปลดล็อกทุกด่านในขั้น
 * ด่านที่ผ่านด้วยวิธีนี้ติดป้าย "ผ่านด้วยการสอบ" แยกจากด่านที่เรียนจริง (ไม่มีดาว)
 * ระหว่างสอบไม่บอกเฉลย และไม่ให้ XP
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var N = 15, PASS = 90;

  function builder(l, n) {
    if (l.kind === 'kana') return NS.kanaQuiz.build(l, n);
    if (l.kind === 'vocab') return NS.vocabQuiz.build(l, n);
    if (l.kind === 'grammar') return NS.sentenceQuiz.buildGrammar(l, n);
    if (l.kind === 'phrase') return NS.sentenceQuiz.buildPhrase(l, n);
    return [];
  }

  function stageLevels(stage) { return stage.levels.filter(function (l) { return !l.bonus && !l.soon; }); }

  /* ขั้นนี้สอบข้ามได้ไหม: ยังมีด่านที่ไม่ผ่าน และด่านแรกของขั้นเปิดอยู่ */
  function canTake(stage) {
    var ls = stageLevels(stage);
    if (!ls.length) return false;
    var allPassed = ls.every(function (l) { return NS.progress.isPassed(l.id); });
    return !allPassed && NS.progress.isUnlocked(ls[0]);
  }

  function build(stage) {
    var ls = stageLevels(stage), per = Math.ceil(N / ls.length) + 1, all = [];
    ls.forEach(function (l) { all = all.concat(NS.ui.shuffle(builder(l, per)).slice(0, per)); });
    // กระจายให้ทุกด่านมีข้อสอบ แล้วตัดเหลือ 15
    var byLevel = ls.map(function (l) { return all.filter(function (q) { return levelOfItem(q.item) === l.id; }); });
    var out = [], k = 0;
    while (out.length < N && byLevel.some(function (a) { return a.length; })) {
      var arr = byLevel[k % byLevel.length];
      if (arr.length) out.push(arr.shift());
      k++;
    }
    return NS.ui.shuffle(out);
  }

  function levelOfItem(it) {
    if (it.kind === 'kana') return (it.script === 'kata' ? '2-' : '1-') + it.lv;
    if (it.kind === 'word') return it.script === 'kata' ? '2-6' : '1-6';
    return it.level;
  }

  NS.exam = { canTake: canTake };

  NS.pages.exam = function (root, args) {
    var stage = NS.progress.stage(Number(args[0]));
    root.appendChild(h('a', { href: '#/home', class: 'back' }, '← เส้นทางเรียน'));
    if (!stage) { root.appendChild(h('p', { class: 'card notice' }, 'ไม่พบขั้นนี้')); return; }
    var title = 'สอบข้ามขั้น ' + stage.id + ' · ' + stage.title;

    function intro() {
      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/home', class: 'back' }, '← เส้นทางเรียน'));
      root.appendChild(h('h1', { class: 'page-title' }, title));
      if (!canTake(stage)) {
        root.appendChild(h('p', { class: 'card notice' }, 'ขั้นนี้สอบข้ามไม่ได้ตอนนี้ (ผ่านครบแล้ว หรือยังไม่ปลดล็อกด่านแรกของขั้น)'));
        return;
      }
      root.appendChild(h('section', { class: 'card stack-sm' },
        h('p', null, 'ถ้าเรียนเรื่องนี้มาแล้ว สอบ ' + N + ' ข้อจากทุกด่านในขั้นนี้ ได้ ' + PASS + '% ขึ้นไป (14 ข้อ) จะปลดล็อกทุกด่านในขั้นนี้ทันที'),
        h('p', { class: 'muted small' }, 'ด่านที่ผ่านด้วยการสอบจะติดป้าย "ผ่านด้วยการสอบ" และไม่มีดาว ถ้ากลับไปเรียนด่านนั้นจริงภายหลัง ป้ายจะเปลี่ยนเป็นผลการเรียนจริง · ระหว่างสอบไม่บอกเฉลย และไม่ได้ XP'),
        h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: start }, '▶ เริ่มสอบ')));
    }

    function start() {
      root.innerHTML = '';
      var holder = h('div');
      root.appendChild(h('h1', { class: 'page-title' }, title));
      root.appendChild(holder);
      NS.quiz.run(holder, {
        questions: build(stage), testMode: true,
        onExit: function () {
          NS.ui.modal({ title: 'ออกจากการสอบ?', body: 'ผลครั้งนี้จะไม่ถูกบันทึก', actions: [
            { label: 'สอบต่อ', cls: 'btn-soft' }, { label: 'ออก', cls: 'btn-danger', onClick: intro }] });
        },
        onFinish: finish
      });
    }

    function finish(r) {
      var passed = r.pct >= PASS, unlocked = [];
      if (passed) {
        var s = NS.store.get(), ids = [];
        stageLevels(stage).forEach(function (l) {
          if (NS.progress.isPassed(l.id)) return;
          s.levels[l.id] = { passed: true, by: 'exam', best: r.pct, stars: 0, tries: 0, last: NS.store.today() };
          unlocked.push(l.id);
          var items = l.kind === 'kana' ? NS.content.levelItems(l) : l.kind === 'vocab' ? NS.content.vocabItems(l)
            : l.kind === 'grammar' ? NS.content.grammarItems(l) : NS.content.phraseItems(l);
          items.forEach(function (it) { ids.push(it.id); });
        });
        NS.store.save();
        NS.store.markLearned(ids);
      }
      root.innerHTML = '';
      root.appendChild(h('h1', { class: 'page-title' }, title));
      root.appendChild(NS.quiz.resultCard(r, { noStars: true, extra: passed
        ? h('p', { class: 'unlock' }, '🔓 ผ่าน! ปลดล็อก ' + unlocked.length + ' ด่าน (' + unlocked.join(', ') + ') ติดป้าย "ผ่านด้วยการสอบ"')
        : h('p', null, 'ต้องได้ ' + PASS + '% ขึ้นไป (14 จาก 15 ข้อ) ลองเรียนทีละด่านก่อน แล้วค่อยกลับมาสอบใหม่ได้') }));
      if (r.wrong.length) root.appendChild(NS.quiz.wrongList(r.wrong));
      root.appendChild(h('div', { class: 'stack' },
        h('a', { class: 'btn btn-primary btn-block', href: '#/home' }, 'กลับหน้าเส้นทางเรียน'),
        passed ? null : h('button', { class: 'btn btn-soft btn-block', type: 'button', onclick: intro }, '↻ สอบอีกครั้ง')));
    }

    intro();
  };
})();
