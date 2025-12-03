/**
 * 🎯 Command Center Component
 * 
 * Centro de comandos para ejecutar acciones en el sistema
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Button,
  TextField,
  Box,
  Alert,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Terminal as TerminalIcon
} from '@mui/icons-material';

const CommandCenter = ({ onExecuteCommand, systemStatus }) => {
  const [customCommand, setCustomCommand] = useState('');
  const [customParams, setCustomParams] = useState('{}');
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predefinedCommands = [
    {
      category: 'Sistema',
      commands: [
        { name: 'Reiniciar Sistema', command: 'system.restart', params: {}, description: 'Reinicia el sistema de forma controlada' },
        { name: 'Optimizar Sistema', command: 'system.optimize', params: {}, description: 'Optimiza rendimiento del sistema' },
        { name: 'Estado de Salud', command: 'system.health', params: {}, description: 'Obtiene estado completo de salud' }
      ]
    },
    {
      category: 'Base de Datos',
      commands: [
        { name: 'Crear Backup', command: 'database.backup', params: {}, description: 'Crea respaldo de la base de datos' },
        { name: 'Optimizar BD', command: 'database.optimize', params: {}, description: 'Optimiza rendimiento de la base de datos' }
      ]
    },
    {
      category: 'Monitoreo',
      commands: [
        { name: 'Iniciar Monitoreo', command: 'monitoring.start', params: {}, description: 'Inicia monitoreo en tiempo real' },
        { name: 'Detener Monitoreo', command: 'monitoring.stop', params: {}, description: 'Detiene monitoreo en tiempo real' }
      ]
    },
    {
      category: 'Integraciones',
      commands: [
        { name: 'Activar Google', command: 'integration.enable', params: { integration: 'google-workspace' }, description: 'Activa Google Workspace' },
        { name: 'Activar OpenAI', command: 'integration.enable', params: { integration: 'openai' }, description: 'Activa OpenAI' },
        { name: 'Activar WhatsApp', command: 'integration.enable', params: { integration: 'whatsapp-web' }, description: 'Activa WhatsApp Web' },
        { name: 'Reiniciar Todas', command: 'integration.restart', params: { integration: 'all' }, description: 'Reinicia todas las integraciones' }
      ]
    }
  ];

  const executeCustomCommand = async () => {
    if (!customCommand.trim()) return;

    setLoading(true);
    try {
      let params = {};
      if (customParams.trim()) {
        params = JSON.parse(customParams);
      }

      const result = await onExecuteCommand(customCommand, params);
      setLastResult(result);
    } catch (error) {
      setLastResult({
        success: false,
        error: error.message,
        command: customCommand
      });
    } finally {
      setLoading(false);
    }
  };

  const executePredefinedCommand = async (command, params) => {
    setLoading(true);
    try {
      const result = await onExecuteCommand(command, params);
      setLastResult(result);
    } catch (error) {
      setLastResult({
        success: false,
        error: error.message,
        command
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Comandos Predefinidos */}
      <Grid size={{ md: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Comandos Predefinidos
            </Typography>

            {predefinedCommands.map((category, categoryIndex) => (
              <Accordion key={categoryIndex} defaultExpanded={categoryIndex === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {category.category}
                  </Typography>
                  <Chip
                    label={category.commands.length}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    {category.commands.map((cmd, cmdIndex) => (
                      <Grid size={{ sm: 6, md: 4 }}key={cmdIndex}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                          onClick={() => executePredefinedCommand(cmd.command, cmd.params)}
                        >
                          <PlayIcon color="primary" />
                          <Typography variant="body2" fontWeight="bold">
                            {cmd.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cmd.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Comando Personalizado */}
      <Grid size={{ md: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TerminalIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Comando Personalizado
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Comando"
              placeholder="system.health"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Parámetros (JSON)"
              placeholder='{"key": "value"}'
              value={customParams}
              onChange={(e) => setCustomParams(e.target.value)}
              multiline
              rows={3}
              size="small"
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={executeCustomCommand}
              disabled={loading || !customCommand.trim()}
              startIcon={<PlayIcon />}
            >
              Ejecutar
            </Button>

            {/* Comandos disponibles */}
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Comandos disponibles:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {[
                  'system.restart',
                  'system.optimize',
                  'system.health',
                  'database.backup',
                  'database.optimize',
                  'monitoring.start',
                  'monitoring.stop',
                  'integration.enable',
                  'integration.disable',
                  'integration.restart'
                ].map((cmd) => (
                  <Chip
                    key={cmd}
                    label={cmd}
                    size="small"
                    variant="outlined"
                    onClick={() => setCustomCommand(cmd)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Resultado */}
      {lastResult && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Resultado del Comando
              </Typography>

              <Alert
                severity={lastResult.success ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  {lastResult.success ? '✅ Comando ejecutado exitosamente' : '❌ Error en la ejecución'}
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid size={{ sm: 6 }}>
                  <Typography variant="subtitle2">Comando:</Typography>
                  <Chip label={lastResult.command} variant="outlined" />
                </Grid>

                <Grid size={{ sm: 6 }}>
                  <Typography variant="subtitle2">Timestamp:</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(lastResult.timestamp).toLocaleString()}
                  </Typography>
                </Grid>

                {lastResult.params && Object.keys(lastResult.params).length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2">Parámetros:</Typography>
                    <Box component="pre" sx={{
                      backgroundColor: 'grey.100',
                      p: 1,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(lastResult.params, null, 2)}
                    </Box>
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2">
                    {lastResult.success ? 'Resultado:' : 'Error:'}
                  </Typography>
                  <Box component="pre" sx={{
                    backgroundColor: lastResult.success ? 'success.light' : 'error.light',
                    color: lastResult.success ? 'success.contrastText' : 'error.contrastText',
                    p: 2,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}>
                    {lastResult.success
                      ? JSON.stringify(lastResult.result, null, 2)
                      : lastResult.error
                    }
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default CommandCenter;