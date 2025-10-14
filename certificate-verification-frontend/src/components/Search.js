import React, { useState, useRef } from 'react';
import {
    Paper,
    InputBase,
    IconButton,
    Box,
    useTheme,
    alpha,
    Popper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import useSearchHistory from '../hooks/useSearchHistory';

const Search = ({ onSearch, placeholder = 'Search certificates...' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const theme = useTheme();
    const searchRef = useRef(null);
    const {
        searchHistory,
        addToHistory,
        clearHistory,
        removeFromHistory
    } = useSearchHistory();

    const handleSearch = (e) => {
        e?.preventDefault();
        if (onSearch && searchTerm.trim()) {
            addToHistory(searchTerm.trim());
            onSearch(searchTerm);
            setIsHistoryOpen(false);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        if (onSearch) {
            onSearch('');
        }
    };

    const handleHistoryItemClick = (term) => {
        setSearchTerm(term);
        onSearch(term);
        setIsHistoryOpen(false);
    };

    return (
        <Box sx={{ position: 'relative' }} ref={searchRef}>
            <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 600,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&:hover': {
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                    },
                }}
            >
                <Box sx={{ p: '10px' }}>
                    <SearchIcon color="action" />
                </Box>
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsHistoryOpen(true);
                    }}
                    onFocus={() => setIsHistoryOpen(true)}
                    inputProps={{ 'aria-label': 'search certificates' }}
                />
                {searchTerm && (
                    <IconButton
                        aria-label="clear search"
                        onClick={handleClear}
                        sx={{ p: '10px' }}
                    >
                        <ClearIcon />
                    </IconButton>
                )}
            </Paper>

            <Popper
                open={isHistoryOpen && searchHistory.length > 0}
                anchorEl={searchRef.current}
                placement="bottom-start"
                style={{ width: searchRef.current?.offsetWidth, zIndex: 1000 }}
            >
                <Paper
                    sx={{
                        mt: 1,
                        boxShadow: theme.shadows[2],
                        maxHeight: 300,
                        overflow: 'auto',
                    }}
                >
                    <List>
                        <ListItem
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            }}
                        >
                            <Typography variant="subtitle2">Recent Searches</Typography>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    clearHistory();
                                    setIsHistoryOpen(false);
                                }}
                                title="Clear search history"
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </ListItem>
                        <Divider />
                        {searchHistory.map((term, index) => (
                            <ListItem
                                key={index}
                                button
                                onClick={() => handleHistoryItemClick(term)}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <HistoryIcon fontSize="small" color="action" />
                                </ListItemIcon>
                                <ListItemText primary={term} />
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromHistory(term);
                                    }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Popper>
        </Box>
    );
};

export default Search;