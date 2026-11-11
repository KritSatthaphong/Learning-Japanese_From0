/*
 * วลีเอาตัวรอด ขั้น 5 (6 สถานการณ์ × 10 วลี) — ใช้ใน Phrasebook และฝึกพูดด้วย
 * ------------------------------------------------------------
 *   id     : รหัสวลี (ห้ามซ้ำ ใช้บันทึกความคืบหน้า)
 *   level  : ด่าน (5-1 ทักทาย, 5-2 แนะนำตัว, 5-3 ร้านอาหาร, 5-4 ซื้อของ, 5-5 ถามทาง, 5-6 ขอความช่วยเหลือ)
 *   jp     : รูปเขียนจริง (มีคันจิ) ใช้อ่านออกเสียง
 *   kana   : เขียนด้วยคานะล้วน
 *   romaji : โรมันจิ        th : ความหมายไทย        note : หมายเหตุ (ไม่บังคับ)
 *   blocks : บล็อกคำสำหรับโจทย์ต่อประโยค (ต่อกันแล้วต้องได้ kana ไม่นับ 、)
 *   decoys : บล็อกหลอก
 *   accept : ลำดับอื่นที่ถูกเหมือนกัน (ไม่บังคับ)
 *   alt    : รูปเขียนอื่นที่ระบบถอดเสียงอาจให้ออกมา (ใช้ในเฟส 5)
 *   verify : true = ยังไม่มั่นใจว่าเป็นธรรมชาติ ควรถามคนญี่ปุ่น
 */
window.NS = window.NS || {};

NS.PHRASES = [
  // ---------- 5-1 ทักทาย ----------
  { id: "greet-ohayou", level: "5-1", jp: "おはようございます", kana: "おはようございます", romaji: "ohayou gozaimasu", th: "สวัสดีตอนเช้า",
    blocks: ["おはよう", "ございます"], decoys: ["です"], alt: ["お早うございます"] },
  { id: "greet-konnichiwa", level: "5-1", jp: "こんにちは", kana: "こんにちは", romaji: "konnichiwa", th: "สวัสดี (ตอนกลางวัน)",
    note: "は ตัวท้ายอ่านว่า wa", blocks: ["こんにちは"], alt: ["今日は"] },
  { id: "greet-konbanwa", level: "5-1", jp: "こんばんは", kana: "こんばんは", romaji: "konbanwa", th: "สวัสดีตอนเย็น / ค่ำ",
    note: "は ตัวท้ายอ่านว่า wa", blocks: ["こんばんは"], alt: ["今晩は"] },
  { id: "greet-arigatou", level: "5-1", jp: "ありがとうございます", kana: "ありがとうございます", romaji: "arigatou gozaimasu", th: "ขอบคุณครับ/ค่ะ",
    blocks: ["ありがとう", "ございます"], decoys: ["すみません"], alt: ["有難うございます"] },
  { id: "greet-sumimasen", level: "5-1", jp: "すみません", kana: "すみません", romaji: "sumimasen", th: "ขอโทษครับ/ค่ะ (ใช้เรียกคนก็ได้)",
    note: "ใช้ได้ทั้งขอโทษ เรียกพนักงาน และขอทาง", blocks: ["すみません"], alt: ["済みません"] },
  { id: "greet-oyasumi", level: "5-1", jp: "おやすみなさい", kana: "おやすみなさい", romaji: "oyasuminasai", th: "ราตรีสวัสดิ์",
    blocks: ["おやすみ", "なさい"], decoys: ["ください"], alt: ["お休みなさい"] },
  { id: "greet-itadakimasu", level: "5-1", jp: "いただきます", kana: "いただきます", romaji: "itadakimasu", th: "(พูดก่อนเริ่มกิน)",
    note: "คล้าย \"ขอบคุณสำหรับอาหาร\" ก่อนกิน", blocks: ["いただきます"], alt: ["頂きます"] },
  { id: "greet-gochisousama", level: "5-1", jp: "ごちそうさまでした", kana: "ごちそうさまでした", romaji: "gochisousama deshita", th: "(พูดหลังกินเสร็จ) ขอบคุณสำหรับอาหาร",
    blocks: ["ごちそうさま", "でした"], decoys: ["です"], alt: ["ご馳走様でした"] },
  { id: "greet-sayounara", level: "5-1", jp: "さようなら", kana: "さようなら", romaji: "sayounara", th: "ลาก่อน",
    note: "ใช้ตอนจะไม่ได้เจอกันนาน ในชีวิตประจำวันมักพูด では、また (แล้วเจอกันใหม่)", blocks: ["さようなら"] },
  { id: "greet-ogenki", level: "5-1", jp: "お元気ですか", kana: "おげんきですか", romaji: "ogenki desu ka", th: "สบายดีไหม",
    note: "ใช้กับคนที่ไม่ได้เจอกันนาน", blocks: ["おげんき", "です", "か"], decoys: ["は"] },

  // ---------- 5-2 แนะนำตัว ----------
  { id: "intro-hajimemashite", level: "5-2", jp: "はじめまして", kana: "はじめまして", romaji: "hajimemashite", th: "ยินดีที่ได้รู้จัก (พูดตอนเจอกันครั้งแรก)",
    blocks: ["はじめまして"], alt: ["初めまして"] },
  { id: "intro-name", level: "5-2", jp: "私はソムチャイです", kana: "わたしはソムチャイです", romaji: "watashi wa somuchai desu", th: "ผมชื่อสมชาย",
    note: "เปลี่ยน ソムチャイ เป็นชื่อตัวเองได้", blocks: ["わたし", "は", "ソムチャイ", "です"], decoys: ["を"], alt: ["わたしはソムチャイです"] },
  { id: "intro-from", level: "5-2", jp: "タイから来ました", kana: "タイからきました", romaji: "tai kara kimashita", th: "มาจากประเทศไทย",
    blocks: ["タイ", "から", "きました"], decoys: ["へ"] },
  { id: "intro-student", level: "5-2", jp: "大学生です", kana: "だいがくせいです", romaji: "daigakusei desu", th: "เป็นนักศึกษามหาวิทยาลัย",
    blocks: ["だいがくせい", "です"], decoys: ["ます"] },
  { id: "intro-major", level: "5-2", jp: "機械工学を勉強しています", kana: "きかいこうがくをべんきょうしています", romaji: "kikai kougaku o benkyou shite imasu", th: "เรียนวิศวกรรมเครื่องกล",
    blocks: ["きかいこうがく", "を", "べんきょうしています"], decoys: ["は"] },
  { id: "intro-little", level: "5-2", jp: "日本語が少し話せます", kana: "にほんごがすこしはなせます", romaji: "nihongo ga sukoshi hanasemasu", th: "พูดภาษาญี่ปุ่นได้นิดหน่อย",
    blocks: ["にほんご", "が", "すこし", "はなせます"], decoys: ["を"], accept: ["すこしにほんごがはなせます"] },
  { id: "intro-hobby", level: "5-2", jp: "趣味はアニメです", kana: "しゅみはアニメです", romaji: "shumi wa anime desu", th: "งานอดิเรกคือดูอนิเมะ",
    blocks: ["しゅみ", "は", "アニメ", "です"], decoys: ["を"], verify: true },
  { id: "intro-yoroshiku", level: "5-2", jp: "よろしくお願いします", kana: "よろしくおねがいします", romaji: "yoroshiku onegaishimasu", th: "ฝากเนื้อฝากตัวด้วยครับ/ค่ะ",
    blocks: ["よろしく", "おねがいします"], decoys: ["ください"] },
  { id: "intro-askname", level: "5-2", jp: "お名前は何ですか", kana: "おなまえはなんですか", romaji: "onamae wa nan desu ka", th: "คุณชื่ออะไรครับ/คะ",
    blocks: ["おなまえ", "は", "なん", "ですか"], decoys: ["を"], verify: true },
  { id: "intro-firsttime", level: "5-2", jp: "日本は初めてです", kana: "にほんははじめてです", romaji: "nihon wa hajimete desu", th: "มาญี่ปุ่นเป็นครั้งแรก",
    blocks: ["にほん", "は", "はじめて", "です"], decoys: ["を"] },

  // ---------- 5-3 ร้านอาหาร ----------
  { id: "food-futari", level: "5-3", jp: "二人です", kana: "ふたりです", romaji: "futari desu", th: "มา 2 คน",
    note: "ตอบเมื่อพนักงานถาม なんめいさまですか (กี่ท่าน) · มาคนเดียว = ひとりです", blocks: ["ふたり", "です"], decoys: ["ひとつ"], alt: ["2人です", "二人です"] },
  { id: "food-menu", level: "5-3", jp: "メニューをください", kana: "メニューをください", romaji: "menyuu o kudasai", th: "ขอเมนูหน่อย",
    blocks: ["メニュー", "を", "ください"], decoys: ["は"] },
  { id: "food-english", level: "5-3", jp: "英語のメニューはありますか", kana: "えいごのメニューはありますか", romaji: "eigo no menyuu wa arimasu ka", th: "มีเมนูภาษาอังกฤษไหม",
    blocks: ["えいご", "の", "メニュー", "は", "ありますか"], decoys: ["を"] },
  { id: "food-kore", level: "5-3", jp: "これをください", kana: "これをください", romaji: "kore o kudasai", th: "ขออันนี้ (ชี้ที่เมนู)",
    blocks: ["これ", "を", "ください"], decoys: ["は"] },
  { id: "food-osusume", level: "5-3", jp: "おすすめは何ですか", kana: "おすすめはなんですか", romaji: "osusume wa nan desu ka", th: "เมนูแนะนำคืออะไร",
    blocks: ["おすすめ", "は", "なん", "ですか"], decoys: ["を"] },
  { id: "food-omizu", level: "5-3", jp: "お水をください", kana: "おみずをください", romaji: "omizu o kudasai", th: "ขอน้ำเปล่าหน่อย",
    blocks: ["おみず", "を", "ください"], decoys: ["は"] },
  { id: "food-notspicy", level: "5-3", jp: "辛くしないでください", kana: "からくしないでください", romaji: "karaku shinaide kudasai", th: "ไม่เอาเผ็ดนะครับ/คะ",
    blocks: ["からく", "しないで", "ください"], decoys: ["します"], verify: true },
  { id: "food-oishii", level: "5-3", jp: "美味しいです", kana: "おいしいです", romaji: "oishii desu", th: "อร่อยครับ/ค่ะ",
    blocks: ["おいしい", "です"], decoys: ["ます"], alt: ["おいしいです"] },
  { id: "food-kaikei", level: "5-3", jp: "お会計お願いします", kana: "おかいけいおねがいします", romaji: "okaikei onegaishimasu", th: "เช็กบิลด้วยครับ/ค่ะ",
    blocks: ["おかいけい", "おねがいします"], decoys: ["ください"] },
  { id: "food-card", level: "5-3", jp: "カードは使えますか", kana: "カードはつかえますか", romaji: "kaado wa tsukaemasu ka", th: "ใช้บัตรเครดิตได้ไหม",
    blocks: ["カード", "は", "つかえますか"], decoys: ["を"] },

  // ---------- 5-4 ซื้อของ / ถามราคา ----------
  { id: "shop-ikura", level: "5-4", jp: "これはいくらですか", kana: "これはいくらですか", romaji: "kore wa ikura desu ka", th: "อันนี้ราคาเท่าไหร่",
    blocks: ["これ", "は", "いくら", "ですか"], decoys: ["を"] },
  { id: "shop-zenbu", level: "5-4", jp: "全部でいくらですか", kana: "ぜんぶでいくらですか", romaji: "zenbu de ikura desu ka", th: "ทั้งหมดเท่าไหร่",
    blocks: ["ぜんぶ", "で", "いくら", "ですか"], decoys: ["は"] },
  { id: "shop-korenishimasu", level: "5-4", jp: "これにします", kana: "これにします", romaji: "kore ni shimasu", th: "เอาอันนี้ (ตัดสินใจเลือกแล้ว)",
    blocks: ["これ", "に", "します"], decoys: ["を"] },
  { id: "shop-miteru", level: "5-4", jp: "見ているだけです", kana: "みているだけです", romaji: "mite iru dake desu", th: "แค่ดูเฉยๆ ครับ/ค่ะ",
    blocks: ["みている", "だけ", "です"], decoys: ["ください"] },
  { id: "shop-shichaku", level: "5-4", jp: "試着してもいいですか", kana: "しちゃくしてもいいですか", romaji: "shichaku shite mo ii desu ka", th: "ขอลองใส่ได้ไหม",
    blocks: ["しちゃく", "しても", "いいですか"], decoys: ["ください"] },
  { id: "shop-bigger", level: "5-4", jp: "もっと大きいのはありますか", kana: "もっとおおきいのはありますか", romaji: "motto ookii no wa arimasu ka", th: "มีไซซ์ใหญ่กว่านี้ไหม",
    blocks: ["もっと", "おおきいの", "は", "ありますか"], decoys: ["ちいさいの"] },
  { id: "shop-nobag", level: "5-4", jp: "袋はいりません", kana: "ふくろはいりません", romaji: "fukuro wa irimasen", th: "ไม่รับถุงครับ/ค่ะ",
    blocks: ["ふくろ", "は", "いりません"], decoys: ["を"] },
  { id: "shop-cardpay", level: "5-4", jp: "カードでお願いします", kana: "カードでおねがいします", romaji: "kaado de onegaishimasu", th: "จ่ายด้วยบัตรครับ/ค่ะ",
    blocks: ["カード", "で", "おねがいします"], decoys: ["を"] },
  { id: "shop-menzei", level: "5-4", jp: "免税できますか", kana: "めんぜいできますか", romaji: "menzei dekimasu ka", th: "ทำ Tax Free ได้ไหม",
    blocks: ["めんぜい", "できますか"], decoys: ["を"], verify: true },
  { id: "shop-takai", level: "5-4", jp: "ちょっと高いです", kana: "ちょっとたかいです", romaji: "chotto takai desu", th: "แพงไปหน่อย",
    blocks: ["ちょっと", "たかい", "です"], decoys: ["やすい"] },

  // ---------- 5-5 ถามทาง ----------
  { id: "dir-eki", level: "5-5", jp: "すみません、駅はどこですか", kana: "すみません、えきはどこですか", romaji: "sumimasen, eki wa doko desu ka", th: "ขอโทษครับ/ค่ะ สถานีอยู่ที่ไหน",
    blocks: ["すみません", "えき", "は", "どこ", "ですか"], decoys: ["を"] },
  { id: "dir-toire", level: "5-5", jp: "トイレはどこですか", kana: "トイレはどこですか", romaji: "toire wa doko desu ka", th: "ห้องน้ำอยู่ที่ไหน",
    blocks: ["トイレ", "は", "どこ", "ですか"], decoys: ["に"] },
  { id: "dir-tooi", level: "5-5", jp: "ここから遠いですか", kana: "ここからとおいですか", romaji: "koko kara tooi desu ka", th: "จากที่นี่ไกลไหม",
    blocks: ["ここ", "から", "とおい", "ですか"], decoys: ["まで"] },
  { id: "dir-aruite", level: "5-5", jp: "歩いて行けますか", kana: "あるいていけますか", romaji: "aruite ikemasu ka", th: "เดินไปได้ไหม",
    blocks: ["あるいて", "いけますか"], decoys: ["きます"] },
  { id: "dir-densha", level: "5-5", jp: "この電車は新宿に行きますか", kana: "このでんしゃはしんじゅくにいきますか", romaji: "kono densha wa shinjuku ni ikimasu ka", th: "รถไฟขบวนนี้ไปชินจูกุไหม",
    blocks: ["この", "でんしゃ", "は", "しんじゅく", "に", "いきますか"], decoys: ["を"] },
  { id: "dir-chizu", level: "5-5", jp: "地図で教えてください", kana: "ちずでおしえてください", romaji: "chizu de oshiete kudasai", th: "ช่วยชี้ในแผนที่ให้หน่อย",
    blocks: ["ちず", "で", "おしえて", "ください"], decoys: ["を"], verify: true },
  { id: "dir-massugu", level: "5-5", jp: "まっすぐですか", kana: "まっすぐですか", romaji: "massugu desu ka", th: "ตรงไปใช่ไหม",
    blocks: ["まっすぐ", "ですか"], decoys: ["みぎ"] },
  { id: "dir-migihidari", level: "5-5", jp: "右ですか、左ですか", kana: "みぎですか、ひだりですか", romaji: "migi desu ka, hidari desu ka", th: "ไปทางขวาหรือซ้าย",
    blocks: ["みぎ", "ですか", "ひだり", "ですか"], decoys: ["まっすぐ"], accept: ["ひだりですかみぎですか"] },
  { id: "dir-nanpun", level: "5-5", jp: "駅まで何分ですか", kana: "えきまでなんぷんですか", romaji: "eki made nanpun desu ka", th: "ไปสถานีใช้เวลากี่นาที",
    blocks: ["えき", "まで", "なんぷん", "ですか"], decoys: ["から"] },
  { id: "dir-taxi", level: "5-5", jp: "タクシー乗り場はどこですか", kana: "タクシーのりばはどこですか", romaji: "takushii noriba wa doko desu ka", th: "จุดขึ้นแท็กซี่อยู่ที่ไหน",
    blocks: ["タクシーのりば", "は", "どこ", "ですか"], decoys: ["を"] },

  // ---------- 5-6 ขอความช่วยเหลือ ----------
  { id: "help-wakarimasen", level: "5-6", jp: "すみません、分かりません", kana: "すみません、わかりません", romaji: "sumimasen, wakarimasen", th: "ขอโทษครับ/ค่ะ ไม่เข้าใจ",
    blocks: ["すみません", "わかりません"], decoys: ["わかります"], alt: ["すみません、わかりません"] },
  { id: "help-mouichido", level: "5-6", jp: "もう一度お願いします", kana: "もういちどおねがいします", romaji: "mou ichido onegaishimasu", th: "ช่วยพูดอีกครั้งได้ไหม",
    blocks: ["もういちど", "おねがいします"], decoys: ["ください"], alt: ["もう1度お願いします", "もういちどお願いします"] },
  { id: "help-yukkuri", level: "5-6", jp: "ゆっくり話してください", kana: "ゆっくりはなしてください", romaji: "yukkuri hanashite kudasai", th: "ช่วยพูดช้าๆ หน่อย",
    blocks: ["ゆっくり", "はなして", "ください"], decoys: ["はなします"] },
  { id: "help-eigo", level: "5-6", jp: "英語は話せますか", kana: "えいごははなせますか", romaji: "eigo wa hanasemasu ka", th: "พูดภาษาอังกฤษได้ไหม",
    blocks: ["えいご", "は", "はなせますか"], decoys: ["を"] },
  { id: "help-sukoshi", level: "5-6", jp: "日本語が少ししか分かりません", kana: "にほんごがすこししかわかりません", romaji: "nihongo ga sukoshi shika wakarimasen", th: "เข้าใจภาษาญี่ปุ่นแค่นิดหน่อย",
    blocks: ["にほんご", "が", "すこし", "しか", "わかりません"], decoys: ["を"] },
  { id: "help-kaite", level: "5-6", jp: "書いてください", kana: "かいてください", romaji: "kaite kudasai", th: "ช่วยเขียนให้ดูหน่อย",
    blocks: ["かいて", "ください"], decoys: ["かいます"] },
  { id: "help-nihongode", level: "5-6", jp: "これは日本語で何ですか", kana: "これはにほんごでなんですか", romaji: "kore wa nihongo de nan desu ka", th: "อันนี้ภาษาญี่ปุ่นเรียกว่าอะไร",
    blocks: ["これ", "は", "にほんご", "で", "なんですか"], decoys: ["を"], accept: ["にほんごでこれはなんですか"] },
  { id: "help-tasukete", level: "5-6", jp: "助けてください", kana: "たすけてください", romaji: "tasukete kudasai", th: "ช่วยด้วย!",
    blocks: ["たすけて", "ください"], decoys: ["します"] },
  { id: "help-mayoimashita", level: "5-6", jp: "道に迷いました", kana: "みちにまよいました", romaji: "michi ni mayoimashita", th: "หลงทางครับ/ค่ะ",
    blocks: ["みち", "に", "まよいました"], decoys: ["を"] },
  { id: "help-daijoubu", level: "5-6", jp: "大丈夫です", kana: "だいじょうぶです", romaji: "daijoubu desu", th: "ไม่เป็นไรครับ/ค่ะ / โอเค",
    blocks: ["だいじょうぶ", "です"], decoys: ["ます"] }
];
