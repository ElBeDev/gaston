/**
 * 📡 Real Time Monitor Component
 * 
 * Monitor en tiempo real del sistema
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Button
} from '@mui/material';
import {
  RadioButtonChecked as ActiveIcon,
  RadioButtonUnchecked as InactiveIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const RealTimeMonitor = ({ realTimeStatus, lastUpdate }) => {
  const [logs, setLogs] = useState([
    { time: new Date().toISOString(), message: 'Sistema iniciado', type: 'info' },
    { time: new Date().toISOString(), message: 'Monitoreo activado', type: 'success' }
  ]);

  // Simular logs en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        { message: 'Health check completado', type: 'info' },
        { message: 'Métricas actualizadas', type: 'info' },
        { message: 'Sistema optimizado', type: 'success' },
        { message: 'Integraciones sincronizadas', type: 'info' }
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      setLogs(prev => [
        {
          time: new Date().toISOString(),
          ...randomMessage
        },
        ...prev.slice(0, 9) // Mantener solo 10 logs
      ]);
    }, 15000); // Cada 15 segundos

    return () => clearInterval(interval);
  }, []);

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">📡 Monitor Tiempo Real</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {realTimeStatus?.monitoring?.active ? (
              <Chip
                icon={<ActiveIcon />}
                label="Activo"
                color="success"
                size="small"
              />
            ) : (
              <Chip
                icon={<InactiveIcon />}
                label="Inactivo"
                color="default"
                size="small"
              />
            )}
          </Box>
        </Box>

        {/* Estado de Socket.IO */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            🔌 WebSocket Status
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={`Estado: ${realTimeStatus?.socketio?.status || 'unknown'}`}
              color={realTimeStatus?.socketio?.status === 'active' ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label={`Conexiones: ${realTimeStatus?.socketio?.connections || 0}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Última Actualización */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            🕒 Última Actualización
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A'}
          </Typography>
        </Box>

        {/* Logs en Tiempo Real */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            📝 Actividad Reciente
          </Typography>
          <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
            {logs.map((log, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', mr: 1 }}>
                  {getLogIcon(log.type)}
                </Avatar>
                <ListItemText
                  primary={log.message}
                  secondary={new Date(log.time).toLocaleTimeString()}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: getLogColor(log.type)
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Configuración de Monitoreo */}
        <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
          <Typography variant="subtitle2" gutterBottom>
            ⚙️ Configuración
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Intervalo: {realTimeStatus?.monitoring?.interval ? 
              `${realTimeStatus.monitoring.interval / 1000}s` : 'N/A'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Auto-refresh: {realTimeStatus?.monitoring?.active ? 'Habilitado' : 'Deshabilitado'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RealTimeMonitor;