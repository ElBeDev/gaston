import React from 'react';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Avatar,
  Box,
  Chip
} from '@mui/material';
import {
  Google as GoogleIcon,
  ExitToApp as LogoutIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const GoogleAuth = ({ showEmailCount = false }) => {
  const { user, isAuthenticated, loading, loginWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <Card sx={{ maxWidth: 400, margin: 'auto' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            Verificando autenticación...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Card sx={{ maxWidth: 400, margin: 'auto' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar src={user.picture} alt={user.name} />
            <Box>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Chip
              icon={<EmailIcon />}
              label="Gmail Conectado"
              color="success"
              variant="outlined"
              size="small"
            />
          </Box>

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
            fullWidth
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 400, margin: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom align="center">
          Iniciar Sesión con Google
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom align="center" paragraph>
          Para que Eva pueda enviar correos desde tu cuenta, necesitas autorizar el acceso a Gmail.
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={loginWithGoogle}
          fullWidth
          sx={{
            backgroundColor: '#4285f4',
            '&:hover': {
              backgroundColor: '#3367d6',
            },
          }}
        >
          Conectar con Google
        </Button>
        
        <Typography variant="caption" display="block" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Eva necesita acceso a Gmail para enviar correos en tu nombre
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GoogleAuth;