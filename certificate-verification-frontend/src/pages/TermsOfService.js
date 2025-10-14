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
  Gavel,
  Security,
  AccountCircle,
  Warning
} from '@mui/icons-material';

const TermsOfService = () => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();

  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: <Gavel sx={{ fontSize: 40, color: 'primary.main' }} />,
      content: [
        'By accessing and using our platform, you agree to be bound by these Terms of Service.',
        'You must be at least 18 years old to use our services.',
        'We reserve the right to modify these terms at any time.',
        'Continued use of the platform after changes constitutes acceptance of the new terms.'
      ]
    },
    {
      title: 'User Responsibilities',
      icon: <AccountCircle sx={{ fontSize: 40, color: 'primary.main' }} />,
      content: [
        'Provide accurate and complete information when using our services.',
        'Maintain the security of your account credentials.',
        'Use the platform in compliance with all applicable laws.',
        'Not attempt to manipulate or abuse the verification system.'
      ]
    },
    {
      title: 'Service Usage',
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      content: [
        'Our platform is provided "as is" without warranties of any kind.',
        'We reserve the right to suspend or terminate services at our discretion.',
        'Users are responsible for maintaining backup copies of their certificates.',
        'We may limit or restrict access to certain features based on account type.'
      ]
    },
    {
      title: 'Limitations of Liability',
      icon: <Warning sx={{ fontSize: 40, color: 'primary.main' }} />,
      content: [
        'We are not liable for any indirect, incidental, or consequential damages.',
        'Our liability is limited to the amount paid for the service.',
        'We do not guarantee uninterrupted or error-free service.',
        'Users are responsible for verifying the accuracy of their certificates.'
      ]
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 6 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: 2 }}>
          <Typography variant="body1" paragraph>
            Welcome to Blockchain Certificate Verification. These Terms of Service govern your use of our platform and services. 
            By accessing or using our platform, you agree to be bound by these terms. Please read them carefully before using 
            our services.
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
            Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms of Service, please contact us at:
          </Typography>
          <Typography variant="body1">
            Email: legal@blockchainverify.com
          </Typography>
          <Typography variant="body1">
            Address: 123 Blockchain Street, Tech City, TC 12345
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfService; 