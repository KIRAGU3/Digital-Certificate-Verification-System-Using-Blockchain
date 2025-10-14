import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Verified,
  Timeline,
  Security,
  Storage
} from '@mui/icons-material';

const StatCard = ({ icon: Icon, title, value, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 2 : 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Paper>
  );
};

const BlockchainStats = () => {
  const stats = [
    {
      icon: Verified,
      title: 'Certificates Verified',
      value: '1.2M+',
      subtitle: 'Successfully verified on the blockchain'
    },
    {
      icon: Timeline,
      title: 'Blockchain Transactions',
      value: '5.4M+',
      subtitle: 'Secure and immutable records'
    },
    {
      icon: Security,
      title: 'Security Score',
      value: '99.9%',
      subtitle: 'Tamper-proof verification system'
    },
    {
      icon: Storage,
      title: 'Blockchain Size',
      value: '2.8TB',
      subtitle: 'Growing secure database'
    }
  ];

  return (
    <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BlockchainStats; 