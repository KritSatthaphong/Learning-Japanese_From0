/*
 * ข้อสอบ Pre/Post Test ชุดที่ 2 — รูปแบบตามข้อสอบ JLPT N5 (แต่งข้อใหม่ทั้งหมด ไม่ได้คัดลอกข้อสอบจริง)
 * ------------------------------------------------------------
 * ทำไมแต่งใหม่: ข้อสอบ JLPT เป็นลิขสิทธิ์ของ Japan Foundation และ JEES เว็บนี้เป็นสาธารณะ
 *   จึงใช้ "รูปแบบข้อ" + ระดับคำศัพท์ N5 เหมือนของจริง แต่เนื้อหาเป็นข้อใหม่
 *   อ้างอิงรูปแบบ: https://www.jlpt.jp/e/samples/forlearners.html
 *
 * ส่วน 1 อ่าน (reading) 20 ข้อ
 *   kanji   = 漢字読み  อ่านคันจิเป็นฮิรางานะ
 *   hyouki  = 表記      เขียนคำให้ถูก (คาตากานะ / คันจิ)
 *   bunmyaku= 文脈規定  เลือกคำเติมในวงเล็บ
 *   bunpou  = 文法      เลือกคำช่วยเติมในวงเล็บ
 * ส่วน 2 ฟัง (listening) 10 ข้อ — คำสั้นๆ 5 ข้อ + ประโยค 5 ข้อ (เสียงอ่านจากเครื่อง)
 *   word    = ฟังคำ เลือกภาพ (อีโมจิ) / ตัวเลข
 *   kadai   = 課題理解  ฟังประโยค แล้วตอบคำถาม
 *   outou   = 即時応答  ฟังประโยค แล้วเลือกคำตอบที่เหมาะ
 * ส่วน 3 พูด (speaking) 18 ข้อ — อ่านออกเสียงประโยคระดับ N5 (ง่าย → ยาวขึ้น)
 *
 * ช่อง:
 *   q      : คำสั่งภาษาญี่ปุ่น      en : คำแปลคำสั่ง/คำถามภาษาอังกฤษ (ปุ่ม EN) — ไม่แปลตัวเลือก
 *   text   : ข้อความโจทย์ (ส่วนอ่าน) · audio : ข้อความที่ให้เครื่องอ่าน (ส่วนฟัง)
 *   choices: ตัวเลือก 4 ตัว ตัวแรก = คำตอบที่ถูก (แอปสลับลำดับให้เองด้วย seed คงที่)
 *   pic    : true = ตัวเลือกเป็นภาพ/ตัวเลข (แสดงตัวใหญ่)
 *   jp / kana / alt : ส่วนพูด รูปเขียนจริง / คานะล้วน / รูปอื่นที่ระบบถอดเสียงอาจให้ออกมา
 *   verify : true = ควรให้เพื่อนชาวญี่ปุ่นช่วยดู
 * ⚠️ ถ้าแก้ข้อสอบหลังทำ Pre ไปแล้ว ผล Pre กับ Post จะเทียบกันไม่ได้ — ถ้าจะแก้ ให้เพิ่ม VERSION
 */
window.NS = window.NS || {};

NS.TEST = {
  VERSION: 2,

  reading: [
    // ---------- 漢字読み: อ่านคันจิ ----------
    { id: 'r1', kind: 'kanji', q: 'この ことばは ひらがなで どう かきますか。', en: 'How do you write this word in hiragana?',
      text: '山', choices: ['やま', 'まや', 'やめ', 'かわ'] },
    { id: 'r2', kind: 'kanji', q: 'この ことばは ひらがなで どう かきますか。', en: 'How do you write this word in hiragana?',
      text: '水', choices: ['みず', 'みす', 'みつ', 'みそ'] },
    { id: 'r3', kind: 'kanji', q: 'この ことばは ひらがなで どう かきますか。', en: 'How do you write this word in hiragana?',
      text: '白い', choices: ['しろい', 'くろい', 'しらい', 'しるい'] },
    { id: 'r4', kind: 'kanji', q: 'この ことばは ひらがなで どう かきますか。', en: 'How do you write this word in hiragana?',
      text: '先生', choices: ['せんせい', 'せんせ', 'せいせい', 'せんぜい'] },
    { id: 'r5', kind: 'kanji', q: 'この ことばは ひらがなで どう かきますか。', en: 'How do you write this word in hiragana?',
      text: '大きい', choices: ['おおきい', 'おきい', 'おうきい', 'だいきい'] },
    { id: 'r6', kind: 'kanji', q: 'この ことばは ひらがなで どう かきますか。', en: 'How do you write this word in hiragana?',
      text: '学校', choices: ['がっこう', 'がこう', 'がっこ', 'がくこう'] },
    { id: 'r7', kind: 'kanji', q: 'この ことばは ひらがなで どう かきますか。', en: 'How do you write this word in hiragana?',
      text: '今月', choices: ['こんげつ', 'こんがつ', 'いまつき', 'こんつき'] },

    // ---------- 表記: เขียนให้ถูก ----------
    { id: 'r8', kind: 'hyouki', q: 'この ことばは どう かきますか。', en: 'How do you write this word?',
      text: 'てれび', choices: ['テレビ', 'テレヒ', 'テレピ', 'チレビ'] },
    { id: 'r9', kind: 'hyouki', q: 'この ことばは どう かきますか。', en: 'How do you write this word?',
      text: 'ぱん', choices: ['パン', 'ハン', 'バン', 'パソ'] },
    { id: 'r10', kind: 'hyouki', q: 'この ことばは どう かきますか。', en: 'How do you write this word?',
      text: 'こーひー', choices: ['コーヒー', 'コーヒ', 'コーピー', 'ユーヒー'] },
    { id: 'r11', kind: 'hyouki', q: 'この ことばは どう かきますか。', en: 'How do you write this word?',
      text: 'みぎ', choices: ['右', '左', '石', '名'] },
    { id: 'r12', kind: 'hyouki', q: 'この ことばは どう かきますか。', en: 'How do you write this word?',
      text: 'やすみ', choices: ['休み', '体み', '木み', '本み'] },
    { id: 'r13', kind: 'hyouki', q: 'この ことばは どう かきますか。', en: 'How do you write this word?',
      text: 'なまえ', choices: ['名前', '各前', '名削', '石前'] },

    // ---------- 文脈規定: เลือกคำเติม ----------
    { id: 'r14', kind: 'bunmyaku', q: '（　）に なにを いれますか。', en: 'What goes in (　)? — "I drink (　)."',
      text: '（　）を のみます。', choices: ['みず', 'パン', 'ほん', 'いす'] },
    { id: 'r15', kind: 'bunmyaku', q: '（　）に なにを いれますか。', en: 'What goes in (　)? — "This apple is 100 (　)."',
      text: 'この りんごは 100（　）です。', choices: ['えん', 'まい', 'ほん', 'さつ'] },
    { id: 'r16', kind: 'bunmyaku', q: '（　）に なにを いれますか。', en: 'What goes in (　)? — "Today is Saturday. (　) is Sunday."',
      text: 'きょうは どようびです。（　）は にちようびです。', choices: ['あした', 'きのう', 'けさ', 'こんばん'] },
    { id: 'r17', kind: 'bunmyaku', q: '（　）に なにを いれますか。', en: 'What goes in (　)? — "I (　) glasses."',
      text: 'めがねを（　）。', choices: ['かけます', 'きます', 'はきます', 'かぶります'] },

    // ---------- 文法: คำช่วย ----------
    // ไม่ใส่ に เป็นตัวเลือกคู่กับ へ เพราะถูกได้ทั้งคู่
    { id: 'r18', kind: 'bunpou', q: '（　）に なにを いれますか。', en: 'What goes in (　)? — "This is my book."',
      text: 'これは わたし（　）ほんです。', choices: ['の', 'を', 'に', 'で'] },
    { id: 'r19', kind: 'bunpou', q: '（　）に なにを いれますか。', en: 'What goes in (　)? — "I go (　) school."',
      text: 'がっこう（　）いきます。', choices: ['へ', 'を', 'の', 'が'] },
    { id: 'r20', kind: 'bunpou', q: '（　）に なにを いれますか。', en: 'What goes in (　)? — "You are a student (　)"',
      text: 'あなたは がくせいです（　）。', choices: ['か', 'を', 'へ', 'の'] }
  ],

  listening: [
    // ---------- คำสั้นๆ ----------
    { id: 'l1', kind: 'word', q: 'きいた ことばは どれですか。', en: 'Which picture is the word you heard?',
      audio: 'りんご', pic: true, choices: ['🍎', '🍌', '🍊', '🍇'] },
    { id: 'l2', kind: 'word', q: 'きいた ことばは どれですか。', en: 'Which picture is the word you heard?',
      audio: 'いぬ', pic: true, choices: ['🐶', '🐱', '🐟', '🐦'] },
    { id: 'l3', kind: 'word', q: 'きいた ことばは どれですか。', en: 'Which picture is the word you heard?',
      audio: 'でんしゃ', pic: true, choices: ['🚃', '🚗', '🚌', '✈️'] },
    { id: 'l4', kind: 'word', q: 'きいた ことばは どれですか。', en: 'Which picture is the word you heard?',
      audio: 'かさ', pic: true, choices: ['☂️', '👟', '🎒', '👓'] },
    { id: 'l5', kind: 'word', q: 'なんじですか。', en: 'What time is it?',
      audio: 'よじ', pic: true, choices: ['4:00', '7:00', '9:00', '1:00'] },

    // ---------- ประโยค ----------
    { id: 'l6', kind: 'kadai', q: 'いくらですか。', en: 'How much is it?',
      audio: 'この ほんは さんびゃくえんです。', pic: true, choices: ['¥300', '¥3,000', '¥130', '¥800'] },
    { id: 'l7', kind: 'kadai', q: 'この ひとは あした なにを しますか。', en: 'What will this person do tomorrow?',
      audio: 'あした、ともだちと えいがを みます。', pic: true, choices: ['🎬', '🏊', '🍜', '📚'] },
    { id: 'l8', kind: 'outou', q: 'いちばん いい へんじは どれですか。', en: 'Which is the best reply?',
      audio: 'ありがとうございます。', choices: ['どういたしまして。', 'いただきます。', 'おやすみなさい。', 'いってきます。'] },
    { id: 'l9', kind: 'outou', q: 'いちばん いい へんじは どれですか。', en: 'Which is the best reply?',
      audio: 'おなまえは なんですか。', choices: ['たなかです。', 'はたちです。', 'タイです。', 'げんきです。'] },
    { id: 'l10', kind: 'outou', q: 'いちばん いい へんじは どれですか。', en: 'Which is the best reply?',
      audio: 'いま なんじですか。', choices: ['くじです。', 'くがつです。', 'きゅうえんです。', 'ここです。'] }
  ],

  speaking: [
    // ---------- สั้น ----------
    { id: 's1', jp: 'はじめまして。', kana: 'はじめまして' },
    { id: 's2', jp: 'おはようございます。', kana: 'おはようございます', alt: ['お早うございます'] },
    { id: 's3', jp: 'これはペンです。', kana: 'これはペンです' },
    { id: 's4', jp: '私は学生です。', kana: 'わたしはがくせいです', alt: ['わたしは学生です'] },
    { id: 's5', jp: '水をください。', kana: 'みずをください', alt: ['お水をください'] },
    { id: 's6', jp: 'いくらですか。', kana: 'いくらですか' },
    // ---------- กลาง ----------
    { id: 's7', jp: '今日はいい天気ですね。', kana: 'きょうはいいてんきですね', alt: ['今日は良い天気ですね', 'きょうはいい天気ですね'] },
    { id: 's8', jp: '駅はどこですか。', kana: 'えきはどこですか' },
    { id: 's9', jp: '毎朝コーヒーを飲みます。', kana: 'まいあさコーヒーをのみます', alt: ['毎朝コーヒーをのみます'] },
    { id: 's10', jp: '日本語はおもしろいです。', kana: 'にほんごはおもしろいです', alt: ['日本語は面白いです'] },
    { id: 's11', jp: '土曜日に映画を見ました。', kana: 'どようびにえいがをみました', alt: ['土曜日に映画をみました'] },
    { id: 's12', jp: 'トイレはどこにありますか。', kana: 'トイレはどこにありますか' },
    // ---------- ยาวขึ้น ----------
    { id: 's13', jp: '私はタイから来ました。', kana: 'わたしはタイからきました', alt: ['私はタイからきました', 'わたしはタイから来ました'] },
    { id: 's14', jp: '明日は学校へ行きません。', kana: 'あしたはがっこうへいきません', alt: ['明日は学校に行きません', 'あしたは学校へ行きません'] },
    { id: 's15', jp: 'このりんごを三つください。', kana: 'このりんごをみっつください', alt: ['このりんごを3つください', 'このリンゴを3つください', 'このリンゴを三つください'] },
    { id: 's16', jp: 'ゆっくり話してください。', kana: 'ゆっくりはなしてください', alt: ['ゆっくりはなしてください'] },
    { id: 's17', jp: '昨日は雨でしたが、今日は晴れです。', kana: 'きのうはあめでしたが、きょうははれです', verify: true,
      alt: ['昨日は雨でしたが今日は晴れです', 'きのうは雨でしたが今日は晴れです'] },
    { id: 's18', jp: '駅の前で友だちに会いました。', kana: 'えきのまえでともだちにあいました', alt: ['駅の前で友達に会いました', '駅の前で友達にあいました'] }
  ]
};
