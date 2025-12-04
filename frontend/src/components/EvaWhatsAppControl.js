import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Divider,
  Slider,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  WhatsApp,
  SmartToy,
  Settings,
  TrendingUp,
  Message,
  Schedule,
  Security,
  Check,
  Close,
  PlayArrow,
  Stop,
  Refresh,
  Info,
  Warning,
  Error as ErrorIcon,
  CheckCircle
} from '@mui/icons-material';

const EvaWhatsAppControl = () => {
  // Estados principales
  const [whatsappStatus, setWhatsappStatus] = useState({
    isActive: false,
    autoResponseEnabled: false,
    settings: {},
    stats: {}
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados de configuración
  const [settings, setSettings] = useState({
    mode: 'selective',
    confidence_threshold: 70,
    response_delay: 2000,
    max_responses_per_chat: 10,
    daily_limit: 100,
    business_hours_only: false,
    keywords: ['eva', 'asistente', 'ayuda', 'help'],
    blacklist: ['spam', 'publicidad']
  });
  
  // Estados del diálogo
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  
  // Estados de manual testing
  const [testMessage, setTestMessage] = useState('');
  const [testChatId, setTestChatId] = useState('');

  useEffect(() => {
    loadWhatsAppStatus();
  }, []);

  // 📊 Cargar estado de WhatsApp
  const loadWhatsAppStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/eva/whatsapp/status');
      const data = await response.json();
      
      if (data.success) {
        setWhatsappStatus(data.status);
        setSettings(data.status.settings || settings);
      } else {
        setError(data.error || 'Error loading WhatsApp status');
      }
    } catch (err) {
      console.error('Error loading WhatsApp status:', err);
      setError('Error connecting to Eva WhatsApp service');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Activar respuestas automáticas
  const enableAutoResponse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/eva/whatsapp/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('✅ Respuestas automáticas de WhatsApp activadas por Eva');
        await loadWhatsAppStatus(); // Recargar estado
      } else {
        setError(data.message || 'Error enabling auto-response');
      }
    } catch (err) {
      console.error('Error enabling auto-response:', err);
      setError('Error activating WhatsApp auto-response');
    } finally {
      setLoading(false);
    }
  };

  // ❌ Desactivar respuestas automáticas
  const disableAutoResponse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/eva/whatsapp/disable', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('❌ Respuestas automáticas de WhatsApp desactivadas');
        await loadWhatsAppStatus(); // Recargar estado
      } else {
        setError(data.error || 'Error disabling auto-response');
      }
    } catch (err) {
      console.error('Error disabling auto-response:', err);
      setError('Error deactivating WhatsApp auto-response');
    } finally {
      setLoading(false);
    }
  };

  // 🎛️ Toggle auto-response
  const toggleAutoResponse = async () => {
    if (whatsappStatus.autoResponseEnabled) {
      await disableAutoResponse();
    } else {
      await enableAutoResponse();
    }
  };

  // ⚙️ Guardar configuraciones
  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/eva/whatsapp/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('⚙️ Configuración actualizada');
        setSettingsOpen(false);
        await loadWhatsAppStatus();
      } else {
        setError(data.error || 'Error updating settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  // 💬 Enviar mensaje de prueba
  const sendTestMessage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/eva/whatsapp/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: testChatId,
          message: testMessage
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('💬 Mensaje enviado por Eva');
        setTestMessage('');
        setTestChatId('');
      } else {
        setError(data.message || 'Error sending message');
      }
    } catch (err) {
      console.error('Error sending test message:', err);
      setError('Error sending test message');
    } finally {
      setLoading(false);
    }
  };

  // 📊 Obtener color del estado
  const getStatusColor = () => {
    if (!whatsappStatus.isActive) return 'error';
    if (whatsappStatus.autoResponseEnabled) return 'success';
    return 'warning';
  };

  // 📊 Obtener texto del estado
  const getStatusText = () => {
    if (!whatsappStatus.isActive) return 'Inactivo';
    if (whatsappStatus.autoResponseEnabled) return 'Activo';
    return 'Standby';
  };

  if (loading && !whatsappStatus.isActive) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando sistema Eva WhatsApp...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#1e3a8a', color: 'white' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid>
            <WhatsApp sx={{ fontSize: 40 }} />
          </Grid>
          <Grid size="grow">
            <Typography variant="h4" gutterBottom>
              📱 Eva WhatsApp Autonomous Control
            </Typography>
            <Typography variant="subtitle1">
              Sistema inteligente de respuestas automáticas de WhatsApp
            </Typography>
          </Grid>
          <Grid>
            <Chip
              icon={whatsappStatus.autoResponseEnabled ? <CheckCircle /> : <Close />}
              label={getStatusText()}
              color={getStatusColor()}
              size="large"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccess(null)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panel de Control Principal */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎛️ Control Principal
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={whatsappStatus.autoResponseEnabled}
                    onChange={toggleAutoResponse}
                    disabled={!whatsappStatus.isActive || loading}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      Respuestas Automáticas
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Eva responderá mensajes automáticamente
                    </Typography>
                  </Box>
                }
              />

              {loading && <LinearProgress sx={{ mt: 1 }} />}

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="textSecondary" gutterBottom>
                Estado del Sistema:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SmartToy color={whatsappStatus.isActive ? 'success' : 'error'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Eva Autonomous System"
                    secondary={whatsappStatus.isActive ? 'Activo' : 'Inactivo'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <WhatsApp color={whatsappStatus.whatsappServiceActive ? 'success' : 'error'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="WhatsApp Service"
                    secondary={whatsappStatus.whatsappServiceActive ? 'Conectado' : 'Desconectado'}
                  />
                </ListItem>
              </List>
            </CardContent>
            
            <CardActions>
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setSettingsOpen(true)}
                disabled={loading}
              >
                Configurar
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={() => setStatsOpen(true)}
                disabled={loading}
              >
                Estadísticas
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadWhatsAppStatus}
                disabled={loading}
              >
                Actualizar
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Panel de Configuración Rápida */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚙️ Configuración Rápida
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  Modo de Respuesta: {settings.mode}
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={settings.mode}
                    onChange={(e) => setSettings({ ...settings, mode: e.target.value })}
                  >
                    <MenuItem value="selective">Selectivo (solo palabras clave)</MenuItem>
                    <MenuItem value="all">Todos los mensajes</MenuItem>
                    <MenuItem value="keywords">Solo palabras específicas</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  Umbral de Confianza: {settings.confidence_threshold}%
                </Typography>
                <Slider
                  value={settings.confidence_threshold}
                  onChange={(e, value) => setSettings({ ...settings, confidence_threshold: value })}
                  min={0}
                  max={100}
                  marks={[
                    { value: 30, label: '30%' },
                    { value: 70, label: '70%' },
                    { value: 90, label: '90%' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  Delay de Respuesta: {settings.response_delay / 1000}s
                </Typography>
                <Slider
                  value={settings.response_delay}
                  onChange={(e, value) => setSettings({ ...settings, response_delay: value })}
                  min={1000}
                  max={10000}
                  step={500}
                  marks={[
                    { value: 1000, label: '1s' },
                    { value: 5000, label: '5s' },
                    { value: 10000, label: '10s' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value / 1000}s`}
                />
              </Box>
            </CardContent>
            
            <CardActions>
              <Button
                variant="contained"
                startIcon={<Check />}
                onClick={saveSettings}
                disabled={loading}
                fullWidth
              >
                Aplicar Configuración
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Panel de Estadísticas Rápidas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Estadísticas
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {whatsappStatus.stats?.totalMessagesReceived || 0}
                    </Typography>
                    <Typography variant="caption">
                      Mensajes Recibidos
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {whatsappStatus.stats?.totalResponsesSent || 0}
                    </Typography>
                    <Typography variant="caption">
                      Respuestas Enviadas
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {whatsappStatus.stats?.dailyResponses || 0}
                    </Typography>
                    <Typography variant="caption">
                      Respuestas Hoy
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {Math.round(whatsappStatus.stats?.successRate || 0)}%
                    </Typography>
                    <Typography variant="caption">
                      Tasa de Éxito
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Pruebas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧪 Pruebas Manuales
              </Typography>
              
              <TextField
                fullWidth
                label="Chat ID"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                placeholder="ej: 5491234567890@c.us"
              />
              
              <TextField
                fullWidth
                label="Mensaje de Prueba"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                multiline
                rows={3}
                size="small"
                sx={{ mb: 2 }}
                placeholder="Escribe un mensaje para enviar por WhatsApp..."
              />
            </CardContent>
            
            <CardActions>
              <Button
                variant="contained"
                startIcon={<Message />}
                onClick={sendTestMessage}
                disabled={loading || !testMessage || !testChatId}
                fullWidth
              >
                Enviar Mensaje de Prueba
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de Configuración Avanzada */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>⚙️ Configuración Avanzada de WhatsApp</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Límite Diario"
                type="number"
                value={settings.daily_limit}
                onChange={(e) => setSettings({ ...settings, daily_limit: parseInt(e.target.value) })}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Máx. Respuestas por Chat"
                type="number"
                value={settings.max_responses_per_chat}
                onChange={(e) => setSettings({ ...settings, max_responses_per_chat: parseInt(e.target.value) })}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.business_hours_only}
                    onChange={(e) => setSettings({ ...settings, business_hours_only: e.target.checked })}
                  />
                }
                label="Solo horario comercial (9 AM - 6 PM)"
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Palabras Clave (separadas por coma)"
                value={settings.keywords?.join(', ') || ''}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                })}
                helperText="Eva responderá cuando detecte estas palabras"
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Blacklist (separadas por coma)"
                value={settings.blacklist?.join(', ') || ''}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  blacklist: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                })}
                helperText="Eva NO responderá mensajes que contengan estas palabras"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={saveSettings} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Estadísticas Detalladas */}
      <Dialog open={statsOpen} onClose={() => setStatsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>📊 Estadísticas Detalladas</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Rendimiento General</Typography>
          
          <List>
            <ListItem>
              <ListItemText 
                primary="Mensajes Recibidos" 
                secondary={whatsappStatus.stats?.totalMessagesReceived || 0}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Respuestas Enviadas" 
                secondary={whatsappStatus.stats?.totalResponsesSent || 0}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Tasa de Éxito" 
                secondary={`${Math.round(whatsappStatus.stats?.successRate || 0)}%`}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Tiempo Promedio de Respuesta" 
                secondary={`${Math.round(whatsappStatus.stats?.avgResponseTime || 0)}ms`}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Chats Activos" 
                secondary={whatsappStatus.stats?.activeChats || 0}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsOpen(false)} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvaWhatsAppControl;