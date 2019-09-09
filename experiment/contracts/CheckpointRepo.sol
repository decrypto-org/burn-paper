pragma solidity >=0.4.21 <0.6.0;

contract CheckpointRepo {
  bytes32 public approvedMMR;
  address[] private federation;
  mapping(bytes32 => mapping(address => uint)) votesByMMRByMember;
  mapping(bytes32 => uint) votesByMMR;
  bytes32[] mmrsProposedDuringThisRound;

  function isFederationAddress(address _address) internal view returns (bool) {
    for (uint i = 0; i < federation.length; ++i) {
      if (federation[i] == _address) {
        return true;
      }
    }
    return false;
  }

  constructor(address[] memory _federation) public {
    federation = _federation;
  }

  function vote(bytes32 mmr) public {
    require(isFederationAddress(msg.sender), "only federation members can vote");
    require(votesByMMRByMember[mmr][msg.sender] == 0, "member has already voted for this mmr in this round");
    if (votesByMMR[mmr] == 0) {
      mmrsProposedDuringThisRound.push(mmr);
    }

    ++votesByMMRByMember[mmr][msg.sender];
    ++votesByMMR[mmr];
    if (votesByMMR[mmr] == federation.length/2 + 1) {
      approvedMMR = mmr;
      while (mmrsProposedDuringThisRound.length != 0) {
        bytes32 proposedMMR = mmrsProposedDuringThisRound[mmrsProposedDuringThisRound.length-1];
        mmrsProposedDuringThisRound.pop();
        delete votesByMMR[proposedMMR];
        for (uint j = 0; j < federation.length; ++j) {
          delete votesByMMRByMember[proposedMMR][federation[j]];
        }
      }
    }
  }
}
