const Verifier = artifacts.require("Verifier");
const CrosschainMock = artifacts.require("CrosschainMock");

module.exports = function(deployer) {
  deployer.link(Verifier, [CrosschainMock]);
};