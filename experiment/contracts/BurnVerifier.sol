pragma solidity >=0.4.21 <0.6.0;

library BurnVerifier {
    function genBurnPKH(bytes memory tag) internal pure returns (bytes20) {
        bytes20 result = ripemd160(abi.encodePacked(sha256(tag)));
        result ^= hex"0000000000000000000000000000000000000001";
        return result;
    }
    function verifyBurn(bytes memory tag, bytes20 pkh) public pure returns (bool) {
        return genBurnPKH(tag) == pkh;
    }
}
