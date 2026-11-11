/*
 * demo.js — โหมด "ข้อมูลตัวอย่าง" สำหรับสาธิตว่าแอปทำงานอย่างไรเมื่อใช้ไปนานๆ
 * ------------------------------------------------------------
 * - สร้างข้อมูลสมมติ: เรียนทุกวันตั้งแต่ 20 ส.ค. 2026 ถึง 10 พ.ย. 2026 (XP คละกัน) และผ่านทุกด่าน
 * - ข้อมูลจริงจะถูกสำรองไว้ก่อน แล้วคืนให้เมื่อกด "ออกจากโหมดตัวอย่าง"
 * - ระหว่างใช้โหมดนี้ แอปจะแสดงแถบ "ข้อมูลตัวอย่าง" ตลอดเวลา (ปิดไม่ได้)
 *   เพื่อไม่ให้ภาพหน้าจอถูกเข้าใจผิดว่าเป็นผลการเรียนจริง
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};

  var BACKUP_KEY = 'nihongo-survival-v1-backup-before-demo';
  var START = new Date(2026, 7, 20);   // 20 ส.ค. 2026 (เดือนเริ่มนับจาก 0)
  var END = new Date(2026, 10, 10);    // 10 พ.ย. 2026

  /* สุ่มแบบกำหนด seed (ได้ผลเหมือนเดิมทุกครั้ง) */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function levelItemIds(l) {
    var C = NS.content;
    var items = l.kind === 'kana' ? C.levelItems(l)
      : l.kind === 'vocab' ? C.vocabItems(l)
      : l.kind === 'grammar' ? C.grammarItems(l)
      : l.kind === 'phrase' ? C.phraseItems(l) : [];
    return items.map(function (x) { return x.id; });
  }

  function build() {
    var S = NS.stats, rand = rng(20260820);
    var days = [];
    for (var d = new Date(START); d <= END; d = S.addDays(d, 1)) days.push(new Date(d));

    // XP รายวัน: คละกัน มีวันที่เรียนนิดเดียว วันปกติ และวันที่เรียนเยอะ
    var xpByDay = {}, totalCorrect = 0;
    days.forEach(function (day) {
      var r = rand(), xp;
      if (r < 0.25) xp = 10 + Math.floor(rand() * 3) * 10;        // 10–30
      else if (r < 0.75) xp = 40 + Math.floor(rand() * 5) * 10;   // 40–80
      else xp = 90 + Math.floor(rand() * 12) * 10;                // 90–200
      xpByDay[S.key(day)] = xp;
      totalCorrect += xp / 10;
    });

    // ผ่านทุกด่านเรียงตามลำดับ กระจายตลอดช่วงเวลา
    var levels = {}, learned = {};
    var all = NS.progress.all().filter(function (l) { return !l.soon; });
    all.forEach(function (l, i) {
      var day = days[Math.min(days.length - 1, Math.floor((i + 1) * days.length / (all.length + 1)))];
      var k = S.key(day);
      var best = [80, 90, 90, 100, 100][Math.floor(rand() * 5)];
      levels[l.id] = { passed: true, best: best, stars: NS.progress.starsFor(best), by: 'study', tries: 1 + Math.floor(rand() * 3), last: k };
      levelItemIds(l).forEach(function (id) { if (!learned[id]) learned[id] = k; });
    });

    // สถิติความแม่นยำประมาณ 85%
    var answered = Math.round(totalCorrect / 0.85);
    var byStage = {};
    [1, 2, 3, 4, 5].forEach(function (st) {
      var share = [0.2, 0.2, 0.2, 0.2, 0.2][st - 1];
      var c = Math.round(totalCorrect * share);
      byStage[st] = { correct: c, answered: Math.round(c / (0.8 + rand() * 0.12)) };
    });

    return { xpByDay: xpByDay, levels: levels, learned: learned, stats: { answered: answered, correct: totalCorrect, byStage: byStage } };
  }

  NS.demo = {
    isOn: function () { return !!NS.store.get().demo; },

    load: function () {
      var cur = NS.store.get();
      if (!cur.demo) {
        try { localStorage.setItem(BACKUP_KEY, JSON.stringify(cur)); } catch (e) { /* ignore */ }
      }
      var data = build();
      NS.store.replace({
        version: cur.version,
        settings: Object.assign({}, cur.settings),
        demo: true,
        levels: data.levels,
        learned: data.learned,
        xpByDay: data.xpByDay,
        stats: data.stats
      });
    },

    clear: function () {
      var backup = null;
      try { backup = JSON.parse(localStorage.getItem(BACKUP_KEY) || 'null'); } catch (e) { backup = null; }
      if (backup) {
        delete backup.demo;
        NS.store.replace(backup);
      } else {
        NS.store.reset();
      }
      try { localStorage.removeItem(BACKUP_KEY); } catch (e) { /* ignore */ }
    }
  };
})();
