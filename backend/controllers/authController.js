// =============================================================
// Auth Controller: OTP-based authentication
// =============================================================
const jwt = require('jsonwebtoken');
const { findByMobile } = require('../models/customer');
const { storeOtp, validateOtp } = require('../models/session');

/**
 * POST /auth/send-otp
 * Body: { mobile: string }
 */
const sendOtp = (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
  }

  const customer = findByMobile(mobile);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Mobile number not registered with us' });
  }

  // Generate 6-digit OTP (deterministic for demo: last 6 digits of mobile)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  storeOtp(mobile, otp, customer.id);

  console.log(`[OTP] Mobile: ${mobile} | OTP: ${otp}`); // In production, send via SMS

  return res.json({
    success: true,
    message: 'OTP sent successfully',
    // Include OTP in response for demo/hackathon purposes only
    otp,
    maskedMobile: `XXXXXX${mobile.slice(-4)}`
  });
};

/**
 * POST /auth/verify-otp
 * Body: { mobile: string, otp: string }
 */
const verifyOtp = (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
  }

  const customerId = validateOtp(mobile, otp);
  if (!customerId) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }

  const customer = findByMobile(mobile);

  // Issue JWT
  const token = jwt.sign(
    {
      customerId: customer.id,
      mobile: customer.mobile,
      name: customer.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return res.json({
    success: true,
    message: 'Authentication successful',
    token,
    customer: {
      id: customer.id,
      name: customer.name,
      mobile: customer.mobile,
      accountNumber: customer.accountNumber,
      languagePreference: customer.languagePreference,
      cardStatus: customer.cardStatus
    }
  });
};

module.exports = { sendOtp, verifyOtp };
