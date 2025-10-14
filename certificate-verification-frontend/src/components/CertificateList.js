import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Pagination,
    CircularProgress,
    Alert,
} from '@mui/material';
import Search from './Search';
import CertificateFilters from './CertificateFilters';
import { fetchCertificates } from '../services/certificateService';

const CertificateList = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });

    const loadCertificates = async () => {
        try {
            setLoading(true);
            setError(null);
            // TODO: Replace with actual API call
            const response = await fetchCertificates({
                page,
                searchTerm,
                ...filters,
            });
            setCertificates(response.data);
            setTotalPages(response.totalPages);
        } catch (err) {
            setError('Failed to load certificates. Please try again later.');
            console.error('Error loading certificates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCertificates();
    }, [page, searchTerm, filters]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPage(1); // Reset to first page when searching
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>
                    Certificates
                </Typography>

                <Search onSearch={handleSearch} />
                <CertificateFilters onFilterChange={handleFilterChange} />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {certificates.map((certificate) => (
                            <Grid item xs={12} sm={6} md={4} key={certificate.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {certificate.title}
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                            Type: {certificate.type}
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                            Status: {certificate.status}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Issue Date: {new Date(certificate.issueDate).toLocaleDateString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {certificates.length === 0 && !loading && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography color="textSecondary">
                                No certificates found matching your criteria
                            </Typography>
                        </Box>
                    )}

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default CertificateList;
