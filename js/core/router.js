/*
 * router.js — เปลี่ยนหน้าโดยดูจากส่วนท้าย URL (#/home, #/chart, #/level/1-1)
 * ใช้วิธีนี้เพราะเปิดจากไฟล์ (file://) ได้ และขึ้น GitHub Pages ได้โดยไม่ต้องตั้งค่าเซิร์ฟเวอร์
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  NS.pages = NS.pages || {};

  // หน้าไหนอยู่ในแถบเมนูอันไหน
  var TAB_OF = { home: 'learn', level: 'learn', review: 'review', pairs: 'review', chart: 'chart', speak: 'speak', more: 'more', settings: 'more', calendar: 'more', phrasebook: 'speak', srs: 'review', mistakes: 'review', deck: 'more', speakcheck: 'speak', test: 'more', game: 'review', write: 'chart', exam: 'learn', prompts: 'speak', report: 'more' };
  var TITLES = { home: 'เรียน', level: 'ด่าน', review: 'ทบทวน', pairs: 'ฟังแยกเสียง', chart: 'ตารางตัวอักษร', speak: 'ฝึกพูด', more: 'เพิ่มเติม', settings: 'ตั้งค่า', calendar: 'ปฏิทินการเรียน', phrasebook: 'Phrasebook', srs: 'ทบทวนตามรอบ', mistakes: 'สมุดคำผิด', deck: 'เด็คของฉัน', speakcheck: 'Speaking Check', test: 'Pre/Post Test', game: 'เกมจับคู่', write: 'ฝึกเขียน', exam: 'สอบข้ามขั้น', prompts: 'Prompt Library', report: 'สรุปรายงาน PGP' };
  var leaveFns = [];

  function render() {
    leaveFns.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
    leaveFns = [];
    NS.speech.stop();
    if (NS.recorder) NS.recorder.stop();

    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    var name = parts[0] && NS.pages[parts[0]] ? parts[0] : 'home';
    var app = document.getElementById('app');
    app.innerHTML = '';
    app.className = 'page-' + name;
    try {
      NS.pages[name](app, parts.slice(1));
    } catch (e) {
      app.appendChild(NS.ui.h('div', { class: 'card notice bad' }, 'เกิดข้อผิดพลาดในหน้านี้: ' + e.message));
      if (window.console) console.error(e);
    }

    var tab = TAB_OF[name];
    document.querySelectorAll('.tabbar a').forEach(function (a) {
      var on = a.getAttribute('data-tab') === tab;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.title = (TITLES[name] || '') + ' · Nihongo Survival';
    window.scrollTo(0, 0);
  }

  NS.router = {
    start: function () {
      window.addEventListener('hashchange', render);
      render();
    },
    /* ให้หน้าลงทะเบียนสิ่งที่ต้องเก็บกวาดตอนออกจากหน้า */
    onLeave: function (fn) { leaveFns.push(fn); },
    go: function (hash) {
      if (location.hash === hash) render(); else location.hash = hash;
    },
    refresh: render
  };
})();
