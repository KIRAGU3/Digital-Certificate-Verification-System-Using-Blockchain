import React, { useState } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stack,
    Chip,
    IconButton,
    useTheme,
    Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

const CertificateFilters = ({ onFilterChange }) => {
    const theme = useTheme();
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });

    const [activeFilters, setActiveFilters] = useState([]);

    const handleFilterChange = (field, value) => {
        const newFilters = {
            ...filters,
            [field]: value,
        };
        setFilters(newFilters);

        // Update active filters
        if (value) {
            const filterLabel = `${field}: ${value}`;
            if (!activeFilters.includes(filterLabel)) {
                setActiveFilters([...activeFilters, filterLabel]);
            }
        } else {
            setActiveFilters(activeFilters.filter(filter => !filter.startsWith(`${field}:`)));
        }

        // Notify parent component
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const handleRemoveFilter = (filterToRemove) => {
        const [field] = filterToRemove.split(':');
        handleFilterChange(field.trim(), '');
    };

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterListIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Filters</Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={filters.type}
                        label="Type"
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="academic">Academic</MenuItem>
                        <MenuItem value="professional">Professional</MenuItem>
                        <MenuItem value="achievement">Achievement</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="valid">Valid</MenuItem>
                        <MenuItem value="expired">Expired</MenuItem>
                        <MenuItem value="revoked">Revoked</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="From Date"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    label="To Date"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </Stack>

            {activeFilters.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {activeFilters.map((filter) => (
                        <Chip
                            key={filter}
                            label={filter}
                            onDelete={() => handleRemoveFilter(filter)}
                            deleteIcon={<CloseIcon />}
                            sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                },
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default CertificateFilters;