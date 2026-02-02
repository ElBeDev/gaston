import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import {
  Paper,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Alert,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  SmartToy,
  Settings,
  Science,
  Schedule,
  ExpandMore,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Refresh
} from '@mui/icons-material';

const EvaAutoResponsePanel = () => {
  const [evaStatus, setEvaStatus] = useState({
    enabled: false,
    withinWorkingHours: false,
    timeContext: {},
    config: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testSenderName, setTestSenderName] = useState('Usuario Test');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    fetchEvaStatus();
  }, []);

  const fetchEvaStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/whatsapp/eva/status'));
      const data = await response.json();
      
      if (data.success) {
        setEvaStatus(data.status);
      } else {
        setError('Error al obtener estado de Eva');
      }
    } catch (error) {
      setError('Error de conexión al obtener estado');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvaAutoResponse = async (enabled) => {
    try {
      setLoading(true);
      const endpoint = enabled ? 'enable' : 'disable';
      const response = await fetch(`http://localhost:3002/api/whatsapp/eva/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEvaStatus(data.status);
        setSuccess(data.message);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Error al cambiar estado de Eva');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testEvaResponse = async () => {
    if (!testMessage.trim()) {
      setError('Ingresa un mensaje para probar');
      return;
    }

    try {
      setTestLoading(true);
      const response = await fetch('http://localhost:3002/api/whatsapp/eva/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testMessage.trim(),
          senderName: testSenderName.trim() || 'Usuario Test'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResult(data);
        setSuccess('Test completado exitosamente');
      } else {
        setError(data.error || 'Error al probar Eva');
      }
    } catch (error) {
      setError('Error de conexión al probar Eva');
      console.error('Error:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!evaStatus.enabled) return <ErrorIcon sx={{ color: 'error.main' }} />;
    if (!evaStatus.withinWorkingHours) return <Warning sx={{ color: 'warning.main' }} />;
    return <CheckCircle sx={{ color: 'success.main' }} />;
  };

  const getStatusText = () => {
    if (!evaStatus.enabled) return 'Deshabilitada';
    if (!evaStatus.withinWorkingHours) return 'Fuera de horario';
    return 'Activa y operativa';
  };

  const getStatusColor = () => {
    if (!evaStatus.enabled) return 'error';
    if (!evaStatus.withinWorkingHours) return 'warning';
    return 'success';
  };

  const formatTime = (timeContext) => {
    if (!timeContext.currentTime) return 'No disponible';
    
    try {
      const time = new Date(timeContext.currentTime);
      return time.toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
      });
    } catch (error) {
      return 'Error de formato';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SmartToy sx={{ fontSize: 32, color: '#059669' }} />
          Eva Auto Response
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sistema de respuesta automática inteligente para WhatsApp
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Panel de Estado */}
        <Grid size={{ md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon()}
                Estado de Eva
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={evaStatus.enabled || false}
                      onChange={(e) => toggleEvaAutoResponse(e.target.checked)}
                      disabled={loading}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">Auto Respuesta</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Permitir que Eva responda automáticamente
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Estado:</Typography>
                  <Chip 
                    label={getStatusText()}
                    color={getStatusColor()}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Hora Local:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(evaStatus.timeContext)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Horario de Trabajo:</Typography>
                  <Chip 
                    label={evaStatus.withinWorkingHours ? 'Dentro' : 'Fuera'}
                    color={evaStatus.withinWorkingHours ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchEvaStatus}
                disabled={loading}
                size="small"
                sx={{ mt: 2 }}
              >
                Actualizar Estado
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Test */}
        <Grid size={{ md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Science />
                Probar Eva
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Envía un mensaje de prueba para ver cómo respondería Eva
              </Typography>

              <Button
                variant="contained"
                startIcon={<Science />}
                onClick={() => setTestDialogOpen(true)}
                disabled={loading}
                sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
              >
                Abrir Test Eva
              </Button>

              {testResult && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Último Test:
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Mensaje: "{testResult.testMessage.body}"
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Decisión: {testResult.message}
                  </Typography>
                  {testResult.evaDecision.shouldRespond && (
                    <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Respuesta: "{testResult.evaDecision.response}"
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Configuración Avanzada */}
      <Box sx={{ mt: 3 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings />
              Configuración Avanzada
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* Umbrales de Confianza */}
              <Grid size={{ md: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Umbrales de Confianza:
                </Typography>
                {evaStatus.config.confidenceThresholds && Object.entries(evaStatus.config.confidenceThresholds).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                      {key.replace('_', ' ')}:
                    </Typography>
                    <Chip label={value} size="small" variant="outlined" />
                  </Box>
                ))}
              </Grid>

              {/* Tipos de Manejo Automático */}
              <Grid size={{ md: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Manejo Automático:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {evaStatus.config.autoHandleTypes && evaStatus.config.autoHandleTypes.map((type) => (
                    <Chip 
                      key={type} 
                      label={type.replace('_', ' ')} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              {/* Horarios de Trabajo */}
              {evaStatus.config.workingHours && (
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule />
                    Horarios de Trabajo
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(evaStatus.config.workingHours.schedule || {}).map(([day, schedule]) => (
                      <Grid size={{ sm: 6, md: 4 }}key={day}>
                        <Paper variant="outlined" sx={{ p: 1 }}>
                          <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                            {day}:
                          </Typography>
                          <Typography variant="caption" display="block">
                            {schedule.disabled ? 'Deshabilitado' : `${schedule.start} - ${schedule.end}`}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Dialog de Test */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science />
          Probar Eva Auto Response
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Simula un mensaje entrante para ver si Eva respondería automáticamente y qué respuesta generaría.
          </Typography>

          <TextField
            fullWidth
            label="Nombre del Remitente"
            value={testSenderName}
            onChange={(e) => setTestSenderName(e.target.value)}
            sx={{ mb: 2 }}
            size="small"
          />

          <TextField
            fullWidth
            label="Mensaje de Prueba"
            multiline
            rows={3}
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Ej: Hola, ¿puedes reunirte conmigo mañana a las 3 PM?"
            sx={{ mb: 3 }}
          />

          {testResult && (
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Resultado del Test:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ md: 6 }}>
                  <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                    Decisión:
                  </Typography>
                  <Chip 
                    label={testResult.evaDecision.shouldRespond ? 'SÍ RESPONDER' : 'NO RESPONDER'}
                    color={testResult.evaDecision.shouldRespond ? 'success' : 'error'}
                    size="small"
                  />
                  
                  {testResult.evaDecision.confidence && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" display="block">
                        Confianza: {(testResult.evaDecision.confidence * 100).toFixed(1)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={testResult.evaDecision.confidence * 100} 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  )}
                </Grid>

                <Grid size={{ md: 6 }}>
                  <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                    Razón:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testResult.evaDecision.reasoning}
                  </Typography>
                </Grid>

                {testResult.evaDecision.shouldRespond && testResult.evaDecision.response && (
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                      Respuesta Generada:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1, backgroundColor: '#dcf8c6' }}>
                      <Typography variant="body2">
                        {testResult.evaDecision.response}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={testEvaResponse}
            disabled={testLoading || !testMessage.trim()}
            startIcon={testLoading ? <LinearProgress size={20} /> : <Science />}
            sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
          >
            {testLoading ? 'Probando...' : 'Probar Eva'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EvaAutoResponsePanel;