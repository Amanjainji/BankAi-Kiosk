// =============================================================
// Home Screen — Landing page with imagery + 6 service buttons
// =============================================================
import { useNavigate } from 'react-router-dom';
import { useApp, SUPPORTED_LANGUAGES } from '../context/AppContext';

const SERVICES = [
  { icon: '💰', label: { en: 'Check Balance', hi: 'बैलेंस जाँचें', bn: 'ব্যালেন্স দেখুন', ta: 'இருப்பு சரிபார்', te: 'బ్యాలెన్స్ తనిఖీ', kn: 'ಬ್ಯಾಲೆನ್ಸ್ ಪರಿಶೀಲಿಸಿ', ml: 'ബാലൻസ് പരിശോധിക്കുക', mr: 'शिल्लक तपासा', gu: 'બેલેન્સ તપાસો', pa: 'ਬੈਲੇਂਸ ਦੇਖੋ', or: 'ବ୍ୟାଲେନ୍ସ ଯାଞ୍ଚ', ur: 'بیلنس چیک کریں' }, color: '#1a4fa0', bg: '#eef3fc', intent: 'balance' },
  { icon: '📄', label: { en: 'Mini Statement', hi: 'मिनी स्टेटमेंट', bn: 'মিনি স্টেটমেন্ট', ta: 'மினி அறிக்கை', te: 'మినీ స్టేట్‌మెంట్', kn: 'ಮಿನಿ ಸ್ಟೇಟ್‌ಮೆಂಟ್', ml: 'മിനി സ്റ്റേറ്റ്‌മെന്റ്', mr: 'मिनी विधान', gu: 'મિની સ્ટેટમેન્ટ', pa: 'ਮਿਨੀ ਸਟੇਟਮੈਂਟ', or: 'ମିନି ବ୍ୟାଘ୍ରପତ୍ର', ur: 'منی اسٹیٹمنٹ' }, color: '#0da574', bg: '#e8fdf5', intent: 'statement' },
  { icon: '🔒', label: { en: 'Block Card', hi: 'कार्ड ब्लॉक', bn: 'কার্ড ব্লক', ta: 'கார்டு தடு', te: 'కార్డ్ బ్లాక్', kn: 'ಕಾರ್ಡ್ ಬ್ಲಾಕ್', ml: 'കാർഡ് ബ്ലോക്ക്', mr: 'कार्ड ब्लॉक', gu: 'કાર્ડ બ્લૉક', pa: 'ਕਾਰਡ ਬਲੌਕ', or: 'କାର୍ଡ ବ୍ଲକ', ur: 'کارڈ بلاک' }, color: '#e03e3e', bg: '#fdf0f0', intent: 'block_card' },
  { icon: '🏠', label: { en: 'Apply for Loan', hi: 'लोन आवेदन', bn: 'লোনের আবেদন', ta: 'கடன் விண்ணப்பம்', te: 'లోన్ దరఖాస్తు', kn: 'ಸಾಲ ಅರ್ಜಿ', ml: 'ലോൺ അപേക്ഷ', mr: 'कर्ज अर्ज', gu: 'લોન અરજી', pa: 'ਕਰਜ਼ਾ ਅਰਜ਼ੀ', or: 'ଋଣ ଆବେଦନ', ur: 'قرضے کی درخواست' }, color: '#f59e0b', bg: '#fffbeb', intent: 'loan' },
  { icon: '📢', label: { en: 'File Complaint', hi: 'शिकायत दर्ज', bn: 'অভিযোগ দায়ের', ta: 'புகார் தாக்கல்', te: 'ఫిర్యాదు దాఖలు', kn: 'ದೂರು ದಾಖಲು', ml: 'പരാതി ഫയൽ', mr: 'तक्रार दाखल', gu: 'ફરિયાદ નોંધો', pa: 'ਸ਼ਿਕਾਇਤ ਦਰਜ', or: 'ଅଭିଯୋଗ ଦାଖଲ', ur: 'شکایت درج' }, color: '#7c3aed', bg: '#f5f0ff', intent: 'complaint' },
  { icon: '🤖', label: { en: 'Talk to AI', hi: 'AI से बात', bn: 'AI এর সাথে কথা', ta: 'AI உடன் பேசு', te: 'AI తో మాట్లాడు', kn: 'AI ಜೊತೆ ಮಾತನಾಡಿ', ml: 'AI യോട് സംസാരിക്കൂ', mr: 'AI शी बोला', gu: 'AI સાથે વાત', pa: 'AI ਨਾਲ ਗੱਲ', or: 'AI ସଙ୍ଗେ କଥା', ur: 'AI سے بات' }, color: '#0891b2', bg: '#e0f7fa', intent: 'chat' },
];

// Labels for the UI text in each language
const UI_LABELS = {
  en: { title: 'AI Banking Platform', subtitle: 'Smart self-service banking — fast, secure, always available', selectLang: 'Select Language', a11y: 'Accessibility', largeText: 'Large Text', highContrast: 'Dark Mode', voice: 'Voice', whatToDo: 'What would you like to do?', selectService: 'Select a service to get started', otherModes: 'Other Modes', desk: 'Frontline Desk AI', ivr: 'Contact Center IVR', dashboard: 'Agent Dashboard' },
  hi: { title: 'AI बैंकिंग प्लेटफॉर्म', subtitle: 'स्मार्ट सेल्फ-सर्विस बैंकिंग — कभी भी, कहीं भी', selectLang: 'भाषा चुनें', a11y: 'पहुँच', largeText: 'बड़ा टेक्स्ट', highContrast: 'डार्क मोड', voice: 'वॉयस', whatToDo: 'आप क्या करना चाहते हैं?', selectService: 'एक सेवा चुनें', otherModes: 'अन्य मोड', desk: 'फ्रंटलाइन डेस्क AI', ivr: 'कॉन्टैक्ट सेंटर', dashboard: 'एजेंट डैशबोर्ड' },
  default: { title: 'AI Banking Platform', subtitle: 'Smart self-service banking', selectLang: 'Select Language', a11y: 'Accessibility', largeText: 'Large Text', highContrast: 'Dark Mode', voice: 'Voice', whatToDo: 'How can we help you today?', selectService: 'Select a service', otherModes: 'Other Modes', desk: 'Frontline Desk AI', ivr: 'Contact Center', dashboard: 'Agent Dashboard' }
};

const HomeScreen = () => {
  const navigate = useNavigate();
  const { language, setLanguage, largeText, toggleLargeText, highContrast, toggleHighContrast, voiceMode, setVoiceMode, setMode, isAuthenticated } = useApp();
  const t = UI_LABELS[language] || UI_LABELS.default;
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language);

  // If already authenticated, skip login and go straight to chat
  const handleService = (intent) => {
    if (isAuthenticated) {
      navigate('/chat', { state: { intent, firstMessage: intent } });
    } else {
      navigate('/auth', { state: { intent } });
    }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh' }}>

      {/* ── Hero with image ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 420 }}>
        {/* Background image */}
        <img
          src="/bank_kiosk_hero.png"
          alt="AI Banking Branch"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center'
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(13,37,80,0.88) 0%, rgba(26,79,160,0.78) 60%, rgba(43,109,214,0.60) 100%)'
        }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '56px 40px', textAlign: 'center', color: 'white' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
            padding: '6px 18px', borderRadius: '999px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc9a', display: 'inline-block' }} />
            AI-Powered — Always Online
          </div>
          <h1 style={{ color: 'white', fontSize: '2.8rem', marginBottom: 12, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {t.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.15rem', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>
            {t.subtitle}
          </p>

          {/* Language selector grid */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t.selectLang}
            </p>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 680, margin: '0 auto'
            }}>
              {SUPPORTED_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  style={{
                    padding: '7px 14px', borderRadius: '999px', fontSize: '0.82rem',
                    fontWeight: language === l.code ? 700 : 500,
                    border: language === l.code ? '2px solid white' : '1.5px solid rgba(255,255,255,0.28)',
                    background: language === l.code ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                    color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)',
                    transition: 'all 0.18s', whiteSpace: 'nowrap'
                  }}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
        padding: '16px 40px', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', alignItems: 'center'
      }}>
        {[
          { value: '10 Lac+', label: language === 'hi' ? 'ग्राहक' : 'Customers Served' },
          { value: '12', label: language === 'hi' ? 'भाषाएं' : 'Languages Supported' },
          { value: '99.9%', label: language === 'hi' ? 'उपलब्धता' : 'Uptime' },
          { value: '< 30s', label: language === 'hi' ? 'औसत सेवा समय' : 'Avg Service Time' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
        {/* Accessibility controls */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className={`btn btn-sm ${largeText ? 'btn-primary' : 'btn-secondary'}`} onClick={toggleLargeText}>{t.largeText}</button>
          <button className={`btn btn-sm ${highContrast ? 'btn-primary' : 'btn-secondary'}`} onClick={toggleHighContrast}>{t.highContrast}</button>
          <button className={`btn btn-sm ${voiceMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setVoiceMode(v => !v)}>{t.voice}</button>
        </div>
      </div>

      {/* ── Service grid ─────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '40px 32px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 6 }}>{t.whatToDo}</h2>
        <p style={{ textAlign: 'center', marginBottom: 32 }}>{t.selectService}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
          {SERVICES.map((svc) => {
            const label = svc.label[language] || svc.label.en;
            const iconLetters = { balance: 'BAL', statement: 'STMT', block_card: 'CARD', loan: 'LOAN', complaint: 'CMPLT', chat: 'AI' };
            return (
              <button
                key={svc.intent}
                className="service-btn fade-in-up"
                onClick={() => handleService(svc.intent)}
              >
                <div
                  className="service-icon"
                  style={{ background: svc.bg, color: svc.color, fontSize: '1rem', fontWeight: 800, letterSpacing: '0.02em' }}
                >
                  {iconLetters[svc.intent]}
                </div>
                <span style={{ color: svc.color, fontSize: '0.98rem' }}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Other modes strip */}
        <div style={{
          marginTop: 36, padding: '24px', borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.otherModes}:</span>
          <button className="btn btn-secondary" onClick={() => { setMode('desk'); navigate('/desk'); }}>
            {t.desk}
          </button>
          <button className="btn btn-secondary" onClick={() => { setMode('ivr'); navigate('/ivr'); }}>
            {t.ivr}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            {t.dashboard}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
