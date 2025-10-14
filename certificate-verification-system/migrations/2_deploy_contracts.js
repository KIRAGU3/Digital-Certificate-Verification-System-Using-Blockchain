const CertificateVerification = artifacts.require("CertificateVerification");
const Web3 = require('web3');

module.exports = async function (deployer) {
  // Configure Web3
  const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8546'));

  // Deploy the contract
  await deployer.deploy(CertificateVerification);
};
