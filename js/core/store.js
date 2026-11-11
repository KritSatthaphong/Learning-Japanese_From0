/*
 * store.js — เก็บความคืบหน้าใน localStorage (อยู่ในเบราว์เซอร์เครื่องนี้เท่านั้น ไม่ส่งไปที่ไหน)
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var KEY = 'nihongo-survival-v1';

  function defaults() {
    return {
      version: 1,
      settings: {
        rate: 0.85,          // ความเร็วเสียง
        unlockAll: false,    // เปิดทุกด่าน
        theme: 'auto',       // auto | light | dark
        chartMode: 'hira',   // hira | kata | both
        chartFade: true,     // ทำให้ตัวที่ยังไม่เรียนดูจาง
        dailyGoal: 50        // เป้า XP ต่อวัน (ใช้ในเฟส 2)
      },
      levels: {},   // { "1-1": { best: 90, stars: 2, passed: true, by: "study", tries: 3, last: "2026-11-11" } }
      learned: {},  // { "h-a": "2026-11-11" } สิ่งที่เปิดเรียนแล้ว (เฟส 4 จะดึงเข้า SRS)
      xpByDay: {},  // { "2026-11-11": 60 }
      stats: { answered: 0, correct: 0, byStage: {} }
    };
  }

  var state = defaults();
  var ok = true;

  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        var d = defaults();
        state = Object.assign({}, d, saved);
        state.settings = Object.assign({}, d.settings, isObj(saved.settings) ? saved.settings : {});
        state.stats = Object.assign({}, d.stats, isObj(saved.stats) ? saved.stats : {});
        ['levels', 'learned', 'xpByDay'].forEach(function (k) { if (!isObj(state[k])) state[k] = {}; });
        if (!isObj(state.stats.byStage)) state.stats.byStage = {};
      }
    } catch (e) {
      ok = false;
      state = defaults();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      ok = true;
    } catch (e) {
      ok = false;
      if (NS.ui) NS.ui.toast('บันทึกความคืบหน้าไม่ได้ (เบราว์เซอร์อาจอยู่ในโหมดไม่ระบุตัวตน)');
    }
  }

  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  NS.store = {
    load: load,
    save: save,
    today: today,
    isOk: function () { return ok; },
    get: function () { return state; },
    settings: function () { return state.settings; },
    setSetting: function (k, v) { state.settings[k] = v; save(); },

    /* บันทึกคำตอบหนึ่งข้อ: นับสถิติ และให้ XP 10 แต้มถ้าตอบถูก */
    recordAnswer: function (stageId, correct) {
      var s = state.stats;
      s.answered++;
      if (correct) s.correct++;
      var b = s.byStage[stageId] || (s.byStage[stageId] = { answered: 0, correct: 0 });
      b.answered++;
      if (correct) b.correct++;
      if (correct) {
        var t = today();
        var before = state.xpByDay[t] || 0;
        state.xpByDay[t] = before + 10;
        var goal = state.settings.dailyGoal || 50;
        if (before < goal && state.xpByDay[t] >= goal && NS.ui) NS.ui.toast('🎉 ถึงเป้าหมายวันนี้แล้ว! (' + goal + ' XP)');
      }
      save();
    },

    markLearned: function (ids) {
      var t = today();
      ids.forEach(function (id) { if (!state.learned[id]) state.learned[id] = t; });
      save();
    },

    /* บันทึกผลด่าน คืนค่า { rec, firstPass } */
    saveLevel: function (levelId, pct, stars) {
      var rec = state.levels[levelId] || { tries: 0, best: 0, stars: 0, passed: false };
      var wasPassed = rec.passed;
      rec.tries++;
      rec.last = today();
      if (pct > rec.best) rec.best = pct;
      if (stars > rec.stars) rec.stars = stars;
      if (pct >= 80) { rec.passed = true; rec.by = 'study'; }
      state.levels[levelId] = rec;
      save();
      return { rec: rec, firstPass: !wasPassed && rec.passed };
    },

    /* แทนที่ข้อมูลทั้งหมด (ใช้กับโหมดข้อมูลตัวอย่าง และนำเข้าข้อมูลในอนาคต) */
    replace: function (obj) {
      try {
        localStorage.setItem(KEY, JSON.stringify(obj));
        load();
      } catch (e) {
        state = obj;   // บันทึกไม่ได้ ก็ใช้ในหน่วยความจำไปก่อน
      }
    },

    reset: function () {
      state = defaults();
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      save();
    }
  };

  load();
})();
