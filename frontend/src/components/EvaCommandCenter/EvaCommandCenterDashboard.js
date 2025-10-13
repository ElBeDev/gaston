/**
 * 🎛️ Eva Command Center Dashboard
 * 
 * Interfaz principal para el control total del sistema Eva
 * Muestra estado, integraciones, métricas y permite ejecutar comandos
 * 
 * Parte de: Fase 1 - Command Center
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip, 
  Alert,
  CircularProgress,
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  RestartAlt as RestartIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Monitor as MonitorIcon
} from '@mui/icons-material';
import SystemStatusCard from './components/SystemStatusCard';
import IntegrationsCard from './components/IntegrationsCard';
import PerformanceCard from './components/PerformanceCard';
import CommandCenter from './components/CommandCenter';
import RealTimeMonitor from './components/RealTimeMonitor';
import EvaAutonomousDashboard from './EvaAutonomousDashboard';

const EvaCommandCenterDashboard = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    fetchSystemStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  /**
   * 📊 Obtiene el estado completo del sistema
   */
  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/eva/control/status');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSystemStatus(data);
      setLastUpdate(new Date().toISOString());
      setError(null);
      
    } catch (err) {
      console.error('❌ Error fetching system status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎯 Ejecuta un comando del sistema
   */
  const executeCommand = async (command, params = {}) => {
    try {
      const response = await fetch('/eva/control/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command, params })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refrescar estado después de comando exitoso
        await fetchSystemStatus();
        return result;
      } else {
        throw new Error(result.error || 'Command failed');
      }
      
    } catch (err) {
      console.error(`❌ Error executing command ${command}:`, err);
      throw err;
    }
  };

  /**
   * 🔄 Handlers para comandos rápidos
   */
  const handleSystemRestart = () => executeCommand('system.restart');
  const handleSystemOptimize = () => executeCommand('system.optimize');
  const handleStartMonitoring = () => executeCommand('monitoring.start');
  const handleStopMonitoring = () => executeCommand('monitoring.stop');

  /**
   * 📊 Determina el color del estado general
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  /**
   * 📈 Calcula métricas resumidas
   */
  const getSummaryMetrics = () => {
    if (!systemStatus) return null;

    const { integrations, system } = systemStatus;
    
    return {
      totalIntegrations: integrations?.totalIntegrations || 0,
      activeIntegrations: integrations?.activeIntegrations || 0,
      systemUptime: system?.uptime || 0,
      memoryUsage: system?.resources?.memory?.usage || 0,
      responseTime: system?.performance?.responseTime || 0
    };
  };

  const summaryMetrics = getSummaryMetrics();

  if (loading && !systemStatus) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          🎛️ Inicializando Eva Command Center...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      {/* Header del Command Center */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🎛️ Eva Command Center
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Control Total del Sistema - Fase 1 Activa
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Actualizar estado">
            <IconButton onClick={fetchSystemStatus} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Auto-refresh">
            <Button
              variant={autoRefresh ? "contained" : "outlined"}
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              Auto
            </Button>
          </Tooltip>
          
          <Tooltip title="Configuración">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Indicadores de Estado Rápido */}
      {systemStatus && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="primary">
                  {systemStatus.system?.status === 'healthy' ? '✅' : '❌'}
                </Typography>
                <Typography variant="body2">
                  Sistema
                </Typography>
                <Chip 
                  label={systemStatus.system?.status || 'Unknown'} 
                  color={getStatusColor(systemStatus.system?.status)}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="primary">
                  {summaryMetrics?.activeIntegrations || 0}/{summaryMetrics?.totalIntegrations || 0}
                </Typography>
                <Typography variant="body2">
                  Integraciones
                </Typography>
                <Chip 
                  label={`${summaryMetrics?.activeIntegrations || 0} Activas`}
                  color="success"
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="primary">
                  {Math.round(summaryMetrics?.memoryUsage || 0)}%
                </Typography>
                <Typography variant="body2">
                  Memoria
                </Typography>
                <Chip 
                  label="RAM"
                  color={summaryMetrics?.memoryUsage > 80 ? 'warning' : 'success'}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="primary">
                  {Math.round(summaryMetrics?.responseTime || 0)}ms
                </Typography>
                <Typography variant="body2">
                  Respuesta
                </Typography>
                <Chip 
                  label="Latencia"
                  color={summaryMetrics?.responseTime > 1000 ? 'warning' : 'success'}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="primary">
                  {Math.round(summaryMetrics?.systemUptime / 3600 || 0)}h
                </Typography>
                <Typography variant="body2">
                  Uptime
                </Typography>
                <Chip 
                  label="Activo"
                  color="success"
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Comandos Rápidos */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          🎯 Comandos Rápidos
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleSystemOptimize}
            disabled={loading}
          >
            Optimizar Sistema
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RestartIcon />}
            onClick={handleSystemRestart}
            disabled={loading}
            color="warning"
          >
            Reiniciar Sistema
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<PlayIcon />}
            onClick={handleStartMonitoring}
            disabled={loading}
            color="success"
          >
            Iniciar Monitoreo
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<StopIcon />}
            onClick={handleStopMonitoring}
            disabled={loading}
            color="error"
          >
            Detener Monitoreo
          </Button>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            ❌ Error: {error}
          </Typography>
          <Button size="small" onClick={fetchSystemStatus} sx={{ mt: 1 }}>
            Reintentar
          </Button>
        </Alert>
      )}

      {/* Tabs del Dashboard */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label="Estado General" 
            icon={<MonitorIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Integraciones" 
            icon={<CloudIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Rendimiento" 
            icon={<SpeedIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Base de Datos" 
            icon={<StorageIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Centro de Comandos" 
            icon={<SettingsIcon />}
            iconPosition="start"
          />
          <Tab 
            label="🤖 Operaciones Autónomas" 
            icon={<SettingsIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenido de Tabs */}
      {systemStatus && (
        <>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <SystemStatusCard 
                  systemStatus={systemStatus.system} 
                  onRefresh={fetchSystemStatus}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RealTimeMonitor 
                  realTimeStatus={systemStatus.realtime}
                  lastUpdate={lastUpdate}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <IntegrationsCard 
              integrations={systemStatus.integrations}
              onToggleIntegration={executeCommand}
              onRefresh={fetchSystemStatus}
            />
          )}

          {activeTab === 2 && (
            <PerformanceCard 
              performance={systemStatus.system?.performance}
              resources={systemStatus.system?.resources}
              onOptimize={() => executeCommand('system.optimize')}
            />
          )}

          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💾 Base de Datos
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Estado: {systemStatus.database?.status || 'Unknown'}
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => executeCommand('database.backup')}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    Crear Backup
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => executeCommand('database.optimize')}
                    disabled={loading}
                  >
                    Optimizar BD
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeTab === 4 && (
            <CommandCenter 
              onExecuteCommand={executeCommand}
              systemStatus={systemStatus}
            />
          )}

          {activeTab === 5 && (
            <EvaAutonomousDashboard />
          )}
        </>
      )}

      {/* Footer con información de actualización */}
      {lastUpdate && (
        <Box mt={4} textAlign="center">
          <Typography variant="caption" color="textSecondary">
            Última actualización: {new Date(lastUpdate).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EvaCommandCenterDashboard;