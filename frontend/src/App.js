import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ThemeContextProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ContactDashboard from './pages/ContactDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import EmailPageAdvanced from './pages/EmailPageAdvanced';
import CalendarPageAdvanced from './pages/CalendarPageAdvanced';
import EmailPage from './pages/EmailPage';
import WhatsAppPage from './pages/WhatsAppPage';
import WhatsAppWebPage from './pages/WhatsAppWebPage';

const NotesPage = lazy(() => import('./pages/NotesPage'));

function AppContent() {
  const { currentTheme } = useTheme();

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          minHeight: '100vh',
          bgcolor: currentTheme.palette.mode === 'dark'
            ? currentTheme.palette.grey[900]
            : '#f9fafb'
        }}>
          <Header />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/crm" element={<ContactDashboard />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/email" element={<EmailPageAdvanced />} />
            <Route path="/email-simple" element={<EmailPage />} />
            <Route path="/calendar" element={<CalendarPageAdvanced />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
            <Route path="/whatsapp-web" element={<WhatsAppWebPage />} />
            <Route path="/notes" element={
              <Suspense fallback={<div>Loading...</div>}>
                <NotesPage />
              </Suspense>
            } />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
