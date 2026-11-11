/*
 * report.js — สรุปรายงานสำหรับ PGP (หน้าเดียว คัดลอกเป็นข้อความ / ดาวน์โหลด CSV ได้)
 */
(function () {
  'use strict';
  var NS = window.NS = window.NS || {};
  var h = NS.ui.h;
  var STAGE_NAMES = { 1: 'ขั้น 1 ฮิรางานะ', 2: 'ขั้น 2 คาตากานะ', 3: 'ขั้น 3 คำศัพท์', 4: 'ขั้น 4 รูปประโยค', 5: 'ขั้น 5 สถานการณ์จริง',
    pairs: 'ฝึกฟังแยกเสียง', review: 'ทบทวน (SRS/คำผิด)', game: 'เกมจับคู่', speak: 'ฝึกพูด (ตรง ≥ 80%)' };

  function collect() {
    var s = NS.store.get(), P = NS.progress, S = NS.stats;
    var main = P.main();
    var passed = main.filter(function (l) { return P.isPassed(l.id); });
    var byExam = passed.filter(function (l) { return s.levels[l.id].by === 'exam'; }).length;
    var days = Object.keys(s.xpByDay).filter(function (k) { return s.xpByDay[k] > 0; }).sort();
    var acc = Object.keys(STAGE_NAMES).map(function (k) {
      var b = s.stats.byStage[k];
      return { key: k, name: STAGE_NAMES[k], answered: b ? b.answered : 0, correct: b ? b.correct : 0, pct: b && b.answered ? Math.round(b.correct / b.answered * 100) : null };
    });
    var missed = Object.keys(s.missTally).map(function (id) { return { id: id, n: s.missTally[id], it: NS.content.itemById(id) }; })
      .filter(function (x) { return x.it; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 10);
    var pre = NS.prepost.latest('Pre'), post = NS.prepost.latest('Post');
    var speak = s.speakHistory;
    return {
      demo: !!s.demo,
      today: NS.store.today(),
      firstDay: days[0] || '-', lastDay: days[days.length - 1] || '-',
      passed: passed.length, total: main.length, byExam: byExam,
      xp: S.total(), daysStudied: days.length, bestStreak: S.bestStreak(), streak: S.streak(),
      accuracy: s.stats.answered ? Math.round(s.stats.correct / s.stats.answered * 100) : null,
      answered: s.stats.answered,
      acc: acc, missed: missed, pre: pre, post: post,
      deck: s.deck.length, srsItems: Object.keys(s.srs).length,
      speakCount: speak.length, speakMatch: speak.filter(function (x) { return x.verdict === 'match'; }).length,
      gameBest: s.gameBest
    };
  }

  function pctText(t, key) { return t ? NS.prepost.pct(t[key]) + '% (' + t[key].c + '/' + t[key].t + ')' : '-'; }

  function asText(d) {
    var L = [];
    L.push('สรุปผลการเรียนภาษาญี่ปุ่นด้วยแอป Nihongo Survival' + (d.demo ? ' [ข้อมูลตัวอย่าง — ไม่ใช่ผลการเรียนจริง]' : ''));
    L.push('วันที่สรุป: ' + d.today + ' · ช่วงที่เรียน: ' + d.firstDay + ' ถึง ' + d.lastDay);
    L.push('');
    L.push('ด่านที่ผ่าน: ' + d.passed + '/' + d.total + (d.byExam ? ' (ผ่านด้วยการสอบข้ามขั้น ' + d.byExam + ' ด่าน)' : ''));
    L.push('XP รวม: ' + d.xp + ' · จำนวนวันที่เรียน: ' + d.daysStudied + ' วัน · streak สูงสุด: ' + d.bestStreak + ' วัน');
    L.push('ความแม่นยำรวม: ' + (d.accuracy == null ? '-' : d.accuracy + '%') + ' จาก ' + d.answered + ' ข้อ');
    L.push('');
    L.push('ความแม่นยำแยกตามส่วน:');
    d.acc.forEach(function (a) { if (a.answered) L.push('- ' + a.name + ': ' + a.pct + '% (' + a.correct + '/' + a.answered + ')'); });
    L.push('');
    L.push('Pre vs Post Test:');
    L.push('- อ่านตัวอักษร: Pre ' + pctText(d.pre, 'p1') + ' → Post ' + pctText(d.post, 'p1'));
    L.push('- ฟัง: Pre ' + pctText(d.pre, 'p2') + ' → Post ' + pctText(d.post, 'p2'));
    L.push('- พูด: Pre ' + pctText(d.pre, 'p3') + ' → Post ' + pctText(d.post, 'p3'));
    L.push('');
    L.push('10 คำที่ผิดบ่อยที่สุด:');
    if (!d.missed.length) L.push('- (ยังไม่มี)');
    d.missed.forEach(function (x, i) { L.push((i + 1) + '. ' + x.it.char + ' (' + [x.it.label, x.it.th].filter(Boolean).join(' / ') + ') ผิด ' + x.n + ' ครั้ง'); });
    L.push('');
    L.push('ฝึกพูด: ' + d.speakCount + ' ครั้ง (ตรง ' + d.speakMatch + ' ครั้ง) · วลีในเด็คของฉัน: ' + d.deck + ' วลี · รายการในระบบทบทวน: ' + d.srsItems);
    return L.join('\n');
  }

  function asCsv(d) {
    var rows = [['metric', 'value']];
    function add(k, v) { rows.push([k, v == null ? '' : v]); }
    add('demo_data', d.demo ? 'yes' : 'no');
    add('report_date', d.today); add('first_study_day', d.firstDay); add('last_study_day', d.lastDay);
    add('levels_passed', d.passed); add('levels_total', d.total); add('levels_passed_by_exam', d.byExam);
    add('xp_total', d.xp); add('days_studied', d.daysStudied); add('best_streak', d.bestStreak);
    add('accuracy_pct', d.accuracy); add('answered', d.answered);
    d.acc.forEach(function (a) { add('accuracy_' + a.key, a.pct); add('answered_' + a.key, a.answered); });
    ['p1', 'p2', 'p3'].forEach(function (k, i) {
      var n = ['read', 'listen', 'speak'][i];
      add('pre_' + n + '_pct', d.pre ? NS.prepost.pct(d.pre[k]) : null);
      add('post_' + n + '_pct', d.post ? NS.prepost.pct(d.post[k]) : null);
    });
    d.missed.forEach(function (x, i) { add('most_missed_' + (i + 1), x.it.char + ' (' + x.n + ')'); });
    add('speak_attempts', d.speakCount); add('speak_match', d.speakMatch);
    add('deck_phrases', d.deck); add('srs_items', d.srsItems);
    return rows.map(function (r) { return r.map(function (c) { c = String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n');
  }

  NS.pages.report = function (root) {
    var d = collect();
    root.appendChild(h('a', { href: '#/more', class: 'back no-print' }, '← เพิ่มเติม'));
    root.appendChild(h('h1', { class: 'page-title' }, 'สรุปรายงาน PGP', d.demo ? h('span', { class: 'badge demo-badge' }, 'ข้อมูลตัวอย่าง') : null));
    root.appendChild(h('p', { class: 'muted' }, 'วันที่สรุป ' + d.today + ' · ช่วงที่เรียน ' + d.firstDay + ' ถึง ' + d.lastDay));
    root.appendChild(h('div', { class: 'row no-print' },
      h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { NS.ui.copyText(asText(d), 'คัดลอกสรุปแล้ว'); } }, '📋 คัดลอกเป็นข้อความ'),
      h('button', { class: 'btn btn-soft', type: 'button', onclick: function () { NS.ui.download('nihongo-report-' + d.today + '.csv', '﻿' + asCsv(d), 'text/csv;charset=utf-8'); } }, '⬇ ดาวน์โหลด CSV'),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: function () { window.print(); } }, '🖨 พิมพ์')));

    root.appendChild(h('div', { class: 'tiles tiles-4 report-tiles' },
      tile('ด่านที่ผ่าน', d.passed + '/' + d.total, d.byExam ? 'สอบข้าม ' + d.byExam + ' ด่าน' : null),
      tile('XP รวม', d.xp),
      tile('วันที่เรียน', d.daysStudied + ' วัน', 'streak สูงสุด ' + d.bestStreak + ' วัน'),
      tile('ความแม่นยำรวม', d.accuracy == null ? '–' : d.accuracy + '%', d.answered + ' ข้อ')));

    root.appendChild(h('section', { class: 'card' }, h('h2', { class: 'section-title flush' }, 'ความแม่นยำแยกตามส่วน'),
      h('table', { class: 'pp-table report-acc' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'ส่วน'), h('th', { scope: 'col' }, 'ข้อ'), h('th', { scope: 'col' }, 'ความแม่นยำ'))),
        h('tbody', null, d.acc.filter(function (a) { return a.answered; }).map(function (a) {
          return h('tr', null, h('td', null, a.name), h('td', null, a.correct + '/' + a.answered),
            h('td', null, h('span', { class: 'meter' }, h('span', { style: 'width:' + a.pct + '%' })), ' ' + a.pct + '%'));
        }))),
      d.acc.some(function (a) { return a.answered; }) ? null : h('p', { class: 'muted small' }, 'ยังไม่มีข้อมูล')));

    root.appendChild(h('section', { class: 'card' }, h('h2', { class: 'section-title flush' }, 'Pre vs Post Test'),
      d.pre || d.post ? h('table', { class: 'pp-table' },
        h('thead', null, h('tr', null, ['', 'Pre', 'Post', 'เปลี่ยนแปลง'].map(function (x) { return h('th', { scope: 'col' }, x); }))),
        h('tbody', null, [['อ่านตัวอักษร', 'p1'], ['ฟัง', 'p2'], ['พูด', 'p3']].map(function (r) {
          var a = d.pre ? NS.prepost.pct(d.pre[r[1]]) : null, b = d.post ? NS.prepost.pct(d.post[r[1]]) : null;
          return h('tr', null, h('td', null, r[0]), h('td', null, pctText(d.pre, r[1])), h('td', null, pctText(d.post, r[1])),
            h('td', null, a != null && b != null ? (b - a >= 0 ? '+' : '') + (b - a) + '%' : '-'));
        })))
        : h('p', { class: 'muted small' }, 'ยังไม่ได้ทำ Pre/Post Test (เพิ่มเติม → Pre/Post Test)')));

    root.appendChild(h('section', { class: 'card' }, h('h2', { class: 'section-title flush' }, '10 คำที่ผิดบ่อยที่สุด'),
      d.missed.length ? h('ol', { class: 'report-missed' }, d.missed.map(function (x) {
        return h('li', null, NS.ui.jp(x.it.char), ' ', h('span', { class: 'muted small' }, [x.it.label, x.it.th].filter(Boolean).join(' · ')), ' — ผิด ' + x.n + ' ครั้ง');
      })) : h('p', { class: 'muted small' }, 'ยังไม่มีข้อมูล')));

    root.appendChild(h('section', { class: 'card' }, h('h2', { class: 'section-title flush' }, 'อื่นๆ'),
      h('ul', null,
        h('li', null, 'ฝึกพูด ' + d.speakCount + ' ครั้ง · ตรง ' + d.speakMatch + ' ครั้ง'),
        h('li', null, 'วลีในเด็คของฉัน ' + d.deck + ' วลี'),
        h('li', null, 'รายการในระบบทบทวนตามรอบ ' + d.srsItems + ' รายการ'),
        h('li', null, 'เกมจับคู่ คะแนนสูงสุด: ' + (Object.keys(d.gameBest).map(function (k) { return { hira: 'ฮิรางานะ', kata: 'คาตากานะ', vocab: 'คำศัพท์' }[k] + ' ' + d.gameBest[k]; }).join(', ') || '-')))));

    function tile(label, value, sub) {
      return h('div', { class: 'tile card' }, h('small', { class: 'muted' }, label), h('strong', null, String(value)), sub ? h('small', { class: 'muted' }, sub) : null);
    }
  };

  NS.report = { collect: collect, asText: asText, asCsv: asCsv };
})();
