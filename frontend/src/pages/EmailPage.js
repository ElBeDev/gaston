import React from 'react';
import {
  Container,
  Grid2 as Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import GoogleAuth from '../components/GoogleAuth';
import EmailComposer from '../components/EmailComposer';
import CalendarManager from '../components/CalendarManager';
import { Email, CalendarToday } from '@mui/icons-material';

const EmailPage = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        📧📅 Google Workspace
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Conecta tu cuenta de Google para que Eva pueda enviar correos y crear eventos de calendario en tu nombre.
      </Typography>

      <Grid container spacing={3}>
        {/* Authentication Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Autenticación Google
            </Typography>
            <GoogleAuth />
          </Paper>
        </Grid>

        {/* Main Workspace Section */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab
                  icon={<Email />}
                  label="Gmail"
                  iconPosition="start"
                />
                <Tab
                  icon={<CalendarToday />}
                  label="Calendar"
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Email Tab */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  📧 Enviar Email
                </Typography>
                <EmailComposer />
              </Box>
            )}

            {/* Calendar Tab */}
            {tabValue === 1 && (
              <Box>
                <CalendarManager />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmailPage;