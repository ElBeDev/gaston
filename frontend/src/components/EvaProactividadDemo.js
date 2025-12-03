import React from 'react';
import { Card, CardContent, Typography, Grid2 as Grid, Button, Chip, Box } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AlarmIcon from '@mui/icons-material/Alarm';
import TaskIcon from '@mui/icons-material/Task';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const suggestions = [
  {
    icon: <EventIcon color="primary" />, 
    title: 'Reunión sugerida',
    description: '¿Quieres agendar una reunión con Carlos mañana a las 10:00?',
    actions: ['Aceptar', 'Posponer', 'Ignorar'],
    apiPlaceholder: 'IA pendiente'
  },
  {
    icon: <AlarmIcon color="secondary" />, 
    title: 'Recordatorio inteligente',
    description: 'Tienes una factura próxima a vencer. ¿Te recuerdo el pago el viernes?',
    actions: ['Sí', 'No'],
    apiPlaceholder: 'IA pendiente'
  },
  {
    icon: <TaskIcon color="success" />, 
    title: 'Tarea sugerida',
    description: 'Detecté que mencionaste "enviar reporte". ¿Quieres crear la tarea automáticamente?',
    actions: ['Crear tarea', 'Ignorar'],
    apiPlaceholder: 'IA pendiente'
  },
  {
    icon: <LightbulbIcon color="warning" />, 
    title: 'Sugerencia proactiva',
    description: 'Basado en tu agenda, te sugiero un bloque de foco el jueves de 14:00 a 16:00.',
    actions: ['Agregar', 'Ignorar'],
    apiPlaceholder: 'IA pendiente'
  }
];

export default function EvaProactividadDemo() {
  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Automatización Proactiva (Demo)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Aquí verás sugerencias inteligentes, recordatorios y acciones automáticas que Eva podrá ofrecerte. Pronto podrás conectar la IA y APIs reales.
        </Typography>
        <Grid container spacing={2}>
          {suggestions.map((s, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{s.icon}</div>
                <Typography variant="subtitle1">{s.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{s.description}</Typography>
                <Box sx={{ mb: 1 }}>
                  {s.actions.map((a, i) => (
                    <Chip key={i} label={a} size="small" sx={{ mr: 0.5, mb: 0.5 }} disabled />
                  ))}
                </Box>
                <Button variant="contained" disabled fullWidth>
                  {s.apiPlaceholder}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
