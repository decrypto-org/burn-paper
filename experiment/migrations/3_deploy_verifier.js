const Verifier = artifacts.require("Verifier");
const BTCUtils = artifacts.require("BTCUtils");
const BytesLib = artifacts.require("BytesLib");

module.exports = function(deployer) {
  deployer.deploy(BytesLib);
  deployer.link(BytesLib, [BTCUtils, Verifier]);
  deployer.deploy(BTCUtils);
  deployer.link(BTCUtils, Verifier);
  deployer.deploy(Verifier);
};