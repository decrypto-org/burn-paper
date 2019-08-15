pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

import {Crosschain} from "./Crosschain.sol";
import {CheckpointRepo} from "./CheckpointRepo.sol";

contract BurnedBTC is Crosschain {
    CheckpointRepo checkpointContract;

    constructor(address checkpointContractAddress) public {
        checkpointContract = CheckpointRepo(checkpointContractAddress);
    }

    mapping (address => uint256) private _balances;

    function balanceOf(address addr) public view returns (uint256) {
        return _balances[addr];
    }

    function claim(Event memory e) public {
        _balances[msg.sender] += e.amount;
    }
}