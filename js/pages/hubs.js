/*
 * hubs.js — หน้ารวมเมนูของแถบ ทบทวน / ฝึกพูด / เพิ่มเติม
 * รายการที่ยังไม่มีลิงก์ (href) จะแสดงป้าย "เฟส N"
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};

  NS.pages.review = function (root) {
    NS.ui.hub(root, 'ทบทวน', 'ทบทวนสิ่งที่เรียนไปแล้ว เพื่อให้จำได้นาน', [
      { icon: '復', title: 'ทบทวนตามรอบ (SRS)', desc: 'ถึงรอบวันนี้ ' + NS.srs.dueCount() + ' รายการ', href: '#/srs' },
      { icon: '誤', title: 'สมุดคำผิด', desc: 'ค้างอยู่ ' + NS.mistakes.count() + ' ข้อ · ถูก 3 ครั้งติดจะหายไป', href: '#/mistakes' },
      { icon: '耳', title: 'ฟังแยกเสียงที่คล้ายกัน', desc: 'おばさん / おばあさん, きて / きって', href: '#/pairs' },
      { icon: '遊', title: 'เกมจับคู่จับเวลา', desc: '60 วินาที จับคู่ให้ได้มากที่สุด', href: '#/game' }
    ]);
  };

  NS.pages.speak = function (root) {
    NS.ui.hub(root, 'ฝึกพูด', 'พูดใส่ไมค์แล้วให้แอปตรวจ หรือคุยกับ AI', [
      { icon: '話', title: 'Speaking Check', desc: 'พูดวลี แล้วดูว่าตรงแค่ไหน + อัดเสียงฟังเทียบ', href: '#/speakcheck' },
      { icon: '句', title: 'Phrasebook', desc: 'วลีเอาตัวรอดแยกตามสถานการณ์', href: '#/phrasebook' },
      { icon: 'AI', title: 'Prompt Library', desc: 'prompt สำเร็จรูปให้ ChatGPT/Claude เล่นบทบาทคุยด้วย', href: '#/prompts' }
    ]);
  };

  NS.pages.more = function (root) {
    NS.ui.hub(root, 'เพิ่มเติม', '', [
      { icon: '札', title: 'เด็คของฉัน', desc: 'เพิ่มวลีเองจากอนิเมะหรือเพื่อนญี่ปุ่น (' + NS.store.get().deck.length + ' วลี)', href: '#/deck' },
      { icon: '試', title: 'Pre/Post Test', desc: 'วัดผลก่อน-หลังเรียน พร้อมกราฟและ CSV', href: '#/test' },
      { icon: '暦', title: 'ปฏิทินการเรียน', desc: 'เป้าหมายรายวัน + heatmap 12 สัปดาห์', href: '#/calendar' },
      { icon: '報', title: 'สรุปรายงาน PGP', desc: 'สรุปผลการเรียนสำหรับใส่รายงาน', href: '#/report' },
      { icon: '⚙', title: 'ตั้งค่า', desc: 'ความเร็วเสียง, เป้า XP, เปิดทุกด่าน, ธีม, ล้างข้อมูล', href: '#/settings' }
    ]);
  };
})();
