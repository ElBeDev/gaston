import React from 'react';
import { Box, useTheme } from '@mui/material';
import UnifiedChat from "../components/UnifiedChat";

const ChatPage = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.mode === 'dark' 
          ? '#0f172a' 
          : '#f8fafc',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3
      }}
    >
      <UnifiedChat />
    </Box>
  );
};

export default ChatPage;