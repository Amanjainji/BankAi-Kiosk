// =============================================================
// Auth Screen — Mobile number + OTP verification
// =============================================================
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../services/api';
import { useApp } from '../context/AppContext';

const AuthScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, language } = useApp();
  const intent = location.state?.intent;

  const [step, setStep]       = useState('mobile'); // mobile | otp
  const [mobile, setMobile]   = useState('');
  const [otp, setOtp]         = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const T = {
    en: {
      title: 'Secure Authentication',
      subtitle: 'Enter your registered mobile number',
      mobileLabel: 'Mobile Number',
      mobilePh: '10-digit mobile number',
      sendOtp: 'Send OTP',
      verifyTitle: 'Enter Verification Code',
      verifySubtitle: (m) => `OTP sent to XXXXXX${m.slice(-4)}`,
      otpLabel: 'One-Time Password',
      otpPh: '6-digit OTP',
      verify: 'Verify & Login',
      back: '← Back',
      demo: 'Demo accounts: 9876543210 / 9988776655',
      errMobile: 'Please enter a valid 10-digit mobile number',
      errOtp: 'Please enter the 6-digit OTP'
    },
    hi: {
      title: 'सुरक्षित प्रमाणीकरण',
      subtitle: 'अपना पंजीकृत मोबाइल नंबर दर्ज करें',
      mobileLabel: 'मोबाइल नंबर',
      mobilePh: '10 अंकों का मोबाइल नंबर',
      sendOtp: 'OTP भेजें',
      verifyTitle: 'सत्यापन कोड दर्ज करें',
      verifySubtitle: (m) => `OTP XXXXXX${m.slice(-4)} पर भेजा गया`,
      otpLabel: 'वन-टाइम पासवर्ड',
      otpPh: '6 अंकों का OTP',
      verify: 'सत्यापित करें और लॉगिन करें',
      back: '← वापस',
      demo: 'डेमो: 9876543210 / 9988776655',
      errMobile: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें',
      errOtp: 'कृपया 6 अंकों का OTP दर्ज करें'
    }
  };
  const t = T[language] || T.en;

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) return setError(t.errMobile);
    setError(''); setLoading(true);
    try {
      const res = await sendOtp(mobile);
      setOtpHint(res.data.otp); // demo: show OTP
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) return setError(t.errOtp);
    setError(''); setLoading(true);
    try {
      const res = await verifyOtp(mobile, otp);
      const { token, customer } = res.data;
      sessionStorage.setItem('banking_token', token);
      login(token, customer);
      navigate('/chat', { state: { intent, firstMessage: intent } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper" style={{ justifyContent: 'center', alignItems: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Decorative top gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #0d2550, #2b6dd6)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '36px 40px',
          textAlign: 'center', color: 'white'
        }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, margin: '0 auto 12px', letterSpacing: '-0.02em' }}>
            {step === 'mobile' ? 'OTP' : 'VERIFY'}
          </div>
          <h2 style={{ color: 'white', marginBottom: 6 }}>
            {step === 'mobile' ? t.title : t.verifyTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
            {step === 'mobile' ? t.subtitle : t.verifySubtitle(mobile)}
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', padding: '36px 40px' }}>
          {step === 'mobile' ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {t.mobileLabel}
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder={t.mobilePh}
                  maxLength={10}
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  autoFocus
                  style={{ fontSize: '1.4rem', letterSpacing: '0.15em', textAlign: 'center' }}
                />
              </div>

              <div style={{
                background: 'rgba(13,165,116,0.08)', border: '1px solid rgba(13,165,116,0.2)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20,
                fontSize: '0.82rem', color: 'var(--color-success)'
              }}>
                {t.demo}
              </div>

              {error && <p style={{ color: 'var(--color-danger)', marginBottom: 16, fontSize: '0.9rem' }}>{error}</p>}
              <button className="btn btn-primary btn-lg btn-full" onClick={handleSendOtp} disabled={loading}>
                {loading ? <span className="spinner" /> : t.sendOtp}
              </button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {t.otpLabel}
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={t.otpPh}
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                  autoFocus
                  style={{ fontSize: '2rem', letterSpacing: '0.4em', textAlign: 'center' }}
                />
              </div>

              {otpHint && (
                <div style={{
                  background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.3)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20,
                  fontSize: '0.85rem', color: '#c07a00', textAlign: 'center'
                }}>
                  Demo OTP: <strong style={{ letterSpacing: '0.2em' }}>{otpHint}</strong>
                </div>
              )}

              {error && <p style={{ color: 'var(--color-danger)', marginBottom: 16, fontSize: '0.9rem' }}>{error}</p>}
              <button className="btn btn-primary btn-lg btn-full" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? <span className="spinner" /> : t.verify}
              </button>
              <button className="btn btn-ghost btn-full" style={{ marginTop: 12 }} onClick={() => { setStep('mobile'); setError(''); setOtp(''); }}>
                {t.back}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
