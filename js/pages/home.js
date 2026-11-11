/*
 * home.js — หน้าแรก: ปุ่มเรียนต่อ + สถิติ + เส้นทางเรียน
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  function stars(n) {
    return h('span', { class: 'stars', 'aria-label': n + ' ดาว' },
      [1, 2, 3].map(function (i) { return h('span', { class: i <= n ? 'on' : '' }, '★'); }));
  }

  function nodeFor(l, P) {
    var passed = P.isPassed(l.id);
    var ready = P.isReady(l);
    var unlocked = P.isUnlocked(l);
    var r = P.rec(l.id);
    var state = !ready ? 'soon' : passed ? 'passed' : unlocked ? 'open' : 'locked';
    var mark = state === 'passed' ? '✓' : state === 'locked' ? '🔒' : state === 'soon' ? '…' : '▶';
    var meta;
    if (state === 'soon') meta = h('span', { class: 'badge' }, 'เร็วๆ นี้ · เฟส ' + l.soon);
    else if (state === 'locked') meta = h('span', { class: 'muted small' }, 'ผ่านด่านก่อนหน้าเพื่อเปิด');
    else if (passed) meta = h('span', { class: 'node-meta' }, stars(r.stars), r.by === 'exam' ? h('span', { class: 'badge' }, 'ผ่านด้วยการสอบ') : h('span', { class: 'muted small' }, 'ดีที่สุด ' + r.best + '%'));
    else meta = h('span', { class: 'muted small' }, r ? 'ดีที่สุด ' + r.best + '% · ต้องได้ 80%' : 'พร้อมเรียน');

    var inner = [
      h('span', { class: 'node-dot', 'aria-hidden': 'true' }, mark),
      h('span', { class: 'node-body' },
        h('span', { class: 'node-title' }, h('span', { class: 'node-id' }, l.bonus ? 'เสริม' : l.id), ' ', NS.ui.jp(l.title)),
        h('span', { class: 'muted small' }, l.desc),
        meta)
    ];
    var clickable = ready && unlocked;
    return h('li', { class: 'node ' + state + (l.bonus ? ' bonus' : '') },
      clickable ? h('a', { href: '#/level/' + l.id, class: 'node-link' }, inner)
                : h('div', { class: 'node-link', 'aria-disabled': 'true' }, inner));
  }

  NS.pages.home = function (root) {
    var P = NS.progress;
    var st = NS.store.get();
    var cont = P.continueLevel();
    var acc = st.stats.answered ? Math.round(st.stats.correct / st.stats.answered * 100) + '%' : '–';

    root.appendChild(h('section', { class: 'hero card' },
      h('div', { class: 'hero-jp jp', lang: 'ja' }, 'がんばりましょう！'),
      h('p', { class: 'muted' }, 'สู้ๆ นะ! เรียนทีละด่าน จากตัวอักษรไปจนถึงประโยคเอาตัวรอด'),
      cont ? h('a', { class: 'btn btn-primary btn-lg btn-block', href: '#/level/' + cont.id },
        h('span', null, (P.passedCount() === P.main().length ? '🎉 ผ่านครบทุกด่านแล้ว · ทบทวนด่าน ' : '▶ เรียนต่อ: ด่าน ') + cont.id + ' ', NS.ui.jp(cont.title))) : null));

    var S = NS.stats;
    root.appendChild(h('a', { class: 'card goal-card', href: '#/calendar', 'aria-label': 'เป้าหมายวันนี้ ดูปฏิทินการเรียน' }, S.goalBar()));

    root.appendChild(h('div', { class: 'tiles tiles-4' },
      h('div', { class: 'tile card' }, h('small', { class: 'muted' }, 'ด่านที่ผ่าน'), h('strong', null, P.passedCount() + '/' + P.main().length)),
      h('div', { class: 'tile card' }, h('small', { class: 'muted' }, 'XP รวม'), h('strong', null, '⭐ ' + S.total())),
      h('div', { class: 'tile card' }, h('small', { class: 'muted' }, 'เรียนต่อเนื่อง'), h('strong', null, '🔥 ' + S.streak() + ' วัน')),
      h('div', { class: 'tile card' }, h('small', { class: 'muted' }, 'ความแม่นยำเฉลี่ย'), h('strong', null, acc))));

    root.appendChild(h('h2', { class: 'section-title' }, 'เส้นทางเรียน', NS.demo.isOn() ? h('span', { class: 'badge demo-badge' }, 'ข้อมูลตัวอย่าง') : null));
    NS.PATH.forEach(function (s) {
      var ms = s.levels.filter(function (l) { return !l.bonus; });
      var done = ms.filter(function (l) { return P.isPassed(l.id); }).length;
      root.appendChild(h('section', { class: 'stage' },
        h('header', { class: 'stage-head' },
          h('div', null, h('small', { class: 'muted' }, 'ขั้นที่ ' + s.id), h('h3', null, s.title), h('small', { class: 'muted' }, s.sub)),
          h('span', { class: 'stage-count' }, done + '/' + ms.length)),
        h('ol', { class: 'path' }, s.levels.map(function (l) { return nodeFor(l, P); }))));
    });
  };
})();
