/*
 * content.js — แปลงข้อมูลใน data/*.js ให้อยู่ในรูป "รายการที่ใช้เรียน/ทำแบบฝึกหัด"
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};

  var BASE_ROW = { g: 'k', z: 's', d: 't', b: 'h', p: 'h' };
  var charRomaji = null;

  function romajiOfChar(ch) {
    if (!charRomaji) {
      charRomaji = {};
      NS.KANA.forEach(function (k) {
        if (!(k.hira in charRomaji)) charRomaji[k.hira] = k.romaji;
        if (!(k.kata in charRomaji)) charRomaji[k.kata] = k.romaji;
      });
    }
    return charRomaji[ch] || '';
  }

  function romajiLabel(r) { return r === 'wo' ? 'wo (o)' : r; }

  /* สร้างคำอธิบายอัตโนมัติให้เสียงขุ่น/เสียงควบที่ไม่ได้ใส่ทริคจำไว้ */
  function autoTip(k, script) {
    if (k.group === 'dakuten') {
      var base = NS.KANA.find(function (b) { return b.group === 'basic' && b.row === BASE_ROW[k.row] && b.col === k.col; });
      if (base) {
        var mark = k.row === 'p' ? 'วงกลมเล็ก ゜' : 'ขีดสองขีด ゛';
        return base[script] + ' (' + base.romaji + ') + ' + mark + ' → ' + k[script] + ' (' + k.romaji + ')';
      }
    }
    if (k.group === 'youon') {
      var ch = k[script];
      return ch[0] + ' (' + romajiOfChar(ch[0]) + ') + ' + ch[1] + ' ตัวเล็ก → อ่านรวบเป็นพยางค์เดียว "' + k.romaji + '"';
    }
    return '';
  }

  function kanaId(k, script) { return (script === 'hira' ? 'h-' : 'k-') + (k.key || k.romaji); }

  function kanaItem(k, script) {
    var tip = (script === 'hira' ? k.tipH : k.tipK) || autoTip(k, script);
    return {
      id: kanaId(k, script),
      kind: 'kana',
      script: script,
      char: k[script],
      romaji: k.romaji,
      label: romajiLabel(k.romaji),
      group: k.group,
      lv: k.lv,
      tip: tip,
      note: k.note || '',
      quiz: !k.noQuiz,
      sound: k[script],
      soundKey: k.romaji === 'wo' ? 'o' : k.romaji,   // お กับ を เสียงเหมือนกัน
      verify: !!k.verify
    };
  }

  /* คำตัวอย่างในด่านตัวอักษร (คำที่มี っ / คำทับศัพท์) */
  function wordTip(w, script) {
    var ch = w[script];
    var parts = ['แปลว่า "' + w.th + '"'];
    if (/[っッ]/.test(ch)) parts.push((script === 'hira' ? 'っ' : 'ッ') + ' ตัวเล็ก = หยุดค้างครึ่งจังหวะ ในโรมันจิเขียนพยัญชนะซ้ำ');
    if (/ー/.test(ch)) parts.push('ー = ลากเสียงสระตัวหน้าให้ยาว');
    if (/[ゃゅょャュョ]/.test(ch)) parts.push('มีเสียงควบ (ตัวเล็ก ゃゅょ)');
    return parts.join(' · ');
  }

  function wordItem(w, script) {
    return {
      id: 'w-' + w.romaji,
      kind: 'word',
      script: script,
      char: w[script],
      romaji: w.romaji,
      label: w.romaji,
      th: w.th,
      group: 'word',
      tip: wordTip(w, script),
      note: '',
      quiz: true,
      sound: w[script],
      soundKey: w.romaji,
      near: w.near ? {
        id: 'near-' + w.romaji, char: w.near[script], romaji: w.near.romaji,
        label: w.near.romaji, sound: w.near[script], soundKey: w.near.romaji
      } : null,
      verify: !!w.verify
    };
  }

  function levelItems(level) {
    if (level.kind !== 'kana') return [];
    var items = NS.KANA.filter(function (k) { return k.lv === level.lv; })
      .map(function (k) { return kanaItem(k, level.script); });
    if (level.words && NS[level.words]) {
      items = items.concat(NS[level.words].map(function (w) { return wordItem(w, level.script); }));
    }
    return items;
  }

  /* ตัวอักษรจากด่านก่อนหน้า (สคริปต์เดียวกัน) ใช้เป็นตัวเลือกหลอก */
  function prevItems(level) {
    if (level.kind !== 'kana') return [];
    return NS.KANA.filter(function (k) { return k.lv < level.lv; })
      .map(function (k) { return kanaItem(k, level.script); });
  }

  /* คำศัพท์ขั้น 3 */
  function vocabItem(v) {
    return {
      id: 'v-' + v.romaji,
      kind: 'vocab',
      char: v.kana,
      kanji: v.kanji || '',
      romaji: v.romaji,
      label: v.romaji,
      th: v.th,
      tip: v.note || '',
      note: '',
      level: v.level,
      quiz: true,
      sound: v.kana,
      soundKey: v.kana,
      alt: v.alt || [],
      verify: !!v.verify
    };
  }

  function vocabItems(level) {
    return (NS.VOCAB || []).filter(function (v) { return v.level === level.id; }).map(vocabItem);
  }

  /* คำศัพท์จากด่านก่อนหน้าในขั้นคำศัพท์ (ใช้เป็นตัวเลือกหลอก) */
  function vocabBefore(level) {
    return (NS.VOCAB || []).filter(function (v) { return v.level < level.id; }).map(vocabItem);
  }

  /* ประโยค (ขั้น 4) และวลี (ขั้น 5) */
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function sentenceItem(s, levelId) {
    return {
      id: s.id ? 'p-' + s.id : 'g-' + slug(s.romaji),
      kind: s.id ? 'phrase' : 'sentence',
      level: s.level || levelId,
      char: s.kana,
      jp: s.jp || s.kana,
      romaji: s.romaji,
      label: s.romaji,
      th: s.th,
      note: s.note || '',
      tip: s.note || '',
      blocks: s.blocks || [],
      decoys: s.decoys || [],
      wrong: s.wrong || [],
      accept: s.accept || [],
      alt: s.alt || [],
      sound: s.jp || s.kana,
      verify: !!s.verify
    };
  }

  function grammarOf(level) { return (NS.GRAMMAR || {})[level.id] || null; }
  function grammarItems(level) {
    var g = grammarOf(level);
    return g ? g.sentences.map(function (s) { return sentenceItem(s, level.id); }) : [];
  }
  function phraseItems(level) {
    return (NS.PHRASES || []).filter(function (p) { return p.level === level.id; }).map(function (p) { return sentenceItem(p); });
  }
  function phrasesBefore(level) {
    return (NS.PHRASES || []).filter(function (p) { return p.level < level.id; }).map(function (p) { return sentenceItem(p); });
  }
  function allPhrases() { return (NS.PHRASES || []).map(function (p) { return sentenceItem(p); }); }

  NS.content = {
    sentenceItem: sentenceItem,
    grammarOf: grammarOf,
    grammarItems: grammarItems,
    phraseItems: phraseItems,
    phrasesBefore: phrasesBefore,
    allPhrases: allPhrases,
    vocabItem: vocabItem,
    vocabItems: vocabItems,
    vocabBefore: vocabBefore,
    romajiLabel: romajiLabel,
    kanaItem: kanaItem,
    kanaId: kanaId,
    levelItems: levelItems,
    prevItems: prevItems
  };
})();
