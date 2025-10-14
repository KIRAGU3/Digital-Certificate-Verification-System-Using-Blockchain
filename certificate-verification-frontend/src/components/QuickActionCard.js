import React from 'react';
import {
    Card,
    CardActionArea,
    Stack,
    Box,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const QuickActionCard = ({ icon: Icon, title, description, path, primary }) => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: 3,
                border: 2,
                borderColor: primary ? 'primary.main' : 'divider',
                backgroundColor: primary ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                transition: 'all 0.3s ease-in-out',
                transform: 'translateY(0)',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                    borderColor: primary ? 'primary.main' : theme.palette.primary.light,
                    '& .icon-container': {
                        transform: 'scale(1.1)',
                        backgroundColor: primary ? theme.palette.primary.main : theme.palette.primary.light,
                    },
                },
            }}
        >
            <CardActionArea
                component={RouterLink}
                to={path}
                sx={{
                    height: '100%',
                    p: 4,
                    '&:hover': {
                        backgroundColor: 'transparent'
                    }
                }}
            >
                <Stack spacing={3} alignItems="center" textAlign="center">
                    <Box
                        className="icon-container"
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: primary ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                            color: primary ? 'white' : 'primary.main',
                            transition: 'all 0.3s ease-in-out',
                            mb: 2
                        }}
                    >
                        <Icon sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            color: primary ? 'primary.main' : 'text.primary'
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                    >
                        {description}
                    </Typography>
                </Stack>
            </CardActionArea>
        </Card>
    );
};

export default QuickActionCard;