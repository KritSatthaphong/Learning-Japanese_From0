/*
 * ข้อมูลตัวอักษร ฮิรางานะ / คาตากานะ
 * ------------------------------------------------------------
 * แก้ไขได้เอง: เปลี่ยนข้อความใน tipH (ทริคจำฮิรางานะ) หรือ tipK (ทริคจำคาตากานะ) ได้เลย
 * ระวัง: อย่าลบเครื่องหมาย " , { } ออก ไม่อย่างนั้นแอปจะโหลดไม่ขึ้น
 *
 * ความหมายของแต่ละช่อง
 *   romaji : โรมันจิแบบ Hepburn
 *   hira   : ฮิรางานะ        kata : คาตากานะ
 *   group  : basic = ตัวพื้นฐาน, dakuten = เสียงขุ่น, youon = เสียงควบ
 *   row    : แถวในตาราง (- = แถวสระ, k, s, t, ...)   col : คอลัมน์ (a i u e o / ya yu yo)
 *   lv     : อยู่ในด่านที่เท่าไหร่ของขั้น (ฮิรางานะ = ด่าน 1-lv, คาตากานะ = ด่าน 2-lv)
 *   tipH / tipK : ทริคจำ (เว้นว่าง "" ได้ ถ้าเป็นเสียงขุ่น/เสียงควบ แอปจะสร้างคำอธิบายให้เอง)
 *   key    : ใช้เมื่อโรมันจิซ้ำกับตัวอื่น (ぢ づ)
 *   noQuiz : true = แสดงในตาราง แต่ไม่ออกในแบบฝึกหัด
 *   verify : true = ยังไม่มั่นใจ ควรถามคนญี่ปุ่น
 */
window.NS = window.NS || {};

NS.KANA = [
  // ---------- ด่าน 1: แถว あ และ か ----------
  { romaji: "a",  hira: "あ", kata: "ア", group: "basic", row: "-", col: "a", lv: 1, tipH: "มีไม้กางเขนกับวงกลม เหมือนคนอ้าปากกว้างร้อง \"อ๊า~\"", tipK: "" },
  { romaji: "i",  hira: "い", kata: "イ", group: "basic", row: "-", col: "i", lv: 1, tipH: "สองขีดยืนคู่กันเหมือนตัว i สองตัว → \"อิ\"", tipK: "" },
  { romaji: "u",  hira: "う", kata: "ウ", group: "basic", row: "-", col: "u", lv: 1, tipH: "ตัว U นอนตะแคง มีขีดเล็กเป็นหมวก → \"อุ\"", tipK: "" },
  { romaji: "e",  hira: "え", kata: "エ", group: "basic", row: "-", col: "e", lv: 1, tipH: "เหมือนนกมีหงอนขีดเดียว ทำหน้าสงสัยว่า \"เอ๊ะ?\"", tipK: "" },
  { romaji: "o",  hira: "お", kata: "オ", group: "basic", row: "-", col: "o", lv: 1, tipH: "คล้าย あ แต่มีจุดลอยทางขวา เหมือนโยนลูกบอลแล้วร้อง \"โอ้!\"", tipK: "" },
  { romaji: "ka", hira: "か", kata: "カ", group: "basic", row: "k", col: "a", lv: 1, tipH: "เหมือนดาบที่ฟันลงมา มีขีดเล็กเป็นเสียง \"คะ!\" ฉับ", tipK: "" },
  { romaji: "ki", hira: "き", kata: "キ", group: "basic", row: "k", col: "i", lv: 1, tipH: "หน้าตาเหมือนลูกกุญแจ (key) → \"คิ\"", tipK: "" },
  { romaji: "ku", hira: "く", kata: "ク", group: "basic", row: "k", col: "u", lv: 1, tipH: "เหมือนปากนกที่อ้าร้อง \"คุ คุ\"", tipK: "" },
  { romaji: "ke", hira: "け", kata: "ケ", group: "basic", row: "k", col: "e", lv: 1, tipH: "ขีดซ้าย + ตัวคล้ายตัว K ครึ่งหนึ่ง → \"เคะ\"", tipK: "" },
  { romaji: "ko", hira: "こ", kata: "コ", group: "basic", row: "k", col: "o", lv: 1, tipH: "สองขีดเหมือนเหรียญ (coin) สองเหรียญวางเรียง → \"โคะ\"", tipK: "" },

  // ---------- ด่าน 2: แถว さ และ た ----------
  { romaji: "sa",  hira: "さ", kata: "サ", group: "basic", row: "s", col: "a", lv: 2, tipH: "หางข้างล่างโค้งเปิดไปทาง \"ซ้าย\" → \"ซะ\" (ตรงข้ามกับ ち)", tipK: "" },
  { romaji: "shi", hira: "し", kata: "シ", group: "basic", row: "s", col: "i", lv: 2, tipH: "เส้นเดียวเหมือนตะขอเบ็ดที่ \"ชี้\" ขึ้น → \"ชิ\"", tipK: "" },
  { romaji: "su",  hira: "す", kata: "ス", group: "basic", row: "s", col: "u", lv: 2, tipH: "เหมือนเส้นบะหมี่ม้วนเป็นวงตอนกำลัง \"ซู้ด\" → \"สึ\"", tipK: "" },
  { romaji: "se",  hira: "せ", kata: "セ", group: "basic", row: "s", col: "e", lv: 2, tipH: "เหมือนคนเดิน \"เซ\" จนขาพับ → \"เซะ\"", tipK: "" },
  { romaji: "so",  hira: "そ", kata: "ソ", group: "basic", row: "s", col: "o", lv: 2, tipH: "เส้นซิกแซกเหมือนรอยเย็บผ้า (sew) → \"โซะ\"", tipK: "" },
  { romaji: "ta",  hira: "た", kata: "タ", group: "basic", row: "t", col: "a", lv: 2, tipH: "ด้านซ้ายเหมือนตัว t ด้านขวาเหมือนตัว a → \"ta\"", tipK: "" },
  { romaji: "chi", hira: "ち", kata: "チ", group: "basic", row: "t", col: "i", lv: 2, tipH: "หางโค้งไปทางขวา คิดว่า \"ชิดขวา\" → \"ชิ\" (ตรงข้ามกับ さ)", tipK: "" },
  { romaji: "tsu", hira: "つ", kata: "ツ", group: "basic", row: "t", col: "u", lv: 2, tipH: "เหมือนคลื่นยักษ์ลูกเดียว คลื่น \"สึ\"นามิ (tsunami)", tipK: "" },
  { romaji: "te",  hira: "て", kata: "テ", group: "basic", row: "t", col: "e", lv: 2, tipH: "เหมือนตัว T ที่หางงอ (て ยังแปลว่า \"มือ\" ด้วย) → \"เทะ\"", tipK: "" },
  { romaji: "to",  hira: "と", kata: "ト", group: "basic", row: "t", col: "o", lv: 2, tipH: "เหมือนนิ้วเท้า (toe) ที่มีเสี้ยนตำ → \"โทะ\"", tipK: "" },

  // ---------- ด่าน 3: แถว な และ は ----------
  { romaji: "na", hira: "な", kata: "ナ", group: "basic", row: "n", col: "a", lv: 3, tipH: "ไม้กางเขน + ปมข้างล่าง เหมือนคนไหว้ขอร้อง \"นะ~\"", tipK: "" },
  { romaji: "ni", hira: "に", kata: "ニ", group: "basic", row: "n", col: "i", lv: 3, tipH: "ขีดซ้ายเหมือนขา มี こ อยู่ข้าง เหมือนหัวเข่า (knee) → \"นิ\"", tipK: "" },
  { romaji: "nu", hira: "ぬ", kata: "ヌ", group: "basic", row: "n", col: "u", lv: 3, tipH: "เหมือนเส้นบะหมี่ (noodle) พันกัน มีห่วงที่หาง → \"นุ\" (め ไม่มีห่วง)", tipK: "" },
  { romaji: "ne", hira: "ね", kata: "ネ", group: "basic", row: "n", col: "e", lv: 3, tipH: "เหมือนแมว (ねこ) นอนขดหางม้วน → \"เนะ\"", tipK: "" },
  { romaji: "no", hira: "の", kata: "ノ", group: "basic", row: "n", col: "o", lv: 3, tipH: "วงเดียวเหมือนป้ายห้าม \"No!\" → \"โนะ\"", tipK: "" },
  { romaji: "ha", hira: "は", kata: "ハ", group: "basic", row: "h", col: "a", lv: 3, tipH: "เหมือนคนกุมท้องหัวเราะ \"ฮ่า!\" (ถ้าใช้เป็นคำช่วยจะอ่านว่า wa)", tipK: "" },
  { romaji: "hi", hira: "ひ", kata: "ヒ", group: "basic", row: "h", col: "i", lv: 3, tipH: "เหมือนปากยิ้มกว้าง หัวเราะ \"ฮิๆ\"", tipK: "" },
  { romaji: "fu", hira: "ふ", kata: "フ", group: "basic", row: "h", col: "u", lv: 3, tipH: "เหมือนภูเขาไฟ \"ฟูจิ\" มีควันสองข้าง → \"ฟุ\" (เป่าลมเบาๆ ระหว่าง ฟุ กับ ฮุ)", tipK: "" },
  { romaji: "he", hira: "へ", kata: "ヘ", group: "basic", row: "h", col: "e", lv: 3, tipH: "เหมือนยอดเขาลูกเล็ก ปีนถึงแล้วร้อง \"เฮ้!\" (ถ้าใช้เป็นคำช่วยจะอ่านว่า e)", tipK: "" },
  { romaji: "ho", hira: "ほ", kata: "ホ", group: "basic", row: "h", col: "o", lv: 3, tipH: "เหมือน は แต่มีขีดบนเพิ่ม เหมือนบ้าน (home) มีหลังคา → \"โฮะ\"", tipK: "" },

  // ---------- ด่าน 4: แถว ま や ら わ และ ん ----------
  { romaji: "ma", hira: "ま", kata: "マ", group: "basic", row: "m", col: "a", lv: 4, tipH: "สองขีดขวาง + ห่วงข้างล่าง เหมือน \"มะม้า\" ใส่ผ้ากันเปื้อน", tipK: "" },
  { romaji: "mi", hira: "み", kata: "ミ", group: "basic", row: "m", col: "i", lv: 4, tipH: "หน้าตาคล้ายเลข 21 → \"มิ\" อายุ 21", tipK: "" },
  { romaji: "mu", hira: "む", kata: "ム", group: "basic", row: "m", col: "u", lv: 4, tipH: "เหมือนวัวมีเขาและหาง ร้อง \"มู~\" → \"มุ\"", tipK: "" },
  { romaji: "me", hira: "め", kata: "メ", group: "basic", row: "m", col: "e", lv: 4, tipH: "เหมือนลูกตา (め แปลว่า \"ตา\") ไม่มีห่วงที่หาง (ต่างจาก ぬ)", tipK: "" },
  { romaji: "mo", hira: "も", kata: "モ", group: "basic", row: "m", col: "o", lv: 4, tipH: "ตะขอเบ็ดมีเหยื่อสองขีด ได้ปลา \"มากขึ้น\" (more) → \"โมะ\"", tipK: "" },
  { romaji: "ya", hira: "や", kata: "ヤ", group: "basic", row: "y", col: "a", lv: 4, tipH: "เหมือนหัวจามรี (yak) มีเขา → \"ยะ\"", tipK: "" },
  { romaji: "yu", hira: "ゆ", kata: "ユ", group: "basic", row: "y", col: "u", lv: 4, tipH: "เหมือนปลาว่ายวนในน้ำ เรียกว่า \"you!\" → \"ยุ\"", tipK: "" },
  { romaji: "yo", hira: "よ", kata: "ヨ", group: "basic", row: "y", col: "o", lv: 4, tipH: "เหมือนลูก \"โยโย่\" ห้อยลงจากนิ้ว → \"โยะ\"", tipK: "" },
  { romaji: "ra", hira: "ら", kata: "ラ", group: "basic", row: "r", col: "a", lv: 4, tipH: "เหมือนกระต่าย (rabbit) นั่งหันข้าง หูขีดเดียว → \"ระ\"", tipK: "" },
  { romaji: "ri", hira: "り", kata: "リ", group: "basic", row: "r", col: "i", lv: 4, tipH: "สองเส้นเหมือนต้นกกขึ้น \"ริม\"น้ำ → \"ริ\"", tipK: "" },
  { romaji: "ru", hira: "る", kata: "ル", group: "basic", row: "r", col: "u", lv: 4, tipH: "เหมือน ろ แต่มีห่วง (loop) ที่หาง → \"รุ\"", tipK: "" },
  { romaji: "re", hira: "れ", kata: "レ", group: "basic", row: "r", col: "e", lv: 4, tipH: "เหมือน ね แต่หางเตะออกไปตรงๆ ไม่ม้วน → \"เระ\"", tipK: "" },
  { romaji: "ro", hira: "ろ", kata: "ロ", group: "basic", row: "r", col: "o", lv: 4, tipH: "เหมือน る แต่ไม่มีห่วง เหมือนถนน (road) โล่ง → \"โระ\"", tipK: "" },
  { romaji: "wa", hira: "わ", kata: "ワ", group: "basic", row: "w", col: "a", lv: 4, tipH: "เหมือน ね แต่หางโค้งกว้าง ร้อง \"ว้าว!\" → \"วะ\"", tipK: "" },
  { romaji: "wo", hira: "を", kata: "ヲ", group: "basic", row: "w", col: "o", lv: 4, tipH: "ใช้เป็นคำช่วยเท่านั้น อ่านว่า \"โอะ\" (o) เหมือน お แต่ใช้ต่างกัน", tipK: "", note: "เขียนโรมันจิว่า wo แต่ออกเสียงว่า o" },
  { romaji: "n",  hira: "ん", kata: "ン", group: "basic", row: "nn", col: "a", lv: 4, tipH: "เหมือนตัว n ภาษาอังกฤษเขียนหวัด → เสียง \"น\" สะกด", tipK: "" },

  // ---------- ด่าน 5: เสียงขุ่น (゛ ขีดสองขีด / ゜ วงกลมเล็ก) ----------
  { romaji: "ga", hira: "が", kata: "ガ", group: "dakuten", row: "g", col: "a", lv: 5, tipH: "", tipK: "" },
  { romaji: "gi", hira: "ぎ", kata: "ギ", group: "dakuten", row: "g", col: "i", lv: 5, tipH: "", tipK: "" },
  { romaji: "gu", hira: "ぐ", kata: "グ", group: "dakuten", row: "g", col: "u", lv: 5, tipH: "", tipK: "" },
  { romaji: "ge", hira: "げ", kata: "ゲ", group: "dakuten", row: "g", col: "e", lv: 5, tipH: "", tipK: "" },
  { romaji: "go", hira: "ご", kata: "ゴ", group: "dakuten", row: "g", col: "o", lv: 5, tipH: "", tipK: "" },
  { romaji: "za", hira: "ざ", kata: "ザ", group: "dakuten", row: "z", col: "a", lv: 5, tipH: "", tipK: "" },
  { romaji: "ji", hira: "じ", kata: "ジ", group: "dakuten", row: "z", col: "i", lv: 5, tipH: "", tipK: "" },
  { romaji: "zu", hira: "ず", kata: "ズ", group: "dakuten", row: "z", col: "u", lv: 5, tipH: "", tipK: "" },
  { romaji: "ze", hira: "ぜ", kata: "ゼ", group: "dakuten", row: "z", col: "e", lv: 5, tipH: "", tipK: "" },
  { romaji: "zo", hira: "ぞ", kata: "ゾ", group: "dakuten", row: "z", col: "o", lv: 5, tipH: "", tipK: "" },
  { romaji: "da", hira: "だ", kata: "ダ", group: "dakuten", row: "d", col: "a", lv: 5, tipH: "", tipK: "" },
  { romaji: "ji", key: "di", hira: "ぢ", kata: "ヂ", group: "dakuten", row: "d", col: "i", lv: 5, tipH: "", tipK: "", noQuiz: true, note: "ออกเสียงเหมือน じ (ji) ใช้น้อยมาก" },
  { romaji: "zu", key: "du", hira: "づ", kata: "ヅ", group: "dakuten", row: "d", col: "u", lv: 5, tipH: "", tipK: "", noQuiz: true, note: "ออกเสียงเหมือน ず (zu) ใช้น้อยมาก" },
  { romaji: "de", hira: "で", kata: "デ", group: "dakuten", row: "d", col: "e", lv: 5, tipH: "", tipK: "" },
  { romaji: "do", hira: "ど", kata: "ド", group: "dakuten", row: "d", col: "o", lv: 5, tipH: "", tipK: "" },
  { romaji: "ba", hira: "ば", kata: "バ", group: "dakuten", row: "b", col: "a", lv: 5, tipH: "", tipK: "" },
  { romaji: "bi", hira: "び", kata: "ビ", group: "dakuten", row: "b", col: "i", lv: 5, tipH: "", tipK: "" },
  { romaji: "bu", hira: "ぶ", kata: "ブ", group: "dakuten", row: "b", col: "u", lv: 5, tipH: "", tipK: "" },
  { romaji: "be", hira: "べ", kata: "ベ", group: "dakuten", row: "b", col: "e", lv: 5, tipH: "", tipK: "" },
  { romaji: "bo", hira: "ぼ", kata: "ボ", group: "dakuten", row: "b", col: "o", lv: 5, tipH: "", tipK: "" },
  { romaji: "pa", hira: "ぱ", kata: "パ", group: "dakuten", row: "p", col: "a", lv: 5, tipH: "", tipK: "" },
  { romaji: "pi", hira: "ぴ", kata: "ピ", group: "dakuten", row: "p", col: "i", lv: 5, tipH: "", tipK: "" },
  { romaji: "pu", hira: "ぷ", kata: "プ", group: "dakuten", row: "p", col: "u", lv: 5, tipH: "", tipK: "" },
  { romaji: "pe", hira: "ぺ", kata: "ペ", group: "dakuten", row: "p", col: "e", lv: 5, tipH: "", tipK: "" },
  { romaji: "po", hira: "ぽ", kata: "ポ", group: "dakuten", row: "p", col: "o", lv: 5, tipH: "", tipK: "" },

  // ---------- ด่าน 6: เสียงควบ (ตัวเล็ก ゃ ゅ ょ) ----------
  { romaji: "kya", hira: "きゃ", kata: "キャ", group: "youon", row: "ky", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "kyu", hira: "きゅ", kata: "キュ", group: "youon", row: "ky", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "kyo", hira: "きょ", kata: "キョ", group: "youon", row: "ky", col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "sha", hira: "しゃ", kata: "シャ", group: "youon", row: "sh", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "shu", hira: "しゅ", kata: "シュ", group: "youon", row: "sh", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "sho", hira: "しょ", kata: "ショ", group: "youon", row: "sh", col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "cha", hira: "ちゃ", kata: "チャ", group: "youon", row: "ch", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "chu", hira: "ちゅ", kata: "チュ", group: "youon", row: "ch", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "cho", hira: "ちょ", kata: "チョ", group: "youon", row: "ch", col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "nya", hira: "にゃ", kata: "ニャ", group: "youon", row: "ny", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "nyu", hira: "にゅ", kata: "ニュ", group: "youon", row: "ny", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "nyo", hira: "にょ", kata: "ニョ", group: "youon", row: "ny", col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "hya", hira: "ひゃ", kata: "ヒャ", group: "youon", row: "hy", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "hyu", hira: "ひゅ", kata: "ヒュ", group: "youon", row: "hy", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "hyo", hira: "ひょ", kata: "ヒョ", group: "youon", row: "hy", col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "mya", hira: "みゃ", kata: "ミャ", group: "youon", row: "my", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "myu", hira: "みゅ", kata: "ミュ", group: "youon", row: "my", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "myo", hira: "みょ", kata: "ミョ", group: "youon", row: "my", col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "rya", hira: "りゃ", kata: "リャ", group: "youon", row: "ry", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "ryu", hira: "りゅ", kata: "リュ", group: "youon", row: "ry", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "ryo", hira: "りょ", kata: "リョ", group: "youon", row: "ry", col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "gya", hira: "ぎゃ", kata: "ギャ", group: "youon", row: "gy", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "gyu", hira: "ぎゅ", kata: "ギュ", group: "youon", row: "gy", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "gyo", hira: "ぎょ", kata: "ギョ", group: "youon", row: "gy", col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "ja",  hira: "じゃ", kata: "ジャ", group: "youon", row: "j",  col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "ju",  hira: "じゅ", kata: "ジュ", group: "youon", row: "j",  col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "jo",  hira: "じょ", kata: "ジョ", group: "youon", row: "j",  col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "bya", hira: "びゃ", kata: "ビャ", group: "youon", row: "by", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "byu", hira: "びゅ", kata: "ビュ", group: "youon", row: "by", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "byo", hira: "びょ", kata: "ビョ", group: "youon", row: "by", col: "yo", lv: 6, tipH: "", tipK: "" },
  { romaji: "pya", hira: "ぴゃ", kata: "ピャ", group: "youon", row: "py", col: "ya", lv: 6, tipH: "", tipK: "" },
  { romaji: "pyu", hira: "ぴゅ", kata: "ピュ", group: "youon", row: "py", col: "yu", lv: 6, tipH: "", tipK: "" },
  { romaji: "pyo", hira: "ぴょ", kata: "ピョ", group: "youon", row: "py", col: "yo", lv: 6, tipH: "", tipK: "" }
];

/*
 * คำตัวอย่าง っ ตัวเล็ก (ด่าน 1-6)
 *   near = คำที่หน้าตาคล้ายกันแต่ไม่มี っ ใช้เป็นตัวเลือกหลอก เพื่อฝึกแยกเสียง
 */
NS.SOKUON = [
  { hira: "きって",   romaji: "kitte",   th: "แสตมป์",              near: { hira: "きて",   romaji: "kite" } },
  { hira: "ちょっと", romaji: "chotto",  th: "นิดหน่อย / สักครู่",   near: { hira: "ちょと", romaji: "choto" } },
  { hira: "がっこう", romaji: "gakkou",  th: "โรงเรียน",            near: { hira: "がこう", romaji: "gakou" } },
  { hira: "ざっし",   romaji: "zasshi",  th: "นิตยสาร",             near: { hira: "ざし",   romaji: "zashi" } },
  { hira: "まって",   romaji: "matte",   th: "รอก่อน (แบบกันเอง)",   near: { hira: "まて",   romaji: "mate" } }
];
