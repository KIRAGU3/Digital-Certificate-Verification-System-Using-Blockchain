import React from 'react';
import {
    TextField,
    FormHelperText,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for consistent form field spacing
const FormField = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    position: 'relative',
}));

const ValidationMessage = styled(Typography)(({ theme, severity }) => ({
    fontSize: '0.75rem',
    marginTop: theme.spacing(0.5),
    color: severity === 'success'
        ? theme.palette.success.main
        : severity === 'warning'
            ? theme.palette.warning.main
            : theme.palette.error.main,
}));

// Enhanced text input with validation and loading state
export const FormInput = ({
    label,
    value,
    onChange,
    error,
    helperText,
    isLoading,
    validation,
    required,
    type = 'text',
    ...props
}) => {
    const showValidation = validation && !error;

    return (
        <FormField>
            <TextField
                fullWidth
                label={label}
                value={value}
                onChange={onChange}
                error={!!error}
                helperText={error || helperText}
                required={required}
                type={type}
                variant="outlined"
                InputProps={{
                    endAdornment: isLoading && (
                        <CircularProgress size={20} color="inherit" />
                    ),
                }}
                {...props}
            />
            {showValidation && (
                <ValidationMessage severity={validation.severity}>
                    {validation.message}
                </ValidationMessage>
            )}
        </FormField>
    );
};

// Enhanced select input with validation
export const FormSelect = ({
    label,
    value,
    onChange,
    options,
    error,
    helperText,
    required,
    ...props
}) => {
    return (
        <FormField>
            <FormControl fullWidth error={!!error} required={required}>
                <InputLabel>{label}</InputLabel>
                <Select
                    value={value}
                    onChange={onChange}
                    label={label}
                    {...props}
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
                {(error || helperText) && (
                    <FormHelperText>{error || helperText}</FormHelperText>
                )}
            </FormControl>
        </FormField>
    );
};

// Form section with title and optional description
export const FormSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    '& .MuiTypography-h6': {
        marginBottom: theme.spacing(2),
    },
    '& .MuiTypography-body2': {
        marginBottom: theme.spacing(3),
        color: theme.palette.text.secondary,
    },
}));

// Form row for horizontal layout
export const FormRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: theme.spacing(3),
    },
}));