import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Dashboard,
  Chat,
  People,
  Analytics,
  Email,
  CalendarToday,
  WhatsApp,
  Brightness4,
  Brightness7,
  AccountCircle,
  Logout,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import EvaAvatar from './EvaAvatar';

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleTheme } = useCustomTheme();
  const { user, isAuthenticated, loginWithGoogle, logout } = useAuth();
  const [evaHeaderStatus] = useState('online');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <Dashboard /> },
    { label: 'Chat with Eva', path: '/chat', icon: <Chat /> },
    { label: 'CRM', path: '/crm', icon: <People /> },
    { label: 'Analytics', path: '/analytics', icon: <Analytics /> },
    { label: 'Email', path: '/email', icon: <Email /> },
    { label: 'Calendar', path: '/calendar', icon: <CalendarToday /> },
    { label: 'WhatsApp', path: '/whatsapp', icon: <WhatsApp /> },
    { label: 'WhatsApp Web', path: '/whatsapp-web', icon: <WhatsApp /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: '#fff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Mini Eva Avatar */}
          <EvaAvatar
            status={evaHeaderStatus}
            size="medium"
            showStatus={false}
            showIntelligence={false}
            animated={true}
            onClick={() => navigate('/chat')}
          />
          
          {/* Logo and Title */}
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: '#2563eb',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              Eva Assistant
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Intelligent AI Companion
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

          {navItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              sx={{
                color: isActive(item.path) ? '#2563eb' : '#6b7280',
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                background: isActive(item.path) 
                  ? 'rgba(37, 99, 235, 0.1)' 
                  : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb'
                }
              }}
            >
              {item.label}
            </Button>
          ))}

          {/* Google Auth Status */}
          {isAuthenticated && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Chip
                icon={<CheckCircle />}
                label="Gmail"
                size="small"
                color="success"
                variant="outlined"
              />
              <IconButton onClick={handleUserMenuOpen}>
                <Avatar
                  src={user.picture}
                  alt={user.name}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="subtitle2">{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              variant="outlined"
              startIcon={<AccountCircle />}
              onClick={loginWithGoogle}
              sx={{ ml: 2 }}
            >
              Login Gmail
            </Button>
          )}

          <IconButton
            onClick={toggleTheme}
            sx={{
              ml: 2,
              bgcolor: '#f3f4f6',
              '&:hover': {
                bgcolor: '#e5e7eb'
              }
            }}
          >
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;