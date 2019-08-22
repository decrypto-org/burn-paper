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

    struct TxInclusion {
        bytes32 txIDRoot;
        uint txIndex;
        bytes32[] hashes;
    }

    struct Proof {
        BitcoinTransaction transaction;
        TxInclusion txInclusion;
    }

    function _encodeEvent(Event memory evt) private pure returns (bytes memory) {
        return abi.encodePacked(evt.receivingPKH, evt.amount, evt.txID);
    }

    mapping (bytes => bool) private finalizedEvents;

    function verifyEventProof(Event memory evt, Proof memory proof) public pure returns (bool) {
        require(Verifier.verifyTxRaw(
            proof.transaction.version,
            proof.transaction.vin,
            proof.transaction.vout,
            proof.transaction.locktime,
            evt.txID
        ), "tx raw verification");
        require(Verifier.verifyTxInclusion(
            evt.txID,
            proof.txInclusion.txIDRoot,
            proof.txInclusion.txIndex,
            proof.txInclusion.hashes
        ), "tx inclusion verification");
        return true;
    }

    function submitEventProof(Event memory evt, Proof memory proof) public {
        require(verifyEventProof(evt, proof), "proof must be valid");
        finalizedEvents[_encodeEvent(evt)] = true;
    }

    function eventExists(Event memory evt) public view returns (bool) {
        return finalizedEvents[_encodeEvent(evt)];
    }
}