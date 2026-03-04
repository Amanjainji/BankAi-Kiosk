// =============================================================
// Chat Screen — AI Conversation UI
// =============================================================
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { chat, createEscalation } from "../services/api";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";

const QUICK_REPLIES = {
  en: [
    "Check Balance",
    "Mini Statement",
    "Block My Card",
    "Apply for Loan",
    "File Complaint",
    "Talk to Agent",
  ],
  hi: [
    "बैलेंस देखें",
    "मिनी स्टेटमेंट",
    "कार्ड ब्लॉक",
    "लोन आवेदन",
    "शिकायत दर्ज",
    "एजेंट से बात",
  ],
  bn: [
    "ব্যালেন্স দেখুন",
    "মিনি স্টেটমেন্ট",
    "কার্ড ব্লক",
    "ঋণের আবেদন",
    "অভিযোগ",
    "এজেন্টের সাথে কথা",
  ],
  ta: [
    "இருப்பு சரிபார்",
    "மினி அறிக்கை",
    "அட்டை தடு",
    "கடன் விண்ணப்பம்",
    "புகார்",
    "முகவருடன் பேசு",
  ],
  te: [
    "బ్యాలెన్స్ చూడు",
    "మినీ స్టేట్‌మెంట్",
    "కార్డ్ బ్లాక్",
    "లోన్ దరఖాస్తు",
    "ఫిర్యాదు",
    "ఏజెంట్‌తో మాట్లాడు",
  ],
  kn: [
    "ಬ್ಯಾಲೆನ್ಸ್ ತಪಾಸಿ",
    "ಮಿನಿ ಸ್ಟೇಟ್‌ಮೆಂಟ್",
    "ಕಾರ್ಡ್ ಬ್ಲಾಕ್",
    "ಸಾಲ ಅರ್ಜಿ",
    "ದೂರು",
    "ಏಜೆಂಟ್ ಜೊತೆ ಮಾತು",
  ],
  ml: [
    "ബാലൻസ് പരിശോധിക്കൂ",
    "മിനി സ്റ്റേറ്റ്‌മെന്റ്",
    "കാർഡ് ബ്ലോക്ക്",
    "ലോൺ അപേക്ഷ",
    "പരാതി",
    "ഏജന്റുമായി സംസാരിക്കൂ",
  ],
  mr: [
    "शिल्लक तपासा",
    "मिनी विधान",
    "कार्ड ब्लॉक",
    "कर्ज अर्ज",
    "तक्रार",
    "एजंटशी बोला",
  ],
  gu: [
    "બેલેન્સ તપાસો",
    "મિની સ્ટેટમેન્ટ",
    "કાર્ડ બ્લૉક",
    "લોન અરજી",
    "ફરિયાદ",
    "એજન્ટ સાથે વાત",
  ],
  pa: [
    "ਬੈਲੇਂਸ ਦੇਖੋ",
    "ਮਿਨੀ ਸਟੇਟਮੈਂਟ",
    "ਕਾਰਡ ਬਲੌਕ",
    "ਕਰਜ਼ਾ ਅਰਜ਼ੀ",
    "ਸ਼ਿਕਾਇਤ",
    "ਏਜੰਟ ਨਾਲ ਗੱਲ",
  ],
  or: [
    "ବ୍ୟାଲେନ୍ସ ଯାଞ୍ଚ",
    "ମିନି ବିବୃତ୍ତି",
    "କାର୍ଡ ବ୍ଲକ",
    "ଋଣ ଆବେଦନ",
    "ଅଭିଯୋଗ",
    "ଏଜେଣ୍ଟ ସହ କଥା",
  ],
  ur: [
    "بیلنس چیک",
    "منی اسٹیٹمنٹ",
    "کارڈ بلاک",
    "قرضے کی درخواست",
    "شکایت",
    "ایجنٹ سے بات",
  ],
};

const INTENT_TO_MSG = {
  balance: {
    en: "Check my balance",
    hi: "मेरा बैलेंस बताएं",
    default: "Check my balance",
  },
  statement: {
    en: "Show mini statement",
    hi: "मिनी स्टेटमेंट दिखाएं",
    default: "Show mini statement",
  },
  block_card: {
    en: "Block my card",
    hi: "मेरा कार्ड ब्लॉक करें",
    default: "Block my card",
  },
  loan: { en: "I want a loan", hi: "मुझे लोन चाहिए", default: "I want a loan" },
  complaint: {
    en: "I want to file a complaint",
    hi: "मुझे शिकायत दर्ज करनी है",
    default: "I want to file a complaint",
  },
  chat: {
    en: "Hello, I need help",
    hi: "नमस्ते, मुझे मदद चाहिए",
    default: "Hello, I need help",
  },
};

const ChatScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, customer, sessionId, setSessionId, voiceMode } = useApp();
  const { isListening, startListening, speak } = useVoice(language);

  const GREETINGS = {
    en: `Hello ${customer?.name?.split(" ")[0] || ""}! I'm your Ramsetu Assistant. How can I help you today?`,
    hi: `नमस्ते ${customer?.name?.split(" ")[0] || ""}! मैं आपका AI बैंकिंग सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?`,
    bn: `নমস্কার ${customer?.name?.split(" ")[0] || ""}! আমি আপনার AI ব্যাংকিং সহকারী। কীভাবে সাহায্য করতে পারি?`,
    ta: `வணக்கம் ${customer?.name?.split(" ")[0] || ""}! நான் உங்கள் AI வங்கி உதவியாளர். எவ்வாறு உதவலாம்?`,
    te: `నమస్కారం ${customer?.name?.split(" ")[0] || ""}! నేను మీ AI బ్యాంకింగ్ సహాయకుడని. ఎలా సహాయపడగలను?`,
    kn: `ನಮಸ್ಕಾರ ${customer?.name?.split(" ")[0] || ""}! ನಾನು ನಿಮ್ಮ AI ಬ್ಯಾಂಕಿಂಗ್ ಸಹಾಯಕ. ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`,
    ml: `നമസ്കാരം ${customer?.name?.split(" ")[0] || ""}! ഞാൻ നിങ്ങളുടെ AI ബാങ്കിംഗ് സഹായി. എങ്ങനെ സഹായിക്കാം?`,
    mr: `नमस्कार ${customer?.name?.split(" ")[0] || ""}! मी तुमचा AI बँकिंग सहाय्यक आहे. कसे मदत करू?`,
    gu: `નમસ્તે ${customer?.name?.split(" ")[0] || ""}! હું તમારો AI બેન્કિંગ સહાયક છું. કેવી રીતે મદદ કરી શકું?`,
    pa: `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${customer?.name?.split(" ")[0] || ""}! ਮੈਂ ਤੁਹਾਡਾ AI ਬੈਂਕਿੰਗ ਸਹਾਇਕ ਹਾਂ। ਕਿਵੇਂ ਮਦਦ ਕਰਾਂ?`,
    or: `ନମସ୍କାର ${customer?.name?.split(" ")[0] || ""}! ମୁଁ ଆପଣଙ୍କ AI ବ୍ୟାଙ୍କିଙ୍ଗ ସହାୟକ। କିପରି ସାହାଯ୍ୟ କରିବି?`,
    ur: `السلام علیکم ${customer?.name?.split(" ")[0] || ""}! میں آپ کا AI بینکنگ مددگار ہوں۔ کیسے مدد کروں؟`,
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: GREETINGS[language] || GREETINGS.en,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sentFirst, setSentFirst] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send first intent message if navigated from kiosk service button
  useEffect(() => {
    if (
      !sentFirst &&
      location.state?.intent &&
      location.state.intent !== "chat"
    ) {
      const intentMsg = INTENT_TO_MSG[location.state.intent];
      if (intentMsg) {
        setSentFirst(true);
        setTimeout(() => sendMessage(intentMsg[language] || intentMsg.en), 600);
      }
    }
  }, []);

  const addMessage = (role, text) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role, text, timestamp: new Date() },
    ]);
  };

  const sendMessage = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText) return;
    setInput("");
    addMessage("user", msgText);
    setIsTyping(true);

    try {
      const res = await chat(msgText, sessionId, language);
      const data = res.data;

      if (!sessionId && data.sessionId) setSessionId(data.sessionId);

      setTimeout(
        () => {
          setIsTyping(false);
          addMessage("bot", data.message);
          if (voiceMode) speak(data.message, data.language);

          if (data.escalate) {
            // Create escalation ticket then navigate
            createEscalation({
              intent: data.intent,
              language: data.language,
              summary: data.summary,
              turns: [],
            }).catch(() => {});

            setTimeout(
              () =>
                navigate("/escalation", {
                  state: {
                    ticket: { summary: data.summary, intent: data.intent },
                  },
                }),
              2000,
            );
          }
        },
        800 + Math.random() * 400,
      );
    } catch (err) {
      setIsTyping(false);
      addMessage(
        "bot",
        language === "hi"
          ? "माफ करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।"
          : "Sorry, an error occurred. Please try again.",
      );
    }
  };

  const handleVoiceInput = () => {
    startListening((transcript) => {
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 300);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 68px)",
        background: "var(--bg-page)",
      }}
    >
      {/* Chat header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d2550, #1a4fa0)",
          padding: "16px 24px",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              position: "relative",
            }}
          >
            AI
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                background: "#22c55e",
                borderRadius: "50%",
                border: "2px solid #0d2550",
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>RamSetu Assistant</div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div className="pulse-dot" style={{ width: 7, height: 7 }} />
              {language === "hi" ? "ऑनलाइन" : "Online"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-sm"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "none",
            }}
            onClick={() => navigate("/")}
          >
            {language === "hi" ? "मुख्य पृष्ठ" : "Home"}
          </button>
        </div>
      </div>

      {/* Quick replies */}
      <div
        style={{
          padding: "10px 16px",
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        {(QUICK_REPLIES[language] || QUICK_REPLIES.en).map((qr, i) => (
          <button
            key={i}
            onClick={() => sendMessage(qr)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              whiteSpace: "nowrap",
              border: "1.5px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--color-primary)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            {qr}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.role === "bot" && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#1a4fa0,#2b6dd6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "white",
                  marginRight: 8,
                  flexShrink: 0,
                  alignSelf: "flex-end",
                }}
              >
                AI
              </div>
            )}
            <div>
              <div className={`chat-bubble ${msg.role}`}>{msg.text}</div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  marginTop: 4,
                  textAlign: msg.role === "user" ? "right" : "left",
                }}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#1a4fa0,#2b6dd6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "white",
              }}
            >
              AI
            </div>
            <div className="chat-bubble bot" style={{ display: "inline-flex" }}>
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "14px 16px",
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        <input
          ref={inputRef}
          className="input-field"
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={
            language === "hi" ? "यहाँ लिखें..." : "Type your message..."
          }
        />

        {/* Voice input button */}
        <button
          onClick={handleVoiceInput}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: isListening
              ? "linear-gradient(135deg, #e03e3e, #f05252)"
              : "linear-gradient(135deg, #1a4fa0, #2b6dd6)",
            color: "white",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s",
            boxShadow: isListening
              ? "0 0 0 4px rgba(224,62,62,0.25)"
              : "var(--shadow-sm)",
          }}
          title={isListening ? "Listening..." : "Click to speak"}
        >
          {isListening ? "||" : "MIC"}
        </button>

        <button
          className="btn btn-primary"
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          style={{
            height: 48,
            borderRadius: "var(--radius-md)",
            padding: "0 20px",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
