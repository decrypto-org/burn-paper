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

    struct BlockConnection {
        bytes32[] hashes;
        bytes1[] sides;
    }

    struct Proof {
        BitcoinTransaction transaction;
        TxInclusion txInclusion;
        BlockConnection blockConnection;
    }

    function _encodeEvent(Event memory evt) private pure returns (bytes memory) {
        return abi.encodePacked(evt.receivingPKH, evt.amount, evt.txID);
    }

    mapping (bytes => bool) private finalizedEvents;

    function getMMRRoot() public view returns (bytes32);

    function verifyEventProof(Event memory evt, Proof memory proof) public view returns (bool) {
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

        require(Verifier.verifyBlockConnection(
            getMMRRoot(),
            proof.blockConnection.hashes,
            proof.blockConnection.sides,
            proof.txInclusion.txIDRoot
        ), "block connection verification");
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