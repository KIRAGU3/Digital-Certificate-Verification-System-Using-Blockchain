import React from 'react';
import {
    Tooltip,
    IconButton,
    useTheme,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useOnboarding } from '../contexts/OnboardingContext';

const HelpTooltip = ({ title, children, placement = 'top', id }) => {
    const theme = useTheme();
    const { helpTooltipsEnabled } = useOnboarding();

    if (!helpTooltipsEnabled) return children;

    return (
        <Tooltip
            title={title}
            placement={placement}
            arrow
            PopperProps={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, -8],
                        },
                    },
                ],
            }}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {children}
                <IconButton
                    size="small"
                    sx={{
                        ml: 0.5,
                        color: theme.palette.text.secondary,
                        '&:hover': {
                            color: theme.palette.primary.main,
                        },
                    }}
                >
                    <HelpOutlineIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default HelpTooltip;