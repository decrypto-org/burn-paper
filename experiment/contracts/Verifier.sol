pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

import {BTCUtils} from "./bitcoin-spv/BTCUtils.sol";
import {BytesLib} from "./bitcoin-spv/BytesLib.sol";

library Verifier {
    using BytesLib for bytes;
    using BTCUtils for bytes;

    function verifyTxRaw(bytes memory raw, bytes32 txID) public pure returns (bool) {
        return abi.encodePacked(raw.hash256()).reverseEndianness().toBytes32() == txID;
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

    function verifyTx(bytes memory raw, uint256 amount, string memory receivingAddress, bytes32 txID) public pure returns (bool) {
        return verifyTxRaw(raw, txID);
    }
}