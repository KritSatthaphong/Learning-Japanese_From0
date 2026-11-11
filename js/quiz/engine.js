/*
 * engine.js — ตัวเล่นแบบฝึกหัดแบบเลือกตอบ (ใช้ร่วมกันทุกด่าน)
 *
 * รูปแบบคำถาม:
 * {
 *   label:  'ตัวนี้อ่านว่าอะไร?',
 *   prompt: { text: 'か', jp: true }   หรือ   { audio: 'か' }
 *   choices: [{ id, label, jp }],
 *   answerId: 'h-ka',
 *   reveal: { title: 'か = ka', detail: 'ทริคจำ...', speak: 'か' },
 *   item: (รายการต้นทาง ใช้กับสมุดคำผิดในเฟส 4)
 * }
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  function run(root, opts) {
    var qs = opts.questions;
    var total = qs.length;
    var i = 0, correct = 0, answered = false;
    var wrong = [];
    var current = null;

    function onKey(e) {
      if (!document.body.contains(root)) { document.removeEventListener('keydown', onKey); return; }
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (!answered && /^[1-4]$/.test(e.key) && current) {
        var b = current.btns[Number(e.key) - 1];
        if (b) b.click();
      } else if (answered && e.key === 'Enter' && current && current.next) {
        e.preventDefault();
        current.next.click();
      }
    }
    document.addEventListener('keydown', onKey);
    NS.router.onLeave(function () { document.removeEventListener('keydown', onKey); });

    function renderPrompt(p) {
      if (p.audio) {
        return h('div', { class: 'q-prompt q-audio' },
          h('button', { class: 'big-speaker', type: 'button', 'aria-label': 'ฟังอีกครั้ง',
            onclick: function () { NS.speech.speak(p.audio); } }, '🔊'),
          h('button', { class: 'btn btn-ghost small', type: 'button',
            onclick: function () { NS.speech.speak(p.audio, { rate: 0.5 }); } }, '🐢 ฟังช้า'));
      }
      return h('div', { class: 'q-prompt' },
        p.jp ? NS.ui.jp(p.text, 'q-big') : h('span', { class: 'q-big q-latin' }, p.text),
        p.sub ? h('div', { class: 'muted' }, p.sub) : null);
    }

    function show() {
      answered = false;
      var q = qs[i];
      root.innerHTML = '';

      var bar = h('div', { class: 'bar', style: 'width:' + Math.round(i / total * 100) + '%' });
      var top = h('div', { class: 'quiz-top' },
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'ออกจากแบบฝึกหัด', onclick: function () { if (opts.onExit) opts.onExit(); } }, '✕'),
        h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(i) }, bar),
        h('span', { class: 'muted small' }, (i + 1) + '/' + total));

      var btns = [];
      var choices = h('div', { class: 'choices' });
      q.choices.forEach(function (c, ci) {
        var b = h('button', { class: 'choice', type: 'button', onclick: function () { pick(c, b); } },
          h('span', { class: 'choice-num', 'aria-hidden': 'true' }, String(ci + 1)),
          c.jp ? NS.ui.jp(c.label, 'choice-jp') : h('span', { class: 'choice-latin' }, c.label));
        b._choice = c;
        btns.push(b);
        choices.appendChild(b);
      });

      var fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
      current = { q: q, btns: btns, fb: fb, next: null };

      root.appendChild(h('div', { class: 'quiz' }, top,
        h('div', { class: 'q-label' }, q.label),
        renderPrompt(q.prompt), choices, fb));

      if (q.prompt.audio) setTimeout(function () { NS.speech.speak(q.prompt.audio); }, 200);
    }

    function pick(c) {
      if (answered) return;
      answered = true;
      var q = current.q;
      var ok = c.id === q.answerId;
      if (ok) correct++; else wrong.push(q);
      current.btns.forEach(function (b) {
        b.disabled = true;
        if (b._choice.id === q.answerId) b.classList.add('correct');
        else if (b._choice === c) b.classList.add('wrong');
        else b.classList.add('dim');
      });
      if (opts.onAnswer) opts.onAnswer(q, ok);

      var last = i === total - 1;
      var next = h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: function () {
        if (last) finish(); else { i++; show(); }
      } }, last ? 'ดูผลลัพธ์' : 'ถัดไป →');
      current.next = next;

      var fb = current.fb;
      fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
      fb.hidden = false;
      fb.appendChild(h('div', { class: 'fb-head' }, ok ? '✅ ถูกต้อง!' : '❌ ยังไม่ถูก'));
      if (q.reveal) {
        fb.appendChild(h('div', { class: 'fb-answer' },
          h('span', null, 'เฉลย: '), NS.ui.jp(q.reveal.title, 'fb-title'),
          q.reveal.speak ? NS.ui.speakBtn(q.reveal.speak, { label: '🔊', aria: 'ฟังเฉลย', cls: 'btn-ghost small' }) : null));
        if (q.reveal.detail) fb.appendChild(h('div', { class: 'fb-detail' }, q.reveal.detail));
      }
      fb.appendChild(next);
      if (q.reveal && q.reveal.speak && !q.prompt.audio) NS.speech.speak(q.reveal.speak);
      next.focus({ preventScroll: true });
      fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function finish() {
      document.removeEventListener('keydown', onKey);
      var pct = Math.round(correct / total * 100);
      if (opts.onFinish) opts.onFinish({ correct: correct, total: total, pct: pct, wrong: wrong });
    }

    show();
  }

  NS.quiz = { run: run };
})();
