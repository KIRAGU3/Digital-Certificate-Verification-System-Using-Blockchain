import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../theme/ThemeProvider';

const ThemeToggle = () => {
    const { mode, toggleTheme } = useThemeMode();

    return (
        <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
                onClick={toggleTheme}
                color="inherit"
                size="small"
                sx={{
                    width: 34,
                    height: 34,
                    padding: '6px',
                    '&:hover': {
                        backgroundColor: (theme) =>
                            mode === 'light'
                                ? theme.palette.grey[300]
                                : theme.palette.grey[800],
                    },
                }}
            >
                {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
        </Tooltip>
    );
};

export default ThemeToggle;