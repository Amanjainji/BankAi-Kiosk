# AI-Powered Unified Self-Service Banking Platform

> Hackathon MVP — Branch Kiosk + Frontline Desk AI + Contact Center IVR + Agent Dashboard

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
npm install
node server.js
```
Backend runs on **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

---

## 🔐 Demo Accounts

| Mobile       | Name         | Balance        |
|--------------|--------------|----------------|
| 9876543210   | Arjun Sharma | ₹1,25,420.50   |
| 9988776655   | Priya Patel  | ₹87,350.00     |
| 7700112233   | Rajesh Kumar | ₹4,200.75      |

> OTP is shown in response (demo mode) — copy and paste it to login.

---

## 🗺️ Pages & Routes

| Route        | Description                          |
|--------------|--------------------------------------|
| `/`          | Branch Kiosk Home — 6 service tiles  |
| `/auth`      | Mobile + OTP authentication          |
| `/chat`      | AI Conversation (requires login)     |
| `/escalation`| Human agent escalation screen        |
| `/desk`      | Frontline Desk AI — Token generator  |
| `/ivr`       | Contact Center Voice Bot simulation  |
| `/dashboard` | Agent Dashboard with analytics       |

---

## 🧠 AI Intent Detection

Supported intents (keyword-based, plug OpenAI later):

| Intent       | Keywords                              |
|--------------|---------------------------------------|
| `balance`    | balance, bakaya, paisa kitna          |
| `statement`  | statement, history, passbook          |
| `block_card` | block card, lost card, band karo      |
| `loan`       | loan, home loan, emi, karz            |
| `complaint`  | complaint, problem, shikayat          |
| `fraud`      | fraud, scam, unauthorized, dhoka      |
| `escalate`   | angry, frustrated, not satisfied      |

---

## 📡 API Endpoints

```
POST /auth/send-otp          → Send OTP to mobile
POST /auth/verify-otp        → Verify OTP, get JWT
POST /ai/chat                → AI conversation (JWT required)
GET  /account/balance        → Account balance (JWT required)
GET  /account/mini-statement → Last 5 transactions (JWT required)
POST /account/block-card     → Block debit card (JWT required)
POST /escalation/create      → Create escalation ticket (JWT required)
GET  /admin/metrics          → Analytics data
GET  /admin/escalations      → All escalation tickets
```

---

## 🔊 Voice Features

- **Speech-to-Text**: Web Speech API (`SpeechRecognition`)
- **Text-to-Speech**: Web Speech API (`SpeechSynthesis`)
- **Languages**: English (en-IN) and Hindi (hi-IN)
- **Toggle**: Voice mode toggle in Navbar

---

## ♿ Accessibility

- **Large Text Mode**: Increases all font sizes
- **High Contrast Mode**: Dark background, white text
- Both toggleable from navbar and kiosk home screen

---

## 🏗️ Architecture

```
kiosk/
├── backend/
│   ├── server.js
│   ├── routes/          auth, ai, account, escalation, admin
│   ├── controllers/     authController, aiController, accountController, ...
│   ├── services/        aiService.js, bankingService.js
│   ├── models/          customer.js, session.js, escalation.js
│   └── middleware/      auth.js, audit.js
└── frontend/
    ├── src/
    │   ├── context/     AppContext.jsx
    │   ├── hooks/       useVoice.js
    │   ├── services/    api.js
    │   ├── components/  Navbar.jsx
    │   └── pages/       HomeScreen, AuthScreen, ChatScreen, EscalationScreen,
    │                    DeskAIScreen, VoiceBotScreen, AgentDashboard
    └── index.css        (Full design system)
```
