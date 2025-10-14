require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

const { PRIVATE_KEY, INFURA_PROJECT_ID } = process.env;

module.exports = {
  networks: {
    // Local Ganache development network
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 5500000,
      networkCheckTimeout: 100000000,
      skipDryRun: true
    },

    // Polygon Mumbai testnet (optional)
    polygon_mumbai: {
      provider: () => new HDWalletProvider(
        PRIVATE_KEY,
        `https://polygon-mumbai.infura.io/v3/${INFURA_PROJECT_ID}`
      ),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
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
  }
};
