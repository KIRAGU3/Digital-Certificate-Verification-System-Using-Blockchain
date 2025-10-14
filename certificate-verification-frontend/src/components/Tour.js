import React from 'react';
import {
    Box,
    Paper,
    Button,
    Typography,
    IconButton,
    Popper,
    Fade,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const Tour = ({
    steps,
    currentStep,
    isOpen,
    onNext,
    onPrev,
    onClose,
    onSkip,
}) => {
    const theme = useTheme();
    const currentStepData = steps[currentStep];

    if (!isOpen || !currentStepData) return null;

    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) return null;

    return (
        <Popper
            open={isOpen}
            anchorEl={targetElement}
            placement={currentStepData.placement || 'bottom'}
            transition
            modifiers={[
                {
                    name: 'offset',
                    options: {
                        offset: [0, 10],
                    },
                },
            ]}
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps}>
                    <Paper
                        elevation={4}
                        sx={{
                            p: 2,
                            maxWidth: 320,
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                border: '5px solid transparent',
                                borderBottomColor: 'background.paper',
                            },
                        }}
                    >
                        <Box sx={{ position: 'relative' }}>
                            <IconButton
                                size="small"
                                onClick={onClose}
                                sx={{ position: 'absolute', right: -8, top: -8 }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>

                            <Typography variant="h6" gutterBottom>
                                {currentStepData.title}
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 2 }}>
                                {currentStepData.content}
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 2,
                                }}
                            >
                                <Button
                                    size="small"
                                    onClick={onSkip}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Skip tour
                                </Button>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {currentStep > 0 && (
                                        <Button
                                            size="small"
                                            onClick={onPrev}
                                            startIcon={<NavigateBeforeIcon />}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={onNext}
                                        endIcon={<NavigateNextIcon />}
                                    >
                                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                                    </Button>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 2,
                                    gap: 0.5,
                                }}
                            >
                                {steps.map((_, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: index === currentStep ? 'primary.main' : 'grey.300',
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            )}
        </Popper>
    );
};

export default Tour;