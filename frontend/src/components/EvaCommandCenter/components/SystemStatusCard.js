/**
 * 📊 System Status Card Component
 * 
 * Muestra el estado detallado del sistema
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Box,
  Alert
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const SystemStatusCard = ({ systemStatus, onRefresh }) => {
  if (!systemStatus) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">📊 Estado del Sistema</Typography>
          <Typography>Cargando...</Typography>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">📊 Estado del Sistema</Typography>
          <Chip 
            label={systemStatus.status} 
            color={getStatusColor(systemStatus.status)}
          />
        </Box>

        <Grid container spacing={2}>
          {/* Memoria */}
          <Grid size={{ sm: 6 }}>
            <Box mb={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <MemoryIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Memoria: {systemStatus.resources?.memory?.usage || 0}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(systemStatus.resources?.memory?.usage || 0)}
                color={systemStatus.resources?.memory?.usage > 80 ? 'warning' : 'primary'}
              />
            </Box>
          </Grid>

          {/* Performance */}
          <Grid size={{ sm: 6 }}>
            <Box mb={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <SpeedIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Respuesta: {systemStatus.performance?.responseTime || 0}ms
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((systemStatus.performance?.responseTime || 0) / 10, 100)}
                color={systemStatus.performance?.responseTime > 1000 ? 'warning' : 'primary'}
              />
            </Box>
          </Grid>

          {/* Uptime */}
          <Grid size={{ sm: 6 }}>
            <Box display="flex" alignItems="center">
              <TimelineIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Uptime: {formatUptime(systemStatus.uptime || 0)}
              </Typography>
            </Box>
          </Grid>

          {/* Servicios */}
          <Grid size={{ sm: 6 }}>
            <Box display="flex" alignItems="center">
              <StorageIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Servicios: {systemStatus.services?.filter(s => s.status === 'active').length || 0}/
                {systemStatus.services?.length || 0}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Errores */}
        {systemStatus.errors && systemStatus.errors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {systemStatus.errors.length} error(es) detectado(s)
            </Typography>
          </Alert>
        )}

        {/* Servicios Detalle */}
        {systemStatus.services && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Servicios:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {systemStatus.services.map((service, index) => (
                <Chip
                  key={index}
                  label={service.name}
                  size="small"
                  color={service.status === 'active' ? 'success' : 'default'}
                  variant={service.status === 'active' ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;