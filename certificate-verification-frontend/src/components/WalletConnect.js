import React, { useEffect, useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  AccountBalanceWallet,
  Logout,
  Warning,
  CheckCircle,
  ContentCopy,
  AccountBalance
} from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';
import { getNetworkConfig } from '../config/scroll-networks';
import { ethers } from 'ethers';

const WalletConnect = ({ compact = false, showBalance = true }) => {
  const {
    account,
    provider,
    chainId,
    isConnecting,
    error,
    isScrollNetwork,
    connectWallet,
    disconnectWallet,
    switchToScrollNetwork,
  } = useWeb3();

  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatBalance = (bal) => {
    if (!bal) return '0.0000';
    return parseFloat(bal).toFixed(4);
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchBalance = async () => {
    if (!account || !provider) return;

    setLoadingBalance(true);
    try {
      const balanceWei = await provider.getBalance(account);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (account && provider && showBalance) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [account, provider, showBalance]);

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
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWallet color="primary" />
              Wallet Connected
            </Typography>
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

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Scroll Address
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body1"
                sx={{ fontFamily: 'monospace', fontWeight: 500 }}
              >
                {account}
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy Full Address'}>
                <IconButton size="small" onClick={copyAddress}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {showBalance && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Balance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {loadingBalance ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    <AccountBalance color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatBalance(balance)} ETH
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          )}

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
                    Switch to Scroll Sepolia
                  </Button>
                )}
              </Box>
              {isScrollNetwork && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Chain ID: {chainId} | RPC: {networkConfig.rpcUrls[0]}
                </Typography>
              )}
            </Box>
          )}

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
