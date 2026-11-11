/*
 * คำศัพท์ขั้น 3 (7 ด่าน ด่านละ 10 คำ)
 * ------------------------------------------------------------
 *   level : ด่านที่คำนี้อยู่
 *   kana  : เขียนด้วยฮิรางานะ/คาตากานะ (แสดงตัวใหญ่ และใช้อ่านออกเสียง)
 *   kanji : รูปคันจิ (แสดงตัวเล็กไว้ดูเฉยๆ ไม่ใช้ในแบบฝึกหัด) เว้นว่าง "" ได้
 *   romaji: โรมันจิแบบ Hepburn (สระยาวเขียน ou / uu / ii / oo)
 *   th    : ความหมายไทย
 *   note  : หมายเหตุสั้นๆ (ไม่บังคับ)
 *   alt   : รูปเขียนอื่นที่ระบบถอดเสียงอาจให้ออกมา (ใช้ในเฟส 5 ฝึกพูด)
 *   verify: true = ยังไม่มั่นใจ ควรถามคนญี่ปุ่น
 */
window.NS = window.NS || {};

NS.VOCAB = [
  // ---------- 3-1 ตัวเลข 1–10 ----------
  { level: "3-1", kana: "いち",   kanji: "一", romaji: "ichi", th: "หนึ่ง (1)", alt: ["1"] },
  { level: "3-1", kana: "に",     kanji: "二", romaji: "ni",   th: "สอง (2)", alt: ["2"] },
  { level: "3-1", kana: "さん",   kanji: "三", romaji: "san",  th: "สาม (3)", alt: ["3"] },
  { level: "3-1", kana: "よん",   kanji: "四", romaji: "yon",  th: "สี่ (4)", alt: ["4", "し"], note: "อ่านว่า し (shi) ได้ด้วย แต่ใช้ よん บ่อยกว่า" },
  { level: "3-1", kana: "ご",     kanji: "五", romaji: "go",   th: "ห้า (5)", alt: ["5"] },
  { level: "3-1", kana: "ろく",   kanji: "六", romaji: "roku", th: "หก (6)", alt: ["6"] },
  { level: "3-1", kana: "なな",   kanji: "七", romaji: "nana", th: "เจ็ด (7)", alt: ["7", "しち"], note: "อ่านว่า しち (shichi) ได้ด้วย" },
  { level: "3-1", kana: "はち",   kanji: "八", romaji: "hachi", th: "แปด (8)", alt: ["8"] },
  { level: "3-1", kana: "きゅう", kanji: "九", romaji: "kyuu", th: "เก้า (9)", alt: ["9", "く"], note: "อ่านว่า く (ku) ได้ด้วย เช่น くじ = 9 โมง" },
  { level: "3-1", kana: "じゅう", kanji: "十", romaji: "juu",  th: "สิบ (10)", alt: ["10"] },

  // ---------- 3-2 คนและครอบครัว ----------
  { level: "3-2", kana: "わたし",   kanji: "私",   romaji: "watashi",  th: "ฉัน / ผม" },
  { level: "3-2", kana: "ひと",     kanji: "人",   romaji: "hito",     th: "คน" },
  { level: "3-2", kana: "ともだち", kanji: "友達", romaji: "tomodachi", th: "เพื่อน" },
  { level: "3-2", kana: "かぞく",   kanji: "家族", romaji: "kazoku",   th: "ครอบครัว" },
  { level: "3-2", kana: "ちち",     kanji: "父",   romaji: "chichi",   th: "พ่อ (ของตัวเอง)", note: "พ่อของคนอื่นใช้ おとうさん" },
  { level: "3-2", kana: "はは",     kanji: "母",   romaji: "haha",     th: "แม่ (ของตัวเอง)", note: "แม่ของคนอื่นใช้ おかあさん" },
  { level: "3-2", kana: "あに",     kanji: "兄",   romaji: "ani",      th: "พี่ชาย (ของตัวเอง)", note: "พี่ชายของคนอื่นใช้ おにいさん" },
  { level: "3-2", kana: "あね",     kanji: "姉",   romaji: "ane",      th: "พี่สาว (ของตัวเอง)", note: "พี่สาวของคนอื่นใช้ おねえさん" },
  { level: "3-2", kana: "がくせい", kanji: "学生", romaji: "gakusei",  th: "นักเรียน / นักศึกษา" },
  { level: "3-2", kana: "せんせい", kanji: "先生", romaji: "sensei",   th: "ครู / อาจารย์" },

  // ---------- 3-3 อาหารและเครื่องดื่ม ----------
  { level: "3-3", kana: "みず",     kanji: "水",   romaji: "mizu",   th: "น้ำ" },
  { level: "3-3", kana: "おちゃ",   kanji: "お茶", romaji: "ocha",   th: "ชา (ชาเขียว)" },
  { level: "3-3", kana: "ごはん",   kanji: "ご飯", romaji: "gohan",  th: "ข้าว / มื้ออาหาร" },
  { level: "3-3", kana: "パン",     kanji: "",     romaji: "pan",    th: "ขนมปัง" },
  { level: "3-3", kana: "さかな",   kanji: "魚",   romaji: "sakana", th: "ปลา" },
  { level: "3-3", kana: "にく",     kanji: "肉",   romaji: "niku",   th: "เนื้อสัตว์" },
  { level: "3-3", kana: "やさい",   kanji: "野菜", romaji: "yasai",  th: "ผัก" },
  { level: "3-3", kana: "たまご",   kanji: "卵",   romaji: "tamago", th: "ไข่" },
  { level: "3-3", kana: "ビール",   kanji: "",     romaji: "biiru",  th: "เบียร์" },
  { level: "3-3", kana: "ラーメン", kanji: "",     romaji: "raamen", th: "ราเมน" },

  // ---------- 3-4 สถานที่ ----------
  { level: "3-4", kana: "えき",       kanji: "駅",   romaji: "eki",     th: "สถานีรถไฟ" },
  { level: "3-4", kana: "みせ",       kanji: "店",   romaji: "mise",    th: "ร้าน" },
  { level: "3-4", kana: "ぎんこう",   kanji: "銀行", romaji: "ginkou",  th: "ธนาคาร" },
  { level: "3-4", kana: "びょういん", kanji: "病院", romaji: "byouin",  th: "โรงพยาบาล" },
  { level: "3-4", kana: "がっこう",   kanji: "学校", romaji: "gakkou",  th: "โรงเรียน" },
  { level: "3-4", kana: "いえ",       kanji: "家",   romaji: "ie",      th: "บ้าน" },
  { level: "3-4", kana: "へや",       kanji: "部屋", romaji: "heya",    th: "ห้อง" },
  { level: "3-4", kana: "こうえん",   kanji: "公園", romaji: "kouen",   th: "สวนสาธารณะ" },
  { level: "3-4", kana: "くうこう",   kanji: "空港", romaji: "kuukou",  th: "สนามบิน" },
  { level: "3-4", kana: "スーパー",   kanji: "",     romaji: "suupaa",  th: "ซูเปอร์มาร์เก็ต" },

  // ---------- 3-5 คำกริยา (ます) ----------
  { level: "3-5", kana: "たべます",   kanji: "食べます", romaji: "tabemasu",   th: "กิน" },
  { level: "3-5", kana: "のみます",   kanji: "飲みます", romaji: "nomimasu",   th: "ดื่ม" },
  { level: "3-5", kana: "いきます",   kanji: "行きます", romaji: "ikimasu",    th: "ไป" },
  { level: "3-5", kana: "きます",     kanji: "来ます",   romaji: "kimasu",     th: "มา" },
  { level: "3-5", kana: "かえります", kanji: "帰ります", romaji: "kaerimasu",  th: "กลับ (บ้าน)" },
  { level: "3-5", kana: "みます",     kanji: "見ます",   romaji: "mimasu",     th: "ดู" },
  { level: "3-5", kana: "ききます",   kanji: "聞きます", romaji: "kikimasu",   th: "ฟัง / ถาม" },
  { level: "3-5", kana: "かいます",   kanji: "買います", romaji: "kaimasu",    th: "ซื้อ" },
  { level: "3-5", kana: "はなします", kanji: "話します", romaji: "hanashimasu", th: "พูด" },
  { level: "3-5", kana: "わかります", kanji: "分かります", romaji: "wakarimasu", th: "เข้าใจ" },

  // ---------- 3-6 คำคุณศัพท์ ----------
  { level: "3-6", kana: "おいしい", kanji: "",       romaji: "oishii",  th: "อร่อย" },
  { level: "3-6", kana: "たかい",   kanji: "高い",   romaji: "takai",   th: "แพง / สูง" },
  { level: "3-6", kana: "やすい",   kanji: "安い",   romaji: "yasui",   th: "ถูก (ราคา)" },
  { level: "3-6", kana: "おおきい", kanji: "大きい", romaji: "ookii",   th: "ใหญ่" },
  { level: "3-6", kana: "ちいさい", kanji: "小さい", romaji: "chiisai", th: "เล็ก" },
  { level: "3-6", kana: "あつい",   kanji: "暑い",   romaji: "atsui",   th: "ร้อน (อากาศ)" },
  { level: "3-6", kana: "さむい",   kanji: "寒い",   romaji: "samui",   th: "หนาว" },
  { level: "3-6", kana: "いい",     kanji: "",       romaji: "ii",      th: "ดี" },
  { level: "3-6", kana: "からい",   kanji: "辛い",   romaji: "karai",   th: "เผ็ด" },
  { level: "3-6", kana: "かわいい", kanji: "",       romaji: "kawaii",  th: "น่ารัก" },

  // ---------- 3-7 เวลา ----------
  { level: "3-7", kana: "きょう",     kanji: "今日", romaji: "kyou",      th: "วันนี้" },
  { level: "3-7", kana: "あした",     kanji: "明日", romaji: "ashita",    th: "พรุ่งนี้" },
  { level: "3-7", kana: "きのう",     kanji: "昨日", romaji: "kinou",     th: "เมื่อวาน" },
  { level: "3-7", kana: "いま",       kanji: "今",   romaji: "ima",       th: "ตอนนี้" },
  { level: "3-7", kana: "あさ",       kanji: "朝",   romaji: "asa",       th: "ตอนเช้า" },
  { level: "3-7", kana: "ひる",       kanji: "昼",   romaji: "hiru",      th: "ตอนกลางวัน" },
  { level: "3-7", kana: "よる",       kanji: "夜",   romaji: "yoru",      th: "ตอนกลางคืน" },
  { level: "3-7", kana: "まいにち",   kanji: "毎日", romaji: "mainichi",  th: "ทุกวัน" },
  { level: "3-7", kana: "いつ",       kanji: "",     romaji: "itsu",      th: "เมื่อไหร่" },
  { level: "3-7", kana: "しゅうまつ", kanji: "週末", romaji: "shuumatsu", th: "สุดสัปดาห์" }
];
