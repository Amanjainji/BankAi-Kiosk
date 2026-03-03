// =============================================================
// In-Memory OTP/Session Store
// =============================================================

/** @type {Map<string, {otp: string, expiresAt: number, customerId: string}>} */
const otpStore = new Map();

/** Active conversation sessions: sessionId → { customerId, turns, language, startTime } */
const sessionStore = new Map();

/**
 * Store a new OTP for a mobile number (5-minute TTL)
 */
const storeOtp = (mobile, otp, customerId) => {
  otpStore.set(mobile, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    customerId
  });
};

/**
 * Validate an OTP for a mobile number.
 * Returns customerId on success or null on failure.
 */
const validateOtp = (mobile, otp) => {
  const record = otpStore.get(mobile);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(mobile);
    return null;
  }
  if (record.otp !== otp) return null;
  otpStore.delete(mobile); // single-use
  return record.customerId;
};

/**
 * Create a new AI conversation session
 */
const createSession = (sessionId, customerId, language = 'en') => {
  sessionStore.set(sessionId, {
    customerId,
    language,
    turns: [],
    startTime: Date.now(),
    lastIntent: null
  });
};

/**
 * Append a turn (user + assistant messages) to a session
 */
const appendTurn = (sessionId, userMsg, botMsg, intent) => {
  const sess = sessionStore.get(sessionId);
  if (!sess) return;
  sess.turns.push({ userMsg, botMsg, intent, timestamp: Date.now() });
  sess.lastIntent = intent;
};

const getSession = (sessionId) => sessionStore.get(sessionId) || null;

module.exports = { storeOtp, validateOtp, createSession, appendTurn, getSession, sessionStore };
