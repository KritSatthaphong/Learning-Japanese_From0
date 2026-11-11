/*
 * calendar.js — เป้าหมายรายวัน + ปฏิทิน heatmap 12 สัปดาห์ (สีเข้มตาม XP ของวันนั้น)
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var DAYS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
  var WEEKS = 12;

  function thaiDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + (d.getFullYear() + 543); }

  /* ระดับสี 0–4 เทียบกับเป้าหมาย */
  function levelOf(xp, goal) {
    if (!xp) return 0;
    if (xp < goal / 2) return 1;
    if (xp < goal) return 2;
    if (xp < goal * 2) return 3;
    return 4;
  }

  function heatmap(onPick) {
    var S = NS.stats;
    var goal = S.goal();
    var today = new Date();
    var dow = (today.getDay() + 6) % 7;           // จันทร์ = 0
    var start = S.addDays(today, -dow - (WEEKS - 1) * 7);

    var grid = h('div', { class: 'heat', role: 'grid', 'aria-label': 'ปฏิทินการเรียน 12 สัปดาห์' });
    // แถวชื่อเดือน
    grid.appendChild(h('span', { class: 'heat-corner' }));
    for (var w = 0; w < WEEKS; w++) {
      var first = S.addDays(start, w * 7);
      var prevWeek = S.addDays(first, -7);
      var showMonth = w === 0 || first.getMonth() !== prevWeek.getMonth();
      grid.appendChild(h('span', { class: 'heat-month' }, showMonth ? MONTHS[first.getMonth()] : ''));
    }
    for (var r = 0; r < 7; r++) {
      grid.appendChild(h('span', { class: 'heat-day' }, r % 2 === 0 ? DAYS[r] : ''));
      for (var c = 0; c < WEEKS; c++) {
        var d = S.addDays(start, c * 7 + r);
        if (d > today) { grid.appendChild(h('span', { class: 'heat-cell future', 'aria-hidden': 'true' })); continue; }
        var k = S.key(d);
        var xp = S.xpOn(k);
        var label = thaiDate(d) + ': ' + xp + ' XP';
        (function (label) {
          grid.appendChild(h('button', {
            class: 'heat-cell l' + levelOf(xp, goal) + (k === S.key(today) ? ' today' : ''),
            type: 'button', title: label, 'aria-label': label,
            onclick: function () { onPick(label); }
          }));
        })(label);
      }
    }
    return grid;
  }

  NS.pages.calendar = function (root) {
    var S = NS.stats;
    function render() {
      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/more', class: 'back' }, '← เพิ่มเติม'));
      root.appendChild(h('h1', { class: 'page-title' }, 'ปฏิทินการเรียน'));

      root.appendChild(h('section', { class: 'card stack-sm' },
        S.goalBar(),
        h('div', { class: 'field' }, h('span', null, 'เป้า XP ต่อวัน (ตอบถูก 1 ข้อ = 10 XP)'),
          S.goalPicker(render))));

      root.appendChild(h('div', { class: 'tiles tiles-4' },
        h('div', { class: 'tile card' }, h('small', { class: 'muted' }, 'streak ตอนนี้'), h('strong', null, '🔥 ' + S.streak() + ' วัน')),
        h('div', { class: 'tile card' }, h('small', { class: 'muted' }, 'streak สูงสุด'), h('strong', null, S.bestStreak() + ' วัน')),
        h('div', { class: 'tile card' }, h('small', { class: 'muted' }, 'วันที่เรียนทั้งหมด'), h('strong', null, S.daysStudied() + ' วัน')),
        h('div', { class: 'tile card' }, h('small', { class: 'muted' }, 'XP รวม'), h('strong', null, S.total()))));

      var info = h('p', { class: 'muted small heat-info', 'aria-live': 'polite' }, 'แตะที่ช่องเพื่อดู XP ของวันนั้น');
      root.appendChild(h('section', { class: 'card' },
        h('h2', { class: 'section-title flush' }, '12 สัปดาห์ล่าสุด'),
        heatmap(function (t) { info.textContent = t; }),
        info,
        h('div', { class: 'heat-legend', 'aria-hidden': 'true' },
          h('span', { class: 'muted small' }, 'น้อย'),
          [0, 1, 2, 3, 4].map(function (l) { return h('span', { class: 'heat-cell l' + l }); }),
          h('span', { class: 'muted small' }, 'มาก')),
        h('p', { class: 'muted small' }, 'สีเข้มขึ้นตาม XP: ครึ่งเป้า / เกือบถึงเป้า / ถึงเป้า / เกิน 2 เท่า')));
    }
    render();
  };
})();
