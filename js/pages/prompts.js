/*
 * prompts.js — Prompt Library: คัดลอก prompt ไปวางใน ChatGPT / Claude แล้วคุยด้วยโหมดเสียง
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  function build(p) {
    var lines = [];
    lines.push('คุณคือ' + p.role + ' เรากำลังเล่นบทบาทสมมติผ่านโหมดเสียง เพื่อให้ฉันฝึกพูดภาษาญี่ปุ่น');
    lines.push('สถานการณ์: ' + p.setting);
    lines.push('เกี่ยวกับฉัน: เป็นคนไทย เพิ่งเริ่มเรียนภาษาญี่ปุ่น ฟังได้บ้าง พูดได้เป็นคำและประโยคสั้นๆ');
    lines.push('');
    lines.push('กติกา:');
    NS.PROMPT_RULES.concat(p.extra ? [p.extra] : []).forEach(function (r, i) { lines.push((i + 1) + '. ' + r); });
    lines.push('');
    lines.push('เมื่อจบบทสนทนา ให้สรุปเป็นภาษาไทย:');
    NS.PROMPT_SUMMARY.forEach(function (r) { lines.push('- ' + r); });
    lines.push('');
    lines.push('เริ่มได้เลย: ' + p.opener);
    return lines.join('\n');
  }

  NS.pages.prompts = function (root) {
    root.appendChild(h('a', { href: '#/speak', class: 'back' }, '← ฝึกพูด'));
    root.appendChild(h('h1', { class: 'page-title' }, 'Prompt Library'));
    root.appendChild(h('details', { class: 'card help', open: true },
      h('summary', null, 'วิธีใช้'),
      h('ol', null,
        h('li', null, 'กด "คัดลอก" ที่สถานการณ์ที่อยากฝึก'),
        h('li', null, 'เปิดแอป ChatGPT หรือ Claude → เริ่มแชทใหม่ → วาง prompt แล้วส่งเป็นข้อความ'),
        h('li', null, 'กดปุ่มโหมดเสียง (voice) ในแชทเดียวกัน แล้วเริ่มคุยเป็นภาษาญี่ปุ่น'),
        h('li', null, 'ตอบไม่ได้ให้พูดว่า "ヒント" · อยากจบให้พูดว่า "おわり" แล้ว AI จะสรุปจุดที่พูดผิดเป็นภาษาไทย'),
        h('li', null, 'เอาวลีดีๆ จากบทสนทนาไปเพิ่มใน "เด็คของฉัน" เพื่อทบทวนต่อ')),
      h('p', { class: 'muted small' }, 'หมายเหตุ: แอปนี้ไม่ได้ส่งข้อมูลไปที่ AI เอง แค่เตรียมข้อความให้คัดลอก · AI อาจพูดเร็วหรือยาวเกินกติกาบ้าง ให้พูดเตือนว่า ゆっくりお願いします')));

    NS.PROMPTS.forEach(function (p) {
      var text = build(p);
      root.appendChild(h('section', { class: 'card prompt-card' },
        h('div', { class: 'prompt-head' },
          h('span', { class: 'hub-ico jp', lang: 'ja', 'aria-hidden': 'true' }, p.icon),
          h('span', { class: 'hub-text' }, h('strong', null, p.title), h('small', { class: 'muted' }, 'AI รับบท: ' + p.role)),
          h('button', { class: 'btn btn-primary small', type: 'button', onclick: function () { NS.ui.copyText(text, 'คัดลอก prompt "' + p.title + '" แล้ว'); } }, '📋 คัดลอก')),
        h('details', null, h('summary', { class: 'small' }, 'ดู prompt'), h('pre', { class: 'prompt-text' }, text))));
    });
  };

  NS.promptText = build;
})();
