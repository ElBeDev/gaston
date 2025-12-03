/**
 * 🔧 Integrations Card Component
 * 
 * Muestra y controla todas las integraciones del sistema
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Button,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  RestartAlt as RestartIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const IntegrationsCard = ({ integrations, onToggleIntegration, onRefresh }) => {
  const [loading, setLoading] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!integrations) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">🔧 Integraciones</Typography>
          <Typography>Cargando integraciones...</Typography>
        </CardContent>
      </Card>
    );
  }

  const handleIntegrationAction = async (integrationKey, action) => {
    setLoading(integrationKey);
    try {
      await onToggleIntegration(`integration.${action}`, { integration: integrationKey });
    } catch (error) {
      console.error(`Error ${action} integration:`, error);
    } finally {
      setLoading(null);
    }
  };

  const getStatusIcon = (status, enabled) => {
    if (!enabled) return <StopIcon color="disabled" />;
    
    switch (status) {
      case 'active':
      case 'configured':
      case 'connected':
        return <CheckCircleIcon color="success" />;
      case 'error':
      case 'disconnected':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="disabled" />;
    }
  };

  const getStatusColor = (status, enabled) => {
    if (!enabled) return 'default';
    
    switch (status) {
      case 'active':
      case 'configured':
      case 'connected':
        return 'success';
      case 'error':
      case 'disconnected':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const openDetails = (integration) => {
    setSelectedIntegration(integration);
    setDetailsOpen(true);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">🔧 Integraciones</Typography>
          <Box>
            <Chip 
              label={`${integrations.activeIntegrations}/${integrations.totalIntegrations} Activas`}
              color="primary"
              variant="outlined"
            />
            <Button size="small" onClick={onRefresh} sx={{ ml: 1 }}>
              Actualizar
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Estado</TableCell>
                <TableCell>Integración</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Servicios</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(integrations.integrations || {}).map(([key, integration]) => (
                <TableRow key={key}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(integration.status, integration.enabled)}
                      <Chip
                        label={integration.status}
                        size="small"
                        color={getStatusColor(integration.status, integration.enabled)}
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {integration.name}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={integration.type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {integration.services?.join(', ') || 'N/A'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box display="flex" gap={0.5}>
                      {integration.enabled ? (
                        <Tooltip title="Desactivar">
                          <IconButton
                            size="small"
                            onClick={() => handleIntegrationAction(key, 'disable')}
                            disabled={loading === key}
                            color="error"
                          >
                            {loading === key ? <CircularProgress size={16} /> : <StopIcon />}
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activar">
                          <IconButton
                            size="small"
                            onClick={() => handleIntegrationAction(key, 'enable')}
                            disabled={loading === key}
                            color="success"
                          >
                            {loading === key ? <CircularProgress size={16} /> : <PlayIcon />}
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Reiniciar">
                        <IconButton
                          size="small"
                          onClick={() => handleIntegrationAction(key, 'restart')}
                          disabled={loading === key}
                          color="warning"
                        >
                          {loading === key ? <CircularProgress size={16} /> : <RestartIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Configurar">
                        <IconButton
                          size="small"
                          onClick={() => openDetails(integration)}
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Detalles">
                        <IconButton
                          size="small"
                          onClick={() => openDetails(integration)}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Resumen por tipo */}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Resumen por tipo:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.values(integrations.integrations || {})
              .reduce((acc, integration) => {
                const type = integration.type;
                if (!acc[type]) acc[type] = { total: 0, active: 0 };
                acc[type].total++;
                if (integration.enabled && integration.status === 'active') {
                  acc[type].active++;
                }
                return acc;
              }, {})
              && Object.entries(
                Object.values(integrations.integrations || {})
                  .reduce((acc, integration) => {
                    const type = integration.type;
                    if (!acc[type]) acc[type] = { total: 0, active: 0 };
                    acc[type].total++;
                    if (integration.enabled && integration.status === 'active') {
                      acc[type].active++;
                    }
                    return acc;
                  }, {})
              ).map(([type, stats]) => (
                <Chip
                  key={type}
                  label={`${type}: ${stats.active}/${stats.total}`}
                  size="small"
                  color={stats.active === stats.total ? 'success' : 'default'}
                  variant="outlined"
                />
              ))}
          </Box>
        </Box>
      </CardContent>

      {/* Dialog de detalles */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          🔧 Detalles de Integración: {selectedIntegration?.name}
        </DialogTitle>
        <DialogContent>
          {selectedIntegration && (
            <Grid container spacing={2}>
              <Grid size={{ sm: 6 }}>
                <Typography variant="subtitle2">Estado:</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedIntegration.status}
                </Typography>
              </Grid>
              
              <Grid size={{ sm: 6 }}>
                <Typography variant="subtitle2">Habilitado:</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedIntegration.enabled ? 'Sí' : 'No'}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Servicios:</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedIntegration.services?.join(', ') || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Configuración:</Typography>
                <Box component="pre" sx={{ 
                  backgroundColor: 'grey.100', 
                  p: 1, 
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(selectedIntegration.configuration, null, 2)}
                </Box>
              </Grid>
              
              {selectedIntegration.errors && selectedIntegration.errors.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="error">Errores:</Typography>
                  {selectedIntegration.errors.map((error, index) => (
                    <Typography key={index} variant="body2" color="error">
                      • {error}
                    </Typography>
                  ))}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default IntegrationsCard;