// =============================================================
// App.jsx — React Router + AppProvider wrapper
// =============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';

import HomeScreen      from './pages/HomeScreen';
import AuthScreen      from './pages/AuthScreen';
import ChatScreen      from './pages/ChatScreen';
import EscalationScreen from './pages/EscalationScreen';
import DeskAIScreen    from './pages/DeskAIScreen';
import VoiceBotScreen  from './pages/VoiceBotScreen';
import AgentDashboard  from './pages/AgentDashboard';

/** Protect routes that require authentication */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/"          element={<HomeScreen />} />
      <Route path="/auth"      element={<AuthScreen />} />
      <Route path="/chat"      element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
      <Route path="/escalation" element={<EscalationScreen />} />
      <Route path="/desk"      element={<DeskAIScreen />} />
      <Route path="/ivr"       element={<VoiceBotScreen />} />
      <Route path="/dashboard" element={<AgentDashboard />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AppProvider>
);

export default App;
