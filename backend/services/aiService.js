// =============================================================
// AI Orchestrator Service — Multi-language support (12 languages)
// =============================================================
const bankingService = require("./bankingService");
const { appendTurn, getSession } = require("../models/session");

// ── Language Detection ────────────────────────────────────────
const SCRIPT_PATTERNS = {
  hi: /[\u0900-\u097F]/, // Devanagari (Hindi, Marathi)
  bn: /[\u0980-\u09FF]/, // Bengali
  ta: /[\u0B80-\u0BFF]/, // Tamil
  te: /[\u0C00-\u0C7F]/, // Telugu
  kn: /[\u0C80-\u0CFF]/, // Kannada
  ml: /[\u0D00-\u0D7F]/, // Malayalam
  gu: /[\u0A80-\u0AFF]/, // Gujarati
  pa: /[\u0A00-\u0A7F]/, // Punjabi / Gurmukhi
  or: /[\u0B00-\u0B7F]/, // Odia
  ur: /[\u0600-\u06FF]/, // Arabic script (Urdu)
};

const HINDI_KEYWORDS = [
  "nahi",
  "mujhe",
  "mera",
  "meri",
  "paisa",
  "khata",
  "shikayat",
  "kripya",
  "namaste",
  "dhanyawad",
  "bakaya",
];
const MARATHI_KEYWORDS = ["mala", "mazha", "tumcha", "ahe", "nahi", "khate"];

const detectLanguage = (text = "", hint = null) => {
  // Prefer explicit language hint from client (selected language)
  if (hint && hint !== "en") return hint;
  // Script-based detection
  for (const [lang, pattern] of Object.entries(SCRIPT_PATTERNS)) {
    if (pattern.test(text)) return lang;
  }
  // Keyword fallback
  const lower = text.toLowerCase();
  if (HINDI_KEYWORDS.some((kw) => lower.includes(kw))) return "hi";
  return "en";
};

// ── Intent Detection ─────────────────────────────────────────
const INTENT_MAP = [
  {
    intent: "balance",
    keywords: [
      "balance",
      "bakaya",
      "kitna",
      "how much",
      "account balance",
      "check balance",
      "check my balance",
      "paisa kitna",
      "shillak",
      "bakiye",
      "remaining",
    ],
  },
  {
    intent: "statement",
    keywords: [
      "statement",
      "transactions",
      "history",
      "mini statement",
      "last transaction",
      "passbook",
      "show mini",
      "vivara",
      "hakku",
    ],
  },
  {
    intent: "block_card",
    keywords: [
      "block my card",
      "block card",
      "card block",
      "lost card",
      "stolen card",
      "debit block",
      "block my",
      "my card",
      "band karo",
      "card band",
      "block karo",
      "card lost",
      "card stolen",
    ],
  },
  {
    intent: "loan",
    keywords: [
      "loan",
      "home loan",
      "personal loan",
      "vehicle loan",
      "education loan",
      "emi",
      "borrow",
      "karz",
      "karzu",
      "qarz",
      "apply for loan",
      "want loan",
      "need loan",
    ],
  },
  {
    intent: "complaint",
    keywords: [
      "complaint",
      "file complaint",
      "problem",
      "issue",
      "not working",
      "wrong",
      "error",
      "shikayat",
      "pareshaani",
      "taqleef",
    ],
  },
  {
    intent: "fraud",
    keywords: [
      "fraud",
      "scam",
      "unauthorized",
      "hacked",
      "stolen money",
      "dhoka",
      "chori",
      "suspicious",
      "farzi",
      "thagi",
    ],
  },
  {
    intent: "escalate",
    keywords: [
      "angry",
      "frustrated",
      "useless",
      "terrible",
      "worst",
      "human",
      "talk to agent",
      "agent",
      "manager",
      "not satisfied",
      "pathetic",
      "gussa",
      "naraaz",
    ],
  },
  {
    intent: "greeting",
    keywords: [
      "hello",
      "hi",
      "hey",
      "namaste",
      "vanakkam",
      "namaskar",
      "sat sri akal",
      "good morning",
      "help",
      "i need help",
    ],
  },
  {
    intent: "farewell",
    keywords: [
      "bye",
      "goodbye",
      "thank you",
      "thanks",
      "dhanyawad",
      "nandri",
      "shukriya",
      "alvida",
    ],
  },
];

const detectIntent = (text = "") => {
  const lower = text.toLowerCase();
  for (const { intent, keywords } of INTENT_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return intent;
  }
  return "unknown";
};

// ── Escalation Trigger ────────────────────────────────────────
const ESCALATION_INTENTS = new Set(["fraud", "escalate", "complaint"]);
const shouldEscalate = (intent) => ESCALATION_INTENTS.has(intent);

// ── Response Templates (12 languages) ────────────────────────
// Structured as: lang → { intent: string | fn }
// For regional langs: balance/statement/loan are data-driven; others are static strings
const makeResponses = ({
  greeting,
  farewell,
  unknown,
  balance,
  statement,
  block_card,
  loan,
  complaint,
  fraud,
  escalate,
}) => ({
  greeting,
  farewell,
  unknown,
  balance,
  statement,
  block_card,
  loan,
  complaint,
  fraud,
  escalate,
});

const RESPONSES = {
  en: makeResponses({
    greeting:
      "Hello! I am your AI banking assistant. How can I help you? I can check your balance, show statements, block cards, help with loans, or file complaints.",
    farewell: "Thank you for using RamSetu. Have a wonderful day!",
    unknown:
      "I didn't quite understand that. You can ask me about your balance, transactions, card blocking, loans, or file a complaint.",
    balance: (d) =>
      `Your current account balance is \u20b9${d.balance.toLocaleString("en-IN")}. Account: ${d.accountNumber}`,
    statement: (d) =>
      `Your last ${d.transactions.length} transactions:\n${d.transactions.map((t) => `\u2022 ${t.date} | ${t.type.toUpperCase()} \u20b9${t.amount.toLocaleString("en-IN")} \u2014 ${t.description}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "Your card is already blocked. Visit any branch for a replacement."
        : `Card blocked successfully. Reference: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `You are eligible for a ${d.loanType} loan up to \u20b9${d.requestedAmount.toLocaleString("en-IN")} at ${d.interestRate}. EMI: \u20b9${d.emi}/month. Ref: ${d.referenceNumber}`
        : d.message,
    complaint:
      "Your complaint has been registered. Our team will contact you within 24 hours. Escalating you to a human agent now.",
    fraud:
      "Fraud alert registered! Escalating immediately to our fraud prevention team. Do NOT share any OTP or PIN with anyone.",
    escalate:
      "I understand your concern and sincerely apologize. Connecting you to a senior banking expert right away.",
  }),
  hi: makeResponses({
    greeting:
      "नमस्ते! मैं आपका AI बैंकिंग सहायक हूँ। मैं बैलेंस, स्टेटमेंट, कार्ड ब्लॉकिंग, लोन या शिकायत में मदद कर सकता हूँ।",
    farewell: "RamSetu का उपयोग करने के लिए धन्यवाद। आपका दिन शुभ हो!",
    unknown:
      "मुझे यह समझ नहीं आया। बैलेंस, लेनदेन, कार्ड ब्लॉकिंग, लोन या शिकायत के बारे में पूछें।",
    balance: (d) =>
      `आपके खाते में \u20b9${d.balance.toLocaleString("en-IN")} उपलब्ध हैं। खाता: ${d.accountNumber}`,
    statement: (d) =>
      `आपके अंतिम ${d.transactions.length} लेनदेन:\n${d.transactions.map((t) => `\u2022 ${t.date} | ${t.type === "credit" ? "जमा" : "निकासी"} \u20b9${t.amount.toLocaleString("en-IN")} \u2014 ${t.description}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "आपका कार्ड पहले से ब्लॉक है।"
        : `कार्ड सफलतापूर्वक ब्लॉक किया गया। संदर्भ: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `आप \u20b9${d.requestedAmount.toLocaleString("en-IN")} के ${d.loanType} लोन के लिए पात्र हैं। EMI: \u20b9${d.emi}/माह।`
        : d.message,
    complaint:
      "आपकी शिकायत दर्ज की गई है। 24 घंटे में संपर्क होगा। मैं आपको मानव एजेंट से जोड़ रहा हूँ।",
    fraud:
      "धोखाधड़ी की सूचना दर्ज! तुरंत टीम से जोड़ा जा रहा है। कोई OTP या PIN किसी को न बताएं।",
    escalate: "मुझे खेद है। मैं आपको अभी एक वरिष्ठ विशेषज्ञ से जोड़ रहा हूँ।",
  }),
  bn: makeResponses({
    greeting:
      "নমস্কার! আমি আপনার AI ব্যাংকিং সহকারী। আমি ব্যালেন্স, স্টেটমেন্ট, কার্ড ব্লক, ঋণ বা অভিযোগে সাহায্য করতে পারি।",
    farewell: "RamSetu ব্যবহার করার জন্য ধন্যবাদ। আপনার দিনটি শুভ হোক!",
    unknown:
      "আমি বুঝতে পারিনি। ব্যালেন্স, লেনদেন, কার্ড ব্লক বা ঋণ সম্পর্কে জিজ্ঞাসা করুন।",
    balance: (d) =>
      `আপনার অ্যাকাউন্টে \u20b9${d.balance.toLocaleString("en-IN")} আছে। অ্যাকাউন্ট: ${d.accountNumber}`,
    statement: (d) =>
      `আপনার শেষ ${d.transactions.length}টি লেনদেন:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "আপনার কার্ড ইতিমধ্যে ব্লক করা আছে।"
        : `কার্ড সফলভাবে ব্লক করা হয়েছে। রেফারেন্স: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `আপনি \u20b9${d.requestedAmount.toLocaleString("en-IN")} পর্যন্ত ${d.loanType} ঋণের যোগ্য। EMI: \u20b9${d.emi}/মাস।`
        : d.message,
    complaint: "আপনার অভিযোগ নথিভুক্ত হয়েছে। ২৪ ঘণ্টার মধ্যে যোগাযোগ করা হবে।",
    fraud:
      "প্রতারণার সতর্কতা! আমরা অবিলম্বে দলকে সংযুক্ত করছি। কাউকে OTP বা PIN দেবেন না।",
    escalate: "আমি দুঃখিত। এখনই একজন সিনিয়র বিশেষজ্ঞের সাথে যুক্ত করছি।",
  }),
  ta: makeResponses({
    greeting:
      "வணக்கம்! நான் உங்கள் AI வங்கி உதவியாளர். இருப்பு, அறிக்கை, அட்டை தடை, கடன் அல்லது புகாரில் உதவ முடியும்.",
    farewell: "RamSetu பயன்படுத்தியதற்கு நன்றி. நல்ல நாள்!",
    unknown:
      "புரியவில்லை. இருப்பு, பரிவர்த்தனை, அட்டை தடை அல்லது கடன் பற்றி கேளுங்கள்.",
    balance: (d) =>
      `உங்கள் கணக்கில் \u20b9${d.balance.toLocaleString("en-IN")} உள்ளது. கணக்கு: ${d.accountNumber}`,
    statement: (d) =>
      `கடைசி ${d.transactions.length} பரிவர்த்தனைகள்:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "உங்கள் அட்டை ஏற்கனவே தடுக்கப்பட்டுள்ளது."
        : `அட்டை வெற்றிகரமாக தடுக்கப்பட்டது. Ref: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `நீங்கள் \u20b9${d.requestedAmount.toLocaleString("en-IN")} வரை ${d.loanType} கடனுக்கு தகுதியானவர்.`
        : d.message,
    complaint:
      "உங்கள் புகார் பதிவு செய்யப்பட்டது. 24 மணி நேரத்தில் தொடர்பு கொள்வோம்.",
    fraud:
      "மோசடி எச்சரிக்கை! உடனே குழுவிடம் இணைக்கிறோம். OTP அல்லது PIN யாரிடமும் சொல்லாதீர்கள்.",
    escalate: "மன்னிக்கவும். உடனே மூத்த நிபுணரிடம் இணைக்கிறோம்.",
  }),
  te: makeResponses({
    greeting:
      "నమస్కారం! నేను మీ AI బ్యాంకింగ్ సహాయకుడని. బ్యాలెన్స్, స్టేట్‌మెంట్, కార్డ్ బ్లాక్, రుణం లేదా ఫిర్యాదులో సహాయం చేయగలను.",
    farewell: "RamSetu ఉపయోగించినందుకు ధన్యవాదాలు. మీకు శుభదినం!",
    unknown:
      "అర్థం కాలేదు. బ్యాలెన్స్, లావాదేవీలు, కార్డ్ బ్లాక్ లేదా రుణం గురించి అడగండి.",
    balance: (d) =>
      `మీ ఖాతాలో \u20b9${d.balance.toLocaleString("en-IN")} ఉంది. ఖాతా: ${d.accountNumber}`,
    statement: (d) =>
      `చివరి ${d.transactions.length} లావాదేవీలు:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "మీ కార్డ్ ఇప్పటికే బ్లాక్ చేయబడింది."
        : `కార్డ్ విజయవంతంగా బ్లాక్ చేయబడింది. Ref: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `మీరు \u20b9${d.requestedAmount.toLocaleString("en-IN")} వరకు ${d.loanType} రుణానికి అర్హులు.`
        : d.message,
    complaint: "మీ ఫిర్యాదు నమోదు చేయబడింది. 24 గంటల్లో సంప్రదిస్తాము.",
    fraud:
      "మోసం హెచ్చరిక! వెంటనే బృందానికి అనుసంధానిస్తున్నాము. OTP లేదా PIN ఎవరికీ చెప్పకండి.",
    escalate: "క్షమించండి. వెంటనే సీనియర్ నిపుణుడికి అనుసంధానిస్తున్నాము.",
  }),
  kn: makeResponses({
    greeting:
      "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಬ್ಯಾಂಕಿಂಗ್ ಸಹಾಯಕ. ಬ್ಯಾಲೆನ್ಸ್, ಸ್ಟೇಟ್‌ಮೆಂಟ್, ಕಾರ್ಡ್ ಬ್ಲಾಕ್, ಸಾಲ ಅಥವಾ ದೂರಿನಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    farewell: "RamSetu ಬಳಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು. ಶುಭ ದಿನ!",
    unknown:
      "ಅರ್ಥವಾಗಲಿಲ್ಲ. ಬ್ಯಾಲೆನ್ಸ್, ವ್ಯವಹಾರಗಳು, ಕಾರ್ಡ್ ಬ್ಲಾಕ್ ಅಥವಾ ಸಾಲದ ಬಗ್ಗೆ ಕೇಳಿ.",
    balance: (d) =>
      `ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ \u20b9${d.balance.toLocaleString("en-IN")} ಇದೆ. ಖಾತೆ: ${d.accountNumber}`,
    statement: (d) =>
      `ಕಡೆಯ ${d.transactions.length} ವ್ಯವಹಾರಗಳು:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "ನಿಮ್ಮ ಕಾರ್ಡ್ ಈಗಾಗಲೇ ಬ್ಲಾಕ್ ಆಗಿದೆ."
        : `ಕಾರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ಬ್ಲಾಕ್ ಮಾಡಲಾಗಿದೆ. Ref: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `ನೀವು \u20b9${d.requestedAmount.toLocaleString("en-IN")} ವರೆಗೆ ${d.loanType} ಸಾಲಕ್ಕೆ ಅರ್ಹರು.`
        : d.message,
    complaint: "ನಿಮ್ಮ ದೂರು ನೋಂದಣಿಯಾಗಿದೆ. 24 ಗಂಟೆಯಲ್ಲಿ ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.",
    fraud:
      "ವಂಚನೆ ಎಚ್ಚರಿಕೆ! ತಕ್ಷಣ ತಂಡಕ್ಕೆ ಸಂಪರ್ಕಿಸುತ್ತಿದ್ದೇವೆ. OTP ಅಥವಾ PIN ಯಾರಿಗೂ ಹೇಳಬೇಡಿ.",
    escalate: "ಕ್ಷಮಿಸಿ. ತಕ್ಷಣ ಹಿರಿಯ ತಜ್ಞರಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತಿದ್ದೇವೆ.",
  }),
  ml: makeResponses({
    greeting:
      "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI ബാങ്കിംഗ് സഹായി. ബാലൻസ്, സ്‌റ്റേറ്റ്‌മെന്റ്, കാർഡ് ബ്ലോക്ക്, ലോൺ അല്ലെങ്കിൽ പരാതിയിൽ സഹായിക്കാം.",
    farewell: "RamSetu ഉപയോഗിച്ചതിന് നന്ദി. ശുഭദിനം!",
    unknown:
      "മനസ്സിലായില്ല. ബാലൻസ്, ഇടപാടുകൾ, കാർഡ് ബ്ലോക്ക് അല്ലെങ്കിൽ ലോണിനെ കുറിച്ച് ചോദിക്കൂ.",
    balance: (d) =>
      `നിങ്ങളുടെ അക്കൗണ്ടിൽ \u20b9${d.balance.toLocaleString("en-IN")} ഉണ്ട്. അക്കൗണ്ട്: ${d.accountNumber}`,
    statement: (d) =>
      `അവസാന ${d.transactions.length} ഇടപാടുകൾ:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "നിങ്ങളുടെ കാർഡ് ഇതിനകം ബ്ലോക്ക് ചെയ്‌തിരിക്കുന്നു."
        : `കാർഡ് വിജയകരമായി ബ്ലോക്ക് ചെയ്‌തു. Ref: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `നിങ്ങൾ \u20b9${d.requestedAmount.toLocaleString("en-IN")} വരെ ${d.loanType} ലോണിന് അർഹരാണ്.`
        : d.message,
    complaint: "നിങ്ങളുടെ പരാതി രജിസ്റ്റർ ചെയ്‌തു. 24 മണിക്കൂറിൽ ബന്ധപ്പെടും.",
    fraud:
      "തട്ടിപ്പ് മുന്നറിയിപ്പ്! ഉടൻ ടീമിലേക്ക് ബന്ധിക്കുന്നു. OTP അല്ലെങ്കിൽ PIN ആരോടും പറയരുത്.",
    escalate: "ക്ഷമിക്കണം. ഉടൻ സീനിയർ വിദഗ്ദ്ധനുമായി ബന്ധിക്കുന്നു.",
  }),
  mr: makeResponses({
    greeting:
      "नमस्कार! मी तुमचा AI बँकिंग सहाय्यक आहे. शिल्लक, विधान, कार्ड ब्लॉक, कर्ज किंवा तक्रारीत मदत करतो.",
    farewell: "RamSetu वापरल्याबद्दल धन्यवाद. शुभ दिवस!",
    unknown:
      "समजले नाही. शिल्लक, व्यवहार, कार्ड ब्लॉक किंवा कर्जाबद्दल विचारा.",
    balance: (d) =>
      `तुमच्या खात्यात \u20b9${d.balance.toLocaleString("en-IN")} आहे. खाते: ${d.accountNumber}`,
    statement: (d) =>
      `शेवटचे ${d.transactions.length} व्यवहार:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "तुमचे कार्ड आधीच ब्लॉक आहे."
        : `कार्ड यशस्वीरीत्या ब्लॉक केले. Ref: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `तुम्ही \u20b9${d.requestedAmount.toLocaleString("en-IN")} पर्यंत ${d.loanType} कर्जासाठी पात्र आहात.`
        : d.message,
    complaint: "तुमची तक्रार नोंदवली गेली आहे. 24 तासात संपर्क होईल.",
    fraud:
      "फसवणूक सतर्कता! तातडीने टीमला जोडत आहोत. OTP किंवा PIN कुणाला सांगू नका.",
    escalate: "माफ करा. आत्ता एका वरिष्ठ तज्ञाशी जोडत आहोत.",
  }),
  gu: makeResponses({
    greeting:
      "નમસ્તે! હું તમારો AI બેન્કિંગ સહાયક છું. બેલેન્સ, સ્ટેટમેન્ટ, કાર્ડ બ્લોક, લોન કે ફરિયાદમાં મદદ કરી શકું.",
    farewell: "RamSetu ઉપયોગ કરવા બદલ આભાર. શুભ દિન!",
    unknown: "સમજ ન આવ્યું. બેલેન્સ, વ્યવહાર, કાર્ડ બ્લોક કે લોન વિશે પૂછો.",
    balance: (d) =>
      `તમારા ખાતામાં \u20b9${d.balance.toLocaleString("en-IN")} છે. ખાતું: ${d.accountNumber}`,
    statement: (d) =>
      `છેલ્લા ${d.transactions.length} વ્યવહારો:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "તમારું કાર્ડ પહેલેથી બ્લોક છે."
        : `કાર્ડ સફળતાપૂર્વક બ્લોક થઈ ગયું. Ref: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `તમે \u20b9${d.requestedAmount.toLocaleString("en-IN")} સુધી ${d.loanType} લોન માટે પાત્ર છો.`
        : d.message,
    complaint: "ફરિયાદ નોંધાઈ ગઈ. 24 કલાકમાં સંપર્ક થશે.",
    fraud:
      "છેતરપિંડી ચેતવણી! તાત્કાલિક ટીમ સાથે જોડી રહ્યા છીએ. OTP કે PIN કોઈને ન કહો.",
    escalate: "ક્ષમા કરો. અત્યારે વરિષ્ઠ નિષ્ણાત સાથે જોડી રહ્યા છીએ.",
  }),
  pa: makeResponses({
    greeting:
      "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਬੈਂਕਿੰਗ ਸਹਾਇਕ ਹਾਂ। ਬੈਲੇਂਸ, ਸਟੇਟਮੈਂਟ, ਕਾਰਡ ਬਲੌਕ, ਕਰਜ਼ਾ ਜਾਂ ਸ਼ਿਕਾਇਤ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
    farewell: "RamSetu ਵਰਤਣ ਲਈ ਧੰਨਵਾਦ। ਸ਼ੁਭ ਦਿਨ!",
    unknown: "ਸਮਝ ਨਹੀਂ ਆਇਆ। ਬੈਲੇਂਸ, ਲੈਣ-ਦੇਣ, ਕਾਰਡ ਬਲੌਕ ਜਾਂ ਕਰਜ਼ੇ ਬਾਰੇ ਪੁੱਛੋ।",
    balance: (d) =>
      `ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ \u20b9${d.balance.toLocaleString("en-IN")} ਹੈ। ਖਾਤਾ: ${d.accountNumber}`,
    statement: (d) =>
      `ਪਿਛਲੇ ${d.transactions.length} ਲੈਣ-ਦੇਣ:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "ਤੁਹਾਡਾ ਕਾਰਡ ਪਹਿਲਾਂ ਤੋਂ ਬਲੌਕ ਹੈ।"
        : `ਕਾਰਡ ਸਫਲਤਾਪੂਰਵਕ ਬਲੌਕ ਕੀਤਾ ਗਿਆ। Ref: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `ਤੁਸੀਂ \u20b9${d.requestedAmount.toLocaleString("en-IN")} ਤੱਕ ${d.loanType} ਕਰਜ਼ੇ ਲਈ ਯੋਗ ਹੋ।`
        : d.message,
    complaint: "ਸ਼ਿਕਾਇਤ ਦਰਜ ਕੀਤੀ ਗਈ। 24 ਘੰਟਿਆਂ ਵਿੱਚ ਸੰਪਰਕ ਕਰਾਂਗੇ।",
    fraud:
      "ਧੋਖਾਧੜੀ ਚੇਤਾਵਨੀ! ਤੁਰੰਤ ਟੀਮ ਨਾਲ ਜੋੜ ਰਹੇ ਹਾਂ। OTP ਜਾਂ PIN ਕਿਸੇ ਨੂੰ ਨਾ ਦੱਸੋ।",
    escalate: "ਮੁਆਫ਼ ਕਰੋ। ਹੁਣੇ ਸੀਨੀਅਰ ਮਾਹਿਰ ਨਾਲ ਜੋੜ ਰਹੇ ਹਾਂ।",
  }),
  or: makeResponses({
    greeting:
      "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ AI ବ୍ୟାଙ୍କିଙ୍ଗ ସହାୟକ। ବ୍ୟାଲେନ୍ସ, ବିବୃତ୍ତି, କାର୍ଡ ବ୍ଲକ, ଋଣ ବା ଅଭିଯୋଗରେ ସାହାଯ୍ୟ କରିପାରିବି।",
    farewell: "RamSetu ବ୍ୟବହାର କରିବା ପାଇଁ ଧନ୍ୟବାଦ। ଶୁଭ ଦିନ!",
    unknown:
      "ବୁଝି ପାରିଲୁ ନାହିଁ। ବ୍ୟାଲେନ୍ସ, ଲେଣଦେଣ, ବ୍ଲକ ବା ଋଣ ବିଷୟରେ ପଚାରନ୍ତୁ।",
    balance: (d) =>
      `ଆପଣଙ୍କ ଖାତାରେ \u20b9${d.balance.toLocaleString("en-IN")} ଅଛି। ଖାତା: ${d.accountNumber}`,
    statement: (d) =>
      `ଶେଷ ${d.transactions.length}ଟି ଲେଣଦେଣ:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "ଆପଣଙ୍କ କାର୍ଡ ଈ ବ୍ଲକ ହୋଇଛି।"
        : `କାର୍ଡ ସଫଳଭାବରେ ବ୍ଲକ ହୋଇଛି। Ref: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `ଆପଣ \u20b9${d.requestedAmount.toLocaleString("en-IN")} ପର୍ଯ୍ୟନ୍ତ ${d.loanType} ଋଣ ପ୍ରାପ୍ତ ହୋଇ ପାରିବେ।`
        : d.message,
    complaint: "ଅଭିଯୋଗ ଦାଖଲ ହୋଇଛି। 24 ଘଣ୍ଟା ମଧ୍ୟରେ ଯୋଗାଯୋଗ ହୋଇବ।",
    fraud:
      "ଜାଲିଆତି ସତର୍କବାର୍ତ୍ତା! ତୁରନ୍ତ ଦଳ ସହ ଯୋଡୁଛୁ। OTP ବା PIN କାହାକୁ ଦିଅନ୍ତୁ ନାହିଁ।",
    escalate: "ଦୁଃଖିତ। ଏବେ ବରିଷ୍ଠ ବିଶେଷଜ୍ଞ ସହ ଯୋଡୁଛୁ।",
  }),
  ur: makeResponses({
    greeting:
      ".آپ کا استقبال ہے! میں آپ کا AI بینکنگ مددگار ہوں۔ بیلنس، اسٹیٹمنٹ، کارڈ بلاک، لون یا شکایت میں مدد کر سکتا ہوں",
    farewell: "!RamSetu استعمال کرنے کا شکریہ۔ اچھا دن گزاریں",
    unknown:
      ".سمجھ نہیں آیا۔ بیلنس، لین دین، کارڈ بلاک یا لون کے بارے میں پوچھیں",
    balance: (d) =>
      `آپ کے اکاؤنٹ میں \u20b9${d.balance.toLocaleString("en-IN")} ہے۔ اکاؤنٹ: ${d.accountNumber}`,
    statement: (d) =>
      `آخری ${d.transactions.length} لین دین:\n${d.transactions.map((t) => `\u2022 ${t.date} | \u20b9${t.amount.toLocaleString("en-IN")}`).join("\n")}`,
    block_card: (d) =>
      d.alreadyBlocked
        ? "آپ کا کارڈ پہلے سے بلاک ہے۔"
        : `کارڈ کامیابی سے بلاک کر دیا گیا۔ Ref: ${d.referenceNumber}`,
    loan: (d) =>
      d.eligible
        ? `آپ \u20b9${d.requestedAmount.toLocaleString("en-IN")} تک ${d.loanType} قرضے کے لیے اہل ہیں۔`
        : d.message,
    complaint: "آپ کی شکایت درج ہو گئی ہے۔ 24 گھنٹوں میں رابطہ کریں گے۔",
    fraud:
      "دھوکہ دہی کی انتباہ! فوری طور پر ٹیم سے جوڑ رہے ہیں۔ OTP یا PIN کسی کو نہ دیں۔",
    escalate: "معذرت چاہتے ہیں۔ ابھی سینئر ماہر سے جوڑ رہے ہیں۔",
  }),
};

// ── Main Orchestrator ─────────────────────────────────────────
const buildResponse = async (
  text,
  customerId,
  sessionId,
  overrideLang = null,
) => {
  const language = detectLanguage(text, overrideLang);
  const intent = detectIntent(text);
  const escalate = shouldEscalate(intent);
  // Fall back to English templates if language not supported
  const R = RESPONSES[language] || RESPONSES.en;

  let message = "";
  let apiData = null;

  try {
    switch (intent) {
      case "balance":
        apiData = bankingService.getBalance(customerId);
        message = R.balance(apiData);
        break;
      case "statement":
        apiData = bankingService.getMiniStatement(customerId);
        message = R.statement(apiData);
        break;
      case "block_card":
        apiData = bankingService.blockCard(customerId);
        message = R.block_card(apiData);
        break;
      case "loan":
        apiData = bankingService.applyLoan(customerId, {
          loanType: "personal",
          amount: 500000,
        });
        message = R.loan(apiData);
        break;
      case "complaint":
        message = R.complaint;
        break;
      case "fraud":
        message = R.fraud;
        break;
      case "escalate":
        message = R.escalate;
        break;
      case "greeting":
        message = R.greeting;
        break;
      case "farewell":
        message = R.farewell;
        break;
      default:
        message = R.unknown;
    }
  } catch (err) {
    console.error("[aiService] Error building response:", err.message);
    message = R.unknown || "A technical error occurred. Please try again.";
  }

  const session = getSession(sessionId);
  const summary = session
    ? `Customer asked ${session.turns.length} question(s). Last intent: ${intent}. Message: "${text.substring(0, 100)}"`
    : `Customer message: "${text.substring(0, 100)}"`;

  if (sessionId) appendTurn(sessionId, text, message, intent);

  return {
    message,
    intent,
    escalate,
    summary,
    language,
    apiData,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  detectLanguage,
  detectIntent,
  buildResponse,
  shouldEscalate,
};
