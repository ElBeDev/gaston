import React from 'react';
import {
  Avatar,
  Button,
  Chip,
  Tooltip,
  Box
} from '@mui/material';
import {
  Google as GoogleIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const EvaGoogleLogin = () => {
  const { user, isAuthenticated, loading, loginWithGoogle } = useAuth();

  if (loading) {
    return (
      <Chip
        label="Cargando..."
        size="small"
        variant="outlined"
      />
    );
  }

  if (isAuthenticated && user) {
    return (
      <Tooltip title={`Conectado como ${user.name}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<CheckIcon />}
            label="Google"
            color="success"
            size="small"
            variant="outlined"
          />
          <Avatar
            src={user.picture}
            alt={user.name}
            sx={{ width: 32, height: 32 }}
          />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={loginWithGoogle}
      startIcon={<GoogleIcon />}
      size="small"
      variant="outlined"
      sx={{
        borderColor: 'rgba(255, 255, 255, 0.3)',
        color: 'text.primary',
        '&:hover': {
          borderColor: 'primary.main',
          background: 'rgba(102, 126, 234, 0.1)',
        }
      }}
    >
      Login
    </Button>
  );
};

export default EvaGoogleLogin;
