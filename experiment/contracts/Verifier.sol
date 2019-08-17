pragma solidity >=0.4.21 <0.6.0;

import {BTCUtils} from "./bitcoin-spv/BTCUtils.sol";
import {BytesLib} from "./bitcoin-spv/BytesLib.sol";
import {ValidateSPV} from "./bitcoin-spv/ValidateSPV.sol";

library Verifier {
    using BytesLib for bytes;
    using BTCUtils for bytes;

    function verifyTxRaw(
        bytes4 version,
        bytes memory vin,
        bytes memory vout,
        bytes4 locktime,
        bytes32 txID
    ) public pure returns (bool) {
        bytes32 computedTxID = abi.encodePacked(version, vin, vout, locktime).hash256();
        return abi.encodePacked(computedTxID).reverseEndianness().toBytes32() == txID;
    }

    function extractNumOutputs(bytes memory vout) public pure returns (uint8) {
        uint8 len = uint8(vout[0]);
        require(len < 0xfd, "Multi-byte VarInts not supported");
        return len;
    }

    function verifyVoutIsValueTransfer(bytes memory vout, uint256 amount, bytes20 recipient) public pure returns (bool) {
        uint8 numOutputs = extractNumOutputs(vout);
        for (uint8 i = 0; i < numOutputs; ++i) {
            bytes memory output = vout.extractOutputAtIndex(i);
            bytes memory actualRecipient = output.extractHash();
            if (output.extractValue() == amount && actualRecipient.equal(abi.encodePacked(recipient))) {
                return true;
            }
        }
        return false;
    }

    function verifyTx(
        bytes4 version,
        bytes memory vin,
        bytes memory vout,
        bytes4 locktime,
        uint256 amount,
        bytes20 receivingPKH,
        bytes32 txID
    ) public pure returns (bool) {
        return verifyTxRaw(
            version,
            vin,
            vout,
            locktime,
            txID
        ) && verifyVoutIsValueTransfer(vout, amount, receivingPKH);
    }

    function reverseEndianness32(bytes32 b) internal pure returns (bytes32) {
        return abi.encodePacked(b).reverseEndianness().toBytes32();
    }

    function verifyTxInclusion(bytes32 txID, bytes32 txIDRoot, uint txIndex, bytes32[] memory proof) public pure returns (bool) {
        // TODO: ensure the user sends LE to be efficient
        bytes32 _txID = reverseEndianness32(txID);
        bytes32 _txIDRoot = reverseEndianness32(txIDRoot);
        // TODO: ensure the user sends the proof pre concatenated to be efficient
        bytes memory _proof = hex"";
        for (uint i = 0; i < proof.length; ++i) {
            _proof = abi.encodePacked(_proof, proof[i]);
        }
        return ValidateSPV.prove(_txID, _txIDRoot, _proof, txIndex);
    }
}