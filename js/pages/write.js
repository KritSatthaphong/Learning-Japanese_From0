/*
 * write.js — ฝึกเขียนตัวอักษรด้วยนิ้ว/เมาส์
 * ------------------------------------------------------------
 * แสดงตัวอักษรจางๆ เป็นเส้นนำ (วาดจากฟอนต์ของเครื่อง) ให้ลากตาม แล้วให้คะแนนจาก
 *   - % ที่ทับเส้นนำ (เขียนครอบคลุมตัวอักษรแค่ไหน)
 *   - % ที่ออกนอกเส้น (เส้นที่เขียนเลยออกไป)
 * หมายเหตุ: ยังไม่แสดงลำดับขีด (ข้อมูล KanjiVG) — ข้ามไว้ตามที่ตกลง
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var FONT = '"Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic","Meiryo","Noto Sans JP","Noto Sans CJK JP",sans-serif';

  /* ตัวอักษรที่เรียนแล้ว แยกตามด่าน */
  function levelsFor(script) {
    var stage = script === 'hira' ? 1 : 2;
    return NS.progress.stage(stage).levels.filter(function (l) { return l.kind === 'kana'; }).map(function (l) {
      var items = NS.content.levelItems(l).filter(function (it) { return it.kind === 'kana'; });
      var learned = items.some(function (it) { return NS.store.get().learned[it.id]; }) || NS.progress.isPassed(l.id);
      return { level: l, items: items, learned: learned };
    });
  }

  /* วาดตัวอักษรลงแคนวาสขนาด s */
  function drawGlyph(ctx, ch, s, mode) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var fs = ch.length > 1 ? s * 0.5 : s * 0.78;
    ctx.font = fs + 'px ' + FONT;
    if (mode === 'dilate') { ctx.lineWidth = s * 0.09; ctx.lineJoin = 'round'; ctx.strokeText(ch, s / 2, s / 2 + s * 0.02); }
    ctx.fillText(ch, s / 2, s / 2 + s * 0.02);
    ctx.restore();
  }

  function drawStrokes(ctx, strokes, scale, width) {
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = width;
    strokes.forEach(function (st) {
      if (!st.length) return;
      ctx.beginPath();
      ctx.moveTo(st[0][0] * scale, st[0][1] * scale);
      if (st.length === 1) ctx.lineTo(st[0][0] * scale + 0.1, st[0][1] * scale);
      st.forEach(function (p) { ctx.lineTo(p[0] * scale, p[1] * scale); });
      ctx.stroke();
    });
    ctx.restore();
  }

  function mask(S, fn) {
    var c = document.createElement('canvas'); c.width = c.height = S;
    var x = c.getContext('2d'); x.fillStyle = x.strokeStyle = '#000';
    fn(x);
    var d = x.getImageData(0, 0, S, S).data, m = new Uint8Array(S * S);
    for (var i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 80 ? 1 : 0;
    return m;
  }

  /* คะแนน: strokes เก็บเป็นพิกัด 0..1 */
  function score(ch, strokes) {
    var S = 160;
    var glyph = mask(S, function (x) { drawGlyph(x, ch, S); });
    var glyphWide = mask(S, function (x) { drawGlyph(x, ch, S, 'dilate'); });
    var userThick = mask(S, function (x) { drawStrokes(x, strokes, S, S * 0.15); });
    var userThin = mask(S, function (x) { drawStrokes(x, strokes, S, S * 0.06); });
    var g = 0, cov = 0, u = 0, out = 0;
    for (var i = 0; i < S * S; i++) {
      if (glyph[i]) { g++; if (userThick[i]) cov++; }
      if (userThin[i]) { u++; if (!glyphWide[i]) out++; }
    }
    var coverage = g ? cov / g : 0, outside = u ? out / u : 1;
    return { coverage: Math.round(coverage * 100), outside: Math.round(outside * 100), score: Math.round(coverage * (1 - outside) * 100) };
  }

  NS.pages.write = function (root) {
    var script = 'hira', lvIdx = 0, idx = 0, showGuide = true, strokes = [];

    function render() {
      var levels = levelsFor(script);
      var avail = levels.filter(function (x) { return x.learned; });
      var fallback = !avail.length;
      if (fallback) avail = [levels[0]];
      if (lvIdx >= avail.length) lvIdx = 0;
      var cur = avail[lvIdx], items = cur.items;
      if (idx >= items.length) idx = 0;
      var it = items[idx];
      strokes = [];

      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/chart', class: 'back' }, '← ตารางตัวอักษร'));
      root.appendChild(h('h1', { class: 'page-title' }, 'ฝึกเขียน'));
      root.appendChild(h('div', { class: 'write-tools' },
        NS.ui.segmented([{ value: 'hira', label: 'ひらがな' }, { value: 'kata', label: 'カタカナ' }], script, function (v) { script = v; lvIdx = 0; idx = 0; render(); }, 'ชุดตัวอักษร'),
        (function () {
          var sel = h('select', { class: 'input', 'aria-label': 'เลือกด่าน' }, avail.map(function (x, i) {
            return h('option', { value: String(i), selected: i === lvIdx }, 'ด่าน ' + x.level.id + ' · ' + x.level.title);
          }));
          sel.addEventListener('change', function () { lvIdx = Number(sel.value); idx = 0; render(); });
          return sel;
        })()));
      if (fallback) root.appendChild(h('p', { class: 'notice small' }, 'ยังไม่ได้เรียนด่านไหน แสดงชุดแรกให้ลองก่อน'));

      var size = Math.max(200, Math.min(320, (root.clientWidth || 343) - 36));
      var dpr = window.devicePixelRatio || 1;
      var cv = h('canvas', { class: 'write-canvas', width: String(size * dpr), height: String(size * dpr), style: 'width:' + size + 'px;height:' + size + 'px', 'aria-label': 'พื้นที่เขียนตัว ' + it.char });
      var ctx = cv.getContext('2d');
      var out = h('div', { class: 'write-out', 'aria-live': 'polite' }, h('span', { class: 'muted small' }, 'ลากตามเส้นนำ แล้วกด "ตรวจ"'));

      function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
      function redraw() {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);
        // เส้นช่วยแบ่งช่อง
        ctx.strokeStyle = css('--border'); ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2); ctx.stroke();
        ctx.setLineDash([]);
        if (showGuide) { ctx.fillStyle = css('--guide'); drawGlyph(ctx, it.char, size); }
        ctx.strokeStyle = css('--ink');
        drawStrokes(ctx, strokes, size, size * 0.06);
      }

      var drawing = false;
      function pt(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
      cv.addEventListener('pointerdown', function (e) { drawing = true; cv.setPointerCapture(e.pointerId); strokes.push([pt(e)]); redraw(); e.preventDefault(); });
      cv.addEventListener('pointermove', function (e) { if (!drawing) return; strokes[strokes.length - 1].push(pt(e)); redraw(); e.preventDefault(); });
      ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { drawing = false; }); });

      root.appendChild(h('div', { class: 'write-head' },
        NS.ui.jp(it.char, 'write-char'), h('span', { class: 'write-romaji' }, it.label),
        NS.ui.speakBtn(it.sound, { label: '🔊', cls: 'btn-soft small', aria: 'ฟังเสียง' }),
        h('span', { class: 'muted small' }, (idx + 1) + ' / ' + items.length)));
      root.appendChild(h('div', { class: 'write-wrap' }, cv));
      root.appendChild(out);
      root.appendChild(h('div', { class: 'write-btns' },
        h('button', { class: 'btn btn-primary', type: 'button', onclick: function () {
          if (!strokes.length) { NS.ui.toast('ลองเขียนก่อนนะ'); return; }
          var r = score(it.char, strokes);
          var msg = r.score >= 70 ? '🎉 สวยมาก!' : r.score >= 50 ? '👍 ใช้ได้' : '💪 ลองอีกครั้ง';
          out.innerHTML = '';
          out.appendChild(h('div', { class: 'verdict ' + (r.score >= 70 ? 'match' : r.score >= 50 ? 'close' : 'miss') },
            h('div', { class: 'verdict-head' }, h('strong', null, msg), h('span', { class: 'verdict-pct' }, r.score + ' คะแนน')),
            h('div', { class: 'small' }, 'ทับเส้นนำ ' + r.coverage + '% · ออกนอกเส้น ' + r.outside + '%')));
        } }, '✓ ตรวจ'),
        h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { strokes = []; redraw(); out.innerHTML = ''; } }, '🧽 ล้าง'),
        h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { showGuide = !showGuide; redraw(); this.textContent = showGuide ? '🙈 ซ่อนเส้นนำ' : '👁 แสดงเส้นนำ'; } }, showGuide ? '🙈 ซ่อนเส้นนำ' : '👁 แสดงเส้นนำ'),
        h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { idx = (idx + 1) % items.length; render(); } }, 'ตัวถัดไป ▶')));
      root.appendChild(h('p', { class: 'muted small' }, 'คะแนน = % ที่ทับเส้นนำ × (100% − % ที่ออกนอกเส้น) · เส้นนำมาจากฟอนต์ของเครื่อง จึงหน้าตาต่างกันได้เล็กน้อยในแต่ละเครื่อง · ยังไม่มีการแสดงลำดับขีด'));
      redraw();
    }
    render();
  };

  NS.writeScore = score;   // ใช้ทดสอบ
})();
