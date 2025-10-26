require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

const { PRIVATE_KEY, INFURA_PROJECT_ID, SCROLL_PRIVATE_KEY } = process.env;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 5500000,
      networkCheckTimeout: 100000000,
      skipDryRun: true
    },

    polygon_mumbai: {
      provider: () => new HDWalletProvider(
        PRIVATE_KEY,
        `https://polygon-mumbai.infura.io/v3/${INFURA_PROJECT_ID}`
      ),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    scroll_sepolia: {
      provider: () => new HDWalletProvider(
        SCROLL_PRIVATE_KEY || PRIVATE_KEY,
        'https://sepolia-rpc.scroll.io'
      ),
      network_id: 534351,
      gas: 5000000,
      gasPrice: 1000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 100000,
      deploymentPollingInterval: 8000
    },

    scroll_mainnet: {
      provider: () => new HDWalletProvider(
        SCROLL_PRIVATE_KEY || PRIVATE_KEY,
        'https://rpc.scroll.io'
      ),
      network_id: 534352,
      gas: 5000000,
      gasPrice: 1000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 100000,
      deploymentPollingInterval: 8000
    }
  },

  mocha: {
    timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.21",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  db: {
    enabled: false
  },

  plugins: ['truffle-plugin-verify'],

  api_keys: {
    scrollscan: process.env.SCROLLSCAN_API_KEY || ''
  }
};
