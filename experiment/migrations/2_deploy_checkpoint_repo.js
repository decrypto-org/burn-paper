const CheckpointRepo = artifacts.require("CheckpointRepo");

module.exports = function(deployer) {
  deployer.deploy(CheckpointRepo);
};