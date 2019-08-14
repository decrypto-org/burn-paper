pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

contract BurnedBTC {
    struct Event {
        bytes32 receivingAddress;
        uint256 amount;
        bytes32 txID;
    }

    mapping (address => uint256) private _balances;

    function balanceOf(address addr) public view returns (uint256) {
        return _balances[addr];
    }

    function claim(Event memory e) public {
        _balances[msg.sender] += e.amount;
    }
}