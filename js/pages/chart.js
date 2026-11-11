/*
 * chart.js — ตารางตัวอักษร (五十音) 3 ตาราง: พื้นฐาน / เสียงขุ่น / เสียงควบ
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  var BASIC_ROWS = ['-', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'nn'];
  var DAKU_ROWS = ['g', 'z', 'd', 'b', 'p'];
  var YOUON_ROWS = ['ky', 'sh', 'ch', 'ny', 'hy', 'my', 'ry', 'gy', 'j', 'by', 'py'];
  var VOWELS = ['a', 'i', 'u', 'e', 'o'];
  var YCOLS = ['ya', 'yu', 'yo'];
  var ROW_LABEL = { '-': '', nn: 'n' };

  var index = null;
  function lookup(group, row, col) {
    if (!index) {
      index = {};
      NS.KANA.forEach(function (k) { index[k.group + '|' + k.row + '|' + k.col] = k; });
    }
    return index[group + '|' + row + '|' + col] || null;
  }

  function showDetail(k, mode) {
    var scripts = mode === 'both' ? ['hira', 'kata'] : [mode];
    var body = h('div', { class: 'detail' },
      h('div', { class: 'detail-chars' }, scripts.map(function (s) {
        return h('button', { class: 'detail-char', type: 'button', onclick: function () { NS.speech.speak(k[s]); }, 'aria-label': 'ฟัง ' + k[s] },
          NS.ui.jp(k[s]), h('small', { class: 'muted' }, s === 'hira' ? 'ひらがな' : 'カタカナ'));
      })),
      h('div', { class: 'detail-romaji' }, NS.content.romajiLabel(k.romaji)),
      scripts.map(function (s) {
        var it = NS.content.kanaItem(k, s);
        var tip = it.tip;
        return tip ? h('p', { class: 'detail-tip' }, (scripts.length > 1 ? (s === 'hira' ? 'ひ: ' : 'カ: ') : '') + '💡 ' + tip) : null;
      }),
      k.note ? h('p', { class: 'detail-note' }, 'ℹ️ ' + k.note) : null,
      h('div', { class: 'row center' },
        NS.ui.speakBtn(k[scripts[0]], { label: '🔊 ฟัง' }),
        NS.ui.speakBtn(k[scripts[0]], { label: '🐢 ฟังช้า', rate: 0.5, cls: 'btn-ghost' })));
    NS.ui.modal({ title: 'ตัวอักษร', body: body });
    NS.speech.speak(k[scripts[0]]);
  }

  function cell(k, mode, fade) {
    if (!k) return h('td', { class: 'empty', 'aria-hidden': 'true' });
    var scripts = mode === 'both' ? ['hira', 'kata'] : [mode];
    var learnedAny = false;
    var chars = scripts.map(function (s) {
      var learned = NS.progress.isKanaLearned(k, s);
      if (learned) learnedAny = true;
      return h('span', { class: 'cell-char jp' + (fade && !learned ? ' faded' : ''), lang: 'ja' }, k[s]);
    });
    var rom = NS.content.romajiLabel(k.romaji) + (k.noQuiz ? '*' : '');
    return h('td', null, h('button', {
      class: 'cell' + (fade && !learnedAny ? ' unlearned' : ''), type: 'button',
      'aria-label': scripts.map(function (s) { return k[s]; }).join(' ') + ' อ่านว่า ' + NS.content.romajiLabel(k.romaji),
      onclick: function () { showDetail(k, mode); }
    }, h('span', { class: 'cell-chars' }, chars), h('span', { class: 'cell-romaji' }, rom)));
  }

  function table(caption, group, rows, cols, mode, fade, rowLabel) {
    return h('table', { class: 'kana-table cols-' + cols.length + (mode === 'both' ? ' both' : '') },
      h('caption', null, caption),
      h('thead', null, h('tr', null, h('th', { scope: 'col', class: 'rowhead' }, ''), cols.map(function (c) { return h('th', { scope: 'col' }, c); }))),
      h('tbody', null, rows.map(function (r) {
        return h('tr', null,
          h('th', { scope: 'row', class: 'rowhead' }, rowLabel ? rowLabel(r) : (r in ROW_LABEL ? ROW_LABEL[r] : r)),
          cols.map(function (c) { return cell(lookup(group, r, c), mode, fade); }));
      })));
  }

  NS.pages.chart = function (root) {
    var st = NS.store.settings();
    var mode = st.chartMode || 'hira';
    var fade = st.chartFade !== false;

    function render() {
      root.innerHTML = '';
      root.appendChild(h('div', { class: 'print-title' }, 'Nihongo Survival · ตารางตัวอักษรภาษาญี่ปุ่น'));
      root.appendChild(h('h1', { class: 'page-title no-print' }, 'ตารางตัวอักษร'));
      root.appendChild(h('div', { class: 'chart-tools no-print' },
        NS.ui.segmented([
          { value: 'hira', label: 'ひらがな' },
          { value: 'kata', label: 'カタカナ' },
          { value: 'both', label: 'คู่กัน' }
        ], mode, function (v) { mode = v; NS.store.setSetting('chartMode', v); render(); }, 'เลือกชุดตัวอักษร'),
        NS.ui.toggle('จางตัวที่ยังไม่เรียน', fade, function (v) { fade = v; NS.store.setSetting('chartFade', v); render(); }),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: function () { window.print(); } }, '🖨 พิมพ์ตาราง')));
      root.appendChild(h('p', { class: 'muted small no-print' }, 'แตะที่ตัวอักษรเพื่อฟังเสียงและดูทริคจำ'));

      root.appendChild(h('section', { class: 'chart-sec' },
        table('1. ตัวพื้นฐาน 46 ตัว (五十音)', 'basic', BASIC_ROWS, VOWELS, mode, fade)));

      root.appendChild(h('section', { class: 'chart-sec' },
        table('2. เสียงขุ่น (濁音・半濁音)', 'dakuten', DAKU_ROWS, VOWELS, mode, fade),
        h('p', { class: 'muted small foot' }, '* ぢ (ji) และ づ (zu) ออกเสียงเหมือน じ และ ず ใช้น้อยมาก ส่วนใหญ่จะใช้ じ ず แทน')));

      root.appendChild(h('section', { class: 'chart-sec' },
        table('3. เสียงควบ (拗音)', 'youon', YOUON_ROWS, YCOLS, mode, fade)));

      root.appendChild(h('a', { class: 'hub-item card disabled no-print', 'aria-disabled': 'true' },
        h('span', { class: 'hub-ico jp', lang: 'ja', 'aria-hidden': 'true' }, '書'),
        h('span', { class: 'hub-text' }, h('strong', null, 'ฝึกเขียนด้วยนิ้ว'), h('small', { class: 'muted' }, 'ลากตามเส้นนำแล้วให้คะแนน')),
        h('span', { class: 'badge' }, 'เฟส 6')));
    }
    render();
  };
})();
