/*
 * phrasebook.js — รวมวลีเอาตัวรอดจากขั้น 5 กรองตามหมวด ค้นหาได้ กดฟังได้
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  NS.pages.phrasebook = function (root) {
    var stage5 = NS.progress.stage(5);
    var cats = [{ value: 'all', label: 'ทั้งหมด' }].concat(stage5.levels.map(function (l) { return { value: l.id, label: l.title }; }));
    var all = NS.content.allPhrases();
    var cat = 'all';
    var query = '';

    root.appendChild(h('a', { href: '#/speak', class: 'back' }, '← ฝึกพูด'));
    root.appendChild(h('h1', { class: 'page-title' }, 'Phrasebook'));
    root.appendChild(h('p', { class: 'muted' }, 'วลีเอาตัวรอด ' + all.length + ' วลี แตะที่วลีเพื่อฟังเสียง'));

    var search = h('input', { type: 'search', class: 'input', placeholder: 'ค้นหา (ไทย / ญี่ปุ่น / โรมันจิ)', 'aria-label': 'ค้นหาวลี' });
    search.addEventListener('input', function () { query = search.value.trim().toLowerCase(); draw(); });
    var segWrap = h('div');
    var count = h('p', { class: 'muted small', 'aria-live': 'polite' });
    var list = h('div', { class: 'stack-sm' });
    root.appendChild(h('div', { class: 'pb-tools' }, search, segWrap));
    root.appendChild(count);
    root.appendChild(list);

    function match(it) {
      if (cat !== 'all' && it.level !== cat) return false;
      if (!query) return true;
      return [it.th, it.char, it.jp, it.romaji, it.note].join(' ').toLowerCase().indexOf(query) >= 0;
    }

    function drawSeg() {
      segWrap.innerHTML = '';
      segWrap.appendChild(NS.ui.segmented(cats, cat, function (v) { cat = v; drawSeg(); draw(); }, 'เลือกหมวด'));
    }

    function draw() {
      var shown = all.filter(match);
      count.textContent = 'แสดง ' + shown.length + ' วลี';
      list.innerHTML = '';
      if (!shown.length) list.appendChild(h('p', { class: 'card notice' }, 'ไม่พบวลีที่ค้นหา'));
      shown.forEach(function (it) {
        var lv = stage5.levels.find(function (l) { return l.id === it.level; });
        list.appendChild(NS.cards.phrase(it, h('div', { class: 'phrase-foot' },
          h('span', { class: 'badge' }, lv ? lv.title : ''),
          h('button', { class: 'btn btn-ghost small', type: 'button', disabled: true, title: 'จะเปิดใช้ในเฟส 5' }, '🎤 ฝึกพูดวลีนี้ (เฟส 5)'))));
      });
    }

    drawSeg();
    draw();
  };
})();
