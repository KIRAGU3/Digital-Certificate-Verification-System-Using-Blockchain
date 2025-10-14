import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

const routeLabels = {
    '/': 'Home',
    '/verify': 'Verify Certificate',
    '/issue': 'Issue Certificate',
    '/about': 'About',
    '/contact': 'Contact',
    '/faq': 'FAQ',
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms of Service',
    '/blog': 'Blog'
};

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Don't show breadcrumbs on home page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <MuiBreadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{
                py: 2,
                px: { xs: 2, sm: 3 },
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider'
            }}
        >
            <Link
                component={RouterLink}
                to="/"
                underline="hover"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                Home
            </Link>
            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const label = routeLabels[to] || value;

                return last ? (
                    <Typography
                        color="text.primary"
                        key={to}
                        sx={{
                            fontWeight: 'medium',
                            textTransform: 'capitalize'
                        }}
                    >
                        {label}
                    </Typography>
                ) : (
                    <Link
                        component={RouterLink}
                        color="inherit"
                        to={to}
                        key={to}
                        underline="hover"
                    >
                        {label}
                    </Link>
                );
            })}
        </MuiBreadcrumbs>
    );
};

export default Breadcrumbs;