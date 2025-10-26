const NFTReward = artifacts.require("NFTReward");

module.exports = function (deployer) {
  deployer.deploy(NFTReward);
};
