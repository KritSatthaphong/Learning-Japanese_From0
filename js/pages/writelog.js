/*
 * writelog.js — ตารางบันทึกการคัด
 * ตารางใหญ่ของตัวอักษรทุกตัว แต่ละช่องบอกว่าคัดไปแล้วกี่ครั้ง (ยิ่งคัดมาก สียิ่งเข้ม)
 * กดที่ช่องเพื่อดูภาพลายมือที่เคยคัด · มีแท็บประโยค "ภาษาญี่ปุ่น = คำแปลไทย" ด้วย
 * (ไม่แสดงวันที่ นับจำนวนครั้งอย่างเดียว)
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  var TABLES = [
    { title: 'ตัวพื้นฐาน (五十音)', group: 'basic', rows: ['-', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'nn'], cols: ['a', 'i', 'u', 'e', 'o'] },
    { title: 'เสียงขุ่น (濁音・半濁音)', group: 'dakuten', rows: ['g', 'z', 'd', 'b', 'p'], cols: ['a', 'i', 'u', 'e', 'o'] },
    { title: 'เสียงควบ (拗音)', group: 'youon', rows: ['ky', 'sh', 'ch', 'ny', 'hy', 'my', 'ry', 'gy', 'j', 'by', 'py'], cols: ['ya', 'yu', 'yo'] }
  ];
  var ROW_LABEL = { '-': '', nn: 'n' };

  /* ระดับสี 0–4 ตามจำนวนครั้ง */
  function lvl(n) { return n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 9 ? 3 : 4; }

  var index = null;
  function lookup(group, row, col) {
    if (!index) { index = {}; NS.KANA.forEach(function (k) { index[k.group + '|' + k.row + '|' + k.col] = k; }); }
    return index[group + '|' + row + '|' + col] || null;
  }

  /* หน้าต่างรายละเอียด: จำนวนครั้ง คะแนนดีที่สุด และภาพลายมือล่าสุด */
  function showDetail(kind, key, title, sub, href) {
    var rec = kind === 'sent' ? NS.writeLog.sentRec(key) : NS.writeLog.charRec(key);
    var gallery = h('div', { class: 'wl-gallery' + (kind === 'sent' ? ' sent' : '') }, h('span', { class: 'muted small' }, 'กำลังโหลดภาพลายมือ…'));
    NS.writeLog.samples(kind, key).then(function (list) {
      gallery.innerHTML = '';
      if (!list.length) {
        gallery.appendChild(h('p', { class: 'muted small' }, rec.n ? 'ไม่มีภาพลายมือที่เก็บไว้ในเครื่องนี้' : 'ยังไม่เคยคัด'));
        return;
      }
      list.forEach(function (s, i) {
        gallery.appendChild(h('figure', { class: 'wl-sample' },
          h('img', { src: s.img, alt: 'ลายมือครั้งที่ ' + (i + 1) + ' (ล่าสุดก่อน)' }),
          s.score != null ? h('figcaption', null, s.score + ' คะแนน') : null));
      });
    });
    NS.ui.modal({
      title: 'บันทึกการคัด',
      body: h('div', { class: 'wl-detail' },
        NS.ui.jp(title, kind === 'sent' ? 'wl-title-sent' : 'wl-title'),
        sub ? h('div', { class: 'muted' }, sub) : null,
        h('div', { class: 'wl-stats' },
          h('div', null, h('strong', null, String(rec.n)), h('small', { class: 'muted' }, 'ครั้งที่คัด')),
          h('div', null, h('strong', null, rec.best ? String(rec.best) : '–'), h('small', { class: 'muted' }, 'คะแนนดีที่สุด'))),
        h('h3', { class: 'wl-h' }, 'ลายมือล่าสุด (สูงสุด ' + NS.writeLog.KEEP + ' ครั้ง)'),
        gallery),
      actions: [
        { label: 'ปิด', cls: 'btn-soft' },
        { label: '✍️ คัดเลย', cls: 'btn-primary', onClick: function () { NS.router.go(href); } }
      ]
    });
  }

  NS.pages.writelog = function (root) {
    var tab = NS.store.settings().writelogTab || 'hira';

    function render() {
      var T = NS.writeLog.totals();
      root.innerHTML = '';
      root.appendChild(h('div', { class: 'write-nav' },
        h('a', { href: '#/chart', class: 'back' }, '← ตารางตัวอักษร'),
        h('a', { href: '#/write', class: 'btn btn-primary small' }, '✍️ ไปคัด')));
      root.appendChild(h('h1', { class: 'page-title' }, 'บันทึกการคัด'));
      root.appendChild(h('div', { class: 'tiles tiles-4' },
        tile('คัดตัวอักษร', T.charWrites + ' ครั้ง'),
        tile('ตัวที่เคยคัด', T.charsUsed + ' ตัว'),
        tile('คัดประโยค', T.sentWrites + ' ครั้ง'),
        tile('ประโยคที่เคยคัด', T.sentsUsed + ' ประโยค')));
      root.appendChild(h('p', { class: 'muted small' }, 'ตัวเลขในแต่ละช่อง = จำนวนครั้งที่คัด (นับทุกครั้งที่กด "✓ ตรวจ" รวมตัวอักษรที่อยู่ในประโยคที่คัดด้วย) · แตะที่ช่องเพื่อดูลายมือ'));
      root.appendChild(NS.ui.segmented([
        { value: 'hira', label: 'ひらがな' }, { value: 'kata', label: 'カタカナ' }, { value: 'sent', label: 'ประโยค' }
      ], tab, function (v) { tab = v; NS.store.setSetting('writelogTab', v); render(); }, 'เลือกตาราง'));
      root.appendChild(legend());
      if (tab === 'sent') renderSentences(); else renderKana(tab);
    }

    function tile(label, value) {
      return h('div', { class: 'tile card' }, h('small', { class: 'muted' }, label), h('strong', null, value));
    }

    function legend() {
      return h('div', { class: 'wl-legend', 'aria-hidden': 'true' },
        h('span', { class: 'muted small' }, 'คัดน้อย'),
        [['0', 0], ['1–2', 1], ['3–5', 2], ['6–9', 3], ['10+', 4]].map(function (x) { return h('span', { class: 'wl-chip wl' + x[1] }, x[0]); }),
        h('span', { class: 'muted small' }, 'คัดมาก'));
    }

    function renderKana(script) {
      TABLES.forEach(function (t) {
        var table = h('table', { class: 'wl-table cols-' + t.cols.length },
          h('caption', null, t.title),
          h('thead', null, h('tr', null, h('th', { scope: 'col', class: 'rowhead' }), t.cols.map(function (c) { return h('th', { scope: 'col' }, c); }))),
          h('tbody', null, t.rows.map(function (r) {
            return h('tr', null, h('th', { scope: 'row', class: 'rowhead' }, r in ROW_LABEL ? ROW_LABEL[r] : r),
              t.cols.map(function (c) {
                var k = lookup(t.group, r, c);
                if (!k) return h('td', { class: 'empty', 'aria-hidden': 'true' });
                var ch = k[script], n = NS.writeLog.charCount(ch);
                return h('td', null, h('button', {
                  class: 'wl-cell wl' + lvl(n), type: 'button',
                  'aria-label': ch + ' คัดแล้ว ' + n + ' ครั้ง',
                  onclick: function () { showDetail('char', ch, ch, NS.content.romajiLabel(k.romaji), '#/write/char/' + encodeURIComponent(ch)); }
                }, NS.ui.jp(ch, 'wl-char'), h('span', { class: 'wl-rom' }, NS.content.romajiLabel(k.romaji)), h('span', { class: 'wl-n' }, '×' + n)));
              }));
          })));
        root.appendChild(h('section', { class: 'chart-sec' }, table));
      });
    }

    function renderSentences() {
      var groups = NS.progress.stage(5).levels.map(function (l) { return { title: 'วลี · ' + l.title, items: NS.content.phraseItems(l) }; });
      NS.progress.stage(4).levels.forEach(function (l) { groups.push({ title: 'รูปประโยค · ' + l.title, items: NS.content.grammarItems(l) }); });
      var deck = NS.store.get().deck.map(NS.content.deckItem);
      if (deck.length) groups.push({ title: 'เด็คของฉัน', items: deck });
      groups.forEach(function (g) {
        root.appendChild(h('section', { class: 'chart-sec' },
          h('h2', { class: 'wl-group' }, g.title),
          h('div', { class: 'wl-sents' }, g.items.map(function (it) {
            var rec = NS.writeLog.sentRec(it.id);
            return h('button', { class: 'wl-sent wl' + lvl(rec.n), type: 'button',
              'aria-label': it.char + ' แปลว่า ' + it.th + ' คัดแล้ว ' + rec.n + ' ครั้ง',
              onclick: function () { showDetail('sent', it.id, it.char, [it.label, it.th].filter(Boolean).join(' = '), '#/write/sent/' + encodeURIComponent(it.id)); } },
              h('span', { class: 'wl-sent-text' }, NS.ui.jp(it.char, 'wl-sent-jp'), h('span', { class: 'wl-sent-th' }, ' = ' + it.th)),
              h('span', { class: 'wl-n' }, '×' + rec.n));
          }))));
      });
    }

    render();
  };
})();
