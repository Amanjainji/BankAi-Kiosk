// =============================================================
// Frontline Desk AI Screen — All 12 Indian languages
// =============================================================
import { useState } from 'react';
import { useApp, SUPPORTED_LANGUAGES } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import { t as getT } from '../i18n/translations';

const COUNTERS = {
  balance:    { counter: 'A-12', service: 'Account Services',   en: 'Account Enquiry',  hi: 'खाता जानकारी' },
  statement:  { counter: 'A-12', service: 'Account Services',   en: 'Statement',        hi: 'स्टेटमेंट' },
  loan:       { counter: 'B-04', service: 'Loan Department',    en: 'Loan Enquiry',     hi: 'लोन जानकारी' },
  block_card: { counter: 'C-07', service: 'Card Services',      en: 'Card Blocking',    hi: 'कार्ड सेवाएं' },
  complaint:  { counter: 'D-01', service: 'Customer Relations', en: 'Complaint',        hi: 'शिकायत' },
  unknown:    { counter: 'A-01', service: 'General Enquiry',    en: 'General Enquiry',  hi: 'सामान्य जानकारी' }
};

const SAMPLE_REQUESTS = [
  { en: 'I want home loan information', hi: 'मुझे होम लोन की जानकारी चाहिए', ta: 'வீட்டு கடன் தகவல் வேண்டும்', te: 'హోమ్ లోన్ సమాచారం కావాలి', kn: 'ಹೋಮ್ ಲೋನ್ ಮಾಹಿತಿ ಬೇಕು', ml: 'ഹോം ലോൺ വിവരം വേണം', bn: 'হোম লোনের তথ্য চাই', mr: 'होम लोनची माहिती हवी', gu: 'હોમ લોન માહિતી જોઈએ', pa: 'ਹੋਮ ਲੋਨ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ', ur: 'ہوم لون کی معلومات چاہیے' },
  { en: 'My card is lost, please block it', hi: 'मेरा कार्ड खो गया है, ब्लॉक करें', ta: 'என் அட்டை தொலைந்தது, தடுங்கள்', te: 'నా కార్డ్ పోయింది, బ్లాక్ చేయండి', kn: 'ನನ್ನ ಕಾರ್ಡ್ ಕಳೆದಿದೆ, ಬ್ಲಾಕ್ ಮಾಡಿ', ml: 'എന്റെ കാർഡ് നഷ്ടപ്പെട്ടു, ബ്ലോക്ക് ചെയ്യൂ', bn: 'আমার কার্ড হারিয়ে গেছে, ব্লক করুন', mr: 'माझे कार्ड हरवले, ब्लॉक करा', gu: 'મારૂ કાર્ડ ખોવાઈ ગયું, બ્લૉક કરો', pa: 'ਮੇਰਾ ਕਾਰਡ ਗੁੰਮ ਹੋ ਗਿਆ, ਬਲੌਕ ਕਰੋ', ur: 'میرا کارڈ گم ہوگیا، بلاک کریں' },
  { en: 'Show me my account balance', hi: 'मेरा बैलेंस बताएं', ta: 'என் இருப்பு காட்டுங்கள்', te: 'నా బ్యాలెన్స్ చూపించండి', kn: 'ನನ್ನ ಬ್ಯಾಲೆನ್ಸ್ ತೋರಿಸಿ', ml: 'എന്റെ ബാലൻസ് കാണിക്കൂ', bn: 'আমার ব্যালেন্স দেখান', mr: 'माझे बॅलन्स दाखवा', gu: 'મારૂ બેલેન્સ બતાવો', pa: 'ਮੇਰਾ ਬੈਲੇਂਸ ਦੱਸੋ', ur: 'میرا بیلنس دکھائیں' },
];

const INTENT_MAP_SIMPLE = [
  { intent: 'balance',    keywords: ['balance', 'bakaya', 'kitna', 'paisa', 'shillak'] },
  { intent: 'statement',  keywords: ['statement', 'history', 'passbook', 'transaction'] },
  { intent: 'loan',       keywords: ['loan', 'home loan', 'personal', 'emi', 'karz', 'kadanai'] },
  { intent: 'block_card', keywords: ['block', 'card', 'lost', 'stolen', 'band', 'thadda'] },
  { intent: 'complaint',  keywords: ['complaint', 'problem', 'issue', 'shikayat', 'pugar'] },
];

const detectSimpleIntent = (text = '') => {
  const lower = text.toLowerCase();
  for (const { intent, keywords } of INTENT_MAP_SIMPLE) {
    if (keywords.some(k => lower.includes(k))) return intent;
  }
  return 'unknown';
};

export default function DeskAIScreen() {
  const { language } = useApp();
  const { isListening, startListening, speak } = useVoice(language);
  const lbl = getT(language);

  const [inputText, setInputText] = useState('');
  const [result, setResult]       = useState(null);
  const [tokenNum, setTokenNum]   = useState(null);
  const [waitTime, setWaitTime]   = useState(null);

  const HINDI_PATTERN = /[\u0900-\u097F]/;
  const detectLang = (text) => {
    if (HINDI_PATTERN.test(text)) return 'hi';
    return language !== 'en' ? language : 'en';
  };

  const processRequest = (text) => {
    if (!text.trim()) return;
    const lang    = detectLang(text);
    const intent  = detectSimpleIntent(text);
    const counter = COUNTERS[intent] || COUNTERS.unknown;
    const chars   = 'ABCD';
    const token   = `${chars[Math.floor(Math.random() * 4)]}${String(Math.floor(Math.random() * 90) + 10)}`;
    const wait    = Math.floor(Math.random() * 15) + 3;

    setTokenNum(token);
    setWaitTime(wait);
    setResult({ intent, counter, lang, text });
    speak(`${lbl.tokenLabel} ${token}. ${lbl.counter} ${counter.counter}. ${lbl.waitTime} ${wait}`, language);
  };

  const handleVoice = () => {
    startListening((transcript) => {
      setInputText(transcript);
      processRequest(transcript);
    });
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0d2550, #1a4fa0)', padding: '32px', color: 'white', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>DESK</div>
        <h1 style={{ color: 'white', marginBottom: 6 }}>{lbl.deskTitle}</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)' }}>{lbl.deskSub}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 32, maxWidth: 960, margin: '0 auto', width: '100%' }}>
        {/* Input Panel */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>{lbl.requestLabel}</h3>
          <textarea
            className="input-field"
            style={{ height: 120, resize: 'vertical', marginBottom: 16, fontFamily: 'inherit' }}
            placeholder={lbl.placeholder}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-full" onClick={() => processRequest(inputText)} disabled={!inputText.trim()}>
              {lbl.processBtn}
            </button>
            <button
              onClick={handleVoice}
              style={{ width: 56, height: 48, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', background: isListening ? '#e03e3e' : '#0d2550', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, boxShadow: isListening ? '0 0 0 4px rgba(224,62,62,0.3)' : 'var(--shadow-sm)' }}
            >
              {isListening ? 'STOP' : 'MIC'}
            </button>
          </div>

          {isListening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, color: 'var(--color-danger)' }}>
              <div className="waveform">{[...Array(7)].map((_, i) => <span key={i} />)}</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lbl.listening}</span>
            </div>
          )}

          {/* Sample requests */}
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: '0.8rem', marginBottom: 8 }}>{lbl.samples}</p>
            {SAMPLE_REQUESTS.map((s, i) => (
              <button key={i} onClick={() => { const txt = s[language] || s.en; setInputText(txt); processRequest(txt); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', marginBottom: 6, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-page)', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)', transition: 'all 0.15s' }}>
                {s[language] || s.en}
              </button>
            ))}
          </div>
        </div>

        {/* Token Result Panel */}
        <div>
          {result ? (
            <>
              <div className="card" style={{ marginBottom: 16, padding: '20px 24px' }}>
                <h3 style={{ marginBottom: 14 }}>{lbl.analysis}</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span className="badge badge-primary">Intent: {result.intent.replace('_', ' ').toUpperCase()}</span>
                  <span className="badge badge-success">{SUPPORTED_LANGUAGES.find(l => l.code === result.lang)?.name || 'English'}</span>
                  <span className="badge badge-warning">{result.counter.service}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{result.text}"</div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #0d2550, #2b6dd6)', borderRadius: 'var(--radius-xl)', padding: '36px', textAlign: 'center', color: 'white', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{lbl.tokenLabel}</div>
                <div style={{ fontSize: '5rem', fontWeight: 900, letterSpacing: '0.1em', lineHeight: 1, marginBottom: 8 }}>{tokenNum}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.75, marginBottom: 24 }}>{result.counter.service}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{result.counter.counter}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lbl.counter}</div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{waitTime}m</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lbl.waitTime}</div>
                  </div>
                </div>
                <button onClick={() => { setResult(null); setInputText(''); setTokenNum(null); }}
                  style={{ padding: '10px 24px', borderRadius: '999px', border: '2px solid rgba(255,255,255,0.5)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                  {lbl.nextCustomer}
                </button>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 32px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-lg)', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16 }}>TOKEN</div>
              <p style={{ color: 'var(--text-muted)' }}>{lbl.empty}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
