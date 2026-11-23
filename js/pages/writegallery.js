/*
 * writegallery.js — ลายมือทั้งหมด: ดูภาพการคัดทุกครั้งในหน้าเดียว เลื่อนดูได้ (ใหม่สุดก่อน)
 * กรอง ทั้งหมด / ตัวอักษร / ประโยค และค้นหาตัวอักษรหรือคำได้ · โหลดเพิ่มทีละชุดเมื่อเลื่อนลง
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var PAGE = 60;

  /* เติมข้อมูลให้แถวเก่าที่ย้ายมาจากที่เก็บเดิม (ไม่มีข้อความ) */
  function labelOf(r) {
    if (r.label) return r.label;
    if (r.kind === 'sent') { var it = NS.content.itemById(r.key); return it ? it.char : r.key; }
    return r.key;
  }
  function thOf(r) {
    if (r.th) return r.th;
    if (r.kind === 'sent') { var it = NS.content.itemById(r.key); return it ? it.th : ''; }
    return '';
  }
  function hrefOf(r) { return '#/write/' + (r.kind === 'sent' ? 'sent/' : 'char/') + encodeURIComponent(r.key); }

  /* ใส่ลำดับ "ครั้งที่ N" ของแต่ละตัว/ประโยค (นับจากเก่าไปใหม่) */
  function numberize(list) {
    var seen = {};
    for (var i = list.length - 1; i >= 0; i--) {
      var k = list[i].kind + '|' + list[i].key;
      seen[k] = (seen[k] || 0) + 1;
      list[i]._n = seen[k];
    }
    return list;
  }

  function sampleCard(r, onOpen) {
    return h('button', { class: 'wg-card' + (r.kind === 'sent' ? ' sent' : ''), type: 'button', onclick: function () { onOpen(r); },
      'aria-label': labelOf(r) + ' ครั้งที่ ' + r._n + ' ' + (r.score != null ? r.score + ' คะแนน' : '') },
      h('img', { src: r.img, alt: '', loading: 'lazy' }),
      h('span', { class: 'wg-meta' },
        NS.ui.jp(labelOf(r), 'wg-label'),
        h('span', { class: 'wg-sub' }, 'ครั้งที่ ' + r._n + (r.score != null ? ' · ' + r.score + ' คะแนน' : ''))));
  }

  function openSample(r, after) {
    NS.ui.modal({
      title: 'ลายมือ',
      body: h('div', { class: 'wl-detail' },
        h('img', { class: 'wg-big', src: r.img, alt: 'ลายมือ ' + labelOf(r) }),
        NS.ui.jp(labelOf(r), r.kind === 'sent' ? 'wl-title-sent' : 'wl-title-small'),
        thOf(r) ? h('div', { class: 'muted' }, '= ' + thOf(r)) : null,
        h('div', { class: 'muted small' }, 'ครั้งที่ ' + r._n + (r.score != null ? ' · ความใกล้เคียง ' + r.score + ' คะแนน' : ''))),
      actions: [
        { label: '🗑 ลบภาพนี้', cls: 'btn-ghost', onClick: function () {
          NS.ui.modal({ title: 'ลบภาพลายมือนี้?', body: 'ลบเฉพาะภาพ จำนวนครั้งที่คัดในตารางยังเหมือนเดิม', actions: [
            { label: 'ยกเลิก', cls: 'btn-soft' },
            { label: 'ลบ', cls: 'btn-danger', onClick: function () { NS.writeLog.removeSample(r.id).then(after); } }] });
        } },
        { label: 'ปิด', cls: 'btn-soft' },
        { label: '✍️ คัดอีก', cls: 'btn-primary', onClick: function () { NS.router.go(hrefOf(r)); } }
      ]
    });
  }

  NS.pages.writegallery = function (root, args) {
    var filter = 'all', query = args[0] ? decodeURIComponent(args[0]) : '', all = [], shown = 0;

    root.appendChild(h('div', { class: 'write-nav' },
      h('a', { href: '#/writelog', class: 'back' }, '← บันทึกการคัด'),
      h('a', { href: '#/write', class: 'btn btn-primary small' }, '✍️ ไปคัด')));
    root.appendChild(h('h1', { class: 'page-title' }, 'ลายมือทั้งหมด'));
    var summary = h('p', { class: 'muted small', 'aria-live': 'polite' }, 'กำลังโหลด…');
    var search = h('input', { type: 'search', class: 'input', placeholder: 'ค้นหาตัวอักษรหรือคำ เช่น あ หรือ ください', value: query, 'aria-label': 'ค้นหาลายมือ' });
    search.addEventListener('input', function () { query = search.value.trim(); draw(); });
    var segWrap = h('div');
    var grid = h('div', { class: 'wg-grid' });
    var more = h('div', { class: 'wg-more' });
    root.appendChild(h('div', { class: 'pb-tools' }, search, segWrap));
    root.appendChild(summary);
    root.appendChild(grid);
    root.appendChild(more);

    function drawSeg() {
      segWrap.innerHTML = '';
      segWrap.appendChild(NS.ui.segmented([{ value: 'all', label: 'ทั้งหมด' }, { value: 'char', label: 'ตัวอักษร' }, { value: 'sent', label: 'ประโยค' }], filter,
        function (v) { filter = v; drawSeg(); draw(); }, 'กรองลายมือ'));
    }

    function list() {
      return all.filter(function (r) {
        if (filter !== 'all' && r.kind !== filter) return false;
        if (!query) return true;
        return (labelOf(r) + ' ' + thOf(r)).indexOf(query) >= 0;
      });
    }

    function draw() {
      var L = list();
      grid.innerHTML = ''; shown = 0;
      summary.textContent = all.length
        ? 'แสดง ' + L.length + ' จาก ' + all.length + ' ภาพ · ใหม่สุดก่อน · แตะเพื่อดูภาพใหญ่'
        : '';
      if (!all.length) grid.appendChild(h('p', { class: 'card notice' }, 'ยังไม่มีภาพลายมือ ลองไปคัดสักตัว แล้วกดตรวจ ภาพจะมาอยู่ที่นี่'));
      else if (!L.length) grid.appendChild(h('p', { class: 'card notice' }, 'ไม่พบภาพที่ตรงกับการค้นหา'));
      showMore(L);
    }

    function showMore(L) {
      L = L || list();
      L.slice(shown, shown + PAGE).forEach(function (r) { grid.appendChild(sampleCard(r, function (x) { openSample(x, reload); })); });
      shown = Math.min(L.length, shown + PAGE);
      more.innerHTML = '';
      if (shown < L.length) more.appendChild(h('button', { class: 'btn btn-soft btn-block', type: 'button', onclick: function () { showMore(); } }, 'แสดงเพิ่ม (' + (L.length - shown) + ' ภาพ)'));
    }

    // โหลดเพิ่มเองเมื่อเลื่อนลงใกล้ท้าย
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting && more.firstChild) showMore(); }, { rootMargin: '400px' });
      io.observe(more);
      NS.router.onLeave(function () { io.disconnect(); });
    }

    function reload() {
      NS.writeLog.allSamples().then(function (rows) { all = numberize(rows); draw(); });
    }

    drawSeg();
    reload();
  };

  NS.writeGallery = { sampleCard: sampleCard, numberize: numberize, openSample: openSample };
})();
