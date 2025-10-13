/**
 * 🤖 Eva Autonomous Operations Dashboard
 * 
 * Panel de control para las operaciones autónomas de Eva
 * Muestra el estado de todos los componentes autónomos y permite control total
 * 
 * Fase 2 - Autonomous Operations
 * Autor: Eva System Control
 * Fecha: Octubre 12, 2025
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Psychology as BrainIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Schedule as TaskIcon,
  AccountTree as WorkflowIcon,
  BarChart as OptimizeIcon,
  Settings as SettingsIcon,
  AutoMode as AutoIcon
} from '@mui/icons-material';

const EvaAutonomousDashboard = () => {
  const [autonomousData, setAutonomousData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos autónomos
  const fetchAutonomousData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/eva/autonomous/status');
      if (!response.ok) throw new Error('Failed to fetch autonomous data');
      const data = await response.json();
      setAutonomousData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutonomousData();
    const interval = setInterval(fetchAutonomousData, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // Controlar sistema autónomo
  const handleSystemControl = async (action) => {
    try {
      const response = await fetch(`/eva/autonomous/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} autonomous system`);
      
      await fetchAutonomousData(); // Recargar datos
    } catch (err) {
      setError(err.message);
    }
  };

  // Cambiar nivel de autonomía
  const handleAutonomyLevelChange = async (level) => {
    try {
      const response = await fetch('/eva/autonomous/autonomy-level', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level })
      });
      
      if (!response.ok) throw new Error('Failed to change autonomy level');
      
      await fetchAutonomousData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Controlar aprendizaje
  const handleLearningToggle = async (enable) => {
    try {
      const action = enable ? 'enable' : 'disable';
      const response = await fetch(`/eva/autonomous/learning/${action}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} learning`);
      
      await fetchAutonomousData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      default: return 'warning';
    }
  };

  const getAutonomyLevelColor = (level) => {
    switch (level) {
      case 'fully-autonomous': return 'success';
      case 'semi-autonomous': return 'warning';
      case 'supervised': return 'info';
      default: return 'default';
    }
  };

  if (loading) return <LinearProgress />;

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton onClick={fetchAutonomousData}>
          <RefreshIcon />
        </IconButton>
      }>
        Error: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoIcon sx={{ mr: 2, fontSize: 40 }} />
            Eva Autonomous Operations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Fase 2 - Sistema de Operaciones Autónomas
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color={autonomousData?.status === 'active' ? 'error' : 'success'}
            startIcon={autonomousData?.status === 'active' ? <StopIcon /> : <StartIcon />}
            onClick={() => handleSystemControl(autonomousData?.status === 'active' ? 'stop' : 'start')}
          >
            {autonomousData?.status === 'active' ? 'Detener' : 'Iniciar'}
          </Button>
          
          <IconButton onClick={fetchAutonomousData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Estado Principal */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Estado del Sistema</Typography>
              <Chip 
                label={autonomousData?.status?.toUpperCase() || 'UNKNOWN'}
                color={getStatusColor(autonomousData?.status)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Uptime: {Math.round((autonomousData?.uptime || 0) / 60000)} min
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Nivel de Autonomía</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={autonomousData?.autonomyLevel || 'supervised'}
                  onChange={(e) => handleAutonomyLevelChange(e.target.value)}
                >
                  <MenuItem value="supervised">Supervisado</MenuItem>
                  <MenuItem value="semi-autonomous">Semi-Autónomo</MenuItem>
                  <MenuItem value="fully-autonomous">Totalmente Autónomo</MenuItem>
                </Select>
              </FormControl>
              <Chip 
                label={autonomousData?.autonomyLevel?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                color={getAutonomyLevelColor(autonomousData?.autonomyLevel)}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Aprendizaje</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={autonomousData?.isLearning || false}
                    onChange={(e) => handleLearningToggle(e.target.checked)}
                  />
                }
                label={autonomousData?.isLearning ? "Activo" : "Inactivo"}
              />
              <Typography variant="body2" color="text.secondary">
                Modo de aprendizaje autónomo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Estadísticas</Typography>
              <Typography variant="body2">
                Decisiones: {autonomousData?.totalDecisions || 0}
              </Typography>
              <Typography variant="body2">
                Tareas: {autonomousData?.totalTasks || 0}
              </Typography>
              <Typography variant="body2">
                Workflows: {autonomousData?.totalWorkflows || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Eficiencia: {autonomousData?.efficiency || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Componentes Autónomos */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Componentes Autónomos
      </Typography>

      <Grid container spacing={3}>
        {/* Task Scheduler */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TaskIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Task Scheduler</Typography>
                <Chip 
                  label="INTELIGENTE"
                  size="small" 
                  color="info"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Typography variant="body2" gutterBottom>
                Programador inteligente de tareas
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2">
                Tareas ejecutadas: {autonomousData?.components?.taskScheduler?.executionStats?.totalExecuted || 0}
              </Typography>
              <Typography variant="body2">
                Éxito: {autonomousData?.components?.taskScheduler?.executionStats?.successful || 0}
              </Typography>
              <Typography variant="body2" color="error">
                Fallos: {autonomousData?.components?.taskScheduler?.executionStats?.failed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Workflow Engine */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkflowIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">Workflow Engine</Typography>
                <Chip 
                  label="AUTOMATIZADO"
                  size="small" 
                  color="secondary"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Typography variant="body2" gutterBottom>
                Motor de flujos de trabajo
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2">
                Workflows: {autonomousData?.components?.workflowEngine?.totalWorkflows || 0}
              </Typography>
              <Typography variant="body2">
                Ejecuciones: {autonomousData?.components?.workflowEngine?.totalExecutions || 0}
              </Typography>
              <Typography variant="body2">
                Templates: {autonomousData?.components?.workflowEngine?.templates || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Decision Matrix */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BrainIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Decision Matrix</Typography>
                <Chip 
                  label="IA"
                  size="small" 
                  color="warning"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Typography variant="body2" gutterBottom>
                Matriz de decisiones inteligente
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2">
                Decisiones: {autonomousData?.components?.decisionMatrix?.totalDecisions || 0}
              </Typography>
              <Typography variant="body2">
                Precisión: {autonomousData?.components?.decisionMatrix?.accuracy || 0}%
              </Typography>
              <Typography variant="body2">
                Reglas: {autonomousData?.components?.decisionMatrix?.totalRules || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Resource Optimizer */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <OptimizeIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Resource Optimizer</Typography>
                <Chip 
                  label={autonomousData?.components?.resourceOptimizer?.isActive ? "ACTIVO" : "INACTIVO"}
                  size="small" 
                  color={autonomousData?.components?.resourceOptimizer?.isActive ? "success" : "default"}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Typography variant="body2" gutterBottom>
                Optimizador de recursos del sistema
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2">
                Optimizaciones: {autonomousData?.components?.resourceOptimizer?.stats?.optimizationsApplied || 0}
              </Typography>
              <Typography variant="body2">
                Mejora promedio: {autonomousData?.components?.resourceOptimizer?.stats?.averageImprovement || 0}%
              </Typography>
              <Typography variant="body2">
                Nivel: {autonomousData?.components?.resourceOptimizer?.optimizationLevel || 'balanced'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Guardian */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Security Guardian</Typography>
                <Chip 
                  label={autonomousData?.components?.securityGuardian?.isActive ? "PROTEGIENDO" : "INACTIVO"}
                  size="small" 
                  color={autonomousData?.components?.securityGuardian?.isActive ? "error" : "default"}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Typography variant="body2" gutterBottom>
                Guardián de seguridad autónomo
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2">
                Amenazas detectadas: {autonomousData?.components?.securityGuardian?.stats?.threatsDetected || 0}
              </Typography>
              <Typography variant="body2">
                Amenazas bloqueadas: {autonomousData?.components?.securityGuardian?.stats?.threatsBlocked || 0}
              </Typography>
              <Typography variant="body2">
                Nivel: {autonomousData?.components?.securityGuardian?.securityLevel || 'medium'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Tuner */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PerformanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Performance Tuner</Typography>
                <Chip 
                  label={autonomousData?.components?.performanceTuner?.isActive ? "OPTIMIZANDO" : "INACTIVO"}
                  size="small" 
                  color={autonomousData?.components?.performanceTuner?.isActive ? "primary" : "default"}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Typography variant="body2" gutterBottom>
                Optimizador de rendimiento
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2">
                Optimizaciones: {autonomousData?.components?.performanceTuner?.stats?.optimizationsApplied || 0}
              </Typography>
              <Typography variant="body2">
                Mejora: {autonomousData?.components?.performanceTuner?.stats?.performanceImprovement || 0}%
              </Typography>
              <Typography variant="body2">
                Nivel: {autonomousData?.components?.performanceTuner?.tuningLevel || 'adaptive'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Métricas de Rendimiento */}
      {autonomousData?.components?.performanceTuner?.metrics && (
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Métricas de Rendimiento en Tiempo Real
          </Typography>
          
          <Grid container spacing={3}>
            {Object.entries(autonomousData.components.performanceTuner.metrics).map(([metric, data]) => (
              <Grid item xs={6} md={2} key={metric}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {data.current?.toFixed(1) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  <Chip 
                    label={data.trend || 'stable'}
                    size="small"
                    color={data.trend === 'increasing' ? 'warning' : data.trend === 'decreasing' ? 'success' : 'default'}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default EvaAutonomousDashboard;