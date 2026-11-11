/*
 * ui.js — ตัวช่วยสร้างหน้าจอ (ปุ่ม, กล่องข้อความ, หน้าต่างยืนยัน)
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};

  function append(el, kids) {
    kids.forEach(function (k) {
      if (k == null || k === false) return;
      if (Array.isArray(k)) { append(el, k); return; }
      el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    });
  }

  /* h('div', { class: 'card', onclick: fn }, 'ข้อความ', ลูก...) */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'style') el.style.cssText = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    append(el, Array.prototype.slice.call(arguments, 2));
    return el;
  }

  /* ข้อความภาษาญี่ปุ่น: ใส่ lang="ja" เพื่อให้เครื่องเลือกฟอนต์ญี่ปุ่น (ไม่ใช่ฟอนต์จีน) */
  function jp(text, cls) {
    return h('span', { class: 'jp' + (cls ? ' ' + cls : ''), lang: 'ja' }, text);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

  /* ปุ่มลำโพง */
  function speakBtn(text, opts) {
    opts = opts || {};
    return h('button', {
      class: 'btn ' + (opts.cls || 'btn-soft'),
      type: 'button',
      'aria-label': opts.aria || 'ฟังเสียง',
      onclick: function (e) { e.stopPropagation(); NS.speech.speak(text, { rate: opts.rate }); }
    }, opts.label || '🔊 ฟัง');
  }

  /*
   * หน้าต่างแบบ in-app (ไม่ใช้ confirm() ของเบราว์เซอร์)
   * modal({ title, body, actions: [{ label, cls, onClick }] })
   */
  function modal(o) {
    var root = document.getElementById('modal-root');
    var prevFocus = document.activeElement;
    function close() {
      document.removeEventListener('keydown', onKey);
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      if (o.onClose) o.onClose();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    var actions = (o.actions || [{ label: 'ปิด', cls: 'btn-primary' }]).map(function (a) {
      return h('button', {
        class: 'btn ' + (a.cls || 'btn-soft'), type: 'button',
        onclick: function () { var keep = a.onClick && a.onClick() === false; if (!keep) close(); }
      }, a.label);
    });
    var box = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || '' },
      o.title ? h('h2', { class: 'modal-title' }, o.title) : null,
      h('div', { class: 'modal-body' }, o.body),
      h('div', { class: 'modal-actions' }, actions)
    );
    var wrap = h('div', { class: 'modal-wrap', onclick: function (e) { if (e.target === wrap) close(); } }, box);
    root.appendChild(wrap);
    document.addEventListener('keydown', onKey);
    var f = box.querySelector('.modal-actions .btn');
    if (f) f.focus();
    return close;
  }

  /* สวิตช์เปิด/ปิด */
  function toggle(label, checked, onChange, desc) {
    var input = h('input', { type: 'checkbox', class: 'switch-input' });
    input.checked = !!checked;
    input.addEventListener('change', function () { onChange(input.checked); });
    return h('label', { class: 'switch-row' },
      h('span', { class: 'switch-text' }, h('span', null, label), desc ? h('small', { class: 'muted' }, desc) : null),
      input, h('span', { class: 'switch', 'aria-hidden': 'true' }));
  }

  /* ปุ่มเลือกแบบแบ่งส่วน */
  function segmented(options, value, onChange, aria) {
    var wrap = h('div', { class: 'seg', role: 'group', 'aria-label': aria || '' });
    options.forEach(function (op) {
      wrap.appendChild(h('button', {
        type: 'button', class: 'seg-btn' + (op.value === value ? ' active' : ''),
        'aria-pressed': op.value === value ? 'true' : 'false',
        onclick: function () { onChange(op.value); }
      }, op.label));
    });
    return wrap;
  }

  /* หน้ารวมเมนู (ใช้กับแถบ ทบทวน / ฝึกพูด / เพิ่มเติม) */
  function hub(root, title, sub, items) {
    root.appendChild(h('h1', { class: 'page-title' }, title));
    if (sub) root.appendChild(h('p', { class: 'muted' }, sub));
    var list = h('div', { class: 'hub' });
    items.forEach(function (it) {
      var ready = !!it.href;
      var inner = [
        h('span', { class: 'hub-ico jp', lang: 'ja', 'aria-hidden': 'true' }, it.icon),
        h('span', { class: 'hub-text' }, h('strong', null, it.title), h('small', { class: 'muted' }, it.desc)),
        ready ? h('span', { class: 'hub-go', 'aria-hidden': 'true' }, '›') : h('span', { class: 'badge' }, 'เฟส ' + it.phase)
      ];
      list.appendChild(ready
        ? h('a', { class: 'hub-item card', href: it.href }, inner)
        : h('div', { class: 'hub-item card disabled', 'aria-disabled': 'true' }, inner));
    });
    root.appendChild(list);
  }

  /* ดาวน์โหลดข้อความเป็นไฟล์ (CSV / JSON) */
  function download(filename, text, mime) {
    try {
      var blob = text instanceof Blob ? text : new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = h('a', { href: url, download: filename, style: 'display:none' });
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
    } catch (e) { toast('ดาวน์โหลดไม่ได้: ' + e.message); }
  }

  /* คัดลอกข้อความ (มีวิธีสำรองสำหรับเบราว์เซอร์ที่ไม่รองรับ clipboard API หรือเปิดจาก file://) */
  function copyText(text, okMsg) {
    function fallback() {
      var ta = h('textarea', { style: 'position:fixed;top:-1000px;opacity:0' });
      ta.value = text; document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      toast(ok ? (okMsg || 'คัดลอกแล้ว') : 'คัดลอกไม่ได้ ลองเลือกข้อความแล้วคัดลอกเอง');
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { toast(okMsg || 'คัดลอกแล้ว'); }, fallback);
      } else fallback();
    } catch (e) { fallback(); }
  }

  NS.ui = { h: h, jp: jp, download: download, copyText: copyText, shuffle: shuffle, toast: toast, speakBtn: speakBtn, modal: modal, toggle: toggle, segmented: segmented, hub: hub };
})();
