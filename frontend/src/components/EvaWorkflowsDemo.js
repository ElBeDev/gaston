import React from 'react';
import { Card, CardContent, Typography, Grid2 as Grid, Button, Chip, Box } from '@mui/material';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import EventIcon from '@mui/icons-material/Event';
import TaskIcon from '@mui/icons-material/Task';
import ZapIcon from '@mui/icons-material/FlashOn';

const workflows = [
  {
    icon: <ZapIcon color="warning" />, 
    title: 'Email → Tarea',
    description: 'Cuando recibo un email con "importante", crea una tarea automáticamente.',
    actions: ['Ver flujo', 'Editar', 'Desactivar'],
    apiPlaceholder: 'Zapier/API pendiente'
  },
  {
    icon: <EventIcon color="primary" />, 
    title: 'Reunión → WhatsApp',
    description: 'Si se agenda una nueva reunión, envía recordatorio por WhatsApp.',
    actions: ['Ver flujo', 'Editar', 'Desactivar'],
    apiPlaceholder: 'Zapier/API pendiente'
  },
  {
    icon: <TaskIcon color="success" />, 
    title: 'Tarea → Notificación',
    description: 'Cuando una tarea vence hoy, envía notificación push y email.',
    actions: ['Ver flujo', 'Editar', 'Desactivar'],
    apiPlaceholder: 'Zapier/API pendiente'
  },
  {
    icon: <SyncAltIcon color="info" />, 
    title: 'Custom Trigger',
    description: 'Si recibo un mensaje de WhatsApp con "urgente", llama a mi número principal.',
    actions: ['Ver flujo', 'Editar', 'Desactivar'],
    apiPlaceholder: 'API custom pendiente'
  }
];

export default function EvaWorkflowsDemo() {
  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Automatización de Workflows (Demo)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Aquí verás ejemplos de flujos automáticos tipo Zapier/IFTTT. Pronto podrás conectar APIs reales y crear tus propios workflows.
        </Typography>
        <Grid container spacing={2}>
          {workflows.map((w, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{w.icon}</div>
                <Typography variant="subtitle1">{w.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{w.description}</Typography>
                <Box sx={{ mb: 1 }}>
                  {w.actions.map((a, i) => (
                    <Chip key={i} label={a} size="small" sx={{ mr: 0.5, mb: 0.5 }} disabled />
                  ))}
                </Box>
                <Button variant="contained" disabled fullWidth>
                  {w.apiPlaceholder}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
