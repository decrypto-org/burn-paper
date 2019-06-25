import ECDSA;
import BTC;
import Merkle;

const uint N;
const uint FEDERATION_MAJORITY = floor(N/2) + 1;
const address[N] federation;
const uint CONVERSION_RATE;

struct RelayMessage {
  bytes32 coinGenesis;
  bytes32 blockHash;
  RelayMessageAuthentication[FEDERATION_MAJORITY] auth;
};

struct RelayMessageAuthentication {
  bytes32 sig;
  uint32 id;
};

struct RemoteBlockHeader {
  bytes32 MTR;
  bytes32 previd;
  string rest;
};

struct BurnTX {
  string burnaddr;
  uint value;
  string rawtx;
};

contract Burn {
  mapping(bytes32 => bytes32[]) remoteChain;
  bytes32[] spent;

  function requestRelay(bytes32 coinGenesis, bytes32 txid) {
    // Request that the burn transaction is relayed by the federation
    emit RequestRelay(coinGenesis, txid);
  }

  function relayRemoteBlockchain(RelayMessage message) {
    bytes32 hash = SHA256(encode(message.coinGenesis, message.block));

    for (uint i = 0; i < FEDERATION_MAJORITY; i++) {
      bytes32 auth = message.auth[i];
      address addr = ECDSA.recover(hash, auth.sig)
      if (i > 0) {
        // Ensure signatures are unique
        require(message.auth[i].idx > message.auth[i - 1].idx);
      }
      // Ensure party signed-off relay
      require(addr == federation[auth.idx]);
    }

    // Store remote chain checkpoint
    remoteChain[message.coinGenesis].push(message.block);
  }

  function recv(
    bytes32 coinGenesis,
    BurnTX burntx,
    RemoteBlockHeader[] chain,
    bytes32 childIdx,
    bytes32[] MTP,
    address beneficiary
  ) {
    // Verify claimed blockheader has been relayed
    require(chain[chain.length - 1] == remoteChain[coinGenesis][childIdx]);

    // Require remote confirmation
    require(chain.length >= 15);

    // Require block inclusion in subchain
    require(SHA256(blockheader) == chain[0]);

    // Verify remote chain ancestry
    for (uint i = 0; i < chain.length - 1; i++) {
      require(SHA256(chain[i]) == chain[i + 1].previd);
    }
    bytes32 burntxid = SHA256(burntx);

    // Avoid replays
    for (uint i = 0; i < spent.length; i++) {
      require(spent[i] != burntxid);
    }

    // Ensure burn tx has been included in block
    require(Merkle.Verify(chain[0].MTR, MTP, burntxid));

    // Ensure the claimed value is the one burned
    require(BTC.checkValueSent(burntx.rawtx, burntx.burnaddr, burntx.value);

    // Validate proof of unspendability
    string perturbatedBeneficiary = RIPEMD160(SHA256(beneficiary)) ^ 0x01;
    string remoteAddr = BTC.base58check(0x01 + perturbatedBeneficiary);
    require(remoteAddr == burntx.burnaddr);

    // Record burn tx as spent
    spent.push(burntxid);

    // Issue dust
    beneficiary.send(CONVERSION_RATE * burntx.value);
  }
}
