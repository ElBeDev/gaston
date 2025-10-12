import React from 'react';
import { Box, Container } from '@mui/material';
import CalendarManagerAdvanced from '../components/CalendarManagerAdvanced';

const CalendarPageAdvanced = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth={false} sx={{ py: 0, px: 0 }}>
        <CalendarManagerAdvanced />
      </Container>
    </Box>
  );
};

export default CalendarPageAdvanced;