/*
 * demo.js — โหมด "ข้อมูลตัวอย่าง" สำหรับสาธิตว่าแอปทำงานอย่างไรเมื่อใช้ไปนานๆ
 * ------------------------------------------------------------
 * - สร้างข้อมูลสมมติแบบ "คนใช้งานจริงที่ยังเรียนไม่จบ" (seed คงที่ ได้ผลเหมือนเดิม วันที่นับถอยหลังจากวันที่กดโหลด):
 *   เริ่มใช้แอปประมาณ 9 สัปดาห์ก่อน · เรียนบางวัน (ช่วงแรกขยัน วันธรรมดาบ่อยกว่าเสาร์-อาทิตย์ หยุดช่วงสอบกลางภาค ~1 สัปดาห์)
 *   เรียนติดกัน 3 วันล่าสุด วันนี้ยังไม่ได้เรียน · ผ่านขั้น 1–2 และขั้น 3 ถึงด่าน 3-3 กำลังติดด่าน 3-4 (ยังไม่ผ่าน)
 *   ทบทวนค้างบ้าง สมุดคำผิดเยอะ ฝึกพูดนิดหน่อย ทำ Pre Test แล้วแต่ยังไม่ได้ทำ Post · คัดฮิรางานะมากกว่าคาตากานะ
 * - ข้อมูลจริงจะถูกสำรองไว้ก่อน แล้วคืนให้เมื่อกด "ออกจากโหมดตัวอย่าง"
 * - ระหว่างใช้โหมดนี้ แอปจะแสดงแถบ "ข้อมูลตัวอย่าง" ตลอดเวลา (ปิดไม่ได้)
 *   เพื่อไม่ให้ภาพหน้าจอถูกเข้าใจผิดว่าเป็นผลการเรียนจริง
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};

  var BACKUP_KEY = 'nihongo-survival-v1-backup-before-demo';
  var START_AGO = 63;   // เริ่มใช้แอปเมื่อ 63 วันก่อน (heatmap 12 สัปดาห์จะเห็นช่วงก่อนเริ่มเป็นช่องว่าง)

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
    var S = NS.stats, rand = rng(20260915);
    var now = new Date(), TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var today = S.key(TODAY);
    function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
    function plus(k, n) { var p = k.split('-').map(Number); return S.key(S.addDays(new Date(p[0], p[1] - 1, p[2]), n)); }
    function hhmm(from, to) { return (from + Math.floor(rand() * (to - from))) + ':' + String(Math.floor(rand() * 60)).padStart(2, '0'); }

    // ---------- วันที่เรียน: บางวัน ไม่ใช่ทุกวัน ----------
    var active = [], xpByDay = {};
    for (var ago = START_AGO; ago >= 1; ago--) {
      var day = S.addDays(TODAY, -ago), dow = day.getDay(), weekend = dow === 0 || dow === 6;
      var chance = ago > 49 ? 0.85              // 2 สัปดาห์แรก ขยัน
        : ago >= 28 && ago <= 34 ? 0            // หยุด ~1 สัปดาห์ (สอบกลางภาค)
        : ago <= 3 ? 1                          // 3 วันล่าสุด กลับมาเรียนติดกัน
        : weekend ? 0.35 : 0.6;
      if (ago === START_AGO) chance = 1;        // วันแรกที่เริ่มใช้
      if (rand() >= chance) continue;
      var r = rand(), xp;
      if (r < 0.3) xp = 10 + Math.floor(rand() * 2) * 10;         // 10–20 แวะเข้ามานิดเดียว
      else if (r < 0.85) xp = 30 + Math.floor(rand() * 6) * 10;   // 30–80 ปกติ
      else xp = 100 + Math.floor(rand() * 6) * 10;                // 100–150 วันที่ขยัน
      if (ago === START_AGO) xp = 40;
      xpByDay[S.key(day)] = xp;
      active.push(S.key(day));
    }
    // วันนี้ยังไม่ได้เรียน (streak ยังไม่ขาด เพราะเมื่อวานเรียน)
    var totalCorrect = 0;
    Object.keys(xpByDay).forEach(function (k) { totalCorrect += xpByDay[k] / 10; });
    function act(i) { return active[Math.max(0, Math.min(active.length - 1, i))]; }

    // ---------- ด่าน: ผ่านขั้น 1–2 และ 3-1 ถึง 3-3 · ติดด่าน 3-4 ----------
    var plan = [
      ['1-1', 100, 1], ['1-2', 90, 1], ['1-3', 90, 2], ['1-4', 80, 2], ['1-5', 90, 1], ['1-6', 80, 3],
      ['2-1', 100, 1], ['2-2', 80, 2], ['2-3', 90, 2], ['2-4', 80, 2], ['2-5', 80, 3], ['2-6', 90, 2],
      ['3-1', 100, 1], ['3-2', 90, 1], ['3-3', 80, 2], ['3-4', 70, 2]
    ];
    var levels = {}, learned = {};
    var byId = {};
    NS.progress.all().forEach(function (l) { byId[l.id] = l; });
    plan.forEach(function (p, i) {
      var l = byId[p[0]];
      // กระจายวันผ่านด่านตามวันที่เรียน (ด่านสุดท้ายคือเมื่อวาน)
      var k = act(Math.round((i + 1) * (active.length - 1) / plan.length));
      var passed = p[1] >= 80;
      levels[p[0]] = passed
        ? { passed: true, best: p[1], stars: NS.progress.starsFor(p[1]), by: 'study', tries: p[2], last: k }
        : { passed: false, best: p[1], stars: 0, tries: p[2], last: k };
      levelItemIds(l).forEach(function (id) { if (!learned[id]) learned[id] = k; });
    });

    // ---------- สถิติความแม่นยำ (~75–80%) ----------
    var byStage = {}, answered = 0, correct = 0;
    [['1', 0.36], ['2', 0.3], ['3', 0.14], ['review', 0.12], ['game', 0.06], ['speak', 0.02]].forEach(function (x) {
      var c = Math.round(totalCorrect * x[1]);
      var a = Math.round(c / (0.7 + rand() * 0.14));
      byStage[x[0]] = { correct: c, answered: a };
      correct += c; answered += a;
    });

    // ---------- ทบทวนตามรอบ: ทุกอย่างที่เรียนแล้วอยู่ในระบบ · ของเก่าอยู่กล่องสูงกว่า · ค้างทบทวนบ้าง ----------
    var IV = NS.srs.INTERVALS, srs = {};
    Object.keys(learned).forEach(function (id) {
      var it = NS.content.itemById(id);
      if (!it || it.quiz === false) return;
      var p = learned[id].split('-').map(Number);
      var age = Math.round((TODAY - new Date(p[0], p[1] - 1, p[2])) / 86400000);
      var r = rand(), box;
      if (age < 10) box = r < 0.6 ? 1 : 2;
      else if (age < 25) box = r < 0.25 ? 1 : r < 0.6 ? 2 : 3;
      else box = r < 0.12 ? 1 : r < 0.3 ? 2 : r < 0.6 ? 3 : r < 0.85 ? 4 : 5;
      // ถึงรอบแล้วบางส่วน (รวมที่ค้างมาจากวันที่ไม่ได้เข้าแอป)
      var due = rand() < (box <= 2 ? 0.3 : 0.08) ? plus(today, -Math.floor(rand() * 4)) : plus(today, 1 + Math.floor(rand() * IV[box - 1]));
      srs[id] = { box: box, due: due };
    });

    // ---------- สมุดคำผิด (เยอะพอสมควร) ----------
    var missTally = {}, mistakes = {};
    var missPool = Object.keys(srs).filter(function (id) { return /^(h-|k-|v-)/.test(id); });
    for (var m = 0; m < 30 && missPool.length; m++) {
      var mid = missPool.splice(Math.floor(rand() * missPool.length), 1)[0];
      missTally[mid] = 1 + Math.floor(rand() * 5);
      if (m < 17) mistakes[mid] = { count: Math.min(missTally[mid], 1 + Math.floor(rand() * 3)), streak: Math.floor(rand() * 2), last: act(active.length - 1 - Math.floor(rand() * 10)) };
    }

    // ---------- เด็คของฉัน: เพิ่มเอง 3 วลี ----------
    var deckSrc = [
      ['なるほど', 'naruhodo', 'อ๋อ เข้าใจแล้ว', 'anime'],
      ['ちょっと待って', 'chotto matte', 'รอแป๊บนึง', 'anime'],
      ['また明日', 'mata ashita', 'เจอกันพรุ่งนี้', 'friend']
    ];
    var deck = deckSrc.map(function (d, i) {
      var id = 'd-demo-' + (i + 1);
      srs[id] = { box: i === 0 ? 2 : 1, due: i === 2 ? today : plus(today, 1) };
      return { id: id, jp: d[0], romaji: d[1], th: d[2], source: d[3], created: act(8 + i * 11) };
    });

    // ---------- ฝึกพูด: ลองแค่วลีทักทายไม่กี่ครั้ง ----------
    var greet = NS.content.allPhrases().filter(function (x) { return /^p-greet-/.test(x.id); }), speakHistory = [];
    for (var sp = 0; sp < 11; sp++) {
      var it = pick(greet), score = Math.round(25 + rand() * 70);
      var verdict = NS.normalize.verdictOf(score / 100);
      var heard = verdict === 'match' ? it.jp : verdict === 'close' ? Array.from(it.jp).slice(0, Math.max(2, Math.round(it.jp.length * 0.6))).join('') : pick(['え？', 'すみ', 'あの']);
      speakHistory.unshift({ id: it.id, date: act(Math.round(active.length * (0.55 + sp * 0.04))), time: hhmm(19, 23), heard: heard, score: score, verdict: verdict });
    }

    // ---------- Pre Test วันแรก (ยังไม่ได้ทำ Post) ----------
    var tests = [
      { label: 'Pre', v: 3, date: act(0), time: '20:41', p1: { c: 4, t: 20 }, p2: { c: 3, t: 10 }, p3: { c: 2, t: 20, mic: 14, self: 6 } }
    ];

    // ---------- บันทึกการคัด: ฮิรางานะเยอะ คาตากานะน้อย ประโยคไม่กี่ประโยค ----------
    var chars = {}, sents = {}, samples = [];
    NS.KANA.forEach(function (k) {
      if (k.noQuiz) return;
      ['hira', 'kata'].forEach(function (script) {
        var r = rand(), n;
        if (script === 'hira') n = k.group === 'basic' ? (r < 0.1 ? 0 : r < 0.5 ? 1 + Math.floor(rand() * 3) : r < 0.85 ? 4 + Math.floor(rand() * 4) : 8 + Math.floor(rand() * 6)) : (r < 0.6 ? 0 : 1 + Math.floor(rand() * 2));
        else n = k.group === 'basic' ? (r < 0.45 ? 0 : 1 + Math.floor(rand() * 3)) : 0;
        if (!n) return;
        chars[k[script]] = { n: n, best: 40 + Math.floor(rand() * 50) };
        for (var q = 0; q < Math.min(n, 2); q++) samples.push({ kind: 'char', key: k[script], label: k[script], score: 35 + Math.floor(rand() * 55) });
      });
    });
    greet.filter(function (x) { return /^[ぁ-ゟ、。\s]+$/.test(x.char); }).slice(0, 3).forEach(function (it) {
      var n = 1 + Math.floor(rand() * 2);
      sents[it.id] = { n: n, best: 45 + Math.floor(rand() * 35) };
      samples.push({ kind: 'sent', key: it.id, label: it.char, th: it.th, score: sents[it.id].best });
    });

    return {
      xpByDay: xpByDay, levels: levels, learned: learned,
      stats: { answered: answered, correct: correct, byStage: byStage },
      srs: srs, mistakes: mistakes, missTally: missTally, deck: deck, speakHistory: speakHistory, tests: tests,
      gameBest: { hira: 18, kata: 9 },
      writeLog: { chars: chars, sents: sents },
      samples: samples, rand: rand
    };
  }

  /* ภาพลายมือตัวอย่าง: ตัวอักษรเอียง/เลื่อนเล็กน้อยให้ดูเหมือนเขียนเอง บนพื้นขาว + เส้นนำจาง */
  var FONT = '"Hiragino Maru Gothic ProN","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo","Noto Sans JP","Noto Sans CJK JP",sans-serif';
  function demoImage(text, rand) {
    var cells = Array.from(text).filter(function (ch) { return !/[\s、。]/.test(ch); });
    var single = cells.length === 1, cell = single ? 96 : 30;
    var cols = single ? 1 : Math.min(cells.length, 8), rows = Math.ceil(cells.length / cols);
    var c = document.createElement('canvas'); c.width = cols * cell; c.height = rows * cell;
    var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = '#e6e1d8'; x.lineWidth = 1;
    for (var i = 0; i <= cols; i++) { x.beginPath(); x.moveTo(i * cell, 0); x.lineTo(i * cell, c.height); x.stroke(); }
    for (var j = 0; j <= rows; j++) { x.beginPath(); x.moveTo(0, j * cell); x.lineTo(c.width, j * cell); x.stroke(); }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    cells.forEach(function (ch, k) {
      var cx = (k % cols) * cell + cell / 2, cy = Math.floor(k / cols) * cell + cell / 2;
      var fs = (ch.length > 1 ? 0.5 : 0.78) * cell;
      x.font = fs + 'px ' + FONT; x.fillStyle = '#e9e9e9'; x.fillText(ch, cx, cy + cell * 0.02);
      x.save();
      x.translate(cx + (rand() - 0.5) * cell * 0.08, cy + (rand() - 0.5) * cell * 0.08);
      x.rotate((rand() - 0.5) * 0.14);
      x.scale(0.9 + rand() * 0.1, 0.9 + rand() * 0.1);
      x.font = 'bold ' + fs * 0.92 + 'px ' + FONT; x.fillStyle = '#1f1c19';
      x.fillText(ch, 0, cell * 0.02);
      x.restore();
    });
    try { return c.toDataURL('image/png'); } catch (e) { return null; }
  }

  NS.demo = {
    isOn: function () { return !!NS.store.get().demo; },

    /* โหลดข้อมูลตัวอย่าง คืนค่า Promise (รอสร้างภาพลายมือตัวอย่างเสร็จ) */
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
        stats: data.stats,
        srs: data.srs,
        mistakes: data.mistakes,
        missTally: data.missTally,
        deck: data.deck,
        speakHistory: data.speakHistory,
        tests: data.tests,
        gameBest: data.gameBest,
        writeLog: data.writeLog
      });
      // ภาพลายมือตัวอย่าง: ติดป้าย demo ไว้ ไม่ปนกับภาพจริง ไม่ซิงก์ และลบทิ้งเมื่อออกจากโหมด
      return NS.writeLog._clearDemo().then(function () {
        var chain = Promise.resolve();
        data.samples.forEach(function (s) {
          chain = chain.then(function () {
            var img = demoImage(s.label, data.rand);
            return img ? NS.writeLog._add(Object.assign({}, s, { img: img, demo: true })) : null;
          });
        });
        return chain;
      }).then(function () { if (NS.cloud && NS.cloud.user) NS.cloud.syncNow(); });   // แสดงสถานะ "หยุดซิงก์ชั่วคราว"
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
      return NS.writeLog._clearDemo().then(function () { if (NS.cloud && NS.cloud.user) NS.cloud.syncNow(); });   // กลับมาซิงก์ข้อมูลจริง
    }
  };
})();
