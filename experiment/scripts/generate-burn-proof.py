import hashlib
from bitcoin.core import b2x, lx, COIN, CMutableTxOut, CMutableTxIn, CMutableTransaction, CBlock
from bitcoin.wallet import P2PKHBitcoinAddress

receiver_pkh = bytes.fromhex('346753e81b93e3f1567a16f3009c7c65c768d865')
print('receiver_pkh: "%s"' % receiver_pkh.hex())
receiver = P2PKHBitcoinAddress.from_bytes(receiver_pkh)
tx = CMutableTransaction()

tx.vin.append(CMutableTxIn())
tx.vout.append(CMutableTxOut(10, receiver.to_scriptPubKey()))
print('tx: "%s"' % tx.serialize().hex())

print('txid: "%s"' % tx.GetTxid().hex())

blk = CBlock(vtx=[tx])
blk_mtr = blk.calc_merkle_root()
print('block_mtr: "%s"' % blk_mtr.hex())

mmr = hashlib.sha256(b'\x00'+blk_mtr).digest()
print('mmr: "%s"' % mmr.hex())
