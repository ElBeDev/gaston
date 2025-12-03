import React, { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  Box,
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tab,
  Tabs
} from '@mui/material';
import {
  People,
  Assignment,
  Chat,
  Notes,
  Refresh,
  Person,
  SmartToyRounded,
  Psychology,
  Dashboard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import IntelligenceDashboard from '../components/IntelligenceDashboard';
import { isAfter, isBefore, startOfWeek, endOfWeek } from 'date-fns';
import EvaMulticanalDemo from '../components/EvaMulticanalDemo';
import EvaProactividadDemo from '../components/EvaProactividadDemo';
import EvaReunionesDemo from '../components/EvaReunionesDemo';
import EvaWorkflowsDemo from '../components/EvaWorkflowsDemo';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    context: null,
    conversations: [],
    stats: {
      totalContacts: 0,
      totalTasks: 0,
      totalNotes: 0,
      totalConversations: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Configure axios
  axios.defaults.baseURL = 'http://localhost:3001';

  // Helper: Aggregate conversations by week (last 8 weeks)
  function getConversationsByWeek(conversations) {
    if (!conversations || conversations.length === 0) return { labels: [], data: [] };
    const weeks = {};
    conversations.forEach(conv => {
      const date = new Date(conv.createdAt || conv.timestamp || conv.date);
      if (isNaN(date)) return;
      // Get year-week string
      const year = date.getFullYear();
      const week = Math.ceil(((date - new Date(year,0,1)) / 86400000 + new Date(year,0,1).getDay()+1)/7);
      const key = `${year}-W${week}`;
      weeks[key] = (weeks[key] || 0) + 1;
    });
    // Sort by week
    const sorted = Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([k]) => k),
      data: sorted.map(([,v]) => v)
    };
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Fetching dashboard data...');
      
      // Fetch all data in parallel
      const [contextRes, conversationsRes] = await Promise.all([
        axios.get('/api/context/gaston').catch(err => {
          console.log('⚠️ No context found, will create on first interaction');
          return { data: null };
        }),
        axios.get('/api/chat/history/gaston').catch(err => {
          console.log('⚠️ No chat history found');
          return { data: [] };
        })
      ]);

      console.log('📊 Context data:', contextRes.data);
      console.log('📊 Conversations data:', conversationsRes.data);

      const context = contextRes.data;
      const conversations = Array.isArray(conversationsRes.data) ? conversationsRes.data : [];

      // Calculate statistics
      const stats = {
        totalContacts: Array.isArray(context?.contacts) ? context.contacts.length : 0,
        totalTasks: Array.isArray(context?.agenda) ? context.agenda.length : 0,
        totalNotes: Array.isArray(context?.notes) ? context.notes.length : 0,
        totalConversations: conversations.length
      };

      setDashboardData({
        context,
        conversations,
        stats
      });

      console.log('✅ Dashboard data loaded:', { context, conversations, stats });
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Analytics calculations
  const analytics = React.useMemo(() => {
    // Ensure conversations is always an array
    const conversations = Array.isArray(dashboardData.conversations) ? dashboardData.conversations : [];
    
    if (!dashboardData.context && conversations.length === 0) {
      return {
        totalContacts: 0,
        totalTasks: 0,
        totalNotes: 0,
        totalConversations: 0,
        recentContacts: [],
        recentTasks: [],
        recentConversations: []
      };
    }

    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const context = dashboardData.context;

    // Get recent data - ensure arrays exist
    const recentContacts = Array.isArray(context?.contacts) ? context.contacts.slice(-5) : [];
    const recentTasks = Array.isArray(context?.agenda) ? context.agenda.slice(-5) : [];
    const recentConversations = conversations.slice(-5);

    // Calculate this week's activity
    const thisWeekConversations = conversations.filter(conv => 
      conv.timestamp && isAfter(new Date(conv.timestamp), weekStart) && 
      isBefore(new Date(conv.timestamp), weekEnd)
    ).length;

    const completedTasks = Array.isArray(context?.agenda) ? context.agenda.filter(task => task.completed).length : 0;
    const totalTasks = Array.isArray(context?.agenda) ? context.agenda.length : 0;
    const overdueTasks = Array.isArray(context?.agenda) ? context.agenda.filter(task => 
      !task.completed && task.date && isBefore(new Date(task.date), now)
    ).length : 0;

    return {
      totalContacts: dashboardData.stats.totalContacts,
      totalTasks: dashboardData.stats.totalTasks,
      totalNotes: dashboardData.stats.totalNotes,
      totalConversations: dashboardData.stats.totalConversations,
      thisWeekConversations,
      completedTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      recentContacts,
      recentTasks,
      recentConversations
    };
  }, [dashboardData]);

  const quickActions = [
    {
      label: 'Chatear con Eva',
      icon: <Chat />,
      action: () => navigate('/chat'),
      color: 'info',
      description: 'Inicia o continúa tu conversación'
    },
    {
      label: 'Ver CRM',
      icon: <People />,
      action: () => navigate('/crm'),
      color: 'primary',
      description: 'Gestiona contactos y tareas'
    },
    {
      label: 'Actualizar datos',
      icon: <Refresh />,
      action: fetchDashboardData,
      color: 'secondary',
      description: 'Actualiza la información del panel'
    }
  ];

  const statsCards = [
    {
      title: 'Contactos',
      value: analytics.totalContacts,
      change: analytics.totalContacts > 0 ? `${analytics.totalContacts} en total` : 'Aún no hay contactos',
      icon: <People />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      action: () => navigate('/crm')
    },
    {
      title: 'Tareas',
      value: analytics.totalTasks,
      change: analytics.totalTasks > 0 
        ? `${analytics.completionRate}% completadas` 
        : 'Aún no hay tareas',
      icon: <Assignment />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      action: () => navigate('/crm')
    },
    {
      title: 'Conversaciones con Eva',
      value: analytics.totalConversations,
      change: analytics.thisWeekConversations > 0 
        ? `+${analytics.thisWeekConversations} esta semana` 
        : '¡Comienza a chatear!',
      icon: <Chat />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      action: () => navigate('/chat')
    },
    {
      title: 'Notas',
      value: analytics.totalNotes,
      change: analytics.totalNotes > 0 ? `${analytics.totalNotes} guardadas` : 'Aún no hay notas',
      icon: <Notes />, 
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      action: () => navigate('/notes')
    }
  ];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Cargando el panel de Eva...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Panel de Eva
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tu asistente personal de IA: información y datos
        </Typography>
      </Box>
      
      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab 
            icon={<Dashboard />} 
            label="Dashboard Estándar" 
            iconPosition="start"
          />
          <Tab 
            icon={<Psychology />} 
            label="Eva Intelligence" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        // Standard Dashboard Content
        <StandardDashboardContent 
          dashboardData={dashboardData}
          navigate={navigate}
          formatTimestamp={formatTimestamp}
        />
      )}
      
      {currentTab === 1 && (
        // Eva Intelligence Dashboard
        <IntelligenceDashboard />
      )}
    </Box>
  );
};

// Standard Dashboard Component
const StandardDashboardContent = ({ dashboardData, navigate, formatTimestamp }) => {
  const analytics = useMemo(() => {
    if (!dashboardData.context || !dashboardData.context.entities) {
      return {
        recentContacts: [],
        recentTasks: [],
        overdueTasks: 0
      };
    }

    const entities = dashboardData.context.entities;
    
    // Recent contacts
    const recentContacts = entities.filter(e => e.type === 'contact').slice(0, 5);
    
    // Recent tasks
    const recentTasks = entities.filter(e => e.type === 'task').slice(0, 5);
    
    // Overdue tasks (if we had due dates)
    const overdueTasks = 0; // Placeholder
    
    return {
      recentContacts,
      recentTasks,
      overdueTasks
    };
  }, [dashboardData.context]);

  return (
    <>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Conversations Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {dashboardData.stats.totalConversations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conversaciones
                  </Typography>
                </Box>
                <Chat color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contacts Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {dashboardData.stats.totalContacts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contactos
                  </Typography>
                </Box>
                <Person color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tasks Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {dashboardData.stats.totalTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tareas
                  </Typography>
                </Box>
                <Assignment color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notes Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="info.main">
                    {dashboardData.stats.totalNotes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Notas
                  </Typography>
                </Box>
                <Notes color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Conversations Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Actividad de conversaciones
              </Typography>
              {dashboardData.conversations && dashboardData.conversations.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <AnalyticsWidgets 
                    conversations={dashboardData.conversations}
                    stats={dashboardData.stats}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aún no hay datos suficientes para mostrar gráficos
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Conversations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Conversaciones recientes
              </Typography>
              {dashboardData.conversations && dashboardData.conversations.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {dashboardData.conversations.slice(0, 5).map((conversation, index) => (
                    <React.Fragment key={conversation._id || index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <Chat />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={conversation.title || 'Conversación sin título'}
                          secondary={formatTimestamp(conversation.createdAt || conversation.timestamp)}
                        />
                      </ListItem>
                      {index < Math.min(4, dashboardData.conversations.length - 1) && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aún no hay conversaciones. ¡Comienza a chatear con Eva!
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<Chat />}
                    onClick={() => navigate('/chat')}
                    sx={{ mt: 2 }}
                  >
                    Iniciar conversación
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Contacts/Tasks */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resumen de tus datos
              </Typography>
              {dashboardData.context ? (
                <Box>
                  {/* Recent Contacts */}
                  {analytics.recentContacts.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Contactos recientes:
                      </Typography>
                      {analytics.recentContacts.slice(0, 3).map((contact, index) => (
                        <Chip 
                          key={index}
                          label={contact.name || 'Unknown Contact'}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Recent Tasks */}
                  {analytics.recentTasks.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tareas recientes:
                      </Typography>
                      {analytics.recentTasks.slice(0, 3).map((task, index) => (
                        <Chip 
                          key={index}
                          label={task.title || 'Untitled Task'}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}

                  {analytics.overdueTasks > 0 && (
                    <Alert severity="warning" size="small">
                      {analytics.overdueTasks} tarea{analytics.overdueTasks > 1 ? 's' : ''} vencida{analytics.overdueTasks > 1 ? 's' : ''}
                    </Alert>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aún no hay datos personales. ¡Chatea con Eva para construir tu perfil!
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<Chat />}
                    onClick={() => navigate('/chat')}
                    sx={{ mt: 2 }}
                  >
                    Comenzar a construir perfil
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Eva Demo Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Demos de Eva
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ sm: 6 }}>
                  <EvaProactividadDemo />
                </Grid>
                <Grid size={{ sm: 6 }}>
                  <EvaMulticanalDemo />
                </Grid>
                <Grid size={{ sm: 6 }}>
                  <EvaReunionesDemo />
                </Grid>
                <Grid size={{ sm: 6 }}>
                  <EvaWorkflowsDemo />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};
      </Box>

      export default DashboardPage;

      {/* No Data Welcome */}
      {!loading && !error && analytics.totalConversations === 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/chat')}>
              Comenzar chat
            </Button>
          }
        >
          ¡Bienvenido a Eva! Inicia una conversación para ver tu panel personalizado.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, alignItems: 'stretch' }}>
        {statsCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                background: card.gradient,
                color: 'white',
                cursor: 'pointer',
                outline: 'none',
                '&:hover, &:focus': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.3s ease',
                  boxShadow: 6
                },
                '&:focus': {
                  border: '2px solid #fff',
                }
              }}
              onClick={card.action}
              tabIndex={0}
              role="button"
              aria-label={`Ir a ${card.title}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  card.action();
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {card.change}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 56,
                      height: 56,
                      color: '#fff',
                      border: '2px solid #fff',
                    }}
                  >
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Analytics Widgets */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ sm: 12, md: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Conversaciones por semana
              </Typography>
              <Box
                sx={{ height: { xs: 220, sm: 260 }, width: '100%' }}
                role="region"
                aria-label="Gráfico de conversaciones por semana"
              >
                <span style={{ position: 'absolute', left: '-9999px' }} id="linechart-desc">
                  Este gráfico muestra la cantidad de conversaciones por semana en las últimas semanas.
                </span>
                <LineChart
                  xAxis={[{ data: getConversationsByWeek(dashboardData.conversations).labels, label: 'Semana' }]}
                  series={[{ data: getConversationsByWeek(dashboardData.conversations).data, label: 'Conversaciones' }]}
                  height={220}
                  aria-describedby="linechart-desc"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Estado de tareas
              </Typography>
              <Box
                sx={{ height: { xs: 180, sm: 220 }, width: '100%' }}
                role="region"
                aria-label="Gráfico de estado de tareas"
              >
                <span style={{ position: 'absolute', left: '-9999px' }} id="piechart-tasks-desc">
                  Este gráfico de pastel muestra la proporción de tareas completadas, vencidas y pendientes.
                </span>
                <PieChart
                  series={[{
                    data: [
                      { id: 0, value: analytics.completedTasks, label: 'Completadas', color: '#4caf50' },
                      { id: 1, value: analytics.overdueTasks, label: 'Vencidas', color: '#f44336' },
                      { id: 2, value: Math.max(analytics.totalTasks - analytics.completedTasks - analytics.overdueTasks, 0), label: 'Pendientes', color: '#ff9800' }
                    ]
                  }]}
                  height={180}
                  legend={{ hidden: false }}
                  aria-describedby="piechart-tasks-desc"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Segmentos de contactos
              </Typography>
              <Box
                sx={{ height: { xs: 180, sm: 220 }, width: '100%' }}
                role="region"
                aria-label="Gráfico de segmentos de contactos"
              >
                <span style={{ position: 'absolute', left: '-9999px' }} id="piechart-segments-desc">
                  Este gráfico de pastel muestra la distribución de contactos por segmento: VIP, Standard y Other.
                </span>
                <PieChart
                  series={[{
                    data: (() => {
                      const contacts = dashboardData.context?.contacts || [];
                      const segments = { VIP: 0, Standard: 0, Other: 0 };
                      contacts.forEach(c => {
                        const seg = c.businessData?.segment || 'Other';
                        segments[seg] = (segments[seg] || 0) + 1;
                      });
                      return [
                        { id: 0, value: segments.VIP, label: 'VIP', color: '#ffd700' },
                        { id: 1, value: segments.Standard, label: 'Standard', color: '#2196f3' },
                        { id: 2, value: segments.Other, label: 'Other', color: '#9e9e9e' }
                      ];
                    })()
                  }]}
                  height={180}
                  legend={{ hidden: false }}
                  aria-describedby="piechart-segments-desc"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Multicanal Demo - Espacio reservado para APIs */}
      <EvaMulticanalDemo />

      {/* Proactividad Demo - Espacio reservado para IA y automatización */}
      <EvaProactividadDemo />

      {/* Reuniones Demo - Espacio reservado para transcripción, resumen y follow-up */}
      <EvaReunionesDemo />

      {/* Workflows Demo - Espacio reservado para automatización tipo Zapier/IFTTT */}
      <EvaWorkflowsDemo />

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Acciones rápidas
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid size={{ sm: 6, md: 4 }}key={index}>
                    <Button
                      variant="outlined"
                      color={action.color}
                      startIcon={action.icon}
                      onClick={action.action}
                      fullWidth
                      sx={{ 
                        py: 2, 
                        flexDirection: 'column',
                        height: '80px',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          transition: 'transform 0.2s ease'
                        }
                      }}
                    >
                      <Typography variant="button" sx={{ mb: 0.5 }}>
                        {action.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Conversations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Conversaciones recientes con Eva
              </Typography>
              {analytics.recentConversations.length > 0 ? (
                <List>
                  {analytics.recentConversations.map((conversation, index) => (
                    <React.Fragment key={conversation._id || index}>
                      <ListItemButton onClick={() => navigate('/chat')}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: conversation.role === 'user' ? 'primary.main' : 'secondary.main' 
                          }}>
                            {conversation.role === 'user' ? <Person /> : <SmartToyRounded />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {conversation.role === 'user' ? 'You: ' : 'Eva: '}
                              {conversation.message}
                            </Typography>
                          }
                          secondary={formatTime(conversation.timestamp)}
                        />
                      </ListItemButton>
                      {index < analytics.recentConversations.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aún no hay conversaciones. ¡Comienza a chatear con Eva!
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<Chat />}
                    onClick={() => navigate('/chat')}
                    sx={{ mt: 2 }}
                  >
                    Iniciar conversación
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Contacts/Tasks */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resumen de tus datos
              </Typography>
              {dashboardData.context ? (
                <Box>
                  {/* Recent Contacts */}
                  {analytics.recentContacts.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Contactos recientes:
                      </Typography>
                      {analytics.recentContacts.slice(0, 3).map((contact, index) => (
                        <Chip 
                          key={index}
                          label={contact.name || 'Unknown Contact'}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Recent Tasks */}
                  {analytics.recentTasks.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tareas recientes:
                      </Typography>
                      {analytics.recentTasks.slice(0, 3).map((task, index) => (
                        <Chip 
                          key={index}
                          label={task.title || 'Untitled Task'}
                          size="small"
                          color={task.completed ? 'success' : 'default'}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}

                  {analytics.overdueTasks > 0 && (
                    <Alert severity="warning" size="small">
                      {analytics.overdueTasks} tarea{analytics.overdueTasks > 1 ? 's' : ''} vencida{analytics.overdueTasks > 1 ? 's' : ''}
                    </Alert>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aún no hay datos personales. ¡Chatea con Eva para construir tu perfil!
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<Chat />}
                    onClick={() => navigate('/chat')}
                    sx={{ mt: 2 }}
                  >
                    Comenzar a construir perfil
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;