// =============================================================
// Global App Context - Session, Auth, Language, Accessibility
// Restores auth token & customer from sessionStorage on load.
// =============================================================
import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

// All supported Indian/regional languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English',    nativeName: 'English',  speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिंदी',    speechCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali',    nativeName: 'বাংলা',    speechCode: 'bn-IN' },
  { code: 'ta', name: 'Tamil',      nativeName: 'தமிழ்',    speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu',     nativeName: 'తెలుగు',   speechCode: 'te-IN' },
  { code: 'kn', name: 'Kannada',    nativeName: 'ಕನ್ನಡ',    speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam',  nativeName: 'മലയാളം',   speechCode: 'ml-IN' },
  { code: 'mr', name: 'Marathi',    nativeName: 'मराठी',    speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati',   nativeName: 'ગુજરાતી',  speechCode: 'gu-IN' },
  { code: 'pa', name: 'Punjabi',    nativeName: 'ਪੰਜਾਬੀ',   speechCode: 'pa-IN' },
  { code: 'or', name: 'Odia',       nativeName: 'ଓଡ଼ିଆ',    speechCode: 'or-IN' },
  { code: 'ur', name: 'Urdu',       nativeName: 'اردو',     speechCode: 'ur-IN' },
];

/** Try to restore auth state from sessionStorage synchronously */
const restoreAuthState = () => {
  try {
    const token    = sessionStorage.getItem('banking_token');
    const customer = sessionStorage.getItem('banking_customer');
    if (token && customer) {
      return { token, customer: JSON.parse(customer) };
    }
  } catch (_) {}
  return { token: null, customer: null };
};

export const AppProvider = ({ children }) => {
  // Restore on first render via lazy initializer
  const [token, setToken]       = useState(() => restoreAuthState().token);
  const [customer, setCustomer] = useState(() => restoreAuthState().customer);
  const [sessionId, setSessionId] = useState(null);

  // UI Preferences
  const [language, setLanguage]         = useState(() => {
    try { return sessionStorage.getItem('banking_lang') || 'en'; } catch { return 'en'; }
  });
  const [mode, setMode]                 = useState('kiosk');
  const [largeText, setLargeText]       = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceMode, setVoiceMode]       = useState(false);

  // Persist language preference
  const handleSetLanguage = useCallback((code) => {
    setLanguage(code);
    try { sessionStorage.setItem('banking_lang', code); } catch (_) {}
  }, []);

  const login = useCallback((tok, cust) => {
    setToken(tok);
    setCustomer(cust);
    const lang = cust.languagePreference || 'en';
    setLanguage(lang);
    // Persist both token and customer so we can restore across navigation
    try {
      sessionStorage.setItem('banking_token', tok);
      sessionStorage.setItem('banking_customer', JSON.stringify(cust));
      sessionStorage.setItem('banking_lang', lang);
    } catch (_) {}
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCustomer(null);
    setSessionId(null);
    try {
      sessionStorage.removeItem('banking_token');
      sessionStorage.removeItem('banking_customer');
    } catch (_) {}
  }, []);

  const toggleLargeText = useCallback(() => {
    setLargeText(prev => {
      const next = !prev;
      document.body.classList.toggle('large-text', next);
      return next;
    });
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => {
      const next = !prev;
      document.body.classList.toggle('high-contrast', next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      token, customer, sessionId, setSessionId,
      language, setLanguage: handleSetLanguage,
      mode, setMode,
      largeText, toggleLargeText,
      highContrast, toggleHighContrast,
      voiceMode, setVoiceMode,
      login, logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
