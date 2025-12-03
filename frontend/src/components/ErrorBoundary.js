import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';
import { designTokens } from '../styles/designTokens';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // TODO: Send error to logging service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Reload the page as fallback
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: designTokens.gradients.light,
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              p: 4,
              textAlign: 'center',
              borderRadius: designTokens.borderRadius.lg
            }}
          >
            {/* Error Icon */}
            <ErrorIcon
              sx={{
                fontSize: 80,
                color: designTokens.colors.error.main,
                mb: 2
              }}
            />

            {/* Error Title */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: designTokens.typography.fontWeight.bold,
                color: designTokens.colors.neutral[900],
                mb: 2
              }}
            >
              ¡Oops! Algo salió mal
            </Typography>

            {/* Error Description */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Lo sentimos, Eva encontró un error inesperado. 
              No te preocupes, tus datos están seguros.
            </Typography>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  textAlign: 'left',
                  bgcolor: designTokens.colors.neutral[100],
                  p: 2,
                  borderRadius: designTokens.borderRadius.base,
                  mb: 3,
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontFamily: designTokens.typography.fontFamily.mono,
                    fontSize: '0.7rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReset}
                sx={{
                  bgcolor: designTokens.colors.primary.main,
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  borderRadius: designTokens.borderRadius.base,
                  '&:hover': {
                    bgcolor: designTokens.colors.primary.dark
                  }
                }}
              >
                Reintentar
              </Button>

              <Button
                variant="outlined"
                onClick={() => window.location.href = '/'}
                sx={{
                  borderColor: designTokens.colors.neutral[300],
                  color: designTokens.colors.neutral[700],
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  borderRadius: designTokens.borderRadius.base,
                  '&:hover': {
                    borderColor: designTokens.colors.neutral[400],
                    bgcolor: designTokens.colors.neutral[50]
                  }
                }}
              >
                Ir al inicio
              </Button>
            </Box>

            {/* Help Text */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 3 }}
            >
              Si el problema persiste, por favor contacta al soporte técnico
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
