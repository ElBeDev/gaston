/**
 * ⚡ Performance Card Component
 * 
 * Muestra métricas de rendimiento y permite optimización
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  LinearProgress,
  Box,
  Button,
  Chip
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const PerformanceCard = ({ performance, resources, onOptimize }) => {
  if (!performance || !resources) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">⚡ Rendimiento</Typography>
          <Typography>Cargando métricas...</Typography>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (value, thresholds) => {
    if (value > thresholds.critical) return 'error';
    if (value > thresholds.warning) return 'warning';
    return 'success';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Grid container spacing={3}>
      {/* Métricas Principales */}
      <Grid size={{ md: 8 }}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">⚡ Métricas de Rendimiento</Typography>
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={onOptimize}
                size="small"
              >
                Optimizar
              </Button>
            </Box>

            <Grid container spacing={2}>
              {/* Tiempo de Respuesta */}
              <Grid size={{ sm: 6, md: 3 }}>
                <Box textAlign="center">
                  <SpeedIcon color="primary" fontSize="large" />
                  <Typography variant="h6" color="primary">
                    {performance.responseTime || 0}ms
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tiempo Respuesta
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((performance.responseTime || 0) / 50, 100)}
                    color={getPerformanceColor(performance.responseTime || 0, { warning: 1000, critical: 5000 })}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>

              {/* Latencia BD */}
              <Grid size={{ sm: 6, md: 3 }}>
                <Box textAlign="center">
                  <StorageIcon color="primary" fontSize="large" />
                  <Typography variant="h6" color="primary">
                    {performance.databaseLatency || 0}ms
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Latencia BD
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((performance.databaseLatency || 0) / 20, 100)}
                    color={getPerformanceColor(performance.databaseLatency || 0, { warning: 500, critical: 1000 })}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>

              {/* Requests por Minuto */}
              <Grid size={{ sm: 6, md: 3 }}>
                <Box textAlign="center">
                  <TimelineIcon color="primary" fontSize="large" />
                  <Typography variant="h6" color="primary">
                    {performance.requestsPerMinute || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Req/min
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((performance.requestsPerMinute || 0) / 2, 100)}
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>

              {/* Tasa de Error */}
              <Grid size={{ sm: 6, md: 3 }}>
                <Box textAlign="center">
                  <MemoryIcon color="primary" fontSize="large" />
                  <Typography variant="h6" color="primary">
                    {(performance.errorRate || 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tasa Error
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((performance.errorRate || 0) * 10, 100)}
                    color={getPerformanceColor(performance.errorRate || 0, { warning: 2, critical: 5 })}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Recursos del Sistema */}
      <Grid size={{ md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💾 Recursos del Sistema
            </Typography>

            {/* Memoria */}
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Memoria</Typography>
                <Chip
                  label={`${resources.memory?.usage || 0}%`}
                  size="small"
                  color={getPerformanceColor(resources.memory?.usage || 0, { warning: 70, critical: 85 })}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={parseFloat(resources.memory?.usage || 0)}
                color={getPerformanceColor(resources.memory?.usage || 0, { warning: 70, critical: 85 })}
              />
              <Typography variant="caption" color="textSecondary">
                {formatBytes(resources.memory?.heapUsed || 0)} / {formatBytes(resources.memory?.heapTotal || 0)}
              </Typography>
            </Box>

            {/* CPU */}
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">CPU Load</Typography>
                <Chip
                  label={`${(resources.cpu?.loadAverage?.[0] || 0).toFixed(2)}`}
                  size="small"
                  color={getPerformanceColor(resources.cpu?.loadAverage?.[0] || 0, { warning: 1.5, critical: 2.0 })}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((resources.cpu?.loadAverage?.[0] || 0) * 50, 100)}
                color={getPerformanceColor(resources.cpu?.loadAverage?.[0] || 0, { warning: 1.5, critical: 2.0 })}
              />
            </Box>

            {/* Memoria del Sistema */}
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">RAM Sistema</Typography>
                <Chip
                  label={`${(((resources.system?.totalMemory - resources.system?.freeMemory) / resources.system?.totalMemory) * 100 || 0).toFixed(1)}%`}
                  size="small"
                  color="primary"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={((resources.system?.totalMemory - resources.system?.freeMemory) / resources.system?.totalMemory) * 100 || 0}
                color="primary"
              />
              <Typography variant="caption" color="textSecondary">
                {formatBytes((resources.system?.totalMemory - resources.system?.freeMemory) || 0)} / {formatBytes(resources.system?.totalMemory || 0)}
              </Typography>
            </Box>

            {/* Uptime Sistema */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Uptime del Sistema
              </Typography>
              <Typography variant="h6" color="primary">
                {Math.floor((resources.system?.uptime || 0) / 3600)}h {Math.floor(((resources.system?.uptime || 0) % 3600) / 60)}m
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Métricas Adicionales */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Métricas Adicionales
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {performance.throughput || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Throughput
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={{ sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {(performance.apiLatency || 0).toFixed(0)}ms
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    API Latency
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={{ sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {resources.system?.platform || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Plataforma
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={{ sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {resources.system?.arch || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Arquitectura
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PerformanceCard;