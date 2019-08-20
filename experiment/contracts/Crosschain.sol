pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

import {Verifier} from "./Verifier.sol";

contract Crosschain {
    struct Event {
        bytes32 receivingPKH;
        uint256 amount;
        bytes32 txID;
    }

    struct BitcoinTransaction {
        bytes4 version;
        bytes vin;
        bytes vout;
        bytes4 locktime;
    }

    struct Proof {
        BitcoinTransaction transaction;
    }

    function _encodeEvent(Event memory evt) private pure returns (bytes memory) {
        return abi.encodePacked(evt.receivingPKH, evt.amount, evt.txID);
    }

    mapping (bytes => bool) private finalizedEvents;

    function submitEventProof(Event memory evt, Proof memory) public {
        finalizedEvents[_encodeEvent(evt)] = true;
    }

    function eventExists(Event memory evt) public view returns (bool) {
        return finalizedEvents[_encodeEvent(evt)];
    }
}