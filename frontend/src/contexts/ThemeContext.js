import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('eva-theme');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('eva-theme', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#667eea',
        light: '#9bb5ff',
        dark: '#3f51b5',
      },
      secondary: {
        main: '#f093fb',
        light: '#ff94fe',
        dark: '#c163c8',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#667eea',
        light: '#9bb5ff',
        dark: '#3f51b5',
      },
      secondary: {
        main: '#f093fb',
        light: '#ff94fe',
        dark: '#c163c8',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

  const currentTheme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleTheme,
      currentTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};