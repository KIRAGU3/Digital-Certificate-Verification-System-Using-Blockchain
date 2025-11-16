import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CloudUpload,
  QrCode2,
  Videocam,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import './QRCodeVerification.css';

const QRCodeVerification = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const theme = useTheme();

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await verifyQRImage(files[0]);
    }
  };

  const verifyQRImage = async (file) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('qr_image', file);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/certificates/verify-qr/`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify QR code');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to verify certificate from QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      verifyQRImage(file);
    }
  };

  // Camera scanning using jsQR
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Start scanning after a short delay
        setTimeout(scanQRCode, 500);
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const scanQRCode = async () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) {
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Use jsQR if available, otherwise show error
        if (window.jsQR) {
          const code = window.jsQR(
            imageData.data,
            imageData.width,
            imageData.height,
            {
              inversionAttempts: 'dontInvert',
            }
          );

          if (code && code.data) {
            // Extract cert_hash from URL
            let certHash = code.data;
            if (certHash.includes('/verify/')) {
              certHash = certHash.split('/verify/')[1];
            }
            certHash = certHash.replace('0x', '');

            // Stop camera and verify
            stopCamera();
            verifyQRData(certHash);
            return;
          }
        } else {
          setError('jsQR library not loaded. Please upload QR image instead.');
          stopCamera();
          return;
        }
      }

      // Continue scanning
      if (cameraActive) {
        requestAnimationFrame(scanQRCode);
      }
    } catch (err) {
      console.error('Scan error:', err);
      if (cameraActive) {
        requestAnimationFrame(scanQRCode);
      }
    }
  };

  const verifyQRData = async (certHash) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/certificates/verify/0x${certHash}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify certificate');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  const renderCertificateDetails = () => {
    if (!result?.certificate) return null;

    const cert = result.certificate;
    const blockchainVerif = result.blockchain_verification;

    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Student Name
              </Typography>
              <Typography variant="h6">{cert.student_name}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Course
              </Typography>
              <Typography variant="h6">{cert.course}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Institution
              </Typography>
              <Typography variant="h6">{cert.institution}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Issue Date
              </Typography>
              <Typography variant="h6">
                {new Date(cert.issue_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {blockchainVerif && (
          <Grid item xs={12}>
            <Card
              sx={{
                backgroundColor: blockchainVerif.is_valid
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  {blockchainVerif.is_valid ? (
                    <CheckCircle sx={{ color: 'success.main' }} />
                  ) : (
                    <ErrorIcon sx={{ color: 'error.main' }} />
                  )}
                  <Typography variant="h6">
                    {blockchainVerif.is_valid
                      ? 'Verified on Blockchain ✓'
                      : 'Invalid on Blockchain ✗'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode2 />
          QR Code Certificate Verification
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label="Upload QR Image" icon={<CloudUpload />} />
          <Tab label="Scan with Camera" icon={<Videocam />} />
        </Tabs>

        {/* Upload Tab */}
        {tabValue === 0 && (
          <Box>
            <Paper
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                p: 4,
                textAlign: 'center',
                border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider
                  }`,
                backgroundColor: dragActive
                  ? alpha(theme.palette.primary.main, 0.05)
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6">Drag and drop QR code image here</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                or click to select a file
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </Paper>
          </Box>
        )}

        {/* Camera Tab */}
        {tabValue === 1 && (
          <Box sx={{ textAlign: 'center' }}>
            {cameraActive ? (
              <Box>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <Button
                  variant="contained"
                  color="error"
                  onClick={stopCamera}
                  fullWidth
                >
                  Stop Camera
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Videocam />}
                onClick={startCamera}
                fullWidth
              >
                Start Camera
              </Button>
            )}
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography>Verifying certificate...</Typography>
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {/* Result State */}
        {result && !loading && (
          <Box
            sx={{
              mt: 3,
              p: 3,
              backgroundColor: result.is_valid
                ? alpha(theme.palette.success.main, 0.05)
                : alpha(theme.palette.error.main, 0.05),
              borderRadius: 1,
              border: `1px solid ${result.is_valid ? theme.palette.success.main : theme.palette.error.main
                }`,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              {result.is_valid ? (
                <CheckCircle sx={{ fontSize: 32, color: 'success.main' }} />
              ) : (
                <ErrorIcon sx={{ fontSize: 32, color: 'error.main' }} />
              )}
              <Typography variant="h6">
                {result.is_valid ? 'Certificate is Valid ✓' : 'Certificate is Invalid ✗'}
              </Typography>
            </Box>
            {renderCertificateDetails()}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default QRCodeVerification;
