const BurnedBTC = artifacts.require("BurnedBTC");
const BurnVerifier = artifacts.require("BurnVerifier");

module.exports = function(deployer) {
  deployer.deploy(BurnVerifier);
  deployer.link(BurnVerifier, [BurnedBTC]);
};