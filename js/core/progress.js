/*
 * progress.js — ระบบปลดล็อกด่าน และสรุปความคืบหน้า
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};

  var all = [];
  NS.PATH.forEach(function (s) {
    s.levels.forEach(function (l) { l.stage = s.id; all.push(l); });
  });
  var main = all.filter(function (l) { return !l.bonus; });

  function rec(id) { return NS.store.get().levels[id]; }
  function isPassed(id) { var r = rec(id); return !!(r && r.passed); }
  function isReady(l) { return !l.soon; }

  function isUnlocked(l) {
    if (NS.store.settings().unlockAll) return true;
    if (l.bonus) {
      // ด่านเสริมเปิดเมื่อผ่านด่านสุดท้ายของขั้นเดียวกัน
      var stageMain = main.filter(function (m) { return m.stage === l.stage; });
      return stageMain.length ? isPassed(stageMain[stageMain.length - 1].id) : true;
    }
    var i = main.indexOf(l);
    return i <= 0 ? true : isPassed(main[i - 1].id);
  }

  function next(l) {
    if (l.bonus) {
      var stageMain = main.filter(function (m) { return m.stage === l.stage; });
      var last = stageMain[stageMain.length - 1];
      return main[main.indexOf(last) + 1] || null;
    }
    return main[main.indexOf(l) + 1] || null;
  }

  function starsFor(pct) { return pct >= 100 ? 3 : pct >= 90 ? 2 : pct >= 80 ? 1 : 0; }

  NS.progress = {
    all: function () { return all; },
    main: function () { return main; },
    find: function (id) { return all.find(function (l) { return l.id === id; }) || null; },
    stage: function (id) { return NS.PATH.find(function (s) { return s.id === id; }); },
    rec: rec,
    isPassed: isPassed,
    isReady: isReady,
    isUnlocked: isUnlocked,
    next: next,
    starsFor: starsFor,
    passedCount: function () { return main.filter(function (l) { return isPassed(l.id); }).length; },

    /* ด่านที่ควรเรียนต่อ: ด่านแรกที่เปิดอยู่แต่ยังไม่ผ่าน */
    continueLevel: function () {
      var c = main.find(function (l) { return isReady(l) && isUnlocked(l) && !isPassed(l.id); });
      if (c) return c;
      var ready = main.filter(isReady);
      return ready[ready.length - 1] || null;
    },

    /* ตัวอักษรนี้เรียนแล้วหรือยัง (เปิดดูในช่วงเรียน หรือผ่านด่านที่มีตัวนี้แล้ว) */
    isKanaLearned: function (k, script) {
      var id = NS.content.kanaId(k, script);
      if (NS.store.get().learned[id]) return true;
      return isPassed((script === 'hira' ? '1-' : '2-') + k.lv);
    }
  };
})();
