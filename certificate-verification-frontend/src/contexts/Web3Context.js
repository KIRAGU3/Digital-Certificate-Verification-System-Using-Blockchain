import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { DEFAULT_NETWORK, getNetworkConfig, isScrollNetwork } from '../config/scroll-networks';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isScrollNetwork_, setIsScrollNetwork_] = useState(false);

  const checkNetwork = useCallback(async (providerInstance) => {
    try {
      const network = await providerInstance.getNetwork();
      const currentChainId = network.chainId;
      setChainId(currentChainId);
      setIsScrollNetwork_(isScrollNetwork(currentChainId));
      return currentChainId;
    } catch (err) {
      console.error('Error checking network:', err);
      return null;
    }
  }, []);

  const switchToScrollNetwork = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: DEFAULT_NETWORK.chainId }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: DEFAULT_NETWORK.chainId,
                chainName: DEFAULT_NETWORK.chainName,
                nativeCurrency: DEFAULT_NETWORK.nativeCurrency,
                rpcUrls: DEFAULT_NETWORK.rpcUrls,
                blockExplorerUrls: DEFAULT_NETWORK.blockExplorerUrls,
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          setError('Failed to add Scroll network to MetaMask');
          return false;
        }
      } else {
        console.error('Error switching network:', switchError);
        setError('Failed to switch to Scroll network');
        return false;
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to use this feature.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const currentAccount = accounts[0];

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(currentAccount);

      const currentChainId = await checkNetwork(web3Provider);

      if (!isScrollNetwork(currentChainId)) {
        const switched = await switchToScrollNetwork();
        if (switched) {
          await checkNetwork(web3Provider);
        }
      }

      localStorage.setItem('walletConnected', 'true');
      return true;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsScrollNetwork_(false);
    localStorage.removeItem('walletConnected');
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = async (newChainId) => {
      const chainIdDecimal = parseInt(newChainId, 16);
      setChainId(chainIdDecimal);
      setIsScrollNetwork_(isScrollNetwork(chainIdDecimal));

      if (provider) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        setProvider(newProvider);
        setSigner(newSigner);
      }
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [account, provider]);

  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('walletConnected');
      if (wasConnected === 'true' && window.ethereum) {
        await connectWallet();
      }
    };

    autoConnect();
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    error,
    isScrollNetwork: isScrollNetwork_,
    connectWallet,
    disconnectWallet,
    switchToScrollNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
