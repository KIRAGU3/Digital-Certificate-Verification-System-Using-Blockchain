import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  useTheme,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import { useOnboarding } from '../contexts/OnboardingContext';
import {
  Speed,
  Storage,
  Shield,
  GppGood,
  SearchOutlined,
  Add,
  SecurityUpdate
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import BlockchainStats from '../components/BlockchainStats';
import VerificationProcess from '../components/VerificationProcess';
import WelcomeModal from '../components/WelcomeModal';

const HomePage = () => {
  const theme = useTheme();
  const { hasSeenHomeWelcome, setHomeWelcomeSeen } = useOnboarding();
  // Initialize welcome modal state based on whether user has seen it before
  const [showWelcome, setShowWelcome] = useState(!hasSeenHomeWelcome);

  const handleCloseWelcome = () => {
    console.log('Closing welcome modal');
    setShowWelcome(false);
    setHomeWelcomeSeen();
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <WelcomeModal
        open={showWelcome}
        onClose={handleCloseWelcome}
      />
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: 'primary.main',
          color: 'white',
          pt: { xs: 4, md: 6 },
          pb: { xs: 12, md: 16 },
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
        }}
      >
        <Container maxWidth="lg">
          {/* Top Bar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: { xs: 4, md: 6 }
            }}
          >
            <Chip
              icon={<SecurityUpdate sx={{ fontSize: 16 }} />}
              label="Enterprise Ready"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-label': {
                  fontWeight: 500
                }
              }}
            />

            <Button
              variant="outlined"
              size="small"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
              component={RouterLink}
              to="/docs"
            >
              Documentation
            </Button>
          </Box>

          {/* Main Hero Content */}
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    mb: 2
                  }}
                >
                  Secure Certificate Verification
                </Typography>

                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 600,
                    color: 'primary.light',
                    mb: 3
                  }}
                >
                  Powered by Blockchain
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: 'rgba(255,255,255,0.9)',
                    mb: 4,
                    maxWidth: 480
                  }}
                >
                  Ensure the authenticity of certificates with our advanced blockchain verification system.
                  Tamper-proof, instant, and reliable verification for educational institutions and organizations.
                </Typography>

                {/* Action Buttons */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                >
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                    component={RouterLink}
                    to="/verify"
                  >
                    Verify Certificate
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                    component={RouterLink}
                    to="/issue"
                  >
                    Issue Certificate
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            {/* Right Side - Stats */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {[
                  { icon: Shield, label: 'Security', value: '99.9%' },
                  { icon: Speed, label: 'Verification Time', value: '<2s' },
                  { icon: Storage, label: 'Certificates Issued', value: '50K+' },
                  { icon: GppGood, label: 'Success Rate', value: '100%' }
                ].map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        height: '100%',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        textAlign: 'center',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)'
                        }
                      }}
                    >
                      <stat.icon
                        sx={{
                          fontSize: 40,
                          color: 'primary.light',
                          mb: 2
                        }}
                      />
                      <Typography
                        variant="h4"
                        sx={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          mb: 1,
                          color: 'white'
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.7)'
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                background: theme.palette.background.paper,
                borderRadius: 2,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ color: 'primary.main' }}>
                  <SearchOutlined sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" gutterBottom>
                  Verify Certificate
                </Typography>
                <Typography color="text.secondary">
                  Check the authenticity of a certificate using its unique hash
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/verify"
                  sx={{ mt: 2 }}
                >
                  Start Verification
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                background: theme.palette.background.paper,
                borderRadius: 2,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ color: 'primary.main' }}>
                  <Add sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" gutterBottom>
                  Issue Certificate
                </Typography>
                <Typography color="text.secondary">
                  Create and issue new blockchain-verified certificates
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/issue"
                  sx={{ mt: 2 }}
                >
                  Issue Now
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Process Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <VerificationProcess />
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <BlockchainStats />
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;