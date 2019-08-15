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

    function verifyTx(bytes memory raw, uint256 amount, string memory receivingAddress, bytes32 txID) public pure returns (bool) {
        return true;
    }
}