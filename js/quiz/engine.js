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
        p.jp ? NS.ui.jp(p.text, 'q-big' + (p.small ? ' q-sent' : '')) : h('span', { class: 'q-big ' + (p.th ? 'q-th' : 'q-latin') }, p.text),
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
      var choices = h('div', { class: 'choices' + (q.layout === 'list' ? ' list' : '') });
      if (q.type === 'blocks') choices = renderBlocks(q);
      else q.choices.forEach(function (c, ci) {
        var b = h('button', { class: 'choice', type: 'button', onclick: function () { pick(c, b); } },
          h('span', { class: 'choice-num', 'aria-hidden': 'true' }, String(ci + 1)),
          c.jp ? NS.ui.jp(c.label, 'choice-main choice-jp' + (c.label.length > 3 ? ' long' : '')) : h('span', { class: 'choice-main choice-latin' }, c.label),
          c.sub ? h('span', { class: 'choice-sub' }, c.sub) : null);
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
      NS.quiz.current = q;
    }

    /*
     * โจทย์ต่อประโยคจากบล็อกคำ
     * q.tiles = บล็อกทั้งหมด (สลับลำดับแล้ว รวมบล็อกหลอก), q.answerText = คำตอบที่ถูก, q.accept = ลำดับอื่นที่ถูก
     */
    function renderBlocks(q) {
      var placed = [];
      var tray = h('div', { class: 'tray', 'aria-label': 'ประโยคที่เรียงแล้ว (แตะบล็อกเพื่อเอาออก)' });
      var pool = h('div', { class: 'pool', 'aria-label': 'บล็อกคำ (แตะเพื่อเพิ่ม)' });
      var hint = h('span', { class: 'tray-hint muted small' }, 'แตะบล็อกด้านล่างเพื่อเรียงประโยค');
      var tiles = q.tiles.map(function (t, ti) {
        return h('button', { class: 'tile', type: 'button', lang: 'ja', onclick: function () { toggle(ti); } }, t);
      });
      var check = h('button', { class: 'btn btn-primary btn-block', type: 'button', disabled: true, onclick: function () {
        var ans = placed.map(function (ti) { return q.tiles[ti]; }).join('');
        var ok = [q.answerText].concat(q.accept || []).some(function (a) { return norm(a) === norm(ans); });
        tiles.forEach(function (b) { b.disabled = true; });
        tray.classList.add(ok ? 'ok' : 'bad');
        check.hidden = true; clear.hidden = true;
        judge(ok, ok ? null : 'คุณเรียงว่า: ' + (ans || '(ว่าง)'));
      } }, 'ตรวจคำตอบ');
      var clear = h('button', { class: 'btn btn-ghost small', type: 'button', onclick: function () { placed = []; draw(); } }, 'ล้าง');
      function toggle(ti) {
        if (answered) return;
        var pos = placed.indexOf(ti);
        if (pos >= 0) placed.splice(pos, 1); else placed.push(ti);
        draw();
      }
      function draw() {
        tray.innerHTML = ''; pool.innerHTML = '';
        if (!placed.length) tray.appendChild(hint);
        placed.forEach(function (ti) { tray.appendChild(tiles[ti]); });
        tiles.forEach(function (b, ti) { if (placed.indexOf(ti) < 0) pool.appendChild(b); });
        check.disabled = !placed.length;
      }
      draw();
      return h('div', { class: 'blocks' }, tray, pool, h('div', { class: 'blocks-actions' }, clear, check));
    }

    function pick(c) {
      if (answered) return;
      var q = current.q;
      var ok = c.id === q.answerId;
      current.btns.forEach(function (b) {
        b.disabled = true;
        if (opts.testMode) { b.classList.add(b._choice === c ? 'picked' : 'dim'); return; }
        if (b._choice.id === q.answerId) b.classList.add('correct');
        else if (b._choice === c) b.classList.add('wrong');
        else b.classList.add('dim');
      });
      judge(ok);
    }

    /* ตัดสินผล แล้วแสดงเฉลย */
    function judge(ok, extra) {
      if (answered) return;
      answered = true;
      var q = current.q;
      if (ok) correct++; else wrong.push(q);
      if (q.item && q.item.id && NS.mistakes) NS.mistakes.record(q.item.id, ok);
      if (opts.onAnswer) opts.onAnswer(q, ok);

      var last = i === total - 1;
      var next = h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: function () {
        if (last) finish(); else { i++; show(); }
      } }, last ? 'ดูผลลัพธ์' : 'ถัดไป →');
      current.next = next;

      var fb = current.fb;
      if (opts.testMode) {
        // โหมดสอบ: ไม่บอกเฉลยระหว่างสอบ
        fb.className = 'feedback neutral';
        fb.hidden = false;
        fb.appendChild(h('div', { class: 'fb-head' }, '📝 บันทึกคำตอบแล้ว'));
        fb.appendChild(next);
        next.focus({ preventScroll: true });
        return;
      }
      fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
      fb.hidden = false;
      fb.appendChild(h('div', { class: 'fb-head' }, ok ? '✅ ถูกต้อง! +10 XP' : '❌ ยังไม่ถูก'));
      if (extra) fb.appendChild(h('div', { class: 'fb-detail' }, NS.ui.jp(extra)));
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

  /* ตัดช่องว่างและเครื่องหมายวรรคตอนก่อนเทียบคำตอบ */
  function norm(s) { return String(s || '').replace(/[\s、。，,.！!？?・「」]/g, ''); }

  /* การ์ดสรุปคะแนน (ใช้ร่วมกันหลายหน้า) */
  function resultCard(r, o) {
    o = o || {};
    var passed = r.pct >= 80;
    var stars = o.stars != null ? o.stars : NS.progress.starsFor(r.pct);
    return h('section', { class: 'card result ' + (passed ? 'ok' : 'bad') },
      h('div', { class: 'result-score' }, r.correct + '/' + r.total),
      h('div', { class: 'result-pct' }, r.pct + '%'),
      o.noStars ? null : h('div', { class: 'stars big', 'aria-label': stars + ' ดาว' }, [1, 2, 3].map(function (i) { return h('span', { class: i <= stars ? 'on' : '' }, '★'); })),
      h('p', { class: 'result-msg' }, passed
        ? (r.pct === 100 ? 'สมบูรณ์แบบ! 🎉' : 'ผ่านแล้ว! เก่งมาก 👏')
        : (o.noStars ? 'ฝึกต่ออีกนิด สู้ๆ 💪' : 'ยังไม่ผ่าน ต้องได้ 80% ขึ้นไป ลองอีกครั้งนะ 💪')),
      o.extra || null,
      h('p', { class: 'muted small' }, 'ได้ ' + (r.correct * 10) + ' XP' + (o.noStars ? '' : ' · ดาว: 80% = 1 ดวง, 90% = 2 ดวง, 100% = 3 ดวง')));
  }

  /* รายการข้อที่ตอบผิด */
  function wrongList(wrong) {
    return h('section', { class: 'card' },
      h('h3', null, 'ข้อที่ตอบผิด (' + wrong.length + ')'),
      h('ul', { class: 'wrong-list' }, wrong.map(function (q) {
        var it = q.item;
        return h('li', null, NS.ui.jp(it.char, 'wrong-char'),
          h('span', null, ' = ' + it.label + (it.th ? ' · ' + it.th : '')),
          NS.ui.speakBtn(it.sound, { label: '🔊', cls: 'btn-ghost small', aria: 'ฟัง ' + it.char }));
      })));
  }

  NS.quiz = { run: run, resultCard: resultCard, wrongList: wrongList, norm: norm, current: null };
})();
