/*
 * prepost.js — แบบทดสอบก่อน-หลังเรียน (Pre/Post Test)
 * ------------------------------------------------------------
 * ข้อสอบชุดเดิมทุกครั้ง (สุ่มด้วย seed คงที่) ไม่บอกเฉลยระหว่างสอบ และไม่ให้ XP
 *   ส่วน 1 อ่านตัวอักษร 20 ตัว (ฮิรางานะ 10 + คาตากานะ 10) → เลือกโรมันจิ
 *   ส่วน 2 ฟัง 10 วลี → เลือกความหมายไทย
 *   ส่วน 3 พูด 18 วลี (หมวดละ 3) ผ่านเมื่อตรง ≥ 80%
 *          ไมค์ใช้ไม่ได้ → "ตรวจเอง" และบันทึกว่าตรวจด้วยวิธีไหน
 * บันทึกผลพร้อมป้าย Pre/Post และวันที่ แสดงกราฟเทียบ และส่งออก CSV
 * หมายเหตุ: ถ้าแก้ไฟล์ data/*.js ข้อสอบอาจเปลี่ยน ควรทำ Pre และ Post ด้วยข้อมูลชุดเดียวกัน
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var SEED = 20261111;

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function sshuffle(arr, r) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- สร้างข้อสอบ (ได้ชุดเดิมทุกครั้ง) ---------- */
  function buildTest() {
    var r = rng(SEED);
    var basic = NS.KANA.filter(function (k) { return k.group === 'basic' && !k.noQuiz; });
    var part1 = [];
    ['hira', 'kata'].forEach(function (script) {
      var items = basic.map(function (k) { return NS.content.kanaItem(k, script); });
      sshuffle(items, r).slice(0, 10).forEach(function (it) {
        var others = sshuffle(items.filter(function (x) { return x.soundKey !== it.soundKey; }), r).slice(0, 3);
        part1.push({
          type: 'test-read', item: it, answerId: it.id, label: 'ตัวนี้อ่านว่าอะไร?',
          prompt: { text: it.char, jp: true },
          choices: sshuffle([it].concat(others), r).map(function (c) { return { id: c.id, label: c.label, jp: false }; })
        });
      });
    });

    var phrases = NS.content.allPhrases();
    var part2 = sshuffle(phrases, r).slice(0, 10).map(function (it) {
      var used = {}; used[it.th] = true;
      var others = sshuffle(phrases, r).filter(function (c) { if (used[c.th]) return false; used[c.th] = true; return true; }).slice(0, 3);
      return {
        type: 'test-listen', item: it, answerId: it.id, label: 'ฟังแล้วเลือกความหมาย',
        prompt: { audio: it.sound },
        choices: sshuffle([it].concat(others), r).map(function (c) { return { id: c.id, label: c.th, jp: false }; })
      };
    });

    var part3 = [];
    NS.progress.stage(5).levels.forEach(function (l) {
      sshuffle(NS.content.phraseItems(l), r).slice(0, 3).forEach(function (it) { part3.push(it); });
    });
    return { part1: part1, part2: part2, part3: part3 };
  }

  /* ---------- CSV ---------- */
  var HEAD = ['date', 'time', 'label', 'read_correct', 'read_total', 'read_pct', 'listen_correct', 'listen_total', 'listen_pct', 'speak_passed', 'speak_total', 'speak_pct', 'speak_check_method'];
  function pct(x) { return x.t ? Math.round(x.c / x.t * 100) : 0; }
  function methodOf(p3) { return p3.mic && p3.self ? 'mixed' : p3.self ? 'self' : 'mic'; }
  function csv() {
    var rows = [HEAD.join(',')];
    NS.store.get().tests.forEach(function (t) {
      rows.push([t.date, t.time, t.label, t.p1.c, t.p1.t, pct(t.p1), t.p2.c, t.p2.t, pct(t.p2), t.p3.c, t.p3.t, pct(t.p3), methodOf(t.p3)].join(','));
    });
    return rows.join('\n');
  }

  /* ---------- กราฟแท่งเทียบ Pre กับ Post (SVG) ---------- */
  function latest(label) {
    var ts = NS.store.get().tests.filter(function (t) { return t.label === label; });
    return ts[ts.length - 1] || null;
  }
  function chart() {
    var pre = latest('Pre'), post = latest('Post');
    var series = [pre && { name: 'Pre', cls: 's-pre', t: pre }, post && { name: 'Post', cls: 's-post', t: post }].filter(Boolean);
    var parts = [{ key: 'p1', label: 'อ่านตัวอักษร' }, { key: 'p2', label: 'ฟัง' }, { key: 'p3', label: 'พูด' }];
    var W = 340, H = 210, L = 34, R = 8, T = 18, B = 30;
    var pw = W - L - R, ph = H - T - B, gw = pw / parts.length, bw = 30, gap = 2;
    var ns = 'http://www.w3.org/2000/svg';
    function el(tag, attrs, text) {
      var e = document.createElementNS(ns, tag);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (text != null) e.textContent = text;
      return e;
    }
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'pp-chart', role: 'img',
      'aria-label': 'กราฟเทียบคะแนน ' + series.map(function (s) { return s.name + ': ' + parts.map(function (p) { return p.label + ' ' + pct(s.t[p.key]) + '%'; }).join(', '); }).join(' · ') });
    [0, 50, 100].forEach(function (v) {
      var y = T + ph - v / 100 * ph;
      svg.appendChild(el('line', { x1: L, x2: W - R, y1: y, y2: y, class: 'pp-grid' }));
      svg.appendChild(el('text', { x: L - 6, y: y + 4, class: 'pp-axis', 'text-anchor': 'end' }, v + '%'));
    });
    parts.forEach(function (p, gi) {
      var cx = L + gw * gi + gw / 2;
      var groupW = series.length * bw + (series.length - 1) * gap;
      series.forEach(function (s, si) {
        var v = pct(s.t[p.key]);
        var x = cx - groupW / 2 + si * (bw + gap);
        var hgt = Math.max(v / 100 * ph, v ? 2 : 0);
        var y = T + ph - hgt;
        var rr = Math.min(4, hgt);
        // แท่งมุมบนโค้ง 4px ฐานตรง
        var d = 'M' + x + ',' + (T + ph) + ' V' + (y + rr) + ' Q' + x + ',' + y + ' ' + (x + rr) + ',' + y +
          ' H' + (x + bw - rr) + ' Q' + (x + bw) + ',' + y + ' ' + (x + bw) + ',' + (y + rr) + ' V' + (T + ph) + ' Z';
        var bar = el('path', { d: d, class: 'pp-bar ' + s.cls });
        bar.appendChild(el('title', {}, s.name + ' · ' + p.label + ': ' + s.t[p.key].c + '/' + s.t[p.key].t + ' (' + v + '%)'));
        svg.appendChild(bar);
        svg.appendChild(el('text', { x: x + bw / 2, y: y - 4, class: 'pp-val', 'text-anchor': 'middle' }, v + '%'));
      });
      svg.appendChild(el('text', { x: cx, y: H - 10, class: 'pp-axis', 'text-anchor': 'middle' }, p.label));
    });
    svg.appendChild(el('line', { x1: L, x2: W - R, y1: T + ph, y2: T + ph, class: 'pp-base' }));
    var legend = h('div', { class: 'pp-legend' }, series.map(function (s) {
      return h('span', null, h('i', { class: 'sw ' + s.cls }), s.name + ' (' + s.t.date + ')');
    }));
    return h('div', null, legend, svg);
  }

  NS.pages.test = function (root) {
    var label = 'Pre';

    function home() {
      var tests = NS.store.get().tests;
      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/more', class: 'back' }, '← เพิ่มเติม'));
      root.appendChild(h('h1', { class: 'page-title' }, 'Pre/Post Test'));
      root.appendChild(h('section', { class: 'card stack-sm' },
        h('p', null, 'ข้อสอบชุดเดียวกันทุกครั้ง ใช้วัดผลก่อนเรียน (Pre) และหลังเรียน (Post)'),
        h('ul', { class: 'pp-parts' },
          h('li', null, h('strong', null, 'ส่วน 1 อ่าน: '), 'ตัวอักษร 20 ตัว → เลือกโรมันจิ'),
          h('li', null, h('strong', null, 'ส่วน 2 ฟัง: '), '10 วลี → เลือกความหมายไทย'),
          h('li', null, h('strong', null, 'ส่วน 3 พูด: '), '18 วลี (หมวดละ 3) ผ่านเมื่อตรง ≥ 80%')),
        h('p', { class: 'muted small' }, 'ระหว่างสอบจะไม่บอกเฉลย และไม่ได้ XP · ใช้เวลาประมาณ 10–15 นาที · ส่วนพูดต้องใช้ไมค์ (Chrome ผ่าน localhost หรือ GitHub Pages) ถ้าใช้ไม่ได้ ให้ตรวจเองได้'),
        h('div', { class: 'field' }, h('span', null, 'ครั้งนี้เป็นการสอบ'),
          NS.ui.segmented([{ value: 'Pre', label: 'Pre (ก่อนเรียน)' }, { value: 'Post', label: 'Post (หลังเรียน)' }], label, function (v) { label = v; home(); }, 'ป้ายการสอบ')),
        h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: start }, '▶ เริ่มสอบ ' + label)));

      root.appendChild(h('h2', { class: 'section-title' }, 'ผลการสอบ'));
      if (!tests.length) { root.appendChild(h('p', { class: 'card notice' }, 'ยังไม่มีผลสอบ')); return; }
      root.appendChild(h('section', { class: 'card' },
        h('h3', null, latest('Post') && latest('Pre') ? 'เทียบ Pre กับ Post ล่าสุด' : 'ผลล่าสุด'),
        chart(),
        latest('Post') ? null : h('p', { class: 'muted small' }, 'ทำ Post หลังเรียนจบ เพื่อดูกราฟเทียบก่อน-หลัง')));
      root.appendChild(h('div', { class: 'table-wrap card' }, h('table', { class: 'pp-table' },
        h('caption', { class: 'muted small' }, 'ผลทุกครั้ง (ตารางนี้คือข้อมูลเดียวกับกราฟ)'),
        h('thead', null, h('tr', null, ['วันที่', 'ป้าย', 'อ่าน', 'ฟัง', 'พูด', 'ตรวจพูด', ''].map(function (x) { return h('th', { scope: 'col' }, x); }))),
        h('tbody', null, tests.map(function (t, i) {
          return h('tr', null, h('td', null, t.date), h('td', null, h('span', { class: 'badge ' + (t.label === 'Pre' ? 's-pre-badge' : 's-post-badge') }, t.label)),
            h('td', null, t.p1.c + '/' + t.p1.t), h('td', null, t.p2.c + '/' + t.p2.t), h('td', null, t.p3.c + '/' + t.p3.t),
            h('td', { class: 'small' }, { mic: 'ไมค์', self: 'ตรวจเอง', mixed: 'ผสม' }[methodOf(t.p3)]),
            h('td', null, h('button', { class: 'icon-btn small', type: 'button', 'aria-label': 'ลบผลสอบนี้', onclick: function () { confirmDel(i); } }, '✕')));
        })))));
      root.appendChild(h('div', { class: 'row' },
        h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { NS.ui.copyText(csv(), 'คัดลอก CSV แล้ว'); } }, '📋 คัดลอก CSV'),
        h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { NS.ui.download('nihongo-prepost-' + NS.store.today() + '.csv', '﻿' + csv(), 'text/csv;charset=utf-8'); } }, '⬇ ดาวน์โหลด CSV')));
    }

    function confirmDel(i) {
      NS.ui.modal({ title: 'ลบผลสอบนี้?', body: 'ลบแล้วกู้คืนไม่ได้', actions: [
        { label: 'ยกเลิก', cls: 'btn-soft' },
        { label: 'ลบ', cls: 'btn-danger', onClick: function () { NS.store.get().tests.splice(i, 1); NS.store.save(); home(); } }
      ] });
    }

    var test, result;
    function start() {
      test = buildTest();
      result = { label: label, date: NS.store.today(), time: new Date().toTimeString().slice(0, 5), p1: { c: 0, t: test.part1.length }, p2: { c: 0, t: test.part2.length }, p3: { c: 0, t: test.part3.length, mic: 0, self: 0 } };
      runPart('ส่วน 1/3 · อ่านตัวอักษร', test.part1, 'p1', function () {
        runPart('ส่วน 2/3 · ฟัง', test.part2, 'p2', speakPart);
      });
    }

    function exitConfirm() {
      NS.ui.modal({ title: 'ออกจากการสอบ?', body: 'ผลสอบครั้งนี้จะไม่ถูกบันทึก', actions: [
        { label: 'สอบต่อ', cls: 'btn-soft' }, { label: 'ออก', cls: 'btn-danger', onClick: home }] });
    }

    function runPart(title, qs, key, next) {
      root.innerHTML = '';
      var holder = h('div');
      root.appendChild(h('h1', { class: 'page-title' }, 'สอบ ' + label + ' · ' + title));
      root.appendChild(holder);
      NS.quiz.run(holder, {
        questions: qs, testMode: true,
        onAnswer: function (q, ok) { if (ok) result[key].c++; },
        onExit: exitConfirm,
        onFinish: next
      });
    }

    function speakPart() {
      var i = 0;
      function show() {
        var it = test.part3[i], best = null, method = null;
        root.innerHTML = '';
        root.appendChild(h('h1', { class: 'page-title' }, 'สอบ ' + label + ' · ส่วน 3/3 · พูด'));
        root.appendChild(h('div', { class: 'quiz-top' },
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'ออกจากการสอบ', onclick: exitConfirm }, '✕'),
          h('div', { class: 'progress' }, h('div', { class: 'bar', style: 'width:' + Math.round(i / test.part3.length * 100) + '%' })),
          h('span', { class: 'muted small' }, (i + 1) + '/' + test.part3.length)));
        var nextBtn = h('button', { class: 'btn btn-primary btn-block', type: 'button', disabled: true, onclick: function () {
          if (best && best.passed) result.p3.c++;
          result.p3[method]++;
          i++;
          if (i < test.part3.length) show(); else finish();
        } }, i === test.part3.length - 1 ? 'ดูผลสอบ' : 'ถัดไป →');
        var state = h('p', { class: 'muted small center', 'aria-live': 'polite' }, 'พูดวลีนี้ (ลองได้หลายครั้ง ใช้ผลที่ดีที่สุด)');
        function setResult(passed, m, pctv) {
          if (!best || passed || m === 'self') best = { passed: passed };
          method = m;
          state.textContent = m === 'self' ? ('ตรวจเอง: ' + (passed ? 'ผ่าน' : 'ไม่ผ่าน')) : ('ผลที่ดีที่สุด: ' + (best.passed ? 'ผ่าน' : 'ยังไม่ผ่าน') + ' (ครั้งล่าสุด ' + pctv + '%)');
          nextBtn.disabled = false;
        }
        root.appendChild(h('section', { class: 'card sc-target' },
          NS.ui.jp(it.char, 'sc-kana'),
          h('div', { class: 'phrase-romaji' }, it.label),
          h('div', { class: 'phrase-th' }, it.th),
          NS.ui.speakBtn(it.sound, { label: '🔊 ฟังต้นแบบ' })));
        root.appendChild(h('section', { class: 'card' },
          NS.speakBox(it, function (r) { setResult(r.pct >= 80, 'mic', r.pct); }),
          state,
          h('div', { class: 'self-check' },
            h('span', { class: 'muted small' }, NS.speech.recogSupported ? 'ไมค์ใช้ไม่ได้? ตรวจเอง:' : 'ตรวจเอง:'),
            h('button', { class: 'btn btn-soft small', type: 'button', onclick: function () { setResult(true, 'self'); } }, '✅ ผ่าน'),
            h('button', { class: 'btn btn-soft small', type: 'button', onclick: function () { setResult(false, 'self'); } }, '❌ ไม่ผ่าน'))));
        root.appendChild(nextBtn);
      }
      show();
    }

    function finish() {
      NS.store.get().tests.push(result);
      NS.store.save();
      root.innerHTML = '';
      root.appendChild(h('h1', { class: 'page-title' }, 'ผลสอบ ' + label));
      root.appendChild(h('section', { class: 'card result ok' },
        h('div', { class: 'tiles tiles-3' },
          h('div', null, h('small', { class: 'muted' }, 'อ่าน'), h('strong', null, result.p1.c + '/' + result.p1.t)),
          h('div', null, h('small', { class: 'muted' }, 'ฟัง'), h('strong', null, result.p2.c + '/' + result.p2.t)),
          h('div', null, h('small', { class: 'muted' }, 'พูด'), h('strong', null, result.p3.c + '/' + result.p3.t))),
        h('p', { class: 'muted small' }, 'บันทึกแล้ว · ' + result.date + ' ' + result.time)));
      root.appendChild(h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: home }, 'ดูกราฟและ CSV'));
    }

    home();
  };

  NS.prepost = { buildTest: buildTest, csv: csv, latest: latest, pct: pct };
})();
