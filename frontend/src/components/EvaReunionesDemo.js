import React from 'react';
import { Card, CardContent, Typography, Grid, Button, Chip, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GroupIcon from '@mui/icons-material/Group';

export default function EvaReunionesDemo() {
  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestión Inteligente de Reuniones (Demo)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Aquí verás cómo Eva podrá transcribir, resumir y automatizar acciones tras tus reuniones. Pronto podrás conectar la IA y APIs reales.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MicIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="subtitle1">Transcripción automática</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                "Hola equipo, hoy revisamos el avance del proyecto X..."<br/>
                <i>(Aquí aparecerá la transcripción en tiempo real)</i>
              </Typography>
              <Button variant="contained" disabled fullWidth>
                API de transcripción pendiente
              </Button>
            </Card>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SummarizeIcon color="secondary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="subtitle1">Resumen de reunión (IA)</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                - Se revisó el avance del proyecto X.<br/>
                - Carlos se encargará del informe.<br/>
                - Próxima reunión: viernes 10:00.<br/>
                <i>(Aquí aparecerá el resumen generado por IA)</i>
              </Typography>
              <Button variant="contained" disabled fullWidth>
                API de resumen pendiente
              </Button>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentTurnedInIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="subtitle1">Acciones de follow-up sugeridas</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Chip label="Crear tarea: Informe de Carlos" size="small" sx={{ mr: 1, mb: 1 }} disabled />
                <Chip label="Agendar próxima reunión" size="small" sx={{ mr: 1, mb: 1 }} disabled />
                <Chip label="Enviar resumen por email" size="small" sx={{ mr: 1, mb: 1 }} disabled />
              </Box>
              <Button variant="contained" disabled fullWidth>
                API de acciones pendiente
              </Button>
            </Card>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GroupIcon color="info" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="subtitle1">Integración con CRM/contactos</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Participantes: Carlos, Ana, Eva<br/>
                <i>(Aquí se mostrarán los contactos y links al CRM)</i>
              </Typography>
              <Button variant="contained" disabled fullWidth>
                API de CRM pendiente
              </Button>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
