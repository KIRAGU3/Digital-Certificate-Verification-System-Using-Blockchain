import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Upload,
  Verified,
  Security,
  Timeline
} from '@mui/icons-material';

const ProcessStep = ({ icon: Icon, title, description, step }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 2 : 3,
        height: '100%',
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}
      >
        {step}
      </Box>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Paper>
  );
};

const VerificationProcess = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Upload Certificate',
      description: 'Submit your certificate for verification through our secure platform.',
      step: 1
    },
    {
      icon: Security,
      title: 'Blockchain Validation',
      description: 'Your certificate is validated against the blockchain network.',
      step: 2
    },
    {
      icon: Timeline,
      title: 'Transaction Record',
      description: 'A secure transaction is recorded on the blockchain.',
      step: 3
    },
    {
      icon: Verified,
      title: 'Verification Complete',
      description: 'Receive instant verification results with blockchain proof.',
      step: 4
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Verification Process
        </Typography>
        <Grid container spacing={3}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ProcessStep {...step} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default VerificationProcess; 