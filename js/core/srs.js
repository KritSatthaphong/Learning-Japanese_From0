/*
 * srs.js — ทบทวนตามรอบ (Leitner 5 กล่อง) + สมุดคำผิด
 * ------------------------------------------------------------
 * SRS: กล่อง 1–5 ทบทวนทุก 1, 2, 4, 7, 14 วัน
 *   ตอบถูก → เลื่อนขึ้น 1 กล่อง   ตอบผิด → กลับกล่อง 1
 *   ทุกอย่างที่เปิดเรียนในเส้นทางเรียน และวลีในเด็คของฉัน เข้าระบบอัตโนมัติ
 * สมุดคำผิด: เก็บทุกข้อที่ตอบผิด นับจำนวนครั้ง ถ้าตอบถูก 3 ครั้งติดกันจะเอาออก
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var INTERVALS = [1, 2, 4, 7, 14];

  function st() { return NS.store.get(); }
  function today() { return NS.store.today(); }
  function plusDays(dateKey, n) {
    var p = dateKey.split('-').map(Number);
    return NS.stats.key(NS.stats.addDays(new Date(p[0], p[1] - 1, p[2]), n));
  }

  var SRS = NS.srs = {
    INTERVALS: INTERVALS,

    /* ดึงสิ่งที่เรียนแล้ว + เด็คของฉัน เข้าระบบ (เรียกก่อนแสดงจำนวนที่ถึงรอบ) */
    sync: function () {
      var s = st(), changed = false;
      Object.keys(s.learned).forEach(function (id) {
        if (s.srs[id]) return;
        var it = NS.content.itemById(id);
        if (!it || it.quiz === false) return;
        s.srs[id] = { box: 1, due: plusDays(s.learned[id], 1) };
        changed = true;
      });
      s.deck.forEach(function (d) {
        if (s.srs[d.id]) return;
        s.srs[d.id] = { box: 1, due: d.created || today() };
        changed = true;
      });
      if (changed) NS.store.save();
    },

    dueList: function () {
      var s = st(), t = today();
      return Object.keys(s.srs)
        .filter(function (id) { return s.srs[id].due <= t && NS.content.itemById(id); })
        .sort(function (a, b) { return s.srs[a].due < s.srs[b].due ? -1 : s.srs[a].due > s.srs[b].due ? 1 : s.srs[a].box - s.srs[b].box; });
    },

    dueCount: function () { SRS.sync(); return SRS.dueList().length; },

    nextDue: function () {
      var s = st(), t = today();
      var ds = Object.keys(s.srs).map(function (id) { return s.srs[id].due; }).filter(function (d) { return d > t; }).sort();
      return ds[0] || null;
    },

    boxes: function () {
      var c = [0, 0, 0, 0, 0], s = st();
      Object.keys(s.srs).forEach(function (id) { c[(s.srs[id].box || 1) - 1]++; });
      return c;
    },

    answer: function (id, ok) {
      var s = st(), r = s.srs[id];
      if (!r) return;
      r.box = ok ? Math.min(5, r.box + 1) : 1;
      r.due = plusDays(today(), INTERVALS[r.box - 1]);
      NS.store.save();
    },

    remove: function (id) { delete st().srs[id]; NS.store.save(); }
  };

  NS.mistakes = {
    /* เรียกทุกครั้งที่ตอบคำถาม (จาก engine) */
    record: function (id, ok) {
      if (!id || id.indexOf('near-') === 0) return;
      var s = st(), m = s.mistakes[id];
      if (!ok) {
        if (!m) m = s.mistakes[id] = { count: 0, streak: 0 };
        m.count++; m.streak = 0; m.last = today();
        s.missTally[id] = (s.missTally[id] || 0) + 1;
      } else if (m) {
        m.streak++;
        if (m.streak >= 3) delete s.mistakes[id];
      } else {
        return;
      }
      NS.store.save();
    },
    list: function () {
      var s = st();
      return Object.keys(s.mistakes)
        .map(function (id) { return { id: id, item: NS.content.itemById(id), m: s.mistakes[id] }; })
        .filter(function (x) { return x.item; })
        .sort(function (a, b) { return b.m.count - a.m.count; });
    },
    count: function () { return NS.mistakes.list().length; },
    remove: function (id) { delete st().mistakes[id]; NS.store.save(); }
  };
})();
