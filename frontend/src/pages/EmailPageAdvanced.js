import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import EmailManagerAdvanced from '../components/EmailManagerAdvanced';

const EmailPageAdvanced = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth={false} sx={{ py: 0, px: 0 }}>
        <EmailManagerAdvanced />
      </Container>
    </Box>
  );
};

export default EmailPageAdvanced;