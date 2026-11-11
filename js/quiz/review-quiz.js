/*
 * review-quiz.js — สร้างคำถามจาก "รายการใดก็ได้" (ใช้กับ SRS, สมุดคำผิด, เด็คของฉัน)
 * ใช้รูปแบบคำถามเดียวกับแบบฝึกหัดในเส้นทางเรียน
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var shuffle = NS.ui.shuffle;

  /* คำถามสำหรับวลีในเด็คของฉัน: ฟัง→ความหมาย / ดูคำ→ความหมาย / ความหมาย→คำ */
  function deckQ(it) {
    var pool = NS.store.get().deck.map(NS.content.deckItem)
      .concat(NS.content.allPhrases())
      .concat((NS.VOCAB || []).map(NS.content.vocabItem));
    var usedTh = {}; usedTh[it.th] = true;
    var usedJp = {}; usedJp[it.char] = true;
    var opts = [it];
    shuffle(pool).forEach(function (c) {
      if (opts.length >= 4 || usedTh[c.th] || usedJp[c.char]) return;
      usedTh[c.th] = true; usedJp[c.char] = true; opts.push(c);
    });
    opts = shuffle(opts);
    var t = ['a2th', 'w2th', 'th2w'][Math.floor(Math.random() * 3)];
    var reveal = { title: it.char, detail: [it.label, it.th].filter(Boolean).join(' = '), speak: it.sound };
    var base = { type: 'deck-' + t, item: it, answerId: it.id, reveal: reveal };
    if (t === 'a2th') return Object.assign(base, { label: 'ฟังแล้วเลือกความหมาย', prompt: { audio: it.sound },
      choices: opts.map(function (c) { return { id: c.id, label: c.th, jp: false }; }) });
    if (t === 'w2th') return Object.assign(base, { label: 'วลีนี้แปลว่าอะไร?', prompt: { text: it.char, jp: true, small: true },
      choices: opts.map(function (c) { return { id: c.id, label: c.th, jp: false }; }) });
    return Object.assign(base, { label: 'ข้อไหนแปลว่า "' + it.th + '"?', prompt: { text: it.th, th: true }, layout: 'list',
      choices: opts.map(function (c) { return { id: c.id, label: c.char, jp: true }; }) });
  }

  function questionFor(it) {
    try {
      if (it.kind === 'kana' || it.kind === 'word') return NS.kanaQuiz.forItem(it);
      if (it.kind === 'vocab') return NS.vocabQuiz.forItem(it);
      if (it.kind === 'sentence' || it.kind === 'phrase') return NS.sentenceQuiz.forItem(it);
      if (it.kind === 'pair') return NS.pairsQuiz.forItem(it);
      if (it.kind === 'deck') return deckQ(it);
    } catch (e) {
      if (window.console) console.warn('สร้างคำถามไม่ได้', it.id, e);
    }
    return null;
  }

  /* คำถามจากรายการ id หลายตัว (ข้ามตัวที่สร้างคำถามไม่ได้) */
  function fromIds(ids) {
    return ids.map(function (id) { var it = NS.content.itemById(id); return it ? questionFor(it) : null; })
      .filter(Boolean);
  }

  NS.reviewQuiz = { questionFor: questionFor, fromIds: fromIds };
})();
