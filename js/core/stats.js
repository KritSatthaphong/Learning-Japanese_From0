/*
 * stats.js — คำนวณ XP, streak (จำนวนวันที่เรียนต่อเนื่อง), เป้าหมายรายวัน
 * ข้อมูลมาจาก xpByDay ใน store: { "2026-11-11": 60, ... }
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  function key(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function xpOn(k) { return NS.store.get().xpByDay[k] || 0; }

  var S = NS.stats = {
    key: key,
    addDays: addDays,
    xpOn: xpOn,
    goal: function () { return NS.store.settings().dailyGoal || 50; },
    today: function () { return xpOn(key(new Date())); },
    total: function () {
      var m = NS.store.get().xpByDay;
      return Object.keys(m).reduce(function (s, k) { return s + (m[k] || 0); }, 0);
    },
    daysStudied: function () {
      var m = NS.store.get().xpByDay;
      return Object.keys(m).filter(function (k) { return m[k] > 0; }).length;
    },

    /* streak: นับย้อนจากวันนี้ (ถ้าวันนี้ยังไม่เรียน เริ่มนับจากเมื่อวาน streak จึงยังไม่ขาด) */
    streak: function () {
      var d = new Date();
      if (!xpOn(key(d))) d = addDays(d, -1);
      var n = 0;
      while (xpOn(key(d)) > 0) { n++; d = addDays(d, -1); }
      return n;
    },

    bestStreak: function () {
      var m = NS.store.get().xpByDay;
      var days = Object.keys(m).filter(function (k) { return m[k] > 0; }).sort();
      var best = 0, run = 0, prev = null;
      days.forEach(function (k) {
        var p = k.split('-').map(Number);
        var d = new Date(p[0], p[1] - 1, p[2]);
        run = prev && key(addDays(prev, 1)) === k ? run + 1 : 1;
        if (run > best) best = run;
        prev = d;
      });
      return best;
    },

    /* แถบความคืบหน้าเป้าหมายวันนี้ */
    goalBar: function () {
      var xp = S.today(), goal = S.goal();
      var pct = Math.min(100, Math.round(xp / goal * 100));
      var done = xp >= goal;
      return h('div', { class: 'goal' + (done ? ' done' : '') },
        h('div', { class: 'goal-row' },
          h('span', null, done ? '🎉 ถึงเป้าหมายวันนี้แล้ว!' : '🎯 เป้าหมายวันนี้'),
          h('strong', null, xp + ' / ' + goal + ' XP')),
        h('div', { class: 'progress goal-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(goal), 'aria-valuenow': String(xp), 'aria-label': 'XP วันนี้' },
          h('div', { class: 'bar', style: 'width:' + pct + '%' })));
    },

    /* ปุ่มเลือกเป้า XP ต่อวัน */
    goalPicker: function (onChange) {
      var opts = [20, 30, 50, 100, 150].map(function (v) { return { value: v, label: String(v) }; });
      return NS.ui.segmented(opts, S.goal(), function (v) {
        NS.store.setSetting('dailyGoal', v);
        if (onChange) onChange(v);
      }, 'เป้า XP ต่อวัน');
    }
  };
})();
