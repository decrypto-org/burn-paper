pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

import {Crosschain} from "../Crosschain.sol";

contract CrosschainMock is Crosschain {
    bytes32 storedMMR;
    constructor(bytes32 _storedMMR) public {
        storedMMR = _storedMMR;
    }

    function getMMRRoot() public view returns (bytes32) {
        return storedMMR;
    }
}
