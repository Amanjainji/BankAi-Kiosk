# AI-Powered Unified Self-Service Platform for Banking
**Hackathon MVP**

A comprehensive, gen-AI and conversational AI powered banking platform designed to simulate deployment across three major banking touchpoints:
1. **Bank Branch Smart Kiosk** (Self-service touch + voice)
2. **Frontline Desk AI** (Agent assistant)
3. **Contact Center** (IVR Voice Bot + Agent Dashboard)

## Features

- **Omnichannel Simulation:** Seamlessly switch between Kiosk, Desk AI, IVR, and Agent Dashboard modes.
- **Multilingual Support (12 Indian Languages):** Full UI, Chatbot, and Voice Bot support for English, Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia, and Urdu.
- **Voice Interaction (STT & TTS):** Speak to the Kiosk or IVR Bot in your regional language, and hear responses naturally read back. 
- **Intent Detection Engine:** AI orchestrator detects intents (Balance, Statement, Block Card, Loan, Complaint, Escalation) accurately using regional language keywords.
- **Authentication Persistence:** JWT-based session management with Mock OTP that survives page reloads and navigation.
- **Agent Dashboard:** Real-time analytics, escalation monitoring, language usage charts, and sentiment analysis for managers.
- **Accessibility:** High Contrast (Dark Mode) and Large Text modes built-in.
- **Escalation Routing:** Automatically routes frustrated or complex queries (e.g., fraud, angry customers) to a human agent seamlessly.

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Context API, Vanilla CSS, Recharts (for Analytics)
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT)
- **AI/Voice Layer:** Web Speech API (SpeechRecognition & SpeechSynthesis), Custom NLP Intent Matching RulesEngine
- **Architecture:** Modular MVC (Routes, Controllers, Services)

---

## 🎙️ Important: Browser Support for Voice AI

For the best experience with the **Web Speech API** (Speech-to-Text and Text-to-Speech) across all 12 Indian languages:

> **Google Chrome** is highly recommended.

Chrome natively integrates with Google's cloud-based speech services, offering the highest accuracy and the widest support for Indian regional dialects and scripts. Other browsers (like Safari or Firefox) have limited or no support for the `webkitSpeechRecognition` API in regional languages natively.

---

## Setup & Deployment Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (if not already present):
```env
PORT=5001
JWT_SECRET=ai_banking_platform_super_secret_key_2024
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

Start the backend server:
```bash
# For development with auto-reload:
npx nodemon server.js

# Or standard run:
node server.js
```
*The backend will run on `http://localhost:5001`.*

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm install
```

Ensure the API base URL in `frontend/src/services/api.js` points to `http://localhost:5001`.

Start the frontend development server:
```bash
npm run dev
```
*The app will be available at `http://localhost:5173`.*

---

## Testing Scenarios

### Kiosk Mode (Customer Self-Service)
1. Go to `http://localhost:5173/`.
2. Select a regional language (e.g., Tamil).
3. Click "Check Balance" or "Talk to AI".
4. Enter any 10-digit mobile number, click "Send OTP", and enter any 6-digit OTP (mock auth).
5. Chat in English or click the Microphone and speak in your selected language to ask about your balance, loans, or block a card.

### IVR Contact Center Mode
1. From the home screen, click "Contact Center IVR" at the bottom.
2. Ensure you are on Google Chrome.
3. Click "Start Call". The AI will guide you through the IVR phases.
4. Try saying "I want to file a complaint" or "fraud" to trigger an Automatic Agent Escalation.

### Frontline Desk AI Mode
1. Click "Frontline Desk AI".
2. This screen listens to the customer standing at a physical branch desk.
3. Click a sample request or speak one. The AI extracts the intent, language, and generates a Token Number and routes them to the correct counter.

### Agent Dashboard
1. Click "Agent Dashboard".
2. View live metrics, AI handled rates, and a real-time table of escalated tickets with sentiment analysis.

---
*Built for the Gen-AI Banking Hackathon.*
