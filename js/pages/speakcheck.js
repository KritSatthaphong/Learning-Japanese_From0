/*
 * speakcheck.js — ฝึกพูด (Speaking Check)
 * เลือกวลี → ฟังต้นแบบ → กดพูด → ระบบถอดเสียง (ja-JP) แล้วเทียบกับวลี → ตรง / ใกล้เคียง / ไม่ตรง
 * เก็บประวัติ และมีแผงอัดเสียงฟังเทียบ
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  /* แผงพูดให้ตรวจ (ใช้ซ้ำใน Pre/Post Test ด้วย) — onResult(r) ได้ { verdict, pct, heard, form, alternatives } */
  NS.speakBox = function (item, onResult) {
    var out = h('div', { class: 'speak-out', 'aria-live': 'polite' });
    var btn = h('button', { class: 'mic-btn', type: 'button', onclick: go }, h('span', { 'aria-hidden': 'true' }, '🎤'), h('span', null, 'แตะแล้วพูด'));
    var listening = false;

    if (!NS.speech.recogSupported) {
      btn.disabled = true;
      out.appendChild(h('p', { class: 'notice warn' }, '⚠️ ' + NS.speech.errorText('unsupported')));
    }

    function go() {
      if (listening) { NS.speech.stopListening(); return; }
      listening = true;
      btn.classList.add('listening');
      btn.lastChild.textContent = 'กำลังฟัง… (แตะเพื่อหยุด)';
      out.innerHTML = '';
      NS.speech.listen().then(function (res) {
        listening = false;
        btn.classList.remove('listening');
        btn.lastChild.textContent = 'แตะแล้วพูดอีกครั้ง';
        if (!res.ok) {
          out.appendChild(h('p', { class: 'notice warn' }, '⚠️ ' + res.message));
          return;
        }
        var r = NS.normalize.judge(res.alternatives, item);
        r.alternatives = res.alternatives;
        out.appendChild(h('div', { class: 'verdict ' + r.verdict },
          h('div', { class: 'verdict-head' }, h('strong', null, NS.normalize.LABEL[r.verdict]), h('span', { class: 'verdict-pct' }, r.pct + '%')),
          h('div', null, 'ระบบได้ยินว่า: ', NS.ui.jp(r.heard || '(ไม่มี)', 'heard')),
          r.form ? h('div', { class: 'muted small' }, 'เทียบกับ: ', NS.ui.jp(r.form)) : null,
          res.alternatives.length > 1 ? h('div', { class: 'muted small' }, 'ตัวเลือกอื่นที่ระบบได้ยิน: ', NS.ui.jp(res.alternatives.slice(1).join(' / '))) : null,
          h('div', { class: 'muted small' }, 'ตรง ≥ 80% · ใกล้เคียง ≥ 50%')));
        if (onResult) onResult(r);
      });
    }
    return h('div', { class: 'speak-box' }, btn, out);
  };

  function speakables() {
    var groups = NS.progress.stage(5).levels.map(function (l) {
      return { label: l.title, items: NS.content.phraseItems(l) };
    });
    var deck = NS.store.get().deck.map(NS.content.deckItem);
    if (deck.length) groups.push({ label: 'เด็คของฉัน', items: deck });
    return groups;
  }

  NS.pages.speakcheck = function (root, args) {
    var groups = speakables();
    var all = [].concat.apply([], groups.map(function (g) { return g.items; }));
    var id = args[0] ? decodeURIComponent(args[0]) : all[0].id;
    var item = all.find(function (x) { return x.id === id; }) || NS.content.itemById(id) || all[0];

    root.appendChild(h('a', { href: '#/speak', class: 'back' }, '← ฝึกพูด'));
    root.appendChild(h('h1', { class: 'page-title' }, 'Speaking Check'));
    if (NS.speech.isFile) {
      root.appendChild(h('p', { class: 'notice warn' }, '⚠️ เปิดจากไฟล์ (file://) อยู่ — Chrome มักไม่ให้ใช้ไมค์ ถ้าพูดแล้วขึ้นว่าไม่ได้รับอนุญาต ให้เปิดผ่าน localhost หรือ GitHub Pages'));
    }

    var sel = h('select', { class: 'input', 'aria-label': 'เลือกวลี' }, groups.map(function (g) {
      return h('optgroup', { label: g.label }, g.items.map(function (x) {
        return h('option', { value: x.id, selected: x.id === item.id }, x.char + ' — ' + x.th);
      }));
    }));
    sel.addEventListener('change', function () { NS.router.go('#/speakcheck/' + encodeURIComponent(sel.value)); });
    var idx = all.indexOf(item);
    root.appendChild(h('div', { class: 'sc-pick' }, sel,
      h('div', { class: 'row' },
        h('a', { class: 'btn btn-ghost small', href: '#/speakcheck/' + encodeURIComponent((all[idx - 1] || all[all.length - 1]).id) }, '◀ ก่อนหน้า'),
        h('a', { class: 'btn btn-ghost small', href: '#/speakcheck/' + encodeURIComponent((all[idx + 1] || all[0]).id) }, 'ถัดไป ▶'))));

    root.appendChild(h('section', { class: 'card sc-target' },
      NS.ui.jp(item.char, 'sc-kana'),
      item.jp && item.jp !== item.char ? h('div', { class: 'muted small' }, 'เขียนจริง: ', NS.ui.jp(item.jp)) : null,
      item.label ? h('div', { class: 'phrase-romaji' }, item.label) : null,
      h('div', { class: 'phrase-th' }, item.th),
      h('div', { class: 'row center' },
        NS.ui.speakBtn(item.sound, { label: '🔊 ฟังต้นแบบ' }),
        NS.ui.speakBtn(item.sound, { label: '🐢 ช้า', rate: 0.6, cls: 'btn-ghost' }))));

    var histBox = h('section', { class: 'card' });
    root.appendChild(h('section', { class: 'card' }, h('h2', { class: 'section-title flush' }, '1) พูดให้แอปตรวจ'),
      NS.speakBox(item, function (r) {
        var s = NS.store.get();
        s.speakHistory.unshift({ id: item.id, date: NS.store.today(), time: new Date().toTimeString().slice(0, 5), heard: r.heard, score: r.pct, verdict: r.verdict });
        if (s.speakHistory.length > 500) s.speakHistory.length = 500;
        NS.store.recordAnswer('speak', r.verdict === 'match');
        drawHistory();
      })));
    root.appendChild(h('section', { class: 'card' }, h('h2', { class: 'section-title flush' }, '2) อัดเสียงตัวเองฟังเทียบ'), NS.recPanel(item)));
    root.appendChild(histBox);

    function drawHistory() {
      var hist = NS.store.get().speakHistory;
      var mine = hist.filter(function (x) { return x.id === item.id; }).slice(0, 5);
      histBox.innerHTML = '';
      histBox.appendChild(h('h2', { class: 'section-title flush' }, 'ประวัติวลีนี้'));
      if (!mine.length) { histBox.appendChild(h('p', { class: 'muted small' }, 'ยังไม่เคยพูดวลีนี้')); }
      else histBox.appendChild(h('ul', { class: 'hist' }, mine.map(function (x) {
        return h('li', null, h('span', { class: 'hist-v ' + x.verdict }, NS.normalize.LABEL[x.verdict] + ' ' + x.score + '%'),
          h('span', { class: 'muted small' }, x.date + ' ' + (x.time || '')), NS.ui.jp(x.heard || '', 'small'));
      })));
      var total = hist.length, match = hist.filter(function (x) { return x.verdict === 'match'; }).length;
      histBox.appendChild(h('p', { class: 'muted small' }, 'ฝึกพูดทั้งหมด ' + total + ' ครั้ง · ตรง ' + match + ' ครั้ง'));
    }
    drawHistory();
  };
})();
