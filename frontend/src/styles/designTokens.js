/**
 * 🎨 Design Tokens - Eva Assistant
 * Sistema de diseño centralizado para colores, tipografía, espaciado y más
 */

export const designTokens = {
  // 🎨 Color Palette
  colors: {
    primary: {
      main: '#2563eb',      // Azul principal
      light: '#60a5fa',     // Azul claro
      dark: '#1e40af',      // Azul oscuro
      contrast: '#ffffff'    // Texto sobre primary
    },
    success: {
      main: '#10b981',      // Verde
      light: '#34d399',
      dark: '#059669',
      contrast: '#ffffff'
    },
    warning: {
      main: '#f59e0b',      // Amarillo/Naranja
      light: '#fbbf24',
      dark: '#d97706',
      contrast: '#ffffff'
    },
    error: {
      main: '#ef4444',      // Rojo
      light: '#f87171',
      dark: '#dc2626',
      contrast: '#ffffff'
    },
    info: {
      main: '#8b5cf6',      // Púrpura
      light: '#a78bfa',
      dark: '#7c3aed',
      contrast: '#ffffff'
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    eva: {
      main: '#ff1744',      // Rojo de Eva
      glow: 'rgba(255, 23, 68, 0.3)'
    },
    whatsapp: {
      main: '#25D366',      // Verde WhatsApp oficial
      dark: '#128C7E'
    }
  },

  // 📐 Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px'
  },

  // 📝 Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace'
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem'      // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    }
  },

  // 🌓 Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none'
  },

  // 📐 Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px'
  },

  // 🎭 Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '300ms ease-in-out',
    slow: '500ms ease-in-out',
    bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // 📏 Breakpoints (para responsive)
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  },

  // 🎨 Gradients predefinidos
  gradients: {
    primary: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    info: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    eva: 'linear-gradient(135deg, #ff1744 0%, #c51162 100%)',
    dark: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
    light: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  },

  // ⭕ Z-Index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080
  }
};

// 🎨 Funciones helper para colores
export const alpha = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// 📱 Media queries helper
export const mediaQuery = {
  up: (breakpoint) => `@media (min-width: ${designTokens.breakpoints[breakpoint]}px)`,
  down: (breakpoint) => `@media (max-width: ${designTokens.breakpoints[breakpoint] - 1}px)`,
  between: (min, max) => `@media (min-width: ${designTokens.breakpoints[min]}px) and (max-width: ${designTokens.breakpoints[max] - 1}px)`
};

export default designTokens;
