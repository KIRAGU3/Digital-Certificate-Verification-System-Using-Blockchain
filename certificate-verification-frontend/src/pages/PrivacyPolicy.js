import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme
} from '@mui/material';
import {
  Security,
  Storage,
  Share,
  Delete
} from '@mui/icons-material';

const PrivacyPolicy = () => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();

  const sections = [
    {
      title: 'Information We Collect',
      icon: <Storage sx={{ fontSize: 40, color: 'primary.main' }} />,
      content: [
        'Personal information (name, email, contact details)',
        'Certificate information and verification data',
        'Usage data and analytics',
        'Device and browser information'
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: <Share sx={{ fontSize: 40, color: 'primary.main' }} />,
      content: [
        'To provide and maintain our service',
        'To verify certificates and prevent fraud',
        'To improve our platform and user experience',
        'To communicate with you about our services'
      ]
    },
    {
      title: 'Data Security',
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      content: [
        'Encryption of sensitive data',
        'Regular security audits',
        'Access controls and authentication',
        'Secure data storage and transmission'
      ]
    },
    {
      title: 'Your Rights',
      icon: <Delete sx={{ fontSize: 40, color: 'primary.main' }} />,
      content: [
        'Access your personal data',
        'Request data correction or deletion',
        'Opt-out of marketing communications',
        'Data portability'
      ]
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 6 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: 2 }}>
          <Typography variant="body1" paragraph>
            At Blockchain Certificate Verification, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully. 
            If you do not agree with the terms of this privacy policy, please do not access the platform.
          </Typography>
        </Paper>

        {sections.map((section, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {section.icon}
              <Typography variant="h4" sx={{ ml: 2 }}>
                {section.title}
              </Typography>
            </Box>
            <List>
              {section.content.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <ListItem>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        variant: 'body1',
                        color: 'text.secondary'
                      }}
                    />
                  </ListItem>
                  {itemIndex < section.content.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ))}

        <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us at:
          </Typography>
          <Typography variant="body1">
            Email: privacy@blockchainverify.com
          </Typography>
          <Typography variant="body1">
            Address: 123 Blockchain Street, Tech City, TC 12345
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy; 