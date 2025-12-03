import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { ThemeContextProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load ALL pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ContactDashboard = lazy(() => import('./pages/ContactDashboard'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const EmailPageAdvanced = lazy(() => import('./pages/EmailPageAdvanced'));
const CalendarPageAdvanced = lazy(() => import('./pages/CalendarPageAdvanced'));
const WhatsAppUnifiedPage = lazy(() => import('./pages/WhatsAppUnifiedPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));

// Loading component
const PageLoader = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh',
    flexDirection: 'column',
    gap: 2
  }}>
    <CircularProgress size={60} />
    <Box sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
      Cargando Eva...
    </Box>
  </Box>
);

function AppContent() {
  const { currentTheme } = useTheme();

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Box sx={{ 
            minHeight: '100vh',
            bgcolor: currentTheme.palette.mode === 'dark'
              ? currentTheme.palette.grey[900]
              : '#f9fafb'
          }}>
            <Header />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/crm" element={<ContactDashboard />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/email" element={<EmailPageAdvanced />} />
                <Route path="/calendar" element={<CalendarPageAdvanced />} />
                <Route path="/whatsapp" element={<WhatsAppUnifiedPage />} />
                <Route path="/notes" element={<NotesPage />} />
              </Routes>
            </Suspense>
          </Box>
        </Router>
      </ErrorBoundary>
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
