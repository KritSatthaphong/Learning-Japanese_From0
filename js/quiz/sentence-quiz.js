/*
 * sentence-quiz.js — สร้างคำถามจากประโยค
 *
 * ขั้น 4 รูปประโยค: เลือกประโยคที่ถูก / เติมคำช่วย (は を か に へ) / ต่อประโยคจากบล็อกคำ
 * ขั้น 5 สถานการณ์จริง: ฟัง → เลือกความหมาย / ต่อประโยคจากบล็อกคำ
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var shuffle = NS.ui.shuffle;

  var PARTICLES = ['は', 'を', 'か', 'に', 'へ'];
  // คำช่วยที่ "อาจถูกได้เหมือนกัน" ในบางประโยค จึงไม่ใช้เป็นตัวเลือกหลอก
  // เช่น えきに/えきへ いきます ถูกทั้งคู่, ごはんは たべます ก็ถูกไวยากรณ์ (เน้นเปรียบเทียบ)
  var SKIP = { 'を': ['は'], 'に': ['へ', 'は'], 'へ': ['に', 'は'], 'は': [], 'か': [] };
  var PNOTE = {
    'は': 'は เป็นคำช่วยบอกหัวเรื่อง อ่านว่า "wa"',
    'を': 'を ใช้กับสิ่งที่ถูกกระทำ อ่านว่า "o"',
    'へ': 'へ บอกทิศทาง/จุดหมาย อ่านว่า "e"',
    'に': 'に บอกจุดหมาย / ตำแหน่ง',
    'か': 'か ท้ายประโยค = ประโยคคำถาม'
  };

  function reveal(it, extra) {
    return {
      title: it.char,
      detail: [it.label + ' = ' + it.th, extra, it.note].filter(Boolean).join(' · '),
      speak: it.sound
    };
  }

  function particleIdx(it) {
    var idx = [];
    it.blocks.forEach(function (b, i) { if (PARTICLES.indexOf(b) >= 0) idx.push(i); });
    return idx;
  }

  /* ---------- แบบต่างๆ ---------- */
  function blocksQ(it) {
    var tiles = it.blocks.concat(it.decoys.filter(function (d) { return it.blocks.indexOf(d) < 0; }));
    var t;
    do { t = shuffle(tiles); } while (tiles.length > 1 && t.join('|') === it.blocks.join('|'));
    return {
      type: 'blocks', item: it, label: 'เรียงบล็อกให้เป็นประโยคภาษาญี่ปุ่น',
      prompt: { text: it.th, th: true },
      tiles: t, answerText: it.char, accept: it.accept,
      reveal: reveal(it)
    };
  }

  function chooseQ(it, same) {
    var opts = [{ id: it.id, label: it.char }];
    var used = {}; used[NS.quiz.norm(it.char)] = true;
    function add(id, label) {
      if (opts.length >= 4 || used[NS.quiz.norm(label)]) return;
      used[NS.quiz.norm(label)] = true;
      opts.push({ id: id, label: label });
    }
    it.wrong.forEach(function (w, i) { add('wrong-' + i, w); });
    shuffle(same.filter(function (s) { return s.id !== it.id; })).forEach(function (s) { add(s.id, s.char); });
    return {
      type: 'choose', item: it, answerId: it.id, layout: 'list',
      label: 'ประโยคไหนแปลว่า…',
      prompt: { text: it.th, th: true },
      choices: shuffle(opts).map(function (o) { return { id: o.id, label: o.label, jp: true }; }),
      reveal: reveal(it)
    };
  }

  function particleQ(it) {
    var idxs = particleIdx(it);
    var at = idxs[Math.floor(Math.random() * idxs.length)];
    var ans = it.blocks[at];
    var shown = it.blocks.map(function (b, i) { return i === at ? '（　）' : b; }).join('');
    var others = shuffle(PARTICLES.filter(function (p) { return p !== ans && SKIP[ans].indexOf(p) < 0; })).slice(0, 3);
    return {
      type: 'particle', item: it, answerId: 'pt-' + ans,
      label: 'เติมคำช่วยในช่องว่าง',
      prompt: { text: shown, jp: true, sub: it.th, small: true },
      choices: shuffle([ans].concat(others)).map(function (p) { return { id: 'pt-' + p, label: p, jp: true }; }),
      reveal: reveal(it, PNOTE[ans])
    };
  }

  function listenQ(it, same, prev) {
    var opts = [it];
    var usedTh = {}; usedTh[it.th] = true;
    function add(c) { if (opts.length < 4 && !usedTh[c.th]) { usedTh[c.th] = true; opts.push(c); } }
    var p = shuffle(prev);
    if (p.length) add(p.shift());
    shuffle(same.filter(function (s) { return s.id !== it.id; })).forEach(add);
    p.forEach(add);
    return {
      type: 'a2th', item: it, answerId: it.id,
      label: 'ฟังแล้วเลือกความหมาย',
      prompt: { audio: it.sound },
      choices: shuffle(opts).map(function (c) { return { id: c.id, label: c.th, jp: false }; }),
      reveal: reveal(it)
    };
  }

  /* เลือกประโยคให้กระจายทุกประโยค และกระจายชนิดคำถาม */
  function plan(items, n, types, can) {
    var order = [];
    while (order.length < n * 2) order = order.concat(shuffle(items));
    var tlist = [];
    while (tlist.length < n) tlist = tlist.concat(shuffle(types));
    var out = [], used = 0;
    for (var k = 0; k < n; k++) {
      var want = tlist[k];
      var it = order[used++];
      var t = can(it, want) ? want : types.find(function (x) { return can(it, x); });
      out.push({ it: it, type: t });
    }
    return out;
  }

  function buildGrammar(level, n) {
    n = n || 10;
    var items = NS.content.grammarItems(level);
    if (!items.length) return [];
    var can = function (it, t) {
      if (t === 'particle') return particleIdx(it).length > 0;
      if (t === 'blocks') return it.blocks.length > 1;
      return true;
    };
    return plan(items, n, ['choose', 'particle', 'blocks'], can).map(function (p) {
      if (p.type === 'particle') return particleQ(p.it);
      if (p.type === 'blocks') return blocksQ(p.it);
      return chooseQ(p.it, items);
    });
  }

  function buildPhrase(level, n) {
    n = n || 10;
    var items = NS.content.phraseItems(level);
    var prev = NS.content.phrasesBefore(level);
    if (!items.length) return [];
    var can = function (it, t) { return t === 'blocks' ? it.blocks.length > 1 : true; };
    return plan(items, n, ['a2th', 'blocks'], can).map(function (p) {
      return p.type === 'blocks' ? blocksQ(p.it) : listenQ(p.it, items, prev);
    });
  }

  function forItem(it) {
    var level = NS.progress.find(it.level);
    if (it.kind === 'phrase') {
      if (it.blocks.length > 1 && Math.random() < 0.5) return blocksQ(it);
      return listenQ(it, NS.content.phraseItems(level), NS.content.phrasesBefore(level));
    }
    var opts = ['choose'];
    if (particleIdx(it).length) opts.push('particle');
    if (it.blocks.length > 1) opts.push('blocks');
    var t = opts[Math.floor(Math.random() * opts.length)];
    if (t === 'particle') return particleQ(it);
    if (t === 'blocks') return blocksQ(it);
    return chooseQ(it, NS.content.grammarItems(level));
  }

  NS.sentenceQuiz = { buildGrammar: buildGrammar, buildPhrase: buildPhrase, forItem: forItem, PARTICLES: PARTICLES };
})();
