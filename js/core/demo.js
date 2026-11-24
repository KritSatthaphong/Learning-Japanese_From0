/*
 * demo.js — โหมด "ข้อมูลตัวอย่าง" สำหรับสาธิตว่าแอปทำงานอย่างไรเมื่อใช้ไปนานๆ
 * ------------------------------------------------------------
 * - สร้างข้อมูลสมมติ: เรียนทุกวันตั้งแต่ 20 ส.ค. 2026 ถึง 10 พ.ย. 2026 (XP คละกัน) และผ่านทุกด่าน
 *   พร้อมข้อมูลของทุกฟีเจอร์: SRS 271 รายการ ครบ 5 กล่อง (น้อย → มาก), สมุดคำผิด, เด็คของฉัน, ประวัติฝึกพูด, Pre/Post Test,
 *   คะแนนเกม, บันทึกการคัด และภาพลายมือตัวอย่าง (ติดป้าย demo แยกจากภาพจริง)
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

    var today = S.key(new Date());
    function dayKey(i) { return S.key(days[Math.max(0, Math.min(days.length - 1, i))]); }
    function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
    function plus(k, n) { var p = k.split('-').map(Number); return S.key(S.addDays(new Date(p[0], p[1] - 1, p[2]), n)); }

    // สถิติความแม่นยำประมาณ 85% (แยกตามขั้น + ทบทวน/ฟังแยกเสียง/เกม/ฝึกพูด)
    var byStage = {}, answered = 0, correct = 0;
    [['1', 0.17], ['2', 0.15], ['3', 0.16], ['4', 0.14], ['5', 0.12], ['pairs', 0.05], ['review', 0.14], ['game', 0.05], ['speak', 0.02]].forEach(function (x) {
      var c = Math.round(totalCorrect * x[1]);
      var a = Math.round(c / (0.78 + rand() * 0.15));
      byStage[x[0]] = { correct: c, answered: a };
      correct += c; answered += a;
    });

    // ทบทวนตามรอบ: รวม 271 รายการ (รวมวลีในเด็คของฉัน 8 วลี) เรียงจากน้อยไปมาก
    //   กล่อง 1 (ทุก 1 วัน) 20 · กล่อง 2 (2 วัน) 35 · กล่อง 3 (4 วัน) 55 · กล่อง 4 (7 วัน) 71 · กล่อง 5 (14 วัน) 90
    var IV = NS.srs.INTERVALS, srs = {};
    var BOX_TOTAL = [20, 35, 55, 71, 90], DECK_N = 8;
    var deckBoxes = [];
    for (var db = 0; db < DECK_N; db++) deckBoxes.push(1 + (db % 5));
    var quota = BOX_TOTAL.map(function (n, i) { return n - deckBoxes.filter(function (b) { return b === i + 1; }).length; });
    var pool = Object.keys(learned).filter(function (id) { var it = NS.content.itemById(id); return it && it.quiz !== false; });
    // สุ่มลำดับ (seed คงที่) แล้วเลือกมาเท่าที่ต้องใช้
    for (var sh = pool.length - 1; sh > 0; sh--) { var sj = Math.floor(rand() * (sh + 1)); var st = pool[sh]; pool[sh] = pool[sj]; pool[sj] = st; }
    var ids = [], keep = {};
    quota.forEach(function (n, bi) {
      for (var q = 0; q < n && pool.length; q++) {
        var id = pool.shift(), box = bi + 1;
        var todayChance = box === 1 ? 0.5 : box === 2 ? 0.3 : 0.04;
        srs[id] = { box: box, due: rand() < todayChance ? today : plus(today, 1 + Math.floor(rand() * IV[box - 1])) };
        ids.push(id); keep[id] = learned[id];
      }
    });
    // สิ่งที่ "เรียนแล้ว" = เฉพาะที่อยู่ในระบบทบทวน (ไม่อย่างนั้นระบบจะดึงที่เหลือเข้า SRS เพิ่มเองอัตโนมัติ)
    learned = keep;

    // สมุดคำผิด + จำนวนครั้งที่ผิดสะสม
    var missTally = {}, mistakes = {};
    var missPool = ids.filter(function (id) { return /^(h-|k-|v-|p-|g-)/.test(id); });
    for (var m = 0; m < 26 && missPool.length; m++) {
      var mid = missPool.splice(Math.floor(rand() * missPool.length), 1)[0];
      missTally[mid] = 1 + Math.floor(rand() * 7);
      if (m < 12) mistakes[mid] = { count: Math.min(missTally[mid], 1 + Math.floor(rand() * 4)), streak: Math.floor(rand() * 3), last: dayKey(days.length - 1 - Math.floor(rand() * 20)) };
    }

    // เด็คของฉัน
    var deckSrc = [
      ['大丈夫ですか', 'daijoubu desu ka', 'เป็นอะไรไหม / โอเคไหม', 'anime'],
      ['なるほど', 'naruhodo', 'อ๋อ เข้าใจแล้ว', 'anime'],
      ['おつかれさまです', 'otsukaresama desu', 'ขอบคุณที่เหนื่อยนะ (ทักทายหลังทำงาน)', 'friend'],
      ['よろしくね', 'yoroshiku ne', 'ฝากตัวด้วยนะ (แบบเป็นกันเอง)', 'friend'],
      ['ちょっと待って', 'chotto matte', 'รอแป๊บนึง', 'anime'],
      ['また明日', 'mata ashita', 'เจอกันพรุ่งนี้', 'friend'],
      ['いただきます', 'itadakimasu', '(พูดก่อนกินข้าว)', 'other'],
      ['頑張ってください', 'ganbatte kudasai', 'สู้ๆ นะ', 'anime']
    ];
    var deck = deckSrc.map(function (d, i) {
      var created = dayKey(10 + i * 9);
      var id = 'd-demo-' + (i + 1);
      var dbx = deckBoxes[i];
      srs[id] = { box: dbx, due: dbx <= 2 && i % 2 === 0 ? today : plus(today, 1 + Math.floor(rand() * IV[dbx - 1])) };
      return { id: id, jp: d[0], romaji: d[1], th: d[2], source: d[3], created: created };
    });

    // ประวัติฝึกพูด (ช่วงแรกตรงน้อย ช่วงหลังตรงมากขึ้น)
    var phrases = NS.content.allPhrases(), speakHistory = [];
    for (var sp = 0; sp < 70; sp++) {
      var it = pick(phrases), progress = sp / 70;
      var score = Math.round(Math.min(100, 30 + progress * 55 + rand() * 30));
      var verdict = NS.normalize.verdictOf(score / 100);
      var heard = verdict === 'match' ? it.jp : verdict === 'close' ? Array.from(it.jp).slice(0, Math.max(2, Math.round(it.jp.length * 0.6))).join('') : pick(['え？', 'すみ', 'あの']);
      speakHistory.unshift({ id: it.id, date: dayKey(Math.floor(progress * (days.length - 1))), time: (9 + Math.floor(rand() * 12)) + ':' + String(Math.floor(rand() * 60)).padStart(2, '0'), heard: heard, score: score, verdict: verdict });
    }

    // Pre/Post Test
    var tests = [
      { label: 'Pre', v: 2, date: dayKey(0), time: '19:05', p1: { c: 6, t: 20 }, p2: { c: 3, t: 10 }, p3: { c: 2, t: 18, mic: 18, self: 0 } },
      { label: 'Post', v: 2, date: dayKey(days.length - 1), time: '20:12', p1: { c: 19, t: 20 }, p2: { c: 9, t: 10 }, p3: { c: 14, t: 18, mic: 18, self: 0 } }
    ];

    // บันทึกการคัด: จำนวนครั้งต่างกัน (ให้ตารางมีสีครบทุกระดับ)
    var chars = {}, sents = {}, samples = [];
    NS.KANA.forEach(function (k, i) {
      ['hira', 'kata'].forEach(function (script) {
        if (k.noQuiz) return;
        var base = script === 'hira' ? 1 : 0.6;
        var r = rand() * base;
        var n = r < 0.12 ? 0 : r < 0.35 ? 1 + Math.floor(rand() * 2) : r < 0.6 ? 3 + Math.floor(rand() * 3) : r < 0.82 ? 6 + Math.floor(rand() * 4) : 10 + Math.floor(rand() * 9);
        if (!n) return;
        chars[k[script]] = { n: n, best: 55 + Math.floor(rand() * 41) };
        var keep = k.group === 'basic' ? Math.min(n, 3) : Math.min(n, 1);
        for (var q = 0; q < keep; q++) samples.push({ kind: 'char', key: k[script], label: k[script], score: 45 + Math.floor(rand() * 50) });
      });
    });
    phrases.filter(function (x) { return /^[ぁ-ゟ、。\s]+$/.test(x.char); }).slice(0, 14).forEach(function (it, i) {
      var n = 1 + Math.floor(rand() * 5);
      sents[it.id] = { n: n, best: 50 + Math.floor(rand() * 45) };
      samples.push({ kind: 'sent', key: it.id, label: it.char, th: it.th, score: sents[it.id].best });
    });

    return {
      xpByDay: xpByDay, levels: levels, learned: learned,
      stats: { answered: answered, correct: correct, byStage: byStage },
      srs: srs, mistakes: mistakes, missTally: missTally, deck: deck, speakHistory: speakHistory, tests: tests,
      gameBest: { hira: 27, kata: 21, vocab: 16 },
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
