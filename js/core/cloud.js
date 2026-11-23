/*
 * cloud.js — ระบบบัญชี + ซิงก์ข้อมูลข้ามเครื่องด้วย Supabase
 * ------------------------------------------------------------
 * - ล็อกอินด้วยอีเมล + รหัสผ่าน (Supabase Auth)
 * - ความคืบหน้าทั้งหมด (state ใน store.js) เก็บเป็น JSON 1 แถวต่อบัญชี ในตาราง progress
 * - ภาพลายมือเก็บในตาราง writing_samples (1 แถวต่อ 1 ภาพ)
 * - ทั้งสองตารางเปิด RLS: แต่ละบัญชีเห็นเฉพาะข้อมูลของตัวเอง (ดู supabase/setup.sql)
 * - ซิงก์อัตโนมัติหลังมีการเปลี่ยนแปลง 3 วินาที · ถ้า 2 เครื่องแก้พร้อมกัน ข้อมูลที่บันทึกทีหลังชนะ
 * - ไฟล์เสียงที่อัดไว้ไม่ซิงก์ (อยู่ในเครื่องเท่านั้น)
 * - ระหว่างโหมดข้อมูลตัวอย่าง จะหยุดซิงก์ (ไม่ส่งข้อมูลสมมติขึ้นบัญชี)
 * - ถ้ายังไม่ได้ใส่ค่าใน js/config.js แอปทำงานแบบเดิม (เก็บในเครื่องอย่างเดียว)
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var META_KEY = 'nihongo-cloud-meta';   // { owner: user id, dirty: bool, syncedAt: ISO }
  var BACKUP_KEY = 'nihongo-survival-v1-backup-before-login';
  var cfg = NS.CONFIG || {};

  function meta() { try { return JSON.parse(localStorage.getItem(META_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function setMeta(m) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) { /* ignore */ } }
  function patchMeta(p) { setMeta(Object.assign(meta(), p)); }

  var C = NS.cloud = {
    configured: !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase && window.supabase.createClient),
    client: null,
    user: null,
    status: 'off',     // off | loggedout | syncing | pending | ok | paused | error
    message: '',
    lastSync: null
  };
  var listeners = [];
  var pushTimer = null, sampleTimer = null, busy = false;

  function demoOn() { return !!(NS.demo && NS.demo.isOn()); }

  function errText(e) {
    var m = (e && (e.message || e.error_description || e.msg)) || String(e || '');
    if (/Invalid login credentials/i.test(m)) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    if (/Email not confirmed/i.test(m)) return 'ยังไม่ได้ยืนยันอีเมล — เปิดลิงก์ในอีเมลที่ส่งไปก่อน';
    if (/User already registered/i.test(m)) return 'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน';
    if (/Password should be at least/i.test(m)) return 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร';
    if (/rate limit/i.test(m)) return 'ส่งคำขอบ่อยเกินไป รอสักครู่แล้วลองใหม่';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'เชื่อมต่ออินเทอร์เน็ตไม่ได้';
    if (/relation .* does not exist|Could not find the table/i.test(m)) return 'ยังไม่ได้สร้างตารางใน Supabase (รัน supabase/setup.sql ก่อน)';
    return m || 'เกิดข้อผิดพลาด';
  }

  function setStatus(s, msg) {
    C.status = s; C.message = msg || '';
    updateBadge();
    listeners = listeners.filter(function (fn) { try { return fn() !== false; } catch (e) { return false; } });
  }
  C.onChange = function (fn) { listeners.push(fn); };

  /* ---------- ปุ่มบัญชีที่แถบด้านบน ---------- */
  function updateBadge() {
    var el = document.getElementById('acct');
    if (!el) return;
    el.hidden = !C.configured;
    var dot = el.querySelector('.acct-dot');
    if (dot) dot.className = 'acct-dot s-' + C.status;
    var label = { loggedout: 'บัญชี: ยังไม่ได้เข้าสู่ระบบ', syncing: 'กำลังซิงก์…', pending: 'มีข้อมูลรอซิงก์', ok: 'ซิงก์แล้ว', paused: 'หยุดซิงก์ชั่วคราว', error: 'ซิงก์ไม่สำเร็จ' }[C.status] || 'บัญชี';
    el.setAttribute('aria-label', label + (C.user ? ' (' + C.user.email + ')' : ''));
    el.title = el.getAttribute('aria-label');
  }

  /* ---------- ข้อมูล ---------- */
  function cloudState() { var s = JSON.parse(JSON.stringify(NS.store.get())); delete s.demo; return s; }
  function hasLocalData(s) {
    return Object.keys(s.levels || {}).length || Object.keys(s.xpByDay || {}).length || (s.deck || []).length ||
      Object.keys((s.writeLog && s.writeLog.chars) || {}).length || (s.tests || []).length;
  }
  function backupLocal() { try { localStorage.setItem(BACKUP_KEY, JSON.stringify(NS.store.get())); } catch (e) { /* ignore */ } }

  function applyCloud(row) {
    NS.store.replace(row.data || {});
    if (NS.app) { NS.app.applyTheme(); NS.app.updateBanner(); }
    patchMeta({ dirty: false, syncedAt: row.updated_at });
  }

  async function pushProgress() {
    if (!C.user || demoOn()) return;
    var now = new Date().toISOString();
    var r = await C.client.from('progress').upsert({ user_id: C.user.id, data: cloudState(), updated_at: now });
    if (r.error) throw r.error;
    patchMeta({ owner: C.user.id, dirty: false, syncedAt: now });
    C.lastSync = new Date();
  }

  async function fetchProgress() {
    var r = await C.client.from('progress').select('data, updated_at').eq('user_id', C.user.id).maybeSingle();
    if (r.error) throw r.error;
    return r.data;
  }

  /* ---------- ภาพลายมือ ---------- */
  async function syncSamples() {
    if (!C.user || demoOn()) return;
    var rows = await NS.writeLog._rows();               // ใหม่สุดก่อน
    var pending = rows.filter(function (r) { return !r.cid; }).reverse();
    for (var i = 0; i < pending.length; i += 10) {
      var batch = pending.slice(i, i + 10);
      var ins = await C.client.from('writing_samples').insert(batch.map(function (r) {
        return { kind: r.kind, key: r.key, label: r.label || null, th: r.th || null, score: r.score == null ? null : Math.round(r.score), img: r.img };
      })).select('id');
      if (ins.error) throw ins.error;
      for (var j = 0; j < batch.length; j++) { batch[j].cid = ins.data[j].id; await NS.writeLog._put(batch[j]); }
    }
    var have = {};
    rows.concat(pending).forEach(function (r) { if (r.cid) have[r.cid] = true; });
    var ids = [], from = 0;
    for (;;) {
      var q = await C.client.from('writing_samples').select('id').order('id').range(from, from + 999);
      if (q.error) throw q.error;
      q.data.forEach(function (d) { if (!have[d.id]) ids.push(d.id); });
      if (q.data.length < 1000) break;
      from += 1000;
    }
    for (var k = 0; k < ids.length; k += 20) {
      var got = await C.client.from('writing_samples').select('id, kind, key, label, th, score, img').in('id', ids.slice(k, k + 20)).order('id');
      if (got.error) throw got.error;
      for (var g = 0; g < got.data.length; g++) {
        var d = got.data[g];
        await NS.writeLog._add({ kind: d.kind, key: d.key, label: d.label || '', th: d.th || '', score: d.score, img: d.img, cid: d.id });
      }
    }
  }

  /* ---------- ขั้นตอนหลังเข้าสู่ระบบ ---------- */
  function askConflict() {
    return new Promise(function (resolve) {
      NS.ui.modal({
        title: 'ใช้ข้อมูลชุดไหน?',
        body: h('div', null,
          h('p', null, 'ในบัญชีนี้มีความคืบหน้าอยู่แล้ว และในเครื่องนี้ก็มีความคืบหน้าที่ยังไม่ได้ผูกกับบัญชี'),
          h('p', { class: 'muted small' }, 'ข้อมูลชุดที่ไม่ได้เลือกจะถูกสำรองไว้ในเครื่อง (ไม่หายทันที)')),
        actions: [
          { label: 'ใช้ข้อมูลในบัญชี', cls: 'btn-primary', onClick: function () { resolve('cloud'); } },
          { label: 'อัปโหลดข้อมูลในเครื่องแทน', cls: 'btn-soft', onClick: function () { resolve('local'); } }
        ],
        onClose: function () { resolve('cloud'); }
      });
    });
  }

  async function afterLogin() {
    if (busy) return;
    busy = true;
    try {
      if (demoOn()) { setStatus('paused', 'หยุดซิงก์ระหว่างโหมดข้อมูลตัวอย่าง'); return; }
      setStatus('syncing');
      var uid = C.user.id, m = meta();
      var cloud = await fetchProgress();
      if (m.owner === uid) {
        if (m.dirty || !cloud) await pushProgress();
        else if (!m.syncedAt || new Date(cloud.updated_at) > new Date(m.syncedAt)) applyCloud(cloud);
      } else if (m.owner && m.owner !== uid) {
        // ข้อมูลในเครื่องเป็นของบัญชีอื่น (อีกคนไม่ได้ออกจากระบบ) → สำรองไว้ แล้วใช้ข้อมูลของบัญชีนี้
        backupLocal();
        await NS.writeLog.clearSamples();
        if (cloud) applyCloud(cloud); else { NS.store.reset(); patchMeta({ owner: uid }); await pushProgress(); }
      } else if (!cloud) {
        await pushProgress();                                   // บัญชีใหม่: ใช้ข้อมูลในเครื่อง
      } else if (!hasLocalData(NS.store.get())) {
        applyCloud(cloud);                                      // เครื่องใหม่: ดึงจากบัญชี
      } else if ((await askConflict()) === 'cloud') {
        backupLocal();
        await NS.writeLog.clearSamples();
        applyCloud(cloud);
      } else {
        await pushProgress();
      }
      patchMeta({ owner: uid });
      await syncSamples();
      C.lastSync = new Date();
      setStatus('ok');
      NS.srs && NS.srs.sync();
      NS.router.refresh();
    } catch (e) {
      setStatus('error', errText(e));
    } finally {
      busy = false;
    }
  }

  /* ---------- ซิงก์อัตโนมัติ ---------- */
  C.markDirty = function () {
    if (!C.user) return;
    patchMeta({ dirty: true });
    if (demoOn()) { setStatus('paused', 'หยุดซิงก์ระหว่างโหมดข้อมูลตัวอย่าง'); return; }
    if (C.status !== 'syncing') setStatus('pending');
    clearTimeout(pushTimer);
    pushTimer = setTimeout(C.syncNow, 3000);
  };

  C.queueSamples = function () {
    if (!C.user || demoOn()) return;
    clearTimeout(sampleTimer);
    sampleTimer = setTimeout(function () {
      syncSamples().then(function () { if (C.status !== 'pending') setStatus('ok'); }, function (e) { setStatus('error', errText(e)); });
    }, 2000);
  };

  C.deleteSample = function (cid) {
    if (!C.user || demoOn()) return;
    C.client.from('writing_samples').delete().eq('id', cid).then(function (r) { if (r.error) setStatus('error', errText(r.error)); });
  };

  C.syncNow = async function () {
    if (!C.user) return;
    if (demoOn()) { setStatus('paused', 'หยุดซิงก์ระหว่างโหมดข้อมูลตัวอย่าง'); return; }
    clearTimeout(pushTimer);
    setStatus('syncing');
    try {
      if (meta().dirty) await pushProgress();
      else {
        var cloud = await fetchProgress();
        if (cloud && (!meta().syncedAt || new Date(cloud.updated_at) > new Date(meta().syncedAt))) { applyCloud(cloud); NS.router.refresh(); }
        else if (!cloud) await pushProgress();
      }
      await syncSamples();
      C.lastSync = new Date();
      setStatus(meta().dirty ? 'pending' : 'ok');
    } catch (e) {
      setStatus('error', errText(e));
    }
  };

  /* ---------- บัญชี ---------- */
  function redirectUrl() { return location.origin + location.pathname; }

  C.signUp = async function (email, password) {
    var r = await C.client.auth.signUp({ email: email, password: password, options: { emailRedirectTo: redirectUrl() } });
    if (r.error) throw new Error(errText(r.error));
    return { needConfirm: !r.data.session };
  };

  C.signIn = async function (email, password) {
    var r = await C.client.auth.signInWithPassword({ email: email, password: password });
    if (r.error) throw new Error(errText(r.error));
  };

  C.resetPassword = async function (email) {
    var r = await C.client.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() });
    if (r.error) throw new Error(errText(r.error));
  };

  /* ออกจากระบบ: ซิงก์ครั้งสุดท้าย แล้วล้างข้อมูลในเครื่อง (คนถัดไปที่ใช้เครื่องจะไม่เห็นข้อมูลของบัญชีนี้) */
  C.signOut = async function (force) {
    if (!force && C.user && !demoOn()) {
      try { await pushProgress(); await syncSamples(); }
      catch (e) { return { ok: false, message: errText(e) }; }
    }
    clearTimeout(pushTimer); clearTimeout(sampleTimer);
    try { await C.client.auth.signOut(); } catch (e) { /* ignore */ }
    C.user = null;
    setMeta({});
    NS.store.reset();
    await NS.writeLog.clearSamples();
    if (NS.audioDB) await NS.audioDB.clear();
    if (NS.app) { NS.app.applyTheme(); NS.app.updateBanner(); }
    setStatus('loggedout');
    return { ok: true };
  };

  function showNewPassword() {
    var pw = h('input', { type: 'password', class: 'input', autocomplete: 'new-password', placeholder: 'รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)' });
    NS.ui.modal({
      title: 'ตั้งรหัสผ่านใหม่',
      body: h('div', { class: 'stack-sm' }, pw),
      actions: [
        { label: 'ยกเลิก', cls: 'btn-soft' },
        { label: 'บันทึก', cls: 'btn-primary', onClick: function () {
          C.client.auth.updateUser({ password: pw.value }).then(function (r) {
            NS.ui.toast(r.error ? errText(r.error) : 'เปลี่ยนรหัสผ่านแล้ว');
          });
        } }
      ]
    });
  }

  /* ลิงก์จากอีเมล (ยืนยันอีเมล / ลืมรหัสผ่าน) จะกลับมาพร้อม #access_token=… หรือ #error=… */
  function cleanAuthHash(onlyErrors) {
    var hs = location.hash || '';
    if (!/access_token=|error=|error_description=|type=recovery/.test(hs)) return;
    if (onlyErrors && !/error=|error_description=/.test(hs)) return;   // access_token ให้ supabase-js อ่านก่อน
    var p = new URLSearchParams(hs.replace(/^#\/?/, ''));
    if (p.get('error_description')) NS.ui.toast('ลิงก์ใช้ไม่ได้: ' + p.get('error_description').replace(/\+/g, ' '));
    history.replaceState(null, '', location.pathname + '#/account');
    NS.router.refresh();
  }

  C.init = function () {
    if (!C.configured) { setStatus('off'); return; }
    try {
      C.client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit', storageKey: 'nihongo-auth' }
      });
    } catch (e) {
      C.configured = false; setStatus('off', errText(e)); return;
    }
    setStatus('loggedout');
    C.client.auth.onAuthStateChange(function (event, session) {
      var u = session ? session.user : null;
      var changed = !!u !== !!C.user || (u && C.user && u.id !== C.user.id);
      C.user = u;
      // ห้ามเรียก Supabase ตรงๆ ใน callback นี้ (ตามคำแนะนำของ supabase-js) จึงเลื่อนไปทำทีหลัง
      setTimeout(function () {
        if (event === 'PASSWORD_RECOVERY') showNewPassword();
        if (u && changed) afterLogin();
        else if (!u) setStatus('loggedout');
        cleanAuthHash();
      }, 0);
    });
    // ลิงก์ผิดพลาด (เช่น ลิงก์หมดอายุ) ล้างได้ทันที · ลิงก์ที่มี access_token รอให้ supabase-js อ่านก่อน (ล้างใน callback ด้านบน)
    setTimeout(function () { cleanAuthHash(true); }, 0);
    window.addEventListener('hashchange', function () { cleanAuthHash(true); });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden' && C.user && meta().dirty && !demoOn()) C.syncNow();
    });
  };
})();
