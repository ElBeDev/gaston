import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Grid2 as Grid, 
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Add,
  Person,
  Business,
  Analytics,
  TrendingUp,
  Phone,
  Email,
  Schedule,
  Warning,
  Star,
  Search
} from '@mui/icons-material';
import ContactProfile from '../components/ContactProfile';
import RelationshipGraph from '../components/RelationshipGraph';
import ContactSearch from '../components/ContactSearch';
import AnalyticsWidgets from '../components/AnalyticsWidgets';

const ContactDashboard = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Mock stats data - replace with real API call
  const stats = {
    totalContacts: 156,
    vipContacts: 23,
    newThisWeek: 8,
    pendingFollowup: 12,
    highEngagement: 45,
    atRisk: 7
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f9fafb' }}>
      {/* Header with Stats */}
      <Paper sx={{ p: 3, borderRadius: 0, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
              CRM Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tus contactos e interacciones de manera inteligente
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ 
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' }
            }}
          >
            Nuevo Contacto
          </Button>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3}>
          <Grid size={{ sm: 6, md: 2 }}>
            <Card sx={{ bgcolor: '#fff', boxShadow: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2563eb' }}>
                  {stats.totalContacts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Contactos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ sm: 6, md: 2 }}>
            <Card sx={{ bgcolor: '#fff', boxShadow: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#059669' }}>
                  {stats.vipContacts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  VIP
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ sm: 6, md: 2 }}>
            <Card sx={{ bgcolor: '#fff', boxShadow: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7c3aed' }}>
                  {stats.newThisWeek}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nuevos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ sm: 6, md: 2 }}>
            <Card sx={{ bgcolor: '#fff', boxShadow: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                  {stats.pendingFollowup}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Follow-up
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ sm: 6, md: 2 }}>
            <Card sx={{ bgcolor: '#fff', boxShadow: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#be185d' }}>
                  {stats.highEngagement}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alto Engagement
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ sm: 6, md: 2 }}>
            <Card sx={{ bgcolor: '#fff', boxShadow: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ea580c' }}>
                  {stats.atRisk}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En Riesgo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Navigation Tabs */}
        <Box sx={{ mt: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab 
              label="Vista General" 
              icon={<Person />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              label="Analytics" 
              icon={<Analytics />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              label="Seguimientos" 
              icon={<Schedule />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              label="En Riesgo" 
              icon={<Warning />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          </Tabs>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Contact Search */}
        <Paper sx={{ width: 350, display: 'flex', flexDirection: 'column', borderRadius: 0, boxShadow: 1 }}>
          <ContactSearch
            onSelectContact={setSelectedContact}
            selectedContactId={selectedContact ? selectedContact.id : null}
          />
        </Paper>

        {/* Center - Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTab === 0 && (
            <Box sx={{ flex: 1, display: 'flex' }}>
              {/* Contact Profile */}
              <Box sx={{ flex: 2, p: 3, overflow: 'auto' }}>
                <ContactProfile contact={selectedContact} />
              </Box>
              
              {/* Right Sidebar - Relationship Graph */}
              <Box sx={{ width: 300, p: 3, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
                <RelationshipGraph contact={selectedContact} />
              </Box>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Analytics del CRM
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Engagement por Segmento
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">VIP</Typography>
                          <Typography variant="body2">85%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Standard</Typography>
                          <Typography variant="body2">65%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={65} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Other</Typography>
                          <Typography variant="body2">45%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Actividad Reciente
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                        23 nuevos contactos esta semana
                      </Alert>
                      <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
                        12 contactos requieren seguimiento
                      </Alert>
                      <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                        5 reuniones programadas para hoy
                      </Alert>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Seguimientos Pendientes
              </Typography>
              <Card sx={{ p: 3 }}>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Funcionalidad de seguimientos en desarrollo...
                </Typography>
              </Card>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Contactos en Riesgo
              </Typography>
              <Card sx={{ p: 3 }}>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Análisis de riesgo en desarrollo...
                </Typography>
              </Card>
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom Analytics Bar */}
      <Paper sx={{ borderRadius: 0, boxShadow: 1 }}>
        <AnalyticsWidgets />
      </Paper>
    </Box>
  );
};

export default ContactDashboard;
