import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    useTheme,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useOnboarding } from '../contexts/OnboardingContext';

const WelcomeModal = ({ open, onClose }) => {
    const theme = useTheme();
    const { setHomeWelcomeSeen } = useOnboarding();

    console.log('WelcomeModal rendered, open:', open);

    const handleClose = (reason) => {
        console.log('Modal closing, reason:', reason);
        // Only close if it's from a button click
        if (reason === 'buttonClick') {
            setHomeWelcomeSeen();
            onClose();
        }
    };

    const features = [
        {
            icon: <VerifiedUserIcon color="primary" sx={{ fontSize: 40 }} />,
            title: 'Verify Certificates',
            description: 'Instantly verify the authenticity of any certificate using blockchain technology.',
        },
        {
            icon: <SearchIcon color="primary" sx={{ fontSize: 40 }} />,
            title: 'Search & Filter',
            description: 'Easily find and manage certificates with our powerful search and filter system.',
        },
        {
            icon: <AddCircleOutlineIcon color="primary" sx={{ fontSize: 40 }} />,
            title: 'Issue Certificates',
            description: 'Securely issue new certificates that are automatically verified on the blockchain.',
        },
    ];

    return (
        <Dialog
            open={open}
            onClose={() => handleClose('backdropClick')}
            maxWidth="sm"
            disableEscapeKeyDown
            onBackdropClick={() => { }}
            disableEnforceFocus
            closeAfterTransition
            fullWidth
            sx={{
                zIndex: 9999,
                '& .MuiDialog-paper': {
                    margin: 2,
                    maxHeight: 'calc(100% - 64px)'
                }
            }}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 2,
                },
            }}
        >
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogTitle sx={{ textAlign: 'center', pb: 3 }}>
                <Typography variant="h4" component="div" gutterBottom>
                    Welcome to Certificate Verification System
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Let's get you started with the key features
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, my: 2 }}>
                    {features.map((feature, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                                p: 2,
                                borderRadius: 1,
                                bgcolor: theme.palette.background.paper,
                                boxShadow: 1,
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 2,
                                },
                            }}
                        >
                            {feature.icon}
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
                <Button
                    variant="outlined"
                    onClick={() => handleClose('buttonClick')}
                    sx={{ mr: 1 }}
                >
                    Skip Tour
                </Button>
                <Button
                    variant="contained"
                    onClick={() => handleClose('buttonClick')}
                    startIcon={<VerifiedUserIcon />}
                >
                    Get Started
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WelcomeModal;