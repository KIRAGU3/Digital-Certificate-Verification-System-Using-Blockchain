"use strict";

var Web3 = require('web3');

var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
web3.eth.getBlockNumber().then(console.log);
web3.eth.getBlockNumber().then(function (blockNumber) {
  return console.log("Latest Block:", blockNumber);
})["catch"](function (err) {
  return console.error("Error:", err);
});