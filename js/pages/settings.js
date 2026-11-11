/*
 * settings.js — หน้าตั้งค่า: เสียง, เป้า XP, เปิดทุกด่าน, ธีม, ข้อมูลตัวอย่าง, สำรอง/นำเข้า, ล้างข้อมูล
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;

  function voiceStatus() {
    var s = NS.speech.status();
    if (s === 'ok') return h('p', { class: 'notice ok' }, '✅ พบเสียงภาษาญี่ปุ่น: ' + NS.speech.voiceName());
    if (s === 'checking') return h('p', { class: 'notice' }, '⏳ กำลังตรวจหาเสียงภาษาญี่ปุ่น…');
    if (s === 'unknown') return h('p', { class: 'notice' }, 'ℹ️ เบราว์เซอร์ไม่บอกรายชื่อเสียง ลองกด "ทดสอบเสียง" ถ้าไม่มีเสียง ดูวิธีแก้ด้านล่าง');
    if (s === 'unsupported') return h('p', { class: 'notice bad' }, '⚠️ เบราว์เซอร์นี้อ่านออกเสียงไม่ได้ แนะนำ Google Chrome');
    return h('p', { class: 'notice warn' }, '⚠️ ไม่พบเสียงภาษาญี่ปุ่นในเครื่อง ดูวิธีแก้ด้านล่าง');
  }

  NS.pages.settings = function (root) {
    var st = NS.store.settings();
    root.appendChild(h('a', { href: '#/more', class: 'back' }, '← เพิ่มเติม'));
    root.appendChild(h('h1', { class: 'page-title' }, 'ตั้งค่า'));

    /* เสียง */
    var rateOut = h('output', { class: 'rate-out' }, st.rate.toFixed(2) + 'x');
    var range = h('input', { type: 'range', min: '0.5', max: '1.3', step: '0.05', value: String(st.rate), 'aria-label': 'ความเร็วเสียง' });
    range.addEventListener('input', function () { rateOut.textContent = Number(range.value).toFixed(2) + 'x'; });
    range.addEventListener('change', function () { NS.store.setSetting('rate', Number(range.value)); });
    var statusBox = h('div', null, voiceStatus());
    NS.speech.onChange(function () { if (document.body.contains(statusBox)) { statusBox.innerHTML = ''; statusBox.appendChild(voiceStatus()); } });

    root.appendChild(h('section', { class: 'card settings-sec' },
      h('h2', null, '🔊 เสียง'),
      statusBox,
      h('label', { class: 'field' }, h('span', null, 'ความเร็วเสียง ', rateOut), range,
        h('small', { class: 'muted' }, 'ช้า 0.5x ← → เร็ว 1.3x (ปกติ 1.0x)')),
      h('div', { class: 'row' },
        h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { NS.store.setSetting('rate', Number(range.value)); NS.speech.speak('こんにちは。にほんごを べんきょうします。'); } }, '▶ ทดสอบเสียง')),
      NS.app.voiceHelp()));

    /* การเรียน */
    root.appendChild(h('section', { class: 'card settings-sec' },
      h('h2', null, '📚 การเรียน'),
      NS.ui.toggle('เปิดทุกด่าน', st.unlockAll, function (v) { NS.store.setSetting('unlockAll', v); NS.ui.toast(v ? 'เปิดทุกด่านแล้ว' : 'กลับไปใช้ระบบปลดล็อกตามลำดับ'); },
        'สำหรับคนที่เรียนมาแล้ว หรืออยากลองด่านไหนก่อนก็ได้'),
      h('div', { class: 'field' }, h('span', null, 'เป้า XP ต่อวัน'), NS.stats.goalPicker(function (v) { NS.ui.toast('ตั้งเป้าเป็น ' + v + ' XP ต่อวัน'); }),
        h('small', { class: 'muted' }, 'ตอบถูก 1 ข้อ = 10 XP · ดูปฏิทินได้ที่ เพิ่มเติม → ปฏิทินการเรียน'))));

    /* หน้าจอ */
    root.appendChild(h('section', { class: 'card settings-sec' },
      h('h2', null, '🎨 หน้าจอ'),
      h('div', { class: 'field' }, h('span', null, 'ธีมสี'),
        NS.ui.segmented([
          { value: 'auto', label: 'ตามเครื่อง' },
          { value: 'light', label: 'สว่าง' },
          { value: 'dark', label: 'มืด' }
        ], st.theme, function (v) { NS.store.setSetting('theme', v); NS.app.applyTheme(); NS.router.refresh(); }, 'ธีมสี'))));

    /* ข้อมูลตัวอย่าง */
    var demoOn = NS.demo.isOn();
    root.appendChild(h('section', { class: 'card settings-sec' },
      h('h2', null, '🧪 ข้อมูลตัวอย่าง (สำหรับสาธิต)'),
      h('p', { class: 'muted small' }, 'โหลดข้อมูลสมมติ: เรียนทุกวัน 20 ส.ค. – 10 พ.ย. 2026 และผ่านทุกด่าน เพื่อดูว่าหน้าสถิติ ปฏิทิน และ streak แสดงผลอย่างไร ระหว่างนี้จะมีแถบ "ข้อมูลตัวอย่าง" แสดงตลอด ข้อมูลจริงจะถูกสำรองไว้และได้คืนเมื่อออกจากโหมด'),
      demoOn
        ? h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { NS.demo.clear(); NS.app.updateBanner(); NS.ui.toast('กลับสู่ข้อมูลจริงแล้ว'); NS.router.refresh(); } }, '↩ ออกจากโหมดตัวอย่าง (คืนข้อมูลจริง)')
        : h('button', { class: 'btn btn-soft', type: 'button', onclick: function () {
            NS.ui.modal({
              title: 'โหลดข้อมูลตัวอย่าง?',
              body: h('div', null, h('p', null, 'ข้อมูลจริงตอนนี้จะถูกสำรองไว้ แล้วแทนที่ด้วยข้อมูลสมมติชั่วคราว'), h('p', { class: 'muted small' }, 'กด "ออกจากโหมดตัวอย่าง" เมื่อไหร่ก็ได้เพื่อคืนข้อมูลจริง')),
              actions: [
                { label: 'ยกเลิก', cls: 'btn-soft' },
                { label: 'โหลดข้อมูลตัวอย่าง', cls: 'btn-primary', onClick: function () { NS.demo.load(); NS.app.updateBanner(); NS.ui.toast('โหลดข้อมูลตัวอย่างแล้ว'); NS.router.go('#/home'); } }
              ]
            });
          } }, '🧪 โหลดข้อมูลตัวอย่าง')));

    /* ข้อมูล */
    var fileIn = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
    fileIn.addEventListener('change', function () { importAll(fileIn.files[0]); fileIn.value = ''; });
    root.appendChild(h('section', { class: 'card settings-sec' },
      h('h2', null, '💾 ข้อมูล'),
      h('p', { class: 'muted small' }, 'ความคืบหน้าทั้งหมดเก็บอยู่ในเบราว์เซอร์ของเครื่องนี้เท่านั้น ไม่ได้ส่งไปที่ไหน ใช้ปุ่มด้านล่างสำรองเป็นไฟล์ หรือย้ายไปเครื่องอื่น (ไฟล์เสียงที่อัดไว้ไม่รวมอยู่ในไฟล์สำรอง)'),
      h('div', { class: 'row' },
        h('button', { class: 'btn btn-soft', type: 'button', onclick: exportAll }, '⬇ สำรองข้อมูล (JSON)'),
        h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { fileIn.click(); } }, '⬆ นำเข้าข้อมูล'),
        fileIn),
      NS.store.isOk() ? null : h('p', { class: 'notice warn' }, '⚠️ เบราว์เซอร์นี้บันทึกข้อมูลไม่ได้ ความคืบหน้าจะหายเมื่อปิดหน้า'),
      h('button', { class: 'btn btn-danger', type: 'button', onclick: function () {
        NS.ui.modal({
          title: 'ล้างข้อมูลทั้งหมด?',
          body: h('div', null, h('p', null, 'ความคืบหน้า ดาว และสถิติทั้งหมดจะถูกลบ และกู้คืนไม่ได้'), h('p', { class: 'muted small' }, 'การตั้งค่าจะกลับเป็นค่าเริ่มต้นด้วย')),
          actions: [
            { label: 'ยกเลิก', cls: 'btn-soft' },
            { label: 'ลบทั้งหมด', cls: 'btn-danger', onClick: function () { NS.store.reset(); NS.app.applyTheme(); NS.ui.toast('ล้างข้อมูลแล้ว'); NS.router.go('#/home'); } }
          ]
        });
      } }, '🗑 ล้างข้อมูลทั้งหมด')));

    root.appendChild(h('p', { class: 'muted small center' }, 'Nihongo Survival · เว็บแอปเรียนภาษาญี่ปุ่น · สร้างร่วมกับ AI (Claude Code)'));

    function exportAll() {
      var data = { app: 'nihongo-survival', type: 'backup', exportedAt: new Date().toISOString(), state: NS.store.get() };
      NS.ui.download('nihongo-backup-' + NS.store.today() + '.json', JSON.stringify(data, null, 1), 'application/json');
    }
    function importAll(file) {
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var data;
        try { data = JSON.parse(reader.result); } catch (e) { NS.ui.toast('ไฟล์ไม่ใช่ JSON ที่ถูกต้อง'); return; }
        var st = data && data.state;
        if (!data || data.app !== 'nihongo-survival' || !st || typeof st !== 'object' || typeof st.levels !== 'object') {
          NS.ui.toast('ไฟล์นี้ไม่ใช่ไฟล์สำรองของ Nihongo Survival'); return;
        }
        NS.ui.modal({
          title: 'นำเข้าข้อมูล?',
          body: h('div', null, h('p', null, 'ข้อมูลปัจจุบันในเครื่องนี้จะถูกแทนที่ด้วยข้อมูลในไฟล์'), h('p', { class: 'muted small' }, 'ไฟล์สำรองเมื่อ ' + (data.exportedAt || '-').slice(0, 10) + (st.demo ? ' · ⚠️ ไฟล์นี้เป็นข้อมูลตัวอย่าง' : ''))),
          actions: [
            { label: 'ยกเลิก', cls: 'btn-soft' },
            { label: 'นำเข้า', cls: 'btn-primary', onClick: function () { NS.store.replace(st); NS.app.applyTheme(); NS.app.updateBanner(); NS.ui.toast('นำเข้าข้อมูลแล้ว'); NS.router.go('#/home'); } }
          ]
        });
      };
      reader.readAsText(file);
    }
  };
})();
