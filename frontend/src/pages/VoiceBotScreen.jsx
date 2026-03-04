// =============================================================
// Voice Bot IVR Simulation Screen — All 12 Indian languages
// =============================================================
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";
import { t as getT } from "../i18n/translations";

const IVR_PHASES = [
  {
    id: "welcome",
    en: "Welcome to RamSetu contact center. How can I help you today?",
    hi: "RamSetu कॉन्टैक्ट सेंटर में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ?",
    ta: "RamSetu தொடர்பு மையத்திற்கு வரவேற்கிறோம். நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    te: "RamSetu సంప్రదింపు కేంద్రానికి స్వాగతం. నేను మీకు ఎలా సహాయం చేయగలను?",
    kn: "RamSetu ಸಂಪರ್ಕ ಕೇಂದ್ರಕ್ಕೆ ಸ್ವಾಗತ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    ml: "RamSetu കോൺടാക്ട് സെന്ററിലേക്ക് സ്വാഗതം. ഞാൻ എങ്ങനെ സഹായിക്കാം?",
    bn: "RamSetu কন্টাক্ট সেন্টারে আপনাকে স্বাগতম। আমি কীভাবে সাহায্য করতে পারি?",
    mr: "RamSetu संपर्क केंद्रात आपले स्वागत आहे. मी कशी मदत करू?",
    gu: "RamSetu સંપર્ક કેન્દ્રમાં આપનું સ્વાગત છે. હું કેવી રીતે મદદ કરી શકું?",
    pa: "RamSetu ਸੰਪਰਕ ਕੇਂਦਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰਾਂ?",
    ur: "RamSetu رابطہ مرکز میں خوش آمدید۔ میں کیسے مدد کروں؟",
  },
  {
    id: "menu",
    en: "For balance press 1. Mini statement press 2. Card services press 3. Loans press 4. Complaint press 5. Agent press 0.",
    hi: "बैलेंस के लिए 1, स्टेटमेंट के लिए 2, कार्ड के लिए 3, लोन के लिए 4, शिकायत के लिए 5 दबाएं।",
    ta: "இருப்புக்கு 1, அறிக்கைக்கு 2, அட்டைக்கு 3, கடனுக்கு 4, புகாருக்கு 5 அழுத்துங்கள்.",
    te: "బ్యాలెన్స్‌కు 1, స్టేట్‌మెంట్‌కు 2, కార్డ్‌కు 3, లోన్‌కు 4, ఫిర్యాదుకు 5 నొక్కండి.",
    kn: "ಬ್ಯಾಲೆನ್ಸ್‌ಗೆ 1, ಸ್ಟೇಟ್‌ಮೆಂಟ್‌ಗೆ 2, ಕಾರ್ಡ್‌ಗೆ 3, ಸಾಲಕ್ಕೆ 4, ದೂರಿಗೆ 5 ಒತ್ತಿ.",
    ml: "ബാലൻസിന് 1, സ്റ്റേറ്റ്‌മെന്റിന് 2, കാർഡിന് 3, ലോണിന് 4, പരാതിക്ക് 5 അമർത്തൂ.",
    bn: "ব্যালেন্সের জন্য ১, বিবৃতির জন্য ২, কার্ডের জন্য ৩, ঋণের জন্য ৪, অভিযোগের জন্য ৫ চাপুন।",
    mr: "शिल्लकसाठी 1, विधानासाठी 2, कार्डसाठी 3, कर्जासाठी 4, तक्रारीसाठी 5 दाबा.",
    gu: "બેલેન્સ માટે 1, સ્ટેટ. 2, કાર્ડ 3, લોન 4, ફ. 5 દબાવો.",
    pa: "ਬੈਲੇਂਸ ਲਈ 1, ਸਟੇਟਮੈਂਟ 2, ਕਾਰਡ 3, ਲੋਨ 4, ਸ਼ਿਕਾਇਤ 5.",
    ur: "بیلنس کے لیے 1، اسٹیٹمنٹ 2، کارڈ 3، لون 4، شکایت 5۔",
  },
  {
    id: "auth",
    en: "Please say your 10-digit registered mobile number for verification.",
    hi: "सत्यापन के लिए अपना 10 अंकों का मोबाइल नंबर बोलें।",
    ta: "சரிபார்ப்புக்காக உங்கள் 10 இலக்க தொலைபேசி எண்ணை சொல்லுங்கள்.",
    te: "ధృవీకరణ కోసం మీ 10 అంకెల మొబైల్ నంబర్ చెప్పండి.",
    kn: "ಪರಿಶೀಲನೆಗಾಗಿ ನಿಮ್ಮ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಹೇಳಿ.",
    ml: "ഇൻ ഫോൺ നമ്പർ ഉറപ്പിക്കാൻ 10 അക്ക നമ്പർ പറയൂ.",
    bn: "যাচাইয়ের জন্য আপনার 10 সংখ্যার মোবাইল নম্বর বলুন।",
    mr: "सत्यापनासाठी तुमचा 10 अंकी मोबाइल नंबर सांगा.",
    gu: "ચકાસણી માટે 10 આંકડાનો ફોન નં. કહો.",
    pa: "ਪੁਸ਼ਟੀ ਲਈ 10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਇਲ ਨੰਬਰ ਦੱਸੋ.",
    ur: "تصدیق کے لیے 10 ہندسے کا نمبر بولیں۔",
  },
  {
    id: "process",
    en: "Thank you. Processing your request. Please hold.",
    hi: "धन्यवाद। आपका अनुरोध प्रोसेस किया जा रहा है।",
    ta: "நன்றி. உங்கள் கோரிக்கை செயல்படுத்தப்படுகிறது.",
    te: "ధన్యవాదాలు. మీ అభ్యర్థన ప్రాసెస్ అవుతోంది.",
    kn: "ಧನ್ಯವಾದ. ನಿಮ್ಮ ವಿನಂತಿ ಪ್ರಕ್ರಿಯೆಗೊಳ್ಳುತ್ತಿದೆ.",
    ml: "നന്ദി. അഭ്യർത്ഥന പ്രോസസ്സ് ആകുന്നു.",
    bn: "ধন্যবাদ। আপনার অনুরোধ প্রক্রিয়া হচ্ছে।",
    mr: "धन्यवाद. विनंती प्रक्रिया होत आहे.",
    gu: "આભાર. વિનંતી પ્રક્રિયા ચાલી રહી છે.",
    pa: "ਧੰਨਵਾਦ. ਬੇਨਤੀ ਪ੍ਰਕਿਰਿਆ ਹੋ ਰਹੀ ਹੈ.",
    ur: "شکریہ۔ درخواست پر کارروائی ہو رہی ہے۔",
  },
  {
    id: "result",
    en: "Your request has been processed. Is there anything else I can help you with?",
    hi: "आपका अनुरोध सफलतापूर्वक पूरा हो गया। क्या मैं और कोई मदद कर सकता हूँ?",
    ta: "உங்கள் கோரிக்கை வெற்றிகரமாக முடிந்தது. வேறு ஏதாவது உதவ முடியுமா?",
    te: "మీ అభ్యర్థన విజయవంతంగా పూర్తిగా జరిగింది.",
    kn: "ನಿಮ್ಮ ವಿನಂತಿ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ.",
    ml: "അഭ്യർത്ഥന വിജയകരമായി പ്രോസസ്സ് ആയി.",
    bn: "আপনার অনুরোধ সফলভাবে সম্পন্ন হয়েছে।",
    mr: "तुमची विनंती यशस्वीरीत्या पूर्ण झाली.",
    gu: "તમારી વિનંતી સફળ રીتে પ્રક્રિया થઈ.",
    pa: "ਤੁਹਾਡੀ ਬੇਨਤੀ ਸਫਲਤਾਪੂਰਵਕ ਪੂਰੀ ਹੋਈ.",
    ur: "آپ کی درخواست کامیابی سے مکمل ہوئی۔",
  },
];

const ESCALATION_TRIGGERS = [
  "complaint",
  "fraud",
  "angry",
  "not satisfied",
  "human",
  "agent",
  "manager",
  "shikayat",
  "gussa",
  "naraaz",
  "pareshaani",
  "taqleef",
];

export default function VoiceBotScreen() {
  const navigate = useNavigate();
  const { language } = useApp();
  const { isListening, startListening, speak } = useVoice(language);
  const lbl = getT(language);

  const [phase, setPhase] = useState(0);
  const [messages, setMessages] = useState([]);
  const [callActive, setCallActive] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMsg = (role, text) =>
    setMessages((prev) => [
      ...prev,
      {
        role,
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

  const getPhaseText = (phaseData) => phaseData[language] || phaseData.en;

  const startCall = () => {
    setCallActive(true);
    setCallTime(0);
    timerRef.current = setInterval(() => setCallTime((t) => t + 1), 1000);
    setTimeout(() => {
      const welcome = getPhaseText(IVR_PHASES[0]);
      addMsg("bot", welcome);
      speak(welcome, language);
      setTimeout(() => advancePhase(), 3000);
    }, 800);
  };

  const endCall = () => {
    clearInterval(timerRef.current);
    setCallActive(false);
    speak("", language);
  };

  const advancePhase = () => {
    setPhase((p) => {
      const next = p + 1;
      if (next < IVR_PHASES.length) {
        setTimeout(() => {
          const text = getPhaseText(IVR_PHASES[next]);
          addMsg("bot", text);
          speak(text, language);
        }, 500);
      }
      return next;
    });
  };

  const handleUserSpeak = () => {
    startListening((text) => {
      addMsg("user", text);
      const lower = text.toLowerCase();
      if (ESCALATION_TRIGGERS.some((t) => lower.includes(t))) {
        setEscalating(true);
        const msg = getPhaseText({
          en: "Connecting you to a senior agent. Please hold.",
          hi: "मैं एक वरिष्ठ एजेंट से जोड़ रहा हूँ।",
          ta: "மூத்த முகவரிடம் இணைக்கிறோம்.",
          te: "సీనియర్ ఏజెంట్‌కు అనుసంధానిస్తున్నాము.",
          kn: "ಹಿರಿಯ ಏಜೆಂಟ್‌ಗೆ ಸಂಪರ್ಕಿಸುತ್ತಿದ್ದೇವೆ.",
          ml: "സീനിയർ ഏജന്റുമായി ബന്ധിക്കുന്നു.",
          bn: "সিনিয়র এজেন্টের সাথে সংযুক্ত করছি।",
          mr: "वरिष्ठ एजंटशी जोडत आहोत.",
          gu: "સિનિયર એજન્ટ સાથે જોડી રહ્યા છીએ.",
          pa: "ਸੀਨੀਅਰ ਏਜੰਟ ਨਾਲ ਜੋੜ ਰਹੇ ਹਾਂ.",
          ur: "سینئر ایجنٹ سے جوڑ رہے ہیں۔",
        });
        addMsg("bot", msg);
        speak(msg, language);
        setTimeout(() => {
          endCall();
          navigate("/escalation", {
            state: {
              ticket: {
                summary: `IVR escalated: "${text}"`,
                intent: "escalate",
              },
            },
          });
        }, 3000);
        return;
      }
      setTimeout(() => advancePhase(), 1000);
    });
  };

  const formatTime = (secs) =>
    `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d2550, #1a4fa0)",
          padding: "28px 32px",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "white", marginBottom: 6 }}>{lbl.ivrTitle}</h1>
        <p style={{ color: "rgba(255,255,255,0.75)" }}>{lbl.ivrSub}</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          padding: 32,
          maxWidth: 960,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Phone UI */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 320,
              background: "#1a1a2e",
              borderRadius: 32,
              padding: "24px 20px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
              border: "8px solid #2d2d44",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.75rem",
              }}
            >
              <span>RamSetu IVR</span>
              <span>
                {callActive ? "LIVE  " + formatTime(callTime) : "Ready"}
              </span>
            </div>

            <div
              style={{
                background: callActive
                  ? "linear-gradient(135deg, #0d2550, #1a4fa0)"
                  : "#2d2d44",
                borderRadius: 20,
                padding: "32px 20px",
                textAlign: "center",
                marginBottom: 20,
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  color: "white",
                  marginBottom: 10,
                }}
              >
                AI
              </div>
              <div
                style={{ color: "white", fontWeight: 700, fontSize: "1.1rem" }}
              >
                RamSetu Voice Bot
              </div>
              {callActive && (
                <>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.8rem",
                      marginTop: 4,
                    }}
                  >
                    {lbl.online}
                  </div>
                  {isListening && (
                    <div
                      className="waveform"
                      style={{ marginTop: 12, justifyContent: "center" }}
                    >
                      {[...Array(7)].map((_, i) => (
                        <span key={i} style={{ background: "#22c55e" }} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {!callActive ? (
              <button
                onClick={startCall}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #22c55e, #15803d)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
                }}
              >
                {lbl.startCall}
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleUserSpeak}
                  disabled={isListening || escalating}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: "none",
                    cursor: "pointer",
                    background: isListening
                      ? "#e03e3e"
                      : "linear-gradient(135deg, #1a4fa0, #2b6dd6)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    boxShadow: isListening
                      ? "0 0 0 4px rgba(224,62,62,0.3)"
                      : "var(--shadow-sm)",
                  }}
                >
                  {isListening ? lbl.listening : lbl.speak}
                </button>
                <button
                  onClick={endCall}
                  style={{
                    width: 56,
                    padding: "14px",
                    borderRadius: 16,
                    border: "none",
                    cursor: "pointer",
                    background: "#e03e3e",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                >
                  END
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: 20,
              padding: "14px 20px",
              background: "rgba(224,62,62,0.06)",
              border: "1px solid rgba(224,62,62,0.15)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.82rem",
              color: "var(--color-danger)",
              maxWidth: 320,
              width: "100%",
            }}
          >
            {lbl.escalationTip}
          </div>
        </div>

        {/* Transcript */}
        <div
          className="card"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <h3 style={{ marginBottom: 16 }}>{lbl.transcript}</h3>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: 380,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.length === 0 ? (
              <p
                style={{
                  color: "var(--text-muted)",
                  textAlign: "center",
                  marginTop: 40,
                }}
              >
                {lbl.startCall}...
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      marginBottom: 3,
                    }}
                  >
                    {msg.role === "bot" ? "RamSetu Bot" : lbl.customer} ·{" "}
                    {msg.time}
                  </div>
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, #1a4fa0, #2b6dd6)"
                          : "var(--bg-page)",
                      color:
                        msg.role === "user" ? "white" : "var(--text-primary)",
                      border:
                        msg.role === "user"
                          ? "none"
                          : "1px solid var(--border-color)",
                      fontSize: "0.88rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          {callActive && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "rgba(26,79,160,0.06)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "var(--text-secondary)",
                }}
              >
                Phase {Math.min(phase + 1, IVR_PHASES.length)} /{" "}
                {IVR_PHASES.length}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {IVR_PHASES.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background:
                        i <= phase
                          ? "var(--color-primary)"
                          : "var(--border-color)",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
