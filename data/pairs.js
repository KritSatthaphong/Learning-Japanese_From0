/*
 * คู่คำที่เสียงคล้ายกัน (minimal pairs) สำหรับฝึกฟังแยกเสียง
 * ------------------------------------------------------------
 *   cat : หมวด (ดูใน NS.PAIR_CATS)
 *   a/b : คำทั้งสองฝั่ง { kana: ตัวอักษร, romaji: โรมันจิ, th: ความหมายไทย }
 *   verify : true = ยังไม่มั่นใจ ควรถามคนญี่ปุ่น
 * เพิ่มคู่ใหม่ได้โดยคัดลอกบรรทัดเดิมแล้วแก้ข้อความ
 */
window.NS = window.NS || {};

NS.PAIR_CATS = [
  { id: "long",   title: "สระยาว",        desc: "ลากเสียงยาว 2 จังหวะ ความหมายเปลี่ยน" },
  { id: "sokuon", title: "っ ตัวเล็ก",     desc: "หยุดค้างครึ่งจังหวะ ก่อนพยางค์ถัดไป" },
  { id: "tsusu",  title: "つ / す",        desc: "つ (tsu) มีเสียง t นำ, す (su) ไม่มี" },
  { id: "n",      title: "ん ท้ายคำ",      desc: "มีเสียง น สะกดท้ายหรือไม่" }
];

NS.PAIRS = [
  // ---------- สระยาว ----------
  { cat: "long", a: { kana: "おばさん", romaji: "obasan", th: "ป้า / น้า (ผู้หญิงวัยกลางคน)" }, b: { kana: "おばあさん", romaji: "obaasan", th: "คุณยาย / หญิงชรา" } },
  { cat: "long", a: { kana: "おじさん", romaji: "ojisan", th: "ลุง / น้า (ผู้ชายวัยกลางคน)" }, b: { kana: "おじいさん", romaji: "ojiisan", th: "คุณตา / ชายชรา" } },
  { cat: "long", a: { kana: "え", romaji: "e", th: "รูปภาพ" }, b: { kana: "ええ", romaji: "ee", th: "ใช่ / ครับ ค่ะ (ตอบรับ)" } },
  { cat: "long", a: { kana: "ゆき", romaji: "yuki", th: "หิมะ" }, b: { kana: "ゆうき", romaji: "yuuki", th: "ความกล้าหาญ" } },
  { cat: "long", a: { kana: "ここ", romaji: "koko", th: "ที่นี่" }, b: { kana: "こうこう", romaji: "koukou", th: "โรงเรียนมัธยมปลาย" } },
  { cat: "long", a: { kana: "しゅじん", romaji: "shujin", th: "สามี (ของตัวเอง)" }, b: { kana: "しゅうじん", romaji: "shuujin", th: "นักโทษ" }, verify: true },

  // ---------- っ ตัวเล็ก ----------
  { cat: "sokuon", a: { kana: "きて", romaji: "kite", th: "มา (มาสิ / มาแล้ว)" }, b: { kana: "きって", romaji: "kitte", th: "แสตมป์" } },
  { cat: "sokuon", a: { kana: "おと", romaji: "oto", th: "เสียง" }, b: { kana: "おっと", romaji: "otto", th: "สามี" } },
  { cat: "sokuon", a: { kana: "さか", romaji: "saka", th: "เนิน / ทางลาด" }, b: { kana: "さっか", romaji: "sakka", th: "นักเขียน" } },
  { cat: "sokuon", a: { kana: "かこ", romaji: "kako", th: "อดีต" }, b: { kana: "かっこ", romaji: "kakko", th: "วงเล็บ" } },
  { cat: "sokuon", a: { kana: "いた", romaji: "ita", th: "อยู่ (อดีต) / เคยอยู่" }, b: { kana: "いった", romaji: "itta", th: "ไปแล้ว / พูดแล้ว" } },

  // ---------- つ / す ----------
  { cat: "tsusu", a: { kana: "つき", romaji: "tsuki", th: "ดวงจันทร์" }, b: { kana: "すき", romaji: "suki", th: "ชอบ" } },
  { cat: "tsusu", a: { kana: "つる", romaji: "tsuru", th: "นกกระเรียน" }, b: { kana: "する", romaji: "suru", th: "ทำ" } },
  { cat: "tsusu", a: { kana: "つな", romaji: "tsuna", th: "เชือก" }, b: { kana: "すな", romaji: "suna", th: "ทราย" } },
  { cat: "tsusu", a: { kana: "つみ", romaji: "tsumi", th: "บาป / ความผิด" }, b: { kana: "すみ", romaji: "sumi", th: "มุม (ห้อง)" } },
  { cat: "tsusu", a: { kana: "なつ", romaji: "natsu", th: "ฤดูร้อน" }, b: { kana: "なす", romaji: "nasu", th: "มะเขือยาว" } },

  // ---------- ん ท้ายคำ ----------
  { cat: "n", a: { kana: "か", romaji: "ka", th: "ยุง" }, b: { kana: "かん", romaji: "kan", th: "กระป๋อง" } },
  { cat: "n", a: { kana: "き", romaji: "ki", th: "ต้นไม้" }, b: { kana: "きん", romaji: "kin", th: "ทองคำ" } },
  { cat: "n", a: { kana: "て", romaji: "te", th: "มือ" }, b: { kana: "てん", romaji: "ten", th: "คะแนน / จุด" } },
  { cat: "n", a: { kana: "せ", romaji: "se", th: "ส่วนสูง / หลัง" }, b: { kana: "せん", romaji: "sen", th: "หนึ่งพัน" } },
  { cat: "n", a: { kana: "ほ", romaji: "ho", th: "ใบเรือ" }, b: { kana: "ほん", romaji: "hon", th: "หนังสือ" }, verify: true }
];
