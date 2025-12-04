/**
 * API Configuration
 * Centraliza todas las URLs de la API para facilitar el cambio entre dev y prod
 */

// Detectar si estamos en producción (Vercel) o desarrollo local
const isProduction = process.env.NODE_ENV === 'production';

// En producción, usar rutas relativas (mismo dominio que Vercel)
// En desarrollo, usar localhost:3002
export const API_BASE_URL = isProduction 
  ? '' // Rutas relativas en producción
  : process.env.REACT_APP_API_URL || 'http://localhost:3002';

// WebSocket URL (para conexiones en tiempo real)
export const WS_BASE_URL = isProduction
  ? `wss://${window.location.host}` // WebSocket seguro en producción
  : 'ws://localhost:3002';

// Helper para construir URLs de API
export const getApiUrl = (path) => {
  // Asegurar que el path empieza con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Helper para construir URLs de WebSocket
export const getWsUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${WS_BASE_URL}${normalizedPath}`;
};

export default {
  API_BASE_URL,
  WS_BASE_URL,
  getApiUrl,
  getWsUrl,
  isProduction
};
