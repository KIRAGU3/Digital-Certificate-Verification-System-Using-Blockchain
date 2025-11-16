import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import CertificateVerification from '../components/CertificateVerification';
import QRCodeVerification from '../components/QRCodeVerification';
import VerificationProcess from '../components/VerificationProcess';

const VerifyCertificate = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            mb: 4,
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          Certificate Verification
        </Typography>

        <Typography
          variant="h6"
          align="center"
          color="textSecondary"
          sx={{ mb: 6 }}
        >
          Verify the authenticity of your certificates using our blockchain-based verification system
        </Typography>

        <Box sx={{ mb: 6 }}>
          <QRCodeVerification />
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography variant="h5" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
            Or manually enter certificate hash:
          </Typography>
          <CertificateVerification />
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ mb: 4 }}
          >
            How Certificate Verification Works
          </Typography>
          <VerificationProcess />
        </Box>
      </Container>
    </Box>
  );
};

export default VerifyCertificate;