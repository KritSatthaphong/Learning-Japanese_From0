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

  function sokuonItem(w) {
    return {
      id: 'w-' + w.romaji,
      kind: 'word',
      script: 'hira',
      char: w.hira,
      romaji: w.romaji,
      label: w.romaji,
      th: w.th,
      group: 'sokuon',
      tip: 'っ ตัวเล็ก = หยุดค้างครึ่งจังหวะ ในโรมันจิเขียนพยัญชนะซ้ำ (' + w.romaji + ') · แปลว่า ' + w.th,
      note: '',
      quiz: true,
      sound: w.hira,
      soundKey: w.romaji,
      near: w.near ? {
        id: 'near-' + w.romaji, char: w.near.hira, romaji: w.near.romaji,
        label: w.near.romaji, sound: w.near.hira, soundKey: w.near.romaji
      } : null,
      verify: !!w.verify
    };
  }

  function levelItems(level) {
    if (level.kind !== 'kana') return [];
    var items = NS.KANA.filter(function (k) { return k.lv === level.lv; })
      .map(function (k) { return kanaItem(k, level.script); });
    if (level.sokuon && level.script === 'hira') items = items.concat(NS.SOKUON.map(sokuonItem));
    return items;
  }

  /* ตัวอักษรจากด่านก่อนหน้า (สคริปต์เดียวกัน) ใช้เป็นตัวเลือกหลอก */
  function prevItems(level) {
    if (level.kind !== 'kana') return [];
    return NS.KANA.filter(function (k) { return k.lv < level.lv; })
      .map(function (k) { return kanaItem(k, level.script); });
  }

  NS.content = {
    romajiLabel: romajiLabel,
    kanaItem: kanaItem,
    kanaId: kanaId,
    levelItems: levelItems,
    prevItems: prevItems
  };
})();
