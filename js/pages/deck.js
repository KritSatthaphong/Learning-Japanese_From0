/*
 * deck.js — เด็คของฉัน: เพิ่มวลีเอง (จากอนิเมะ / เพื่อนชาวญี่ปุ่น) เข้า SRS อัตโนมัติ
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var SOURCES = [
    { value: 'anime', label: 'อนิเมะ / ซีรีส์' },
    { value: 'friend', label: 'เพื่อนชาวญี่ปุ่น' },
    { value: 'other', label: 'อื่นๆ' }
  ];
  function srcLabel(v) { var s = SOURCES.find(function (x) { return x.value === v; }); return s ? s.label : 'อื่นๆ'; }

  function clean(d) {
    return {
      id: String(d.id || ('d-' + Date.now() + '-' + Math.floor(Math.random() * 1000))),
      jp: String(d.jp || '').trim().slice(0, 200),
      romaji: String(d.romaji || '').trim().slice(0, 200),
      th: String(d.th || '').trim().slice(0, 200),
      source: SOURCES.some(function (s) { return s.value === d.source; }) ? d.source : 'other',
      created: /^\d{4}-\d{2}-\d{2}$/.test(d.created) ? d.created : NS.store.today()
    };
  }

  NS.pages.deck = function (root) {
    var editing = null;

    function render() {
      var deck = NS.store.get().deck;
      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/more', class: 'back' }, '← เพิ่มเติม'));
      root.appendChild(h('h1', { class: 'page-title' }, 'เด็คของฉัน'));
      root.appendChild(h('p', { class: 'muted' }, 'เก็บวลีที่เจอเองจากอนิเมะหรือเพื่อนชาวญี่ปุ่น วลีที่เพิ่มจะเข้าระบบทบทวนตามรอบ (SRS) อัตโนมัติ'));

      /* ฟอร์ม */
      var f = editing || { jp: '', romaji: '', th: '', source: 'anime' };
      var jpIn = h('input', { class: 'input', lang: 'ja', required: true, placeholder: 'เช่น 大丈夫ですか', value: f.jp });
      var roIn = h('input', { class: 'input', placeholder: 'เช่น daijoubu desu ka (ไม่บังคับ)', value: f.romaji });
      var thIn = h('input', { class: 'input', required: true, placeholder: 'เช่น เป็นอะไรไหม', value: f.th });
      var srcSel = h('select', { class: 'input' }, SOURCES.map(function (s) { return h('option', { value: s.value, selected: s.value === f.source }, s.label); }));
      var form = h('form', { class: 'card deck-form stack-sm', onsubmit: function (e) {
        e.preventDefault();
        if (!jpIn.value.trim() || !thIn.value.trim()) { NS.ui.toast('กรอกภาษาญี่ปุ่นและความหมายไทยก่อน'); return; }
        var s = NS.store.get();
        if (editing) {
          var d = s.deck.find(function (x) { return x.id === editing.id; });
          Object.assign(d, clean({ id: d.id, created: d.created, jp: jpIn.value, romaji: roIn.value, th: thIn.value, source: srcSel.value }));
          NS.ui.toast('แก้ไขแล้ว');
        } else {
          s.deck.unshift(clean({ jp: jpIn.value, romaji: roIn.value, th: thIn.value, source: srcSel.value }));
          NS.ui.toast('เพิ่มแล้ว และเข้าระบบทบทวนแล้ว');
        }
        NS.store.save(); NS.srs.sync();
        editing = null; render();
      } },
        h('h2', { class: 'section-title flush' }, editing ? '✏️ แก้ไขวลี' : '➕ เพิ่มวลีใหม่'),
        h('label', { class: 'field' }, h('span', null, 'ภาษาญี่ปุ่น *'), jpIn),
        h('label', { class: 'field' }, h('span', null, 'โรมันจิ'), roIn),
        h('label', { class: 'field' }, h('span', null, 'ความหมายไทย *'), thIn),
        h('label', { class: 'field' }, h('span', null, 'ที่มา'), srcSel),
        h('div', { class: 'row' },
          h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { if (jpIn.value.trim()) NS.speech.speak(jpIn.value); } }, '🔊 ลองฟัง'),
          h('button', { class: 'btn btn-primary', type: 'submit' }, editing ? 'บันทึก' : 'เพิ่ม'),
          editing ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: function () { editing = null; render(); } }, 'ยกเลิก') : null));
      root.appendChild(form);

      /* นำเข้า / ส่งออก */
      var fileIn = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
      fileIn.addEventListener('change', function () { importFile(fileIn.files[0]); });
      root.appendChild(h('div', { class: 'row deck-io' },
        h('button', { class: 'btn btn-ghost small', type: 'button', disabled: !deck.length, onclick: function () {
          NS.ui.download('nihongo-deck-' + NS.store.today() + '.json', JSON.stringify({ app: 'nihongo-survival', type: 'deck', deck: deck }, null, 2), 'application/json');
        } }, '⬇ ส่งออก JSON'),
        h('button', { class: 'btn btn-ghost small', type: 'button', onclick: function () { fileIn.click(); } }, '⬆ นำเข้า JSON'),
        fileIn));

      /* รายการ */
      root.appendChild(h('h2', { class: 'section-title' }, 'วลีของฉัน (' + deck.length + ')'));
      if (!deck.length) root.appendChild(h('p', { class: 'card notice' }, 'ยังไม่มีวลี ลองเพิ่มวลีแรกด้านบน'));
      root.appendChild(h('div', { class: 'stack-sm' }, deck.map(function (d) {
        var it = NS.content.deckItem(d);
        return NS.cards.phrase(it, h('div', { class: 'phrase-foot' },
          h('span', { class: 'badge' }, srcLabel(d.source) + ' · ' + d.created),
          h('span', { class: 'row' },
            h('a', { class: 'btn btn-ghost small', href: '#/speakcheck/' + encodeURIComponent(d.id) }, '🎤 ฝึกพูด'),
            h('button', { class: 'btn btn-ghost small', type: 'button', onclick: function () { editing = d; render(); window.scrollTo(0, 0); } }, '✏️ แก้ไข'),
            h('button', { class: 'btn btn-ghost small', type: 'button', onclick: function () { confirmDelete(d); } }, '🗑 ลบ'))));
      })));
    }

    function confirmDelete(d) {
      NS.ui.modal({
        title: 'ลบวลีนี้?',
        body: h('p', null, NS.ui.jp(d.jp), ' — ' + d.th),
        actions: [
          { label: 'ยกเลิก', cls: 'btn-soft' },
          { label: 'ลบ', cls: 'btn-danger', onClick: function () {
            var s = NS.store.get();
            s.deck = s.deck.filter(function (x) { return x.id !== d.id; });
            delete s.srs[d.id]; delete s.mistakes[d.id];
            NS.store.save(); render();
          } }
        ]
      });
    }

    function importFile(file) {
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var arr = Array.isArray(data) ? data : data.deck;
          if (!Array.isArray(arr)) throw new Error('ไม่พบรายการวลีในไฟล์');
          var s = NS.store.get(), ids = {}, added = 0, skipped = 0;
          s.deck.forEach(function (d) { ids[d.id] = true; ids[d.jp + '|' + d.th] = true; });
          arr.forEach(function (raw) {
            var d = clean(raw || {});
            if (!d.jp || !d.th) return;
            if (ids[d.id] || ids[d.jp + '|' + d.th]) { skipped++; return; }   // มีอยู่แล้ว ไม่เพิ่มซ้ำ
            ids[d.id] = true; ids[d.jp + '|' + d.th] = true; s.deck.push(d); added++;
          });
          NS.store.save(); NS.srs.sync();
          NS.ui.toast('นำเข้า ' + added + ' วลี' + (skipped ? ' (ข้าม ' + skipped + ' วลีที่มีอยู่แล้ว)' : ''));
          render();
        } catch (e) {
          NS.ui.toast('นำเข้าไม่ได้: ไฟล์ไม่ถูกต้อง (' + e.message + ')');
        }
      };
      reader.readAsText(file);
    }

    render();
  };
})();
