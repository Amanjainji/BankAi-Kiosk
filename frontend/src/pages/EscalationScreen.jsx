// =============================================================
// Escalation Screen — "Connecting to Human Agent"
// =============================================================
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const EscalationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, customer } = useApp();
  const ticket = location.state?.ticket || {};
  const [countdown, setCountdown] = useState(5);
  const [agentName] = useState(['Riya Sharma', 'Arjun Verma', 'Sita Iyer'][Math.floor(Math.random() * 3)]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (countdown <= 0) { setConnected(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="page-wrapper" style={{ justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', textAlign: 'center', padding: '48px 40px' }}>
        {!connected ? (
          <>
            {/* Animated connecting ring */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #1a4fa0, #2b6dd6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.9rem', color: 'white', letterSpacing: '-0.02em',
              boxShadow: '0 0 0 0 rgba(26,79,160,0.4)',
              animation: 'pulse-ring 1.5s ease-out infinite'
            }}>
              CALL
            </div>

            <style>{`
              @keyframes pulse-ring {
                0% { box-shadow: 0 0 0 0 rgba(26,79,160,0.4); }
                70% { box-shadow: 0 0 0 30px rgba(26,79,160,0); }
                100% { box-shadow: 0 0 0 0 rgba(26,79,160,0); }
              }
            `}</style>

            <h2 style={{ marginBottom: 8 }}>
              {language === 'hi' ? 'मानव एजेंट से जोड़ रहे हैं...' : 'Connecting to Human Agent...'}
            </h2>
            <p style={{ marginBottom: 24 }}>
              {language === 'hi'
                ? 'कृपया प्रतीक्षा करें। आपकी बातचीत का सारांश एजेंट को भेजा जा रहा है।'
                : 'Please hold. Your conversation summary is being sent to the agent.'}
            </p>

            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #f0a500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 900, color: 'white',
              margin: '0 auto 16px'
            }}>
              {countdown}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {language === 'hi' ? `${countdown} सेकंड में जुड़ रहे हैं` : `Connecting in ${countdown} seconds`}
            </p>

            {ticket.id && (
              <div style={{ marginTop: 20, padding: '12px 20px', background: 'rgba(26,79,160,0.06)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                Ticket: <strong>{ticket.id}</strong>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #0da574, #0d8f63)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.9rem', color: 'white', letterSpacing: '-0.02em'
            }}>
              LIVE
            </div>
            <h2 style={{ marginBottom: 8, color: 'var(--color-success)' }}>
              {language === 'hi' ? 'एजेंट से जुड़ गए!' : 'Connected to Agent!'}
            </h2>
            <p style={{ marginBottom: 24 }}>
              {language === 'hi'
                ? `${agentName} आपकी सहायता करेंगे।`
                : `${agentName} is now assisting you.`}
            </p>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 20px', background: 'rgba(13,165,116,0.08)',
              border: '1px solid rgba(13,165,116,0.2)', borderRadius: 'var(--radius-md)',
              marginBottom: 28, textAlign: 'left'
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #0da574, #6aa3f5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.8rem', color: 'white'
              }}>
                {agentName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{agentName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-success)' }}>
                  Online · {language === 'hi' ? 'सीनियर बैंकिंग एक्सपर्ट' : 'Senior Banking Expert'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {language === 'hi' ? 'अनुमानित प्रतीक्षा: 2 मिनट' : 'Est. wait: 2 minutes'}
                </div>
              </div>
            </div>

            {ticket.summary && (
              <div style={{ padding: '12px 16px', background: 'rgba(26,79,160,0.06)', borderRadius: 'var(--radius-sm)', textAlign: 'left', marginBottom: 24, fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {language === 'hi' ? 'सारांश:' : 'Summary:'}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{ticket.summary}</div>
              </div>
            )}

            <button className="btn btn-secondary btn-full" onClick={() => navigate('/')}>
              {language === 'hi' ? 'मुख्य पृष्ठ पर जाएं' : 'Return to Home'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EscalationScreen;
