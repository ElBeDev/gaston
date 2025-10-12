import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  Fade,
  Zoom,
  useTheme,
  keyframes
} from '@mui/material';
import {
  Psychology,
  Circle,
  AutoAwesome,
  Visibility,
  Memory,
  TipsAndUpdates,
  Favorite,
  Star
} from '@mui/icons-material';

// Animated keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.4); }
  50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.8); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const EvaPlaceholder = React.forwardRef((props, ref) => (
  <svg
    ref={ref}
    width="100%"
    height="100%"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
    {...props}
  >
    <circle cx="40" cy="40" r="38" fill="#ff1744" stroke="#fff" strokeWidth="4"/>
    <ellipse cx="40" cy="48" rx="18" ry="12" fill="#fff"/>
    <ellipse cx="32" cy="38" rx="4" ry="6" fill="#fff"/>
    <ellipse cx="48" cy="38" rx="4" ry="6" fill="#fff"/>
    <ellipse cx="32" cy="38" rx="2" ry="3" fill="#ff1744"/>
    <ellipse cx="48" cy="38" rx="2" ry="3" fill="#ff1744"/>
    <path d="M32 54 Q40 60 48 54" stroke="#ff1744" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
));

const EvaAvatar = ({ 
  status = 'online', 
  isTyping = false, 
  isThinking = false,
  lastActivity = null,
  intelligence = null,
  size = 'large', // small, medium, large, xlarge
  showStatus = true,
  showIntelligence = true,
  animated = true,
  onClick = null,
  speaking = false // Add speaking prop
}) => {
  const theme = useTheme();
  const [currentMood, setCurrentMood] = useState('happy');
  const [sparkles, setSparkles] = useState([]);

  // Avatar sizes
  const avatarSizes = {
    small: { width: 40, height: 40 },
    medium: { width: 60, height: 60 },
    large: { width: 80, height: 80 },
    xlarge: { width: 120, height: 120 }
  };

  // Status colors and messages
  const statusConfig = {
    online: { 
      color: '#4caf50', 
      label: 'Online & Ready',
      mood: 'happy'
    },
    thinking: { 
      color: '#ff9800', 
      label: 'Thinking...',
      mood: 'focused'
    },
    typing: { 
      color: '#2196f3', 
      label: 'Typing...',
      mood: 'excited'
    },
    offline: { 
      color: '#757575', 
      label: 'Offline',
      mood: 'sleeping'
    },
    error: { 
      color: '#f44336', 
      label: 'Connection Issue',
      mood: 'concerned'
    }
  };

  // Determine current status
  const getCurrentStatus = () => {
    if (isThinking) return 'thinking';
    if (isTyping) return 'typing';
    return status;
  };

  const currentStatus = getCurrentStatus();
  const statusInfo = statusConfig[currentStatus];

  // Update mood based on status
  useEffect(() => {
    setCurrentMood(statusInfo.mood);
  }, [currentStatus, statusInfo.mood]);

  // Generate sparkles animation
  useEffect(() => {
    if (animated && (isThinking || isTyping)) {
      const generateSparkles = () => {
        const newSparkles = Array.from({ length: 6 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 2
        }));
        setSparkles(newSparkles);
      };

      generateSparkles();
      const interval = setInterval(generateSparkles, 3000);
      return () => clearInterval(interval);
    } else {
      setSparkles([]);
    }
  }, [isThinking, isTyping, animated]);

  // Eva's face expressions based on mood
  const getEvaExpression = () => {
    const expressions = {
      happy: { emoji: '😊', color: '#667eea' },
      excited: { emoji: '🤩', color: '#f093fb' },
      focused: { emoji: '🤔', color: '#ff9800' },
      sleeping: { emoji: '😴', color: '#757575' },
      concerned: { emoji: '😟', color: '#f44336' }
    };
    return expressions[currentMood] || expressions.happy;
  };

  const expression = getEvaExpression();

  // Intelligence indicators
  const getIntelligenceIndicators = () => {
    if (!intelligence) return [];
    
    const indicators = [];
    
    if (intelligence.intent && intelligence.intent !== 'general') {
      indicators.push({
        icon: <TipsAndUpdates />,
        label: `Intent: ${intelligence.intent}`,
        color: 'primary'
      });
    }
    
    if (intelligence.urgency === 'high') {
      indicators.push({
        icon: <Star />,
        label: 'High Priority',
        color: 'error'
      });
    }
    
    if (intelligence.sentiment === 'positive') {
      indicators.push({
        icon: <Favorite />,
        label: 'Positive Vibe',
        color: 'success'
      });
    }

    return indicators.slice(0, 2); // Max 2 indicators
  };

  const intelligenceIndicators = getIntelligenceIndicators();

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      {/* Sparkles Animation */}
      {sparkles.map(sparkle => (
        <Box
          key={sparkle.id}
          sx={{
            position: 'absolute',
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animation: `${sparkle} 2s infinite ease-in-out`,
            animationDelay: `${sparkle.delay}s`,
            zIndex: 1
          }}
        >
          <AutoAwesome 
            sx={{ 
              fontSize: 12, 
              color: theme.palette.mode === 'dark' ? '#ffd700' : '#667eea',
              filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))'
            }} 
          />
        </Box>
      ))}

      {/* Main Avatar Container */}
      <Box
        sx={{
          position: 'relative',
          ...avatarSizes[size],
          zIndex: 2
        }}
      >
        {/* Glow Effect */}
        {animated && (isThinking || isTyping) && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${expression.color}40, transparent)`,
              animation: `${glow} 2s infinite ease-in-out`,
              zIndex: 1
            }}
          />
        )}

        {/* Eva Avatar Image */}
        <Zoom in timeout={500}>
          <EvaPlaceholder
            className={`eva-avatar${speaking ? " speaking" : ""}`}
          />
        </Zoom>

        {/* Status Indicator */}
        <Circle
          sx={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            fontSize: size === 'small' ? 12 : 16,
            color: statusInfo.color,
            backgroundColor: theme.palette.background.paper,
            borderRadius: '50%',
            animation: currentStatus === 'thinking' || currentStatus === 'typing' 
              ? `${pulse} 1s infinite ease-in-out` 
              : 'none'
          }}
        />
      </Box>

      {/* Status Label */}
      {showStatus && (
        <Fade in timeout={300}>
          <Chip
            label={statusInfo.label}
            size="small"
            sx={{
              backgroundColor: `${statusInfo.color}20`,
              color: statusInfo.color,
              fontWeight: 'bold',
              animation: isTyping ? `${pulse} 1s infinite ease-in-out` : 'none'
            }}
          />
        </Fade>
      )}

      {/* Intelligence Indicators */}
      {showIntelligence && intelligenceIndicators.length > 0 && (
        <Fade in timeout={600}>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            {intelligenceIndicators.map((indicator, index) => (
              <Chip
                key={index}
                icon={indicator.icon}
                label={indicator.label}
                size="small"
                color={indicator.color}
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    fontSize: 14
                  }
                }}
              />
            ))}
          </Box>
        </Fade>
      )}

      {/* Last Activity */}
      {lastActivity && size !== 'small' && (
        <Fade in timeout={900}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.6rem',
              textAlign: 'center',
              maxWidth: 120
            }}
          >
            {lastActivity}
          </Typography>
        </Fade>
      )}

      {/* Brain Activity Visualization */}
      {(isThinking || isTyping) && size === 'xlarge' && (
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            right: '10%',
            bottom: '10%',
            pointerEvents: 'none',
            zIndex: 3
          }}
        >
          <Psychology
            sx={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              fontSize: 20,
              color: theme.palette.mode === 'dark' ? '#ffffff80' : '#00000030',
              animation: `${sparkle} 2s infinite ease-in-out`
            }}
          />
          <Memory
            sx={{
              position: 'absolute',
              top: '60%',
              right: '20%',
              fontSize: 16,
              color: theme.palette.mode === 'dark' ? '#ffffff60' : '#00000020',
              animation: `${sparkle} 2.5s infinite ease-in-out`,
              animationDelay: '0.5s'
            }}
          />
          <Visibility
            sx={{
              position: 'absolute',
              bottom: '30%',
              left: '30%',
              fontSize: 14,
              color: theme.palette.mode === 'dark' ? '#ffffff40' : '#00000015',
              animation: `${sparkle} 3s infinite ease-in-out`,
              animationDelay: '1s'
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default EvaAvatar;