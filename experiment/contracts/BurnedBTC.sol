pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

import {Crosschain} from "./Crosschain.sol";
import {CheckpointRepo} from "./CheckpointRepo.sol";
import {BurnVerifier} from "./BurnVerifier.sol";

contract BurnedBTC is Crosschain {
    CheckpointRepo checkpointContract;

    constructor(address checkpointContractAddress) public {
        checkpointContract = CheckpointRepo(checkpointContractAddress);
    }

    mapping (address => uint256) private _balances;

    function getMMRRoot() public view returns (bytes32) {
        return checkpointContract.approvedMMR();
    }

    function balanceOf(address addr) public view returns (uint256) {
        return _balances[addr];
    }

    function claim(Event memory e, address claimer) public {
        require(eventExists(e),
            "the event of the claim should already be proven via submitEventProof");
        require(BurnVerifier.verifyBurn(abi.encodePacked(claimer), e.receivingPKH),
            "the burn should be addressed to the claimer");
        _balances[claimer] += e.amount;
    }
}