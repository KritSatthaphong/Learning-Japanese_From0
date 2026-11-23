/*
 * account.js — หน้าบัญชี: ลงทะเบียน / เข้าสู่ระบบ / ออกจากระบบ / สถานะการซิงก์
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  var STATUS = {
    off: '—', loggedout: 'ยังไม่ได้เข้าสู่ระบบ', syncing: '🔄 กำลังซิงก์…', pending: '🟠 มีข้อมูลรอซิงก์',
    ok: '🟢 ซิงก์แล้ว', paused: '⏸ หยุดซิงก์ชั่วคราว', error: '🔴 ซิงก์ไม่สำเร็จ'
  };

  NS.pages.account = function (root) {
    var C = NS.cloud, tab = 'login', busy = false;

    function render() {
      root.innerHTML = '';
      root.appendChild(h('a', { href: '#/more', class: 'back' }, '← เพิ่มเติม'));
      root.appendChild(h('h1', { class: 'page-title' }, 'บัญชี'));

      if (!C.configured) {
        root.appendChild(h('section', { class: 'card stack-sm' },
          h('p', null, '🔌 ยังไม่ได้เชื่อมต่อระบบบัญชี (Supabase)'),
          h('p', { class: 'muted small' }, 'ตอนนี้แอปเก็บข้อมูลในเครื่องนี้อย่างเดียว ผู้ดูแลแอปต้องใส่ค่า Supabase ในไฟล์ js/config.js ก่อน (ดูวิธีใน README หัวข้อ "ระบบบัญชี")'),
          h('p', { class: 'muted small' }, 'ระหว่างนี้ใช้ ⚙ ตั้งค่า → สำรอง/นำเข้าข้อมูล เพื่อย้ายข้อมูลระหว่างเครื่องได้')));
        return;
      }

      if (C.user) { renderUser(); return; }

      root.appendChild(h('p', { class: 'muted' }, 'เข้าสู่ระบบเพื่อเก็บความคืบหน้าไว้ในบัญชี แล้วเปิดต่อได้ทุกเครื่อง (iPad / มือถือ / คอม)'));
      root.appendChild(NS.ui.segmented([{ value: 'login', label: 'เข้าสู่ระบบ' }, { value: 'signup', label: 'ลงทะเบียน' }], tab,
        function (v) { tab = v; render(); }, 'เลือก'));

      var email = h('input', { type: 'email', class: 'input', autocomplete: 'email', inputmode: 'email', placeholder: 'อีเมล', required: true, 'aria-label': 'อีเมล' });
      var pw = h('input', { type: 'password', class: 'input', autocomplete: tab === 'signup' ? 'new-password' : 'current-password', placeholder: 'รหัสผ่าน (อย่างน้อย 6 ตัว)', required: true, minlength: '6', 'aria-label': 'รหัสผ่าน' });
      var msg = h('div', { 'aria-live': 'polite' });
      var submit = h('button', { class: 'btn btn-primary btn-block btn-lg', type: 'submit' }, tab === 'signup' ? 'ลงทะเบียน' : 'เข้าสู่ระบบ');

      function show(text, cls) { msg.innerHTML = ''; if (text) msg.appendChild(h('p', { class: 'notice ' + (cls || '') }, text)); }

      var form = h('form', { class: 'card stack-sm acct-form', onsubmit: function (e) {
        e.preventDefault();
        if (busy) return;
        if (!email.value.trim() || pw.value.length < 6) { show('กรอกอีเมล และรหัสผ่านอย่างน้อย 6 ตัว', 'warn'); return; }
        busy = true; submit.disabled = true; show('กำลังดำเนินการ…');
        var p = tab === 'signup' ? C.signUp(email.value.trim(), pw.value) : C.signIn(email.value.trim(), pw.value);
        p.then(function (r) {
          if (tab === 'signup' && r && r.needConfirm) show('📧 ส่งอีเมลยืนยันไปที่ ' + email.value.trim() + ' แล้ว เปิดลิงก์ในอีเมล แล้วกลับมาเข้าสู่ระบบ', 'ok');
          else show('');
        }, function (err) { show('⚠️ ' + err.message, 'bad'); })
          .then(function () { busy = false; submit.disabled = false; });
      } },
        h('label', { class: 'field' }, h('span', null, 'อีเมล'), email),
        h('label', { class: 'field' }, h('span', null, 'รหัสผ่าน'), pw),
        submit, msg,
        tab === 'login' ? h('button', { class: 'btn btn-ghost small', type: 'button', onclick: function () {
          if (!email.value.trim()) { show('กรอกอีเมลก่อน แล้วกด "ลืมรหัสผ่าน" อีกครั้ง', 'warn'); return; }
          C.resetPassword(email.value.trim()).then(function () { show('📧 ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้ว', 'ok'); }, function (err) { show('⚠️ ' + err.message, 'bad'); });
        } }, 'ลืมรหัสผ่าน?') : null);
      root.appendChild(form);

      var local = NS.store.get();
      root.appendChild(h('section', { class: 'card stack-sm' },
        h('h2', { class: 'section-title flush' }, 'ข้อมูลในเครื่องตอนนี้'),
        h('p', { class: 'small' }, 'ผ่าน ' + NS.progress.passedCount() + ' ด่าน · XP ' + NS.stats.total() + ' · คัด ' + NS.writeLog.totals().charWrites + ' ครั้ง'),
        h('p', { class: 'muted small' }, 'ถ้าลงทะเบียนบัญชีใหม่ ข้อมูลในเครื่องนี้จะถูกอัปโหลดเข้าบัญชีให้ · ถ้าเข้าสู่ระบบบัญชีที่มีข้อมูลอยู่แล้ว แอปจะถามว่าจะใช้ข้อมูลชุดไหน'),
        NS.demo.isOn() ? h('p', { class: 'notice warn small' }, '⚠️ ตอนนี้เปิดโหมดข้อมูลตัวอย่างอยู่ ข้อมูลตัวอย่างจะไม่ถูกส่งขึ้นบัญชี') : null));
    }

    function renderUser() {
      var u = C.user;
      root.appendChild(h('section', { class: 'card stack-sm acct-user' },
        h('div', { class: 'acct-row' }, h('span', { class: 'acct-avatar', 'aria-hidden': 'true' }, (u.email || '?').slice(0, 1).toUpperCase()),
          h('div', null, h('strong', null, u.email), h('div', { class: 'muted small' }, 'เข้าสู่ระบบอยู่'))),
        h('div', { class: 'acct-status' },
          h('span', null, STATUS[C.status] || C.status),
          C.lastSync ? h('span', { class: 'muted small' }, ' · ล่าสุด ' + C.lastSync.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })) : null),
        C.message ? h('p', { class: 'notice ' + (C.status === 'error' ? 'bad' : 'warn') + ' small' }, C.message) : null,
        h('div', { class: 'row' },
          h('button', { class: 'btn btn-soft', type: 'button', disabled: C.status === 'syncing', onclick: function () { C.syncNow(); } }, '🔄 ซิงก์ตอนนี้'),
          h('button', { class: 'btn btn-ghost', type: 'button', onclick: logout }, '🚪 ออกจากระบบ'))));
      root.appendChild(h('section', { class: 'card stack-sm' },
        h('h2', { class: 'section-title flush' }, 'อะไรบ้างที่ซิงก์'),
        h('ul', { class: 'small acct-list' },
          h('li', null, '✅ ความคืบหน้าทุกด่าน, XP, streak, ทบทวน (SRS), สมุดคำผิด, เด็คของฉัน, Pre/Post Test, ประวัติฝึกพูด, บันทึกการคัด, การตั้งค่า'),
          h('li', null, '✅ ภาพลายมือทุกภาพ'),
          h('li', null, '❌ ไฟล์เสียงที่อัดไว้ (อยู่ในเครื่องเท่านั้น)')),
        h('p', { class: 'muted small' }, 'ซิงก์อัตโนมัติภายในไม่กี่วินาทีหลังมีการเปลี่ยนแปลง · ถ้าใช้ 2 เครื่องพร้อมกัน ข้อมูลที่บันทึกทีหลังจะทับของเดิม · ออกจากระบบแล้วข้อมูลในเครื่องนี้จะถูกล้าง (ยังอยู่ในบัญชี)')));
    }

    function logout() {
      NS.ui.modal({
        title: 'ออกจากระบบ?',
        body: h('p', null, 'แอปจะซิงก์ครั้งสุดท้าย แล้วล้างข้อมูลในเครื่องนี้ (ข้อมูลยังอยู่ในบัญชี เข้าสู่ระบบใหม่เมื่อไหร่ก็ได้คืน)'),
        actions: [
          { label: 'ยกเลิก', cls: 'btn-soft' },
          { label: 'ออกจากระบบ', cls: 'btn-primary', onClick: function () {
            NS.cloud.signOut(false).then(function (r) {
              if (r.ok) { NS.ui.toast('ออกจากระบบแล้ว'); render(); return; }
              NS.ui.modal({
                title: 'ซิงก์ไม่สำเร็จ',
                body: h('div', null, h('p', null, r.message), h('p', { class: 'muted small' }, 'ถ้าออกจากระบบตอนนี้ ข้อมูลล่าสุดที่ยังไม่ได้ซิงก์จะหายจากเครื่องนี้')),
                actions: [
                  { label: 'ยกเลิก', cls: 'btn-soft' },
                  { label: 'ออกเลย', cls: 'btn-danger', onClick: function () { NS.cloud.signOut(true).then(render); } }
                ]
              });
            });
          } }
        ]
      });
    }

    C.onChange(function () { if (!document.body.contains(root) || !root.classList.contains('page-account')) return false; if (!busy) render(); });
    render();
  };
})();
