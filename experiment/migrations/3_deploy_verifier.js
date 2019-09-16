const Verifier = artifacts.require("Verifier");
const BTCUtils = artifacts.require("BTCUtils");
const BytesLib = artifacts.require("BytesLib");
const SafeMath = artifacts.require("SafeMath");
const ValidateSPV = artifacts.require("ValidateSPV");
const Crosschain = artifacts.require("Crosschain");
const BurnedBTC = artifacts.require("BurnedBTC");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, [ValidateSPV]);
  deployer.deploy(BytesLib);
  deployer.link(BytesLib, [BTCUtils, ValidateSPV, Verifier]);
  deployer.deploy(BTCUtils);
  deployer.link(BTCUtils, [ValidateSPV, Verifier]);
  deployer.deploy(ValidateSPV);
  deployer.link(ValidateSPV, [Verifier]);
  deployer.deploy(Verifier);
  deployer.link(Verifier, [Crosschain, BurnedBTC]);
};
