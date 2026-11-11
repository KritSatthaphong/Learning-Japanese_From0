/*
 * game.js — เกมจับคู่จับเวลา 60 วินาที
 * จับคู่ตัวอักษรกับโรมันจิ (หรือคำศัพท์กับความหมาย) ครั้งละ 6 คู่ จับครบแล้วสุ่มชุดใหม่
 * ใช้เฉพาะสิ่งที่เรียนแล้ว · จับถูก +10 XP · จับผิดเข้าสมุดคำผิด · เก็บคะแนนสูงสุด
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var SECONDS = 60, PER_SET = 6;
  var MODES = [
    { value: 'hira', label: 'ฮิรางานะ' },
    { value: 'kata', label: 'คาตากานะ' },
    { value: 'vocab', label: 'คำศัพท์' }
  ];

  function pool(mode) {
    var s = NS.store.get();
    if (mode === 'vocab') {
      return (NS.VOCAB || []).map(NS.content.vocabItem).filter(function (it) {
        return s.learned[it.id] || NS.progress.isPassed(it.level);
      }).map(function (it) { return { id: it.id, left: it.char, right: it.th, sound: it.sound }; });
    }
    return NS.KANA.filter(function (k) { return !k.noQuiz && NS.progress.isKanaLearned(k, mode); })
      .map(function (k) { var it = NS.content.kanaItem(k, mode); return { id: it.id, left: it.char, right: it.label, sound: it.sound }; });
  }

  NS.pages.game = function (root) {
    var mode = 'hira', timer = null;
    NS.router.onLeave(function () { clearInterval(timer); });

    function home() {
      clearInterval(timer);
      var items = pool(mode), best = NS.store.get().gameBest[mode] || 0;
      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/review', class: 'back' }, '← ทบทวน'));
      root.appendChild(h('h1', { class: 'page-title' }, 'เกมจับคู่จับเวลา'));
      root.appendChild(h('p', { class: 'muted' }, SECONDS + ' วินาที จับคู่ให้ได้มากที่สุด แตะการ์ดซ้าย แล้วแตะคู่ของมันทางขวา ใช้เฉพาะสิ่งที่เรียนแล้ว'));
      root.appendChild(NS.ui.segmented(MODES, mode, function (v) { mode = v; home(); }, 'เลือกโหมด'));
      root.appendChild(h('section', { class: 'card game-start' },
        h('div', null, h('small', { class: 'muted' }, 'คะแนนสูงสุด'), h('strong', { class: 'game-best' }, String(best))),
        h('small', { class: 'muted' }, 'มีให้เล่น ' + items.length + ' รายการ'),
        items.length >= PER_SET
          ? h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: play }, '▶ เริ่มเกม')
          : h('p', { class: 'notice' }, 'ต้องเรียนผ่านก่อนอย่างน้อย ' + PER_SET + ' รายการ (เรียนด่านแรกของ' + MODES.find(function (m) { return m.value === mode; }).label + 'ในแถบ "เรียน")')));
    }

    function play() {
      var items = pool(mode), score = 0, left = SECONDS * 10, sel = null, matched = 0, lastSet = '';
      root.innerHTML = '';
      var bar = h('div', { class: 'bar' });
      var scoreEl = h('strong', null, '0');
      var board = h('div', { class: 'game-board' });
      root.appendChild(h('div', { class: 'game-top' },
        h('div', { class: 'progress game-time' }, bar),
        h('span', { class: 'game-score' }, 'คะแนน ', scoreEl)));
      root.appendChild(board);

      function newSet() {
        var set, key, tries = 0;
        do {
          // เลือก 6 รายการที่คำตอบฝั่งขวาไม่ซ้ำกัน
          var used = {};
          set = NS.ui.shuffle(items).filter(function (x) { if (used[x.right]) return false; used[x.right] = true; return true; }).slice(0, PER_SET);
          key = set.map(function (x) { return x.id; }).sort().join();
        } while (key === lastSet && ++tries < 5);
        lastSet = key; matched = 0; sel = null;
        board.innerHTML = '';
        var L = h('div', { class: 'game-col' }), R = h('div', { class: 'game-col' });
        NS.ui.shuffle(set).forEach(function (x) { L.appendChild(card(x, 'L')); });
        NS.ui.shuffle(set).forEach(function (x) { R.appendChild(card(x, 'R')); });
        board.appendChild(L); board.appendChild(R);
      }

      function card(x, side) {
        var b = h('button', { class: 'gcard ' + (side === 'L' ? 'gleft' : 'gright') + (mode === 'vocab' && side === 'R' ? ' gth' : ''), type: 'button', lang: side === 'L' ? 'ja' : null },
          side === 'L' ? x.left : x.right);
        b._x = x; b._side = side;
        b.addEventListener('click', function () { tap(b); });
        return b;
      }

      function tap(b) {
        if (b.disabled) return;
        if (b._side === 'L') NS.speech.speak(b._x.sound);
        if (!sel || sel._side === b._side) {
          if (sel) sel.classList.remove('sel');
          sel = b; b.classList.add('sel');
          return;
        }
        var a = sel; sel = null; a.classList.remove('sel');
        var leftCard = a._side === 'L' ? a : b;
        if (a._x.id === b._x.id) {
          [a, b].forEach(function (c) { c.classList.add('ok'); c.disabled = true; });
          score++; matched++; scoreEl.textContent = String(score);
          NS.store.recordAnswer('game', true);
          NS.mistakes.record(leftCard._x.id, true);
          if (matched === PER_SET) setTimeout(newSet, 300);
        } else {
          [a, b].forEach(function (c) { c.classList.add('bad'); setTimeout(function () { c.classList.remove('bad'); }, 450); });
          NS.store.recordAnswer('game', false);
          NS.mistakes.record(leftCard._x.id, false);
        }
      }

      newSet();
      timer = setInterval(function () {
        left--;
        bar.style.width = (left / (SECONDS * 10) * 100) + '%';
        if (left <= 100) bar.classList.add('low');
        if (left <= 0) { clearInterval(timer); end(score); }
      }, 100);
    }

    function end(score) {
      var s = NS.store.get(), best = s.gameBest[mode] || 0, record = score > best;
      if (record) { s.gameBest[mode] = score; NS.store.save(); }
      root.innerHTML = '';
      root.appendChild(h('h1', { class: 'page-title' }, 'หมดเวลา!'));
      root.appendChild(h('section', { class: 'card result ok' },
        h('div', { class: 'result-score' }, String(score)),
        h('div', { class: 'result-pct' }, 'คู่'),
        h('p', { class: 'result-msg' }, record ? '🏆 สถิติใหม่!' : 'คะแนนสูงสุด ' + best),
        h('p', { class: 'muted small' }, 'ได้ ' + score * 10 + ' XP · คู่ที่จับผิดถูกเก็บในสมุดคำผิด')));
      root.appendChild(h('div', { class: 'stack' },
        h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: play }, '↻ เล่นอีกครั้ง'),
        h('button', { class: 'btn btn-soft btn-block', type: 'button', onclick: home }, 'เปลี่ยนโหมด')));
    }

    home();
  };
})();
