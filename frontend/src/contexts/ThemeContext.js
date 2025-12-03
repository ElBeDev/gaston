import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import { designTokens } from '../styles/designTokens';

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
        main: designTokens.colors.primary.main,
        light: designTokens.colors.primary.light,
        dark: designTokens.colors.primary.dark,
      },
      secondary: {
        main: designTokens.colors.info.main,
        light: designTokens.colors.info.light,
        dark: designTokens.colors.info.dark,
      },
      success: {
        main: designTokens.colors.success.main,
        light: designTokens.colors.success.light,
        dark: designTokens.colors.success.dark,
      },
      warning: {
        main: designTokens.colors.warning.main,
        light: designTokens.colors.warning.light,
        dark: designTokens.colors.warning.dark,
      },
      error: {
        main: designTokens.colors.error.main,
        light: designTokens.colors.error.light,
        dark: designTokens.colors.error.dark,
      },
      info: {
        main: designTokens.colors.info.main,
        light: designTokens.colors.info.light,
        dark: designTokens.colors.info.dark,
      },
      background: {
        default: designTokens.colors.neutral[50],
        paper: '#ffffff',
      },
      text: {
        primary: designTokens.colors.neutral[900],
        secondary: designTokens.colors.neutral[600],
      },
    },
    typography: {
      fontFamily: designTokens.typography.fontFamily.sans,
      h4: {
        fontWeight: designTokens.typography.fontWeight.semibold,
      },
      h6: {
        fontWeight: designTokens.typography.fontWeight.medium,
      },
    },
    shape: {
      borderRadius: parseInt(designTokens.borderRadius.md),
    },
    shadows: [
      'none',
      designTokens.shadows.sm,
      designTokens.shadows.base,
      designTokens.shadows.md,
      designTokens.shadows.lg,
      designTokens.shadows.xl,
      designTokens.shadows['2xl'],
      ...Array(18).fill('none')
    ]
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: designTokens.colors.primary.main,
        light: designTokens.colors.primary.light,
        dark: designTokens.colors.primary.dark,
      },
      secondary: {
        main: designTokens.colors.info.main,
        light: designTokens.colors.info.light,
        dark: designTokens.colors.info.dark,
      },
      success: {
        main: designTokens.colors.success.main,
        light: designTokens.colors.success.light,
        dark: designTokens.colors.success.dark,
      },
      warning: {
        main: designTokens.colors.warning.main,
        light: designTokens.colors.warning.light,
        dark: designTokens.colors.warning.dark,
      },
      error: {
        main: designTokens.colors.error.main,
        light: designTokens.colors.error.light,
        dark: designTokens.colors.error.dark,
      },
      info: {
        main: designTokens.colors.info.main,
        light: designTokens.colors.info.light,
        dark: designTokens.colors.info.dark,
      },
      background: {
        default: designTokens.colors.neutral[900],
        paper: designTokens.colors.neutral[800],
      },
      text: {
        primary: '#ffffff',
        secondary: designTokens.colors.neutral[400],
      },
    },
    typography: {
      fontFamily: designTokens.typography.fontFamily.sans,
      h4: {
        fontWeight: designTokens.typography.fontWeight.semibold,
      },
      h6: {
        fontWeight: designTokens.typography.fontWeight.medium,
      },
    },
    shape: {
      borderRadius: parseInt(designTokens.borderRadius.md),
    },
    shadows: [
      'none',
      designTokens.shadows.sm,
      designTokens.shadows.base,
      designTokens.shadows.md,
      designTokens.shadows.lg,
      designTokens.shadows.xl,
      designTokens.shadows['2xl'],
      ...Array(18).fill('none')
    ]
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
