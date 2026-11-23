/*
 * write.js — ฝึกเขียน (คัด) ด้วยนิ้ว/เมาส์
 * ------------------------------------------------------------
 * 2 โหมด
 *   ตัวอักษร : คัดทีละตัว บนช่องใหญ่ 1 ช่อง
 *   ประโยค   : คัดประโยค "ภาษาญี่ปุ่น = คำแปลไทย" ลงช่องตารางทีละตัว (แบบกระดาษคัดญี่ปุ่น)
 * แสดงตัวอักษรจางๆ เป็นเส้นนำ (วาดจากฟอนต์ของเครื่อง) ให้คะแนนจาก
 *   % ที่ทับเส้นนำ × (100% − % ที่ออกนอกเส้น)
 * ทุกครั้งที่กด "✓ ตรวจ" จะบันทึกลง "บันทึกการคัด" (นับครั้ง + เก็บภาพลายมือล่าสุด)
 * หมายเหตุ: ยังไม่แสดงลำดับขีด (ข้อมูล KanjiVG)
 *
 * ลิงก์ตรง: #/write/char/あ  หรือ  #/write/sent/<id ประโยค>
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var FONT = '"Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic","Meiryo","Noto Sans JP","Noto Sans CJK JP",sans-serif';

  /* ---------- วาด / ให้คะแนน (ใช้ได้ทั้งตัวเดียวและหลายช่อง) ---------- */

  /* L = { cells: ['お','み',...], cols, rows } */
  function makeLayout(cells, maxCols) {
    var cols = Math.max(1, Math.min(cells.length, maxCols));
    return { cells: cells, cols: cols, rows: Math.ceil(cells.length / cols) };
  }

  function drawGuide(ctx, L, cell, mode) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    L.cells.forEach(function (ch, i) {
      var x = (i % L.cols) * cell + cell / 2, y = Math.floor(i / L.cols) * cell + cell / 2 + cell * 0.02;
      ctx.font = (ch.length > 1 ? cell * 0.5 : cell * 0.78) + 'px ' + FONT;
      if (mode === 'dilate') { ctx.lineWidth = cell * 0.09; ctx.lineJoin = 'round'; ctx.strokeText(ch, x, y); }
      ctx.fillText(ch, x, y);
    });
    ctx.restore();
  }

  /* strokes เก็บพิกัด 0..1 ของความกว้าง/สูงพื้นที่เขียน */
  function drawStrokes(ctx, strokes, W, H, width) {
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = width;
    strokes.forEach(function (st) {
      if (!st.length) return;
      ctx.beginPath();
      ctx.moveTo(st[0][0] * W, st[0][1] * H);
      if (st.length === 1) ctx.lineTo(st[0][0] * W + 0.1, st[0][1] * H);
      st.forEach(function (p) { ctx.lineTo(p[0] * W, p[1] * H); });
      ctx.stroke();
    });
    ctx.restore();
  }

  function mask(W, H, fn) {
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d'); x.fillStyle = x.strokeStyle = '#000';
    fn(x);
    var d = x.getImageData(0, 0, W, H).data, m = new Uint8Array(W * H);
    for (var i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 80 ? 1 : 0;
    return m;
  }

  function scoreLayout(L, strokes) {
    var cell = L.cells.length === 1 ? 160 : 40, W = L.cols * cell, H = L.rows * cell;
    var glyph = mask(W, H, function (x) { drawGuide(x, L, cell); });
    var glyphWide = mask(W, H, function (x) { drawGuide(x, L, cell, 'dilate'); });
    var userThick = mask(W, H, function (x) { drawStrokes(x, strokes, W, H, cell * 0.15); });
    var userThin = mask(W, H, function (x) { drawStrokes(x, strokes, W, H, cell * 0.06); });
    var g = 0, cov = 0, u = 0, out = 0;
    for (var i = 0; i < W * H; i++) {
      if (glyph[i]) { g++; if (userThick[i]) cov++; }
      if (userThin[i]) { u++; if (!glyphWide[i]) out++; }
    }
    var coverage = g ? cov / g : 0, outside = u ? out / u : 1;
    return { coverage: Math.round(coverage * 100), outside: Math.round(outside * 100), score: Math.round(coverage * (1 - outside) * 100) };
  }

  /* ภาพย่อลายมือ (พื้นขาว เส้นนำเทาอ่อน หมึกดำ) เก็บเป็นหลักฐานการคัด */
  function thumbnail(L, strokes) {
    var cell = L.cells.length === 1 ? 96 : 30, W = L.cols * cell, H = L.rows * cell;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#e6e1d8'; x.lineWidth = 1;
    for (var i = 0; i <= L.cols; i++) { x.beginPath(); x.moveTo(i * cell, 0); x.lineTo(i * cell, H); x.stroke(); }
    for (var j = 0; j <= L.rows; j++) { x.beginPath(); x.moveTo(0, j * cell); x.lineTo(W, j * cell); x.stroke(); }
    x.fillStyle = '#e9e9e9'; drawGuide(x, L, cell);
    x.strokeStyle = '#1f1c19'; drawStrokes(x, strokes, W, H, cell * 0.07);
    try { return c.toDataURL('image/png'); } catch (e) { return null; }
  }

  /* ---------- คำใบ้โรมันจิของแต่ละช่อง ---------- */
  var romajiMap = null;
  function romajiOf(ch) {
    if (!romajiMap) {
      romajiMap = {};
      NS.KANA.forEach(function (k) {
        var r = NS.content.romajiLabel(k.romaji).replace(' (o)', '');
        if (!(k.hira in romajiMap)) romajiMap[k.hira] = r;
        if (!(k.kata in romajiMap)) romajiMap[k.kata] = r;
      });
    }
    return romajiMap[ch] || '';
  }
  /* เสียงควบ (き+ゃ) ใส่คำใบ้รวม "kya" ไว้ที่ช่องแรก ช่องตัวเล็กเว้นว่าง · っ/ー ไม่มีคำใบ้ */
  function hintsFor(cells) {
    return cells.map(function (ch, i) {
      if (/^[ゃゅょャュョ]$/.test(ch)) return '';
      var pair = ch + (cells[i + 1] || '');
      if (/[ゃゅょャュョ]$/.test(pair) && romajiOf(pair)) return romajiOf(pair);
      return romajiOf(ch);
    });
  }

  /* ---------- รายการให้เลือก ---------- */

  function kanaLevels(script) {
    var stage = script === 'hira' ? 1 : 2;
    return NS.progress.stage(stage).levels.filter(function (l) { return l.kind === 'kana'; }).map(function (l) {
      var items = NS.content.levelItems(l).filter(function (it) { return it.kind === 'kana'; });
      var learned = items.some(function (it) { return NS.store.get().learned[it.id]; }) || NS.progress.isPassed(l.id);
      return { level: l, items: items, learned: learned };
    });
  }

  function sentenceGroups() {
    var groups = NS.progress.stage(5).levels.map(function (l) { return { label: 'วลี · ' + l.title, items: NS.content.phraseItems(l) }; });
    NS.progress.stage(4).levels.forEach(function (l) { groups.push({ label: 'รูปประโยค · ' + l.title, items: NS.content.grammarItems(l) }); });
    var deck = NS.store.get().deck.map(NS.content.deckItem);
    if (deck.length) groups.push({ label: 'เด็คของฉัน', items: deck });
    return groups;
  }

  function cellsOf(text) {
    return Array.from(String(text)).filter(function (ch) { return !/[\s、。，,.！!？?「」]/.test(ch); });
  }

  /* ความกว้างที่ใช้ได้จริงของหน้า (ไม่รวม padding) */
  function contentWidth(root) {
    var cs = getComputedStyle(root);
    var w = root.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
    return w > 0 ? w : 320;
  }

  /* หาว่าตัวอักษรนี้อยู่ในสคริปต์/ด่านไหน (สำหรับลิงก์ #/write/char/あ) */
  function locateChar(ch) {
    var out = null;
    ['hira', 'kata'].forEach(function (script) {
      kanaLevels(script).forEach(function (x, li) {
        x.items.forEach(function (it, ii) { if (!out && it.char === ch) out = { script: script, level: x.level.id, idx: ii }; });
      });
    });
    return out;
  }

  NS.pages.write = function (root, args) {
    var mode = 'char', script = 'hira', levelId = null, idx = 0, sentId = null, showGuide = true, showHint = true;
    if (args[0] === 'char' && args[1]) {
      var loc = locateChar(decodeURIComponent(args[1]));
      if (loc) { script = loc.script; levelId = loc.level; idx = loc.idx; }
    } else if (args[0] === 'sent' && args[1]) {
      mode = 'sent'; sentId = decodeURIComponent(args[1]);
    }

    function render() {
      root.innerHTML = '';
      root.appendChild(h('div', { class: 'write-nav' },
        h('a', { href: '#/chart', class: 'back' }, '← ตารางตัวอักษร'),
        h('a', { href: '#/writelog', class: 'btn btn-ghost small' }, '📊 บันทึกการคัด')));
      root.appendChild(h('h1', { class: 'page-title' }, 'ฝึกเขียน (คัด)'));
      root.appendChild(NS.ui.segmented([{ value: 'char', label: '✍️ คัดตัวอักษร' }, { value: 'sent', label: '📝 คัดประโยค' }], mode,
        function (v) { mode = v; render(); }, 'โหมดการคัด'));
      if (mode === 'char') renderChar(); else renderSent();
    }

    /* ---------- โหมดตัวอักษร ---------- */
    function renderChar() {
      var levels = kanaLevels(script);
      var avail = levels.filter(function (x) { return x.learned || x.level.id === levelId; });
      var fallback = !avail.length;
      if (fallback) avail = [levels[0]];
      var cur = avail.find(function (x) { return x.level.id === levelId; }) || avail[0];
      levelId = cur.level.id;
      if (idx >= cur.items.length) idx = 0;
      var it = cur.items[idx];

      var sel = h('select', { class: 'input', 'aria-label': 'เลือกด่าน' }, avail.map(function (x) {
        return h('option', { value: x.level.id, selected: x.level.id === levelId }, 'ด่าน ' + x.level.id + ' · ' + x.level.title);
      }));
      sel.addEventListener('change', function () { levelId = sel.value; idx = 0; render(); });
      root.appendChild(h('div', { class: 'write-tools' },
        NS.ui.segmented([{ value: 'hira', label: 'ひらがな' }, { value: 'kata', label: 'カタカナ' }], script, function (v) { script = v; levelId = null; idx = 0; render(); }, 'ชุดตัวอักษร'),
        sel));
      if (fallback) root.appendChild(h('p', { class: 'notice small' }, 'ยังไม่ได้เรียนด่านไหน แสดงชุดแรกให้ลองก่อน'));

      var rec = NS.writeLog.charRec(it.char);
      root.appendChild(h('div', { class: 'write-head' },
        NS.ui.jp(it.char, 'write-char'), h('span', { class: 'write-romaji' }, it.label),
        h('span', { class: 'write-count' }, 'คัดแล้ว ' + rec.n + ' ครั้ง'),
        NS.ui.speakBtn(it.sound, { label: '🔊', cls: 'btn-soft small', aria: 'ฟังเสียง' })));

      board(makeLayout([it.char], 1), {
        onScore: function (r, img) { NS.writeLog.recordChar(it.char, r.score, img); },
        nextLabel: 'ตัวถัดไป ▶ (' + (idx + 1) + '/' + cur.items.length + ')',
        onNext: function () { idx = (idx + 1) % cur.items.length; render(); }
      });
    }

    /* ---------- โหมดประโยค ---------- */
    function renderSent() {
      var groups = sentenceGroups();
      var all = [].concat.apply([], groups.map(function (g) { return g.items; }));
      var it = all.find(function (x) { return x.id === sentId; }) || all[0];
      sentId = it.id;
      var i = all.indexOf(it);

      var sel = h('select', { class: 'input', 'aria-label': 'เลือกประโยค' }, groups.map(function (g) {
        return h('optgroup', { label: g.label }, g.items.map(function (x) {
          var n = NS.writeLog.sentRec(x.id).n;
          return h('option', { value: x.id, selected: x.id === sentId }, (n ? '✓' + n + ' ' : '') + x.char + ' = ' + x.th);
        }));
      }));
      sel.addEventListener('change', function () { sentId = sel.value; render(); });
      root.appendChild(h('div', { class: 'write-tools' }, sel));

      var rec = NS.writeLog.sentRec(it.id);
      root.appendChild(h('div', { class: 'sent-line card' },
        h('div', { class: 'sent-eq' }, NS.ui.jp(it.char, 'sent-jp'), h('span', { class: 'sent-sep' }, ' = '), h('span', { class: 'sent-th' }, it.th)),
        h('div', { class: 'sent-meta' },
          it.label ? h('span', { class: 'phrase-romaji' }, it.label) : null,
          h('span', { class: 'write-count' }, 'คัดแล้ว ' + rec.n + ' ครั้ง'),
          NS.ui.speakBtn(it.sound, { label: '🔊', cls: 'btn-soft small', aria: 'ฟังประโยค' }))));

      var cells = cellsOf(it.char);
      var avail = Math.min(640, contentWidth(root));
      board(makeLayout(cells, Math.max(4, Math.min(10, Math.floor(avail / 44)))), {
        onScore: function (r, img) { NS.writeLog.recordSentence(it.id, it.char, r.score, img); },
        nextLabel: 'ประโยคถัดไป ▶',
        onNext: function () { sentId = (all[i + 1] || all[0]).id; render(); }
      });
    }

    /* ---------- พื้นที่เขียน + ปุ่ม ---------- */
    function board(L, o) {
      var single = L.cells.length === 1;
      var availW = contentWidth(root) - 4;
      var cell = single ? Math.max(180, Math.min(320, availW)) : Math.min(64, Math.floor(availW / L.cols));
      var W = L.cols * cell, H = L.rows * cell;
      var dpr = window.devicePixelRatio || 1;
      var strokes = [], counted = false;
      var cv = h('canvas', { class: 'write-canvas', width: String(W * dpr), height: String(H * dpr), style: 'width:' + W + 'px;aspect-ratio:' + W + ' / ' + H,
        'aria-label': 'พื้นที่คัด ' + L.cells.join('') });
      var ctx = cv.getContext('2d');
      var out = h('div', { class: 'write-out', 'aria-live': 'polite' }, h('span', { class: 'muted small' }, 'ลากตามเส้นนำ แล้วกด "✓ ตรวจ"'));

      function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
      function redraw() {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = css('--border'); ctx.lineWidth = 1;
        for (var c = 0; c < L.cols; c++) for (var r = 0; r < L.rows; r++) {
          var x = c * cell, y = r * cell;
          ctx.setLineDash([]); if (!single) ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
          ctx.setLineDash([3, 4]);
          ctx.beginPath(); ctx.moveTo(x + cell / 2, y); ctx.lineTo(x + cell / 2, y + cell); ctx.moveTo(x, y + cell / 2); ctx.lineTo(x + cell, y + cell / 2); ctx.stroke();
        }
        ctx.setLineDash([]);
        if (showGuide) { ctx.fillStyle = css('--guide'); drawGuide(ctx, L, cell); }
        if (showHint) {
          var hints = hintsFor(L.cells);
          ctx.save();
          ctx.fillStyle = css('--primary'); ctx.globalAlpha = 0.75;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.font = '600 ' + Math.max(10, Math.round(cell * (single ? 0.07 : 0.17))) + 'px system-ui, sans-serif';
          hints.forEach(function (t, i) { if (t) ctx.fillText(t, (i % L.cols) * cell + cell * 0.05, Math.floor(i / L.cols) * cell + cell * 0.04); });
          ctx.restore();
        }
        ctx.strokeStyle = css('--ink');
        drawStrokes(ctx, strokes, W, H, cell * (single ? 0.06 : 0.08));
      }

      var drawing = false;
      function pt(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
      cv.addEventListener('pointerdown', function (e) { drawing = true; counted = false; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } strokes.push([pt(e)]); redraw(); e.preventDefault(); });
      cv.addEventListener('pointermove', function (e) { if (!drawing) return; strokes[strokes.length - 1].push(pt(e)); redraw(); e.preventDefault(); });
      ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { drawing = false; }); });

      var guideBtn = h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { showGuide = !showGuide; guideBtn.textContent = showGuide ? '🙈 ซ่อนเส้นนำ' : '👁 แสดงเส้นนำ'; redraw(); } },
        showGuide ? '🙈 ซ่อนเส้นนำ' : '👁 แสดงเส้นนำ');

      var hintBtn = h('button', { class: 'btn btn-soft', type: 'button', 'aria-pressed': String(showHint), onclick: function () {
        showHint = !showHint; hintBtn.setAttribute('aria-pressed', String(showHint));
        hintBtn.textContent = showHint ? '🔤 ซ่อนคำใบ้โรมันจิ' : '🔤 แสดงคำใบ้โรมันจิ'; redraw();
      } }, showHint ? '🔤 ซ่อนคำใบ้โรมันจิ' : '🔤 แสดงคำใบ้โรมันจิ');

      root.appendChild(h('div', { class: 'write-wrap' }, cv));
      root.appendChild(out);
      root.appendChild(h('div', { class: 'write-btns' },
        h('button', { class: 'btn btn-primary', type: 'button', onclick: function () {
          if (!strokes.length) { NS.ui.toast('ลองเขียนก่อนนะ'); return; }
          var r = scoreLayout(L, strokes);
          var msg = r.score >= 70 ? '🎉 สวยมาก!' : r.score >= 50 ? '👍 ใช้ได้' : '💪 ลองอีกครั้ง';
          if (!counted) { o.onScore(r, thumbnail(L, strokes)); counted = true; }
          out.innerHTML = '';
          out.appendChild(h('div', { class: 'verdict ' + (r.score >= 70 ? 'match' : r.score >= 50 ? 'close' : 'miss') },
            h('div', { class: 'verdict-head' }, h('strong', null, msg), h('span', { class: 'verdict-pct' }, r.score + ' คะแนน')),
            h('div', { class: 'small' }, 'ทับเส้นนำ ' + r.coverage + '% · ออกนอกเส้น ' + r.outside + '%'),
            h('div', { class: 'small muted' }, '📊 บันทึกลง "บันทึกการคัด" แล้ว')));
          document.querySelectorAll('.write-count').forEach(function (el) { el.textContent = el.textContent.replace(/\d+/, function (n) { return String(Number(n) + 1); }); });
        } }, '✓ ตรวจ'),
        h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { strokes = []; counted = false; redraw(); out.innerHTML = ''; } }, '🧽 ล้าง'),
        guideBtn, hintBtn,
        h('button', { class: 'btn btn-soft', type: 'button', onclick: o.onNext }, o.nextLabel)));
      root.appendChild(h('p', { class: 'muted small' }, 'คะแนน = % ที่ทับเส้นนำ × (100% − % ที่ออกนอกเส้น) · เส้นนำมาจากฟอนต์ของเครื่อง จึงหน้าตาต่างกันได้เล็กน้อย · ยังไม่มีการแสดงลำดับขีด'));
      redraw();
    }

    render();
  };

  /* ใช้ในหน้าบันทึกการคัดและสคริปต์ทดสอบ */
  NS.writeScore = function (ch, strokes) { return scoreLayout(makeLayout([ch], 1), strokes); };
  NS.writeTools = { makeLayout: makeLayout, scoreLayout: scoreLayout, cellsOf: cellsOf };
})();
