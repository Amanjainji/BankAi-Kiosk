// =============================================================
// Axios API Service — auto-injects JWT from localStorage
// =============================================================
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' }
});

// Inject token on every request
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('banking_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const sendOtp    = (mobile) => api.post('/auth/send-otp', { mobile });
export const verifyOtp  = (mobile, otp) => api.post('/auth/verify-otp', { mobile, otp });

// AI Chat
export const chat = (message, sessionId, language) =>
  api.post('/ai/chat', { message, sessionId, language });

// Account APIs
export const getBalance      = () => api.get('/account/balance');
export const getMiniStatement = () => api.get('/account/mini-statement');
export const blockCard        = () => api.post('/account/block-card');

// Escalation
export const createEscalation = (data) => api.post('/escalation/create', data);

// Admin
export const getAdminMetrics     = () => api.get('/admin/metrics');
export const getAdminEscalations = () => api.get('/admin/escalations');

export default api;
