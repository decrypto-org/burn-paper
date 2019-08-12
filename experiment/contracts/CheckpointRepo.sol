pragma solidity >=0.4.21 <0.6.0;

contract CheckpointRepo {
  bytes32 public approvedMMR;

  function vote(bytes32 mmr) public {
    approvedMMR = mmr;
  }
}