import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import EvaWhatsAppControl from '../components/EvaWhatsAppControl';

const EvaWhatsAppPage = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ py: 2 }}>
        <EvaWhatsAppControl />
      </Box>
    </Container>
  );
};

export default EvaWhatsAppPage;