import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  Schedule,
  Lightbulb,
  Warning,
  CheckCircle,
  AccessTime,
  Analytics,
  AutoAwesome,
  Refresh
} from '@mui/icons-material';

/**
 * 🧠 Eva Intelligence Dashboard
 * Panel de control que muestra las predicciones, análisis de comportamiento
 * y insights de inteligencia de Eva en tiempo real
 */
const IntelligenceDashboard = ({ userId = 'gaston' }) => {
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadIntelligenceData();
    // Actualizar cada 5 minutos
    const interval = setInterval(loadIntelligenceData, 300000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadIntelligenceData = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos de inteligencia
      // En producción, esto sería una llamada real a la API
      const mockData = {
        userProfile: {
          workingPatterns: {
            peakHours: [9, 10, 15, 16],
            energyType: 'morning-person'
          },
          communicationStyle: {
            formalityLevel: 'professional',
            responseSpeed: 'fast'
          }
        },
        predictions: {
          immediateNeeds: [
            {
              need: 'focus_session',
              description: 'Es tu hora pico de productividad - perfecto para tareas complejas',
              probability: 0.85,
              urgency: 'high',
              suggestedAction: 'Programa una sesión de trabajo profundo'
            },
            {
              need: 'calendar_review',
              description: 'Necesitarás revisar tu calendario para la próxima semana',
              probability: 0.72,
              urgency: 'medium',
              suggestedAction: 'Revisar y optimizar agenda semanal'
            }
          ],
          upcomingActions: [
            {
              action: 'meeting_preparation',
              description: 'Preparar reunión con equipo de desarrollo',
              probability: 0.78,
              timeframe: '2-3 días'
            },
            {
              action: 'project_update',
              description: 'Actualizar status del proyecto Eva',
              probability: 0.65,
              timeframe: '1-2 días'
            }
          ]
        },
        behaviorInsights: {
          currentState: 'peak-productivity',
          productivityScore: 85,
          stressLevel: 'low',
          recommendations: [
            'Tu próxima hora pico de productividad es a las 3:00 PM - perfecto para tareas complejas',
            'Considera un break de 15 minutos para mantener tu energía'
          ]
        },
        riskAssessment: {
          overallRiskLevel: 'low',
          burnoutRisk: { level: 'low', score: 2 },
          overcommitmentRisk: { level: 'medium', score: 4 }
        }
      };

      setTimeout(() => {
        setIntelligenceData(mockData);
        setLastUpdate(new Date());
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error loading intelligence data:', error);
      setLoading(false);
    }
  };

  if (loading && !intelligenceData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Analizando patrones de inteligencia...
        </Typography>
      </Box>
    );
  }

  const getCurrentStateColor = (state) => {
    switch (state) {
      case 'peak-productivity': return 'success';
      case 'high-stress': return 'error';
      case 'moderate-energy': return 'warning';
      default: return 'info';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <Psychology />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              🧠 Dashboard de Inteligencia Eva
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Análisis predictivo y comportamiento en tiempo real
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="caption" color="text.secondary">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Actualizar datos">
            <IconButton onClick={loadIntelligenceData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Estado Actual del Usuario */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Estado Actual</Typography>
              </Box>
              
              <Box textAlign="center" mb={2}>
                <Chip 
                  label={intelligenceData?.behaviorInsights?.currentState || 'Analizando...'}
                  color={getCurrentStateColor(intelligenceData?.behaviorInsights?.currentState)}
                  size="large"
                  sx={{ fontSize: '1rem', p: 2 }}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Productividad: {intelligenceData?.behaviorInsights?.productivityScore || 0}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={intelligenceData?.behaviorInsights?.productivityScore || 0}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Nivel de estrés: {intelligenceData?.behaviorInsights?.stressLevel || 'normal'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Necesidades Inmediatas */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AutoAwesome color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Necesidades Inmediatas</Typography>
              </Box>
              
              <List>
                {intelligenceData?.predictions?.immediateNeeds?.map((need, index) => (
                  <Fade in={true} key={index} timeout={300 * (index + 1)}>
                    <ListItem>
                      <ListItemIcon>
                        <Chip 
                          label={`${Math.round(need.probability * 100)}%`}
                          size="small"
                          color={need.urgency === 'high' ? 'error' : 'primary'}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={need.description}
                        secondary={`Acción sugerida: ${need.suggestedAction}`}
                      />
                    </ListItem>
                  </Fade>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones Próximas */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Schedule color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Acciones Próximas</Typography>
              </Box>
              
              <List dense>
                {intelligenceData?.predictions?.upcomingActions?.map((action, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AccessTime fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={action.description}
                      secondary={`${action.timeframe} • ${Math.round(action.probability * 100)}% probabilidad`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recomendaciones Personalizadas */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Lightbulb color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Recomendaciones</Typography>
              </Box>
              
              <List dense>
                {intelligenceData?.behaviorInsights?.recommendations?.map((rec, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={rec} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Evaluación de Riesgos */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Warning color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Evaluación de Riesgos</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Riesgo General
                </Typography>
                <Chip 
                  label={intelligenceData?.riskAssessment?.overallRiskLevel?.toUpperCase() || 'BAJO'}
                  color={getRiskColor(intelligenceData?.riskAssessment?.overallRiskLevel)}
                  variant="filled"
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Burnout: {intelligenceData?.riskAssessment?.burnoutRisk?.level || 'bajo'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(intelligenceData?.riskAssessment?.burnoutRisk?.score || 0) * 10}
                  color={getRiskColor(intelligenceData?.riskAssessment?.burnoutRisk?.level)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Sobrecarga: {intelligenceData?.riskAssessment?.overcommitmentRisk?.level || 'bajo'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(intelligenceData?.riskAssessment?.overcommitmentRisk?.score || 0) * 10}
                  color={getRiskColor(intelligenceData?.riskAssessment?.overcommitmentRisk?.level)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Patrones de Trabajo */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Analytics color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Patrones de Trabajo</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" gutterBottom>
                    Horarios Pico:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {intelligenceData?.userProfile?.workingPatterns?.peakHours?.map((hour, index) => (
                      <Chip 
                        key={index}
                        label={`${hour}:00`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" gutterBottom>
                    Tipo de Energía:
                  </Typography>
                  <Chip 
                    label={intelligenceData?.userProfile?.workingPatterns?.energyType || 'normal'}
                    color="secondary"
                    variant="filled"
                  />
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography variant="body2" gutterBottom>
                  Estilo de Comunicación:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {intelligenceData?.userProfile?.communicationStyle?.formalityLevel || 'profesional'} • 
                  respuestas {intelligenceData?.userProfile?.communicationStyle?.responseSpeed || 'normales'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading overlay */}
      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0,0,0,0.3)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex={9999}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress />
                <Typography>Actualizando análisis de inteligencia...</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default IntelligenceDashboard;
