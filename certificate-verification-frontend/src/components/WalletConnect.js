import React from 'react';
import {
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AccountBalanceWallet,
  Logout,
  Warning,
  CheckCircle,
  ContentCopy
} from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';
import { getNetworkConfig } from '../config/scroll-networks';

const WalletConnect = ({ compact = false }) => {
  const {
    account,
    chainId,
    isConnecting,
    error,
    isScrollNetwork,
    connectWallet,
    disconnectWallet,
    switchToScrollNetwork,
  } = useWeb3();

  const [copied, setCopied] = React.useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const networkConfig = getNetworkConfig(chainId);

  if (!account) {
    return (
      <Box>
        <Button
          variant="contained"
          startIcon={isConnecting ? <CircularProgress size={20} /> : <AccountBalanceWallet />}
          onClick={connectWallet}
          disabled={isConnecting}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={isScrollNetwork ? <CheckCircle /> : <Warning />}
          label={formatAddress(account)}
          color={isScrollNetwork ? 'success' : 'warning'}
          onClick={copyAddress}
          onDelete={disconnectWallet}
          deleteIcon={<Logout />}
          sx={{ fontFamily: 'monospace' }}
        />
        {copied && (
          <Typography variant="caption" color="success.main">
            Copied!
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Connected Wallet
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontFamily: 'monospace', fontWeight: 500 }}
            >
              {formatAddress(account)}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy Address'}>
              <IconButton size="small" onClick={copyAddress}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={disconnectWallet}
          size="small"
        >
          Disconnect
        </Button>
      </Box>

      {networkConfig && (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Network
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={isScrollNetwork ? <CheckCircle /> : <Warning />}
              label={networkConfig.chainName}
              color={isScrollNetwork ? 'success' : 'warning'}
              size="small"
            />
            {!isScrollNetwork && (
              <Button
                variant="text"
                size="small"
                onClick={switchToScrollNetwork}
              >
                Switch to Scroll
              </Button>
            )}
          </Box>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default WalletConnect;
