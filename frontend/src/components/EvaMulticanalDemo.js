import React from 'react';
import { Card, CardContent, Typography, Grid2 as Grid, Button } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmsIcon from '@mui/icons-material/Sms';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const channels = [
  { name: 'WhatsApp', icon: <WhatsAppIcon color="success" />, apiPlaceholder: 'API pendiente' },
  { name: 'SMS', icon: <SmsIcon color="primary" />, apiPlaceholder: 'API pendiente' },
  { name: 'Llamadas', icon: <CallIcon color="secondary" />, apiPlaceholder: 'API pendiente' },
  { name: 'Email', icon: <EmailIcon color="error" />, apiPlaceholder: 'API pendiente' },
  { name: 'Facebook', icon: <FacebookIcon sx={{ color: '#1877f3' }} />, apiPlaceholder: 'API pendiente' },
  { name: 'Instagram', icon: <InstagramIcon sx={{ color: '#e1306c' }} />, apiPlaceholder: 'API pendiente' },
  { name: 'X/Twitter', icon: <TwitterIcon sx={{ color: '#1da1f2' }} />, apiPlaceholder: 'API pendiente' },
  { name: 'LinkedIn', icon: <LinkedInIcon sx={{ color: '#0077b5' }} />, apiPlaceholder: 'API pendiente' },
];

export default function EvaMulticanalDemo() {
  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Integración Multicanal (Demo)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Aquí verás todos los canales disponibles para Eva. Pronto podrás conectar cada uno con su API correspondiente.
        </Typography>
        <Grid container spacing={2}>
          {channels.map((ch) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={ch.name}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{ch.icon}</div>
                <Typography variant="subtitle1">{ch.name}</Typography>
                <Button variant="contained" disabled sx={{ mt: 1 }}>
                  {ch.apiPlaceholder}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
