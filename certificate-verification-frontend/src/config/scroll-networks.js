export const SCROLL_NETWORKS = {
  SCROLL_SEPOLIA: {
    chainId: '0x8274F',
    chainIdDecimal: 534351,
    chainName: 'Scroll Sepolia Testnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia-rpc.scroll.io'],
    blockExplorerUrls: ['https://sepolia.scrollscan.com']
  },
  SCROLL_MAINNET: {
    chainId: '0x82750',
    chainIdDecimal: 534352,
    chainName: 'Scroll Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.scroll.io'],
    blockExplorerUrls: ['https://scrollscan.com']
  },
  GANACHE: {
    chainId: '0x539',
    chainIdDecimal: 1337,
    chainName: 'Ganache Local',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: []
  }
};

export const DEFAULT_NETWORK = SCROLL_NETWORKS.SCROLL_SEPOLIA;

export const getNetworkConfig = (chainId) => {
  const chainIdStr = typeof chainId === 'number' ? `0x${chainId.toString(16)}` : chainId;
  return Object.values(SCROLL_NETWORKS).find(network => network.chainId === chainIdStr);
};

export const isScrollNetwork = (chainId) => {
  return chainId === SCROLL_NETWORKS.SCROLL_SEPOLIA.chainIdDecimal ||
         chainId === SCROLL_NETWORKS.SCROLL_MAINNET.chainIdDecimal;
};
