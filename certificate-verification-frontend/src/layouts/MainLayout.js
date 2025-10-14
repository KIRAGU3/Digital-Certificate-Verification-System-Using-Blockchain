import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Divider,
  Stack,
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  VerifiedUser,
  AddCircle,
  Info,
  ContactSupport,
  Help,
  Article,
  Security,
  Description
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ThemeToggle from '../components/ThemeToggle';

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const location = useLocation();

  const mainMenuItems = [
    { text: 'Verify Certificate', path: '/verify', icon: <VerifiedUser /> },
    { text: 'Issue Certificate', path: '/issue', icon: <AddCircle /> },
    { text: 'About', path: '/about', icon: <Info /> },
    { text: 'Contact', path: '/contact', icon: <ContactSupport /> },
  ];

  const secondaryMenuItems = [
    { text: 'FAQ', path: '/faq', icon: <Help /> },
    { text: 'Blog', path: '/blog', icon: <Article /> },
    { text: 'Privacy Policy', path: '/privacy', icon: <Security /> },
    { text: 'Terms of Service', path: '/terms', icon: <Description /> },
  ];

  const actions = [
    { text: 'New Certificate', path: '/issue', primary: true },
    { text: 'Verify Certificate', path: '/verify' },
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <VerifiedUser color="primary" />
          Certificate Verification
        </Typography>
      </Box>
      <Divider />
      <List>
        {mainMenuItems.map((item) => (
          <ListItem
            key={item.text}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              color: 'text.primary',
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <List>
        {secondaryMenuItems.map((item) => (
          <ListItem
            key={item.text}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              color: 'text.primary',
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgb(30, 41, 59)'
            : 'rgb(35, 48, 158)',
          backgroundImage: `linear-gradient(to right, ${theme.palette.mode === 'dark'
            ? 'rgb(30, 41, 59), rgb(51, 65, 85)'
            : 'rgb(35, 48, 158), rgb(49, 46, 129)'
            })`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: 'white' }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              <VerifiedUser sx={{ fontSize: { xs: 24, md: 28 } }} />
              CeverSys
            </Typography>

            {!isMobile && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ ml: 4 }}
              >
                {actions.map((action) => (
                  <Button
                    key={action.text}
                    component={RouterLink}
                    to={action.path}
                    variant={action.primary ? "contained" : "text"}
                    sx={{
                      color: action.primary ? 'primary.main' : 'white',
                      backgroundColor: action.primary ? 'white' : 'transparent',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: action.primary
                          ? alpha('#fff', 0.9)
                          : alpha('#fff', 0.1)
                      }
                    }}
                  >
                    {action.text}
                  </Button>
                ))}
              </Stack>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {!isMobile && (
              <>
                {mainMenuItems.slice(2).map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      minWidth: 'auto',
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.1)
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
                <Box sx={{ mx: 0.5 }}>
                  <ThemeToggle />
                </Box>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      <Box sx={{ flex: 1, mt: '64px' }}>
        <Breadcrumbs />
        <Container
          component="main"
          maxWidth="lg"
          sx={{
            py: 4,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900]
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Certificate Verification System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout; 