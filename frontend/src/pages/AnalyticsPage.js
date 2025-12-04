import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  People,
  Chat,
  Email,
  WhatsApp,
  Schedule,
  Star,
  Warning,
  Assessment,
  Timeline,
  BarChart,
  DonutLarge,
  Refresh,
  Download,
  FilterList,
  DateRange,
  Business,
  Psychology,
  Speed,
  Security
} from '@mui/icons-material';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Mock analytics data - replace with real API calls
  const mockAnalytics = {
    overview: {
      totalInteractions: 1247,
      totalContacts: 156,
      avgResponseTime: '2.3h',
      satisfactionScore: 4.8,
      trendsData: {
        interactions: { value: 1247, change: 12.5, trend: 'up' },
        contacts: { value: 156, change: 8.2, trend: 'up' },
        responseTime: { value: '2.3h', change: -15.3, trend: 'down' },
        satisfaction: { value: 4.8, change: 5.1, trend: 'up' }
      }
    },
    communications: {
      channels: [
        { name: 'Chat', count: 567, percentage: 45.5, color: '#2563eb' },
        { name: 'Email', count: 423, percentage: 33.9, color: '#059669' },
        { name: 'WhatsApp', count: 189, percentage: 15.2, color: '#7c3aed' },
        { name: 'Llamadas', count: 68, percentage: 5.4, color: '#ea580c' }
      ],
      hourlyActivity: [
        { hour: '00', count: 12 }, { hour: '01', count: 8 }, { hour: '02', count: 5 },
        { hour: '03', count: 3 }, { hour: '04', count: 2 }, { hour: '05', count: 4 },
        { hour: '06', count: 15 }, { hour: '07', count: 28 }, { hour: '08', count: 45 },
        { hour: '09', count: 67 }, { hour: '10', count: 89 }, { hour: '11', count: 78 },
        { hour: '12', count: 56 }, { hour: '13', count: 45 }, { hour: '14', count: 72 },
        { hour: '15', count: 84 }, { hour: '16', count: 91 }, { hour: '17', count: 76 },
        { hour: '18', count: 43 }, { hour: '19', count: 32 }, { hour: '20', count: 25 },
        { hour: '21', count: 18 }, { hour: '22', count: 14 }, { hour: '23', count: 9 }
      ]
    },
    performance: {
      aiInsights: [
        { metric: 'Precisión de Respuestas', value: 94.2, target: 95, status: 'warning' },
        { metric: 'Tiempo de Procesamiento', value: 98.7, target: 95, status: 'success' },
        { metric: 'Satisfacción del Usuario', value: 96.1, target: 90, status: 'success' },
        { metric: 'Resolución en Primera Interacción', value: 87.3, target: 85, status: 'success' }
      ],
      topTopics: [
        { topic: 'Soporte Técnico', count: 234, sentiment: 'neutral' },
        { topic: 'Consultas Comerciales', count: 189, sentiment: 'positive' },
        { topic: 'Información de Productos', count: 156, sentiment: 'positive' },
        { topic: 'Problemas de Facturación', count: 98, sentiment: 'negative' },
        { topic: 'Configuración de Cuenta', count: 87, sentiment: 'neutral' }
      ]
    },
    users: {
      activeUsers: 89,
      newUsers: 23,
      returningUsers: 66,
      userSegments: [
        { segment: 'VIP', count: 23, engagement: 95 },
        { segment: 'Standard', count: 98, engagement: 78 },
        { segment: 'New', count: 35, engagement: 65 }
      ]
    }
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const MetricCard = ({ title, value, change, trend, icon, color = '#2563eb' }) => (
    <Card sx={{ height: '100%', boxShadow: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${change > 0 ? '+' : ''}${change}%`}
            color={trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default'}
            icon={trend === 'up' ? <TrendingUp /> : trend === 'down' ? <TrendingDown /> : null}
            sx={{ fontSize: '0.75rem', fontWeight: 500 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const ChannelChart = ({ channels }) => (
    <Card sx={{ height: '100%', boxShadow: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DonutLarge sx={{ color: '#2563eb' }} />
          Canales de Comunicación
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {channels.map((channel) => (
            <Box key={channel.name}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: channel.color
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {channel.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {channel.count}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 40 }}>
                    {channel.percentage}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={channel.percentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: channel.color
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const ActivityChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.count));
    
    return (
      <Card sx={{ height: '100%', boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChart sx={{ color: '#2563eb' }} />
            Actividad por Hora
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'end', gap: 0.5, height: 120, overflow: 'auto' }}>
            {data.map((item) => (
              <Box key={item.hour} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
                <Box
                  sx={{
                    width: 20,
                    height: `${(item.count / maxValue) * 100}px`,
                    bgcolor: '#2563eb',
                    borderRadius: '2px 2px 0 0',
                    mb: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#1d4ed8',
                      transform: 'scaleY(1.1)'
                    }
                  }}
                  title={`${item.hour}:00 - ${item.count} interacciones`}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {item.hour}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
              Panel de Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Insights y métricas de rendimiento de Eva
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={timeRange}
                label="Período"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="24h">Últimas 24h</MenuItem>
                <MenuItem value="7d">Últimos 7 días</MenuItem>
                <MenuItem value="30d">Últimos 30 días</MenuItem>
                <MenuItem value="90d">Últimos 90 días</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              sx={{ bgcolor: '#2563eb' }}
            >
              Exportar
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab 
            label="Resumen" 
            icon={<Analytics />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab 
            label="Comunicaciones" 
            icon={<Chat />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab 
            label="Rendimiento IA" 
            icon={<Psychology />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab 
            label="Usuarios" 
            icon={<People />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      {activeTab === 0 && analytics && (
        <Grid container spacing={3}>
          {/* Overview Metrics */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Total Interacciones"
              value={analytics.overview.totalInteractions.toLocaleString()}
              change={analytics.overview.trendsData.interactions.change}
              trend={analytics.overview.trendsData.interactions.trend}
              icon={<Chat />}
              color="#2563eb"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Contactos Activos"
              value={analytics.overview.totalContacts}
              change={analytics.overview.trendsData.contacts.change}
              trend={analytics.overview.trendsData.contacts.trend}
              icon={<People />}
              color="#059669"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Tiempo de Respuesta"
              value={analytics.overview.avgResponseTime}
              change={analytics.overview.trendsData.responseTime.change}
              trend={analytics.overview.trendsData.responseTime.trend}
              icon={<Speed />}
              color="#7c3aed"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Satisfacción"
              value={`${analytics.overview.satisfactionScore}/5`}
              change={analytics.overview.trendsData.satisfaction.change}
              trend={analytics.overview.trendsData.satisfaction.trend}
              icon={<Star />}
              color="#ea580c"
            />
          </Grid>

          {/* Charts */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ChannelChart channels={analytics.communications.channels} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ActivityChart data={analytics.communications.hourlyActivity} />
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timeline sx={{ color: '#2563eb' }} />
                  Resumen de Actividad
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Alert severity="success" sx={{ mb: 1 }}>
                      ✅ {analytics.overview.totalInteractions} interacciones procesadas
                    </Alert>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Alert severity="info" sx={{ mb: 1 }}>
                      📈 Crecimiento del {analytics.overview.trendsData.interactions.change}% en interacciones
                    </Alert>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      ⚡ Tiempo de respuesta mejorado en {Math.abs(analytics.overview.trendsData.responseTime.change)}%
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && analytics && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ActivityChart data={analytics.communications.hourlyActivity} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ChannelChart channels={analytics.communications.channels} />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Detalles de Comunicaciones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Análisis detallado de canales de comunicación próximamente...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && analytics && (
        <Grid container spacing={3}>
          {analytics.performance.aiInsights.map((insight, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card sx={{ boxShadow: 1 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {insight.metric}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {insight.value}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={insight.value}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: insight.status === 'success' ? '#059669' : '#ea580c'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Objetivo: {insight.target}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid size={{ xs: 12 }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Temas Más Consultados
                </Typography>
                <List>
                  {analytics.performance.topTopics.map((topic, index) => (
                    <ListItem key={index} divider={index < analytics.performance.topTopics.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: topic.sentiment === 'positive' ? '#059669' : topic.sentiment === 'negative' ? '#dc2626' : '#6b7280' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={topic.topic}
                        secondary={`${topic.count} consultas`}
                      />
                      <Chip
                        label={topic.sentiment === 'positive' ? 'Positivo' : topic.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
                        size="small"
                        color={topic.sentiment === 'positive' ? 'success' : topic.sentiment === 'negative' ? 'error' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && analytics && (
        <Grid container spacing={3}>
          <Grid size={{ sm: 4 }}>
            <MetricCard
              title="Usuarios Activos"
              value={analytics.users.activeUsers}
              change={12.5}
              trend="up"
              icon={<People />}
              color="#2563eb"
            />
          </Grid>
          <Grid size={{ sm: 4 }}>
            <MetricCard
              title="Nuevos Usuarios"
              value={analytics.users.newUsers}
              change={8.3}
              trend="up"
              icon={<TrendingUp />}
              color="#059669"
            />
          </Grid>
          <Grid size={{ sm: 4 }}>
            <MetricCard
              title="Usuarios Recurrentes"
              value={analytics.users.returningUsers}
              change={5.7}
              trend="up"
              icon={<Assessment />}
              color="#7c3aed"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Segmentos de Usuarios
                </Typography>
                <Grid container spacing={2}>
                  {analytics.users.userSegments.map((segment) => (
                    <Grid size={{ xs: 12, md: 4 }} key={segment.segment}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {segment.segment}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {segment.count} usuarios
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={segment.engagement}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                          {segment.engagement}% engagement
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AnalyticsPage;
