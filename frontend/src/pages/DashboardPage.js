import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Avatar,
  IconButton,
  Chip,
  Paper,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Chat,
  Person,
  Assignment,
  Notes,
  Email,
  WhatsApp,
  Analytics,
  SmartToy,
  Speed,
  Security,
  Cloud,
  ArrowForward,
  Refresh
} from '@mui/icons-material';
const DashboardPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalContacts: 0,
    totalTasks: 0,
    totalNotes: 0,
    totalEmails: 0,
    whatsappConnected: false
  });

  // Simular carga de datos (reemplazar con API real)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        totalConversations: 24,
        totalContacts: 156,
        totalTasks: 8,
        totalNotes: 42,
        totalEmails: 3,
        whatsappConnected: false
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Cargando tu dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 4, 
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              mr: 3,
              backgroundColor: '#2563eb', // Azul profesional sólido
              fontSize: '1.5rem',
              color: 'white'
            }}
          >
            <SmartToy />
          </Avatar>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: '#1e293b', // Gris oscuro profesional
                mb: 0.5
              }}
            >
              ¡Hola! Soy Eva
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Tu asistente personal de IA - Dashboard de control
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <IconButton 
              onClick={() => window.location.reload()}
              sx={{ 
                background: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <Refresh />
            </IconButton>
          </Box>
        </Box>
        
        {/* Status Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            icon={<Speed />} 
            label="IA Activa" 
            color="success" 
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
          <Chip 
            icon={<Security />} 
            label="Conectado Seguro" 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            icon={<Cloud />} 
            label="Sincronizado" 
            color="info" 
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Conversaciones"
            value={stats.totalConversations}
            icon={<Chat />}
            color="primary"
            onClick={() => navigate('/chat')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Contactos"
            value={stats.totalContacts}
            icon={<Person />}
            color="success"
            onClick={() => navigate('/crm')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Tareas"
            value={stats.totalTasks}
            icon={<Assignment />}
            color="warning"
            onClick={() => navigate('/tasks')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Notas"
            value={stats.totalNotes}
            icon={<Notes />}
            color="info"
            onClick={() => navigate('/notes')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="Emails"
            value={stats.totalEmails}
            icon={<Email />}
            color="secondary"
            onClick={() => navigate('/email')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatsCard
            title="WhatsApp"
            value={stats.whatsappConnected ? "Conectado" : "Desconectado"}
            icon={<WhatsApp />}
            color={stats.whatsappConnected ? "success" : "error"}
            onClick={() => navigate('/whatsapp')}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <QuickActionsCard navigate={navigate} />
        </Grid>

        {/* Eva Capabilities */}
        <Grid item xs={12} md={6}>
          <EvaCapabilitiesCard />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <RecentActivityCard />
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <SystemStatusCard />
        </Grid>
      </Grid>
    </Box>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color, onClick, solidColor }) => {
  // Colores profesionales sólidos
  const colorMap = {
    primary: '#2563eb',
    success: '#059669', 
    warning: '#dc2626',
    info: '#7c3aed',
    secondary: '#be185d',
    error: '#dc2626'
  };
  
  const cardColor = solidColor || colorMap[color] || colorMap.primary;
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          boxShadow: onClick ? `0 8px 25px ${alpha(cardColor, 0.2)}` : 'none'
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                color: cardColor
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500,
                color: 'text.secondary'
              }}
            >
              {title}
            </Typography>
          </Box>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56,
              backgroundColor: alpha(cardColor, 0.1),
              color: cardColor
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {onClick && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                mr: 1 
              }}
            >
              Ver más
            </Typography>
            <ArrowForward sx={{ fontSize: 16, color: cardColor }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Quick Actions Card
const QuickActionsCard = ({ navigate }) => {
  const actions = [
    {
      title: 'Nueva Conversación',
      description: 'Chatea con Eva ahora',
      icon: <Chat />,
      action: () => navigate('/chat'),
      color: '#2563eb'
    },
    {
      title: 'Gestionar Contactos',
      description: 'Ver y editar contactos',
      icon: <Person />,
      action: () => navigate('/crm'),
      color: '#059669'
    },
    {
      title: 'Enviar Email',
      description: 'Componer nuevo email',
      icon: <Email />,
      action: () => navigate('/email'),
      color: '#be185d'
    },
    {
      title: 'Conectar WhatsApp',
      description: 'Activar WhatsApp Web',
      icon: <WhatsApp />,
      action: () => navigate('/whatsapp'),
      color: '#7c3aed'
    }
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
          🚀 Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: alpha(action.color, 0.03),
                  border: `1px solid ${alpha(action.color, 0.15)}`,
                  '&:hover': {
                    backgroundColor: alpha(action.color, 0.08),
                    transform: 'translateY(-2px)',
                    borderColor: alpha(action.color, 0.3),
                    boxShadow: `0 4px 20px ${alpha(action.color, 0.15)}`
                  }
                }}
                onClick={action.action}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 2,
                      backgroundColor: action.color,
                      color: 'white'
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Eva Capabilities Card
const EvaCapabilitiesCard = () => {
  const capabilities = [
    { title: 'Conversación Natural', progress: 95, color: '#2563eb' },
    { title: 'Gestión de Contactos', progress: 90, color: '#059669' },
    { title: 'Análisis de Datos', progress: 85, color: '#7c3aed' },
    { title: 'Automatización', progress: 80, color: '#dc2626' }
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
          🧠 Capacidades de Eva
        </Typography>
        {capabilities.map((capability, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {capability.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {capability.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={capability.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(capability.color, 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: capability.color
                }
              }}
            />
          </Box>
        ))}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          backgroundColor: alpha('#7c3aed', 0.08),
          border: `1px solid ${alpha('#7c3aed', 0.15)}`,
          borderRadius: 2 
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            "Eva aprende continuamente de tus interacciones para brindarte una mejor experiencia"
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Recent Activity Card
const RecentActivityCard = () => {
  const activities = [
    {
      type: 'chat',
      message: 'Nueva conversación iniciada',
      time: 'Hace 5 minutos',
      icon: <Chat />,
      color: '#2563eb'
    },
    {
      type: 'contact',
      message: 'Contacto agregado: Juan Pérez',
      time: 'Hace 1 hora',
      icon: <Person />,
      color: '#059669'
    },
    {
      type: 'email',
      message: 'Email enviado exitosamente',
      time: 'Hace 2 horas',
      icon: <Email />,
      color: '#be185d'
    },
    {
      type: 'task',
      message: 'Tarea completada: Llamar cliente',
      time: 'Hace 3 horas',
      icon: <Assignment />,
      color: '#dc2626'
    }
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            📈 Actividad Reciente
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Analytics />}
            onClick={() => {/* navigate to analytics */}}
            sx={{
              borderColor: alpha('#2563eb', 0.3),
              color: '#2563eb',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: alpha('#2563eb', 0.05)
              }
            }}
          >
            Ver Todo
          </Button>
        </Box>
        {activities.map((activity, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  mr: 2,
                  backgroundColor: alpha(activity.color, 0.1),
                  color: activity.color
                }}
              >
                {activity.icon}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                  {activity.message}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            </Box>
            {index < activities.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

// System Status Card
const SystemStatusCard = () => {
  const statusItems = [
    { label: 'IA Engine', status: 'online', color: '#059669' },
    { label: 'Base de Datos', status: 'online', color: '#059669' },
    { label: 'WhatsApp', status: 'offline', color: '#dc2626' },
    { label: 'Email Service', status: 'online', color: '#059669' }
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
          ⚡ Estado del Sistema
        </Typography>
        {statusItems.map((item, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                {item.label}
              </Typography>
              <Chip 
                label={item.status === 'online' ? 'En línea' : 'Desconectado'}
                size="small"
                sx={{
                  backgroundColor: alpha(item.color, 0.1),
                  color: item.color,
                  border: `1px solid ${alpha(item.color, 0.3)}`,
                  fontWeight: 500
                }}
              />
            </Box>
            {index < statusItems.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
        
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          backgroundColor: alpha('#059669', 0.08),
          border: `1px solid ${alpha('#059669', 0.15)}`,
          borderRadius: 2 
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
            🟢 Todos los sistemas principales operativos
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;
