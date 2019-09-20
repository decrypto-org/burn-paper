pragma solidity >=0.4.21 <0.6.0;

import {BTCUtils} from "bitcoin-spv/contracts/BTCUtils.sol";
import {BytesLib} from "bitcoin-spv/contracts/BytesLib.sol";
import {ValidateSPV} from "bitcoin-spv/contracts/ValidateSPV.sol";

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
        return computedTxID == txID;
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
            uint256 actualAmount = output.extractValue();
            bytes memory actualRecipient = output.extractHash();
            if (actualAmount == amount && actualRecipient.equal(abi.encodePacked(recipient))) {
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

    function verifyTxInclusion(bytes32 txID, bytes32 txIDRoot, uint txIndex, bytes memory proof) public pure returns (bool) {
        return ValidateSPV.prove(txID, txIDRoot, proof, txIndex);
    }

    function mmrHashLeaf(bytes32 payload) internal pure returns (bytes32) {
        return sha256(abi.encodePacked(hex"00", payload));
    }

    function mmrHashInternal(bytes32 left, bytes32 right) internal pure returns (bytes32) {
        return sha256(abi.encodePacked(hex"01", left, right));
    }

    function verifyBlockConnection(
        bytes32 mmr,
        bytes32[] memory proofHashes,
        byte[] memory proofSides,
        bytes32 txIDRoot
    ) public pure returns (bool) {
        require(proofHashes.length == proofSides.length, "there should be one side for each hash");
        byte LEFT = hex"01";
        byte RIGHT = hex"02";
        bytes32 h = mmrHashLeaf(txIDRoot);
        for (uint i = 0; i < proofHashes.length; ++i) {
            bytes32 proofHash = proofHashes[i];
            if (proofSides[i] == LEFT) {
                h = mmrHashInternal(proofHash, h);
            }
            else if (proofSides[i] == RIGHT) {
                h = mmrHashInternal(h, proofHash);
            }
        }

        return h == mmr;
    }
}
