import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  CircularProgress,
  Fade,
  Alert,
  Grid,
  InputAdornment,
  useTheme,
  alpha,
} from '@mui/material';
import { VerifiedUser, Error, Search } from '@mui/icons-material';
import { verifyCertificate } from '../services/certificateService';
import './CertificateVerification.css';

const CertificateVerification = () => {
  const [certHash, setCertHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value.trim();
    // Remove '0x' prefix if present when typing
    const normalizedValue = value.startsWith('0x') ? value.slice(2) : value;
    setCertHash(normalizedValue);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certHash.trim()) {
      setError('Please enter a certificate hash');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Always add '0x' prefix when submitting
      const normalizedHash = `0x${certHash}`;
      console.log('Submitting verification request for hash:', normalizedHash);
      const response = await verifyCertificate(normalizedHash);
      console.log('Setting verification result:', response);
      console.log('Blockchain verification data:', response.blockchain_verification);
      setResult(response);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCertificateDetails = () => {
    if (!result?.certificate) return null;

    const certificateData = result.certificate;
    const blockchainData = result.blockchain_details;

    return (
      <Box className="certificate-details">
        <Typography variant="h6" gutterBottom>
          Certificate Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper className="detail-item">
              <Typography variant="subtitle2" color="textSecondary">Student Name</Typography>
              <Typography>{certificateData.student_name}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className="detail-item">
              <Typography variant="subtitle2" color="textSecondary">Course</Typography>
              <Typography>{certificateData.course}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className="detail-item">
              <Typography variant="subtitle2" color="textSecondary">Issue Date</Typography>
              <Typography>
                {new Date(certificateData.issue_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className="detail-item">
              <Typography variant="subtitle2" color="textSecondary">Institution</Typography>
              <Typography>{certificateData.institution}</Typography>
            </Paper>
          </Grid>
          {blockchainData && (
            <Grid item xs={12}>
              <Paper className="detail-item blockchain-verification">
                <Typography variant="subtitle2" color="textSecondary">Blockchain Verification</Typography>
                <Typography>Verified on blockchain: {result.blockchain_valid ? 'Yes' : 'No'}</Typography>
              </Paper>
            </Grid>
          )}
          <Grid item xs={12}>
            <Box className="blockchain-info">
              <Typography variant="subtitle2" gutterBottom>Blockchain Information</Typography>
              <Typography variant="body2" className="blockchain-address">
                Certificate Hash: {certHash}
              </Typography>
              {result.contractAddress && (
                <Typography variant="body2" className="blockchain-address" sx={{ mt: 1 }}>
                  Contract Address: {result.contractAddress}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const theme = useTheme();

  return (
    <Container maxWidth="md" className="certificate-verification">
      <Box
        className="verification-form"
        component={Paper}
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Box className="verification-instructions" sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            Verify Certificate
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              maxWidth: '600px',
              mx: 'auto',
              mb: 3
            }}
          >
            Enter your certificate hash below to verify its authenticity on the blockchain.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box className="form-group">
            <TextField
              fullWidth
              label="Certificate Hash"
              variant="outlined"
              value={certHash}
              onChange={handleChange}
              placeholder="Enter your certificate hash"
              error={!!error}
              helperText={error}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                sx: {
                  fontFamily: "'Roboto Mono', monospace",
                  '& input': {
                    fontSize: '1.1rem',
                    letterSpacing: '0.5px'
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                },
              }}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Verify Certificate'
            )}
          </Button>
        </form>
      </Box>

      {error && (
        <Fade in={true}>
          <Alert severity="error" className="error-message">
            {error}
          </Alert>
        </Fade>
      )}

      {loading && (
        <Box className="loading-state">
          <CircularProgress size={40} />
          <Typography className="loading-text">
            Verifying certificate on the blockchain...
          </Typography>
        </Box>
      )}

      {result && (
        <Fade in={true}>
          <Box className={`verification-status ${result.is_valid ? 'valid' : 'invalid'}`}>
            <Typography variant="h5" align="center" gutterBottom>
              {result.is_valid ? (
                <Box display="flex" alignItems="center" justifyContent="center">
                  <VerifiedUser sx={{ color: 'success.main', mr: 1 }} />
                  Certificate is Valid
                </Box>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Error sx={{ color: 'error.main', mr: 1 }} />
                  Certificate is Invalid
                </Box>
              )}
            </Typography>
            {renderCertificateDetails()}
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default CertificateVerification;