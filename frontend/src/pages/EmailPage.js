import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Paper
} from '@mui/material';
import GoogleAuth from '../components/GoogleAuth';
import EmailComposer from '../components/EmailComposer';

const EmailPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Configuración de Email
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Conecta tu cuenta de Google para que Eva pueda enviar correos en tu nombre.
      </Typography>

      <Grid container spacing={3}>
        {/* Authentication Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Autenticación
            </Typography>
            <GoogleAuth />
          </Paper>
        </Grid>

        {/* Email Composer Section */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enviar Email
            </Typography>
            <EmailComposer />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmailPage;