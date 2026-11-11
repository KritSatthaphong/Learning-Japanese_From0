# Nihongo Survival 日本語

เว็บแอปเรียนภาษาญี่ปุ่นจากศูนย์ แบบเส้นทางเรียนมีไกด์ (Guided Path) ตั้งแต่ตัวอักษรไปจนถึงประโยคเอาตัวรอด
ผลงานประกอบรายงานวิชา ME Portfolio — หัวข้อ "เรียนภาษาญี่ปุ่นแบบเร่งรัดด้วย AI และ Digital Tools"

*A guided web app for learning Japanese from zero — from kana to survival phrases. (English below.)*

---

## ภาษาไทย

### แอปทำอะไรได้บ้าง
| แถบเมนู | ฟีเจอร์ |
|---|---|
| **学 เรียน** | เส้นทางเรียน 5 ขั้น 33 ด่าน (ฮิรางานะ → คาตากานะ → คำศัพท์ → รูปประโยค → สถานการณ์จริง) + ด่านเสริมฟังแยกเสียง แต่ละด่านมี เรียน → แบบฝึกหัด 10 ข้อ → ผลลัพธ์ (ผ่าน ≥ 80%, ดาว 1–3) · XP, streak, เป้าหมายรายวัน · สอบข้ามขั้น |
| **復 ทบทวน** | ทบทวนตามรอบ (SRS Leitner 5 กล่อง: 1/2/4/7/14 วัน) · สมุดคำผิด · ฟังแยกเสียงที่คล้ายกัน (minimal pairs) · เกมจับคู่จับเวลา 60 วินาที |
| **あ ตัวอักษร** | ตาราง 五十音 / เสียงขุ่น / เสียงควบ สลับ ひらがな・カタカナ กดฟังเสียง + ทริคจำภาษาไทย พิมพ์ลง A4 ได้ · ฝึกเขียนด้วยนิ้ว/เมาส์ |
| **話 ฝึกพูด** | Speaking Check (พูดใส่ไมค์แล้วแอปตรวจ) + อัดเสียงตัวเองฟังเทียบ · Phrasebook 60 วลี · Prompt Library ให้ ChatGPT/Claude โหมดเสียงเล่นบทบาทคุยด้วย |
| **⋯ เพิ่มเติม** | เด็คของฉัน (เพิ่มวลีเอง) · Pre/Post Test พร้อมกราฟและ CSV · ปฏิทินการเรียน (heatmap) · สรุปรายงาน PGP · ตั้งค่า (สำรอง/นำเข้าข้อมูล, ข้อมูลตัวอย่าง) |

- ใช้ **Web Speech API** ที่มีในเบราว์เซอร์ (อ่านออกเสียง `speechSynthesis` / ถอดเสียง `SpeechRecognition`) และ `MediaRecorder` อัดเสียง — **ไม่ใช้ API key ไม่มีค่าใช้จ่าย**
- เก็บข้อมูลใน **localStorage** และไฟล์เสียงใน **IndexedDB** ของเบราว์เซอร์เท่านั้น ไม่มีเซิร์ฟเวอร์ ไม่ส่งข้อมูลไปที่ไหน
- หน้าจอภาษาไทย ออกแบบสำหรับมือถือ รองรับ dark mode

### วิธีรัน
แอปเป็นเว็บแบบ static (HTML + CSS + JavaScript ล้วน ไม่ต้อง build) เลือกวิธีใดวิธีหนึ่ง:

1. **ง่ายที่สุด:** ดับเบิลคลิก `index.html` เปิดด้วย Google Chrome
   ใช้ได้เกือบทุกอย่าง *ยกเว้น* ฝึกพูดกับไมค์ (Chrome มักไม่ให้ใช้ไมค์กับไฟล์ `file://`)
2. **VS Code:** ติดตั้งส่วนขยาย *Live Server* → คลิกขวาที่ `index.html` → **Open with Live Server**
3. **มี Node.js:** เปิด Command Prompt ในโฟลเดอร์นี้ แล้วพิมพ์ `npx serve` → เปิดลิงก์ที่ขึ้น (เช่น http://localhost:3000)
4. **มี Python:** `python -m http.server 8000` → เปิด http://localhost:8000
5. **GitHub Pages:** เปิดจากลิงก์ https ของ repo นี้ (ไมค์ใช้ได้)

> ไม่มีเสียงภาษาญี่ปุ่น? ใช้ Chrome หรือ Edge หรือติดตั้งเสียงญี่ปุ่นในเครื่อง (ดูวิธีในแอป: ⚙ ตั้งค่า → เสียง)

### แก้เนื้อหาเอง
ข้อมูลบทเรียนแยกอยู่ในโฟลเดอร์ `data/` เป็นไฟล์ `.js` ที่มีคำอธิบายภาษาไทยด้านบน แก้ด้วย Notepad / VS Code ได้เลย
| ไฟล์ | เนื้อหา |
|---|---|
| `data/kana.js` | ฮิรางานะ/คาตากานะ + ทริคจำ (`tipH`, `tipK`) + คำที่มี っ และคำทับศัพท์ |
| `data/path.js` | โครงเส้นทางเรียน 5 ขั้น 33 ด่าน |
| `data/vocab.js` | คำศัพท์ขั้น 3 (70 คำ) |
| `data/grammar.js` | รูปประโยคขั้น 4 (คำอธิบาย + 48 ประโยค) |
| `data/phrases.js` | วลีเอาตัวรอดขั้น 5 (60 วลี) ใช้ใน Phrasebook และฝึกพูด |
| `data/pairs.js` | คู่คำเสียงคล้าย (21 คู่) |
| `data/prompts.js` | prompt สำหรับ ChatGPT/Claude |

ข้อมูลที่ใส่ `verify: true` คือส่วนที่ยังไม่มั่นใจว่าเป็นธรรมชาติ รายการอยู่ใน [`VERIFY.md`](VERIFY.md)

### สร้างด้วย AI
แอปนี้พัฒนาร่วมกับ **Claude Code (AI ของ Anthropic)** — ผู้เรียนเป็นคนกำหนดความต้องการ ทดสอบ และตัดสินใจ ส่วน AI เขียนโค้ดและเนื้อหา
บันทึกการทำงานทุกรอบ รวมถึงจุดที่ AI ทำผิดหรือทำเกินที่สั่ง อยู่ใน [`DEV_LOG.md`](DEV_LOG.md)
เนื้อหาภาษาญี่ปุ่นสร้างโดย AI และควรให้เจ้าของภาษาตรวจ (ดู `VERIFY.md`)

### เครดิต
- เสียงอ่านและการถอดเสียงมาจาก Web Speech API ของเบราว์เซอร์ (ผลขึ้นกับเบราว์เซอร์และเสียงที่ติดตั้งในเครื่อง)
- เส้นนำในหน้าฝึกเขียนวาดจากฟอนต์ภาษาญี่ปุ่นของเครื่องผู้ใช้ — **ไม่ได้ใช้ข้อมูล KanjiVG** (ยังไม่มีการแสดงลำดับขีด)
- ไม่ได้ใช้โค้ดจากโปรเจกต์ Capstone ของเพื่อน (ไม่ได้มีการส่งโค้ดเข้ามาในโปรเจกต์นี้) และไม่ได้ใช้ไลบรารีภายนอก
- สีกราฟ Pre/Post ผ่านการตรวจความแตกต่างสำหรับผู้มีภาวะตาบอดสี

---

## English

### What it does
A mobile-first, Thai-language web app that takes an absolute beginner from kana to survival Japanese:
- **Guided path:** 5 stages / 33 levels (hiragana, katakana, vocabulary, sentence patterns, real-life situations) + a bonus minimal-pairs listening level. Each level = learn → 10-question exercise → result (pass ≥ 80 %, 1–3 stars). XP, streaks, daily goal, 12-week heatmap, stage skip exams.
- **Review:** Leitner SRS (5 boxes: 1/2/4/7/14 days), mistake notebook, minimal-pair listening drills, 60-second matching game.
- **Kana chart:** gojūon / dakuten / yōon tables, tap to hear + Thai mnemonics, printable on A4; finger/mouse writing practice with a scored guide.
- **Speaking:** Speaking Check (speech recognition, normalised kana/kanji comparison → match / close / miss), record-and-compare, phrasebook, role-play prompt library for ChatGPT/Claude voice mode.
- **Measurement:** fixed-seed Pre/Post test (reading 20, listening 10, speaking 18) with a comparison bar chart and CSV export; one-page PGP report (copy as text / CSV / print).

Uses only browser APIs (`speechSynthesis`, `SpeechRecognition`, `MediaRecorder`, `localStorage`, `IndexedDB`). **No API keys, no server, no paid services; all data stays in the browser.**

### Run it
Static site, no build step:
- Open `index.html` directly in Chrome (everything except microphone features), or
- serve it on localhost: VS Code *Live Server*, `npx serve`, or `python -m http.server 8000`, or
- publish with GitHub Pages (HTTPS, microphone works).

### Built with AI
Developed together with **Claude Code (Anthropic)**. The learner set the requirements, tested each phase and made the decisions; the AI wrote the code and content. Every session — including the AI's mistakes and overreach — is logged in [`DEV_LOG.md`](DEV_LOG.md). Japanese content was AI-generated; items flagged `verify: true` are listed in [`VERIFY.md`](VERIFY.md) for review by a native speaker.

### Credits
Speech synthesis/recognition by the browser's Web Speech API. The writing guide is rendered from the device's Japanese font; KanjiVG stroke data is **not** used. No third-party libraries. No code from the friend's Capstone project was used.
