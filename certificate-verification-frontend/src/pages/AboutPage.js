import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme
} from '@mui/material';
import {
  Security,
  Speed,
  AutoGraph,
  EmojiObjects
} from '@mui/icons-material';

const AboutPage = () => {
  const theme = useTheme();

  const teamMembers = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      avatar: '/avatars/john.jpg',
      bio: 'Blockchain expert with 10+ years of experience in digital security and certificate management.'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      avatar: '/avatars/sarah.jpg',
      bio: 'Former tech lead at major blockchain companies, specializing in distributed systems.'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Product',
      avatar: '/avatars/michael.jpg',
      bio: 'Product visionary with a passion for creating user-friendly blockchain solutions.'
    },
    {
      name: 'Emily Davis',
      role: 'Security Lead',
      avatar: '/avatars/emily.jpg',
      bio: 'Cybersecurity expert focused on implementing robust security measures.'
    }
  ];

  const values = [
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Security First',
      description: 'We prioritize the security and integrity of every certificate verification process.'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Efficiency',
      description: 'Our platform delivers fast and accurate verification results without compromising security.'
    },
    {
      icon: <AutoGraph sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Innovation',
      description: 'We continuously innovate to provide cutting-edge blockchain solutions.'
    },
    {
      icon: <EmojiObjects sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'User-Centric',
      description: 'We design our solutions with the end-user in mind, ensuring a seamless experience.'
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            About Us
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Revolutionizing certificate verification through blockchain technology
          </Typography>
        </Box>

        {/* Mission Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            At Blockchain Certificate Verification, we're on a mission to transform how certificates are verified and validated. 
            We believe in creating a world where every certificate can be instantly verified, eliminating fraud and building trust 
            in the digital age.
          </Typography>
          <Typography variant="body1">
            Our platform leverages the power of blockchain technology to create an immutable, secure, and efficient system for 
            certificate verification. We're committed to making this technology accessible to everyone, from educational 
            institutions to corporate organizations.
          </Typography>
        </Box>

        {/* Values Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Our Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>{value.icon}</Box>
                    <Typography variant="h6" gutterBottom>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Our Team
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      src={member.avatar}
                      alt={member.name}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        border: `4px solid ${theme.palette.primary.main}`
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage; 