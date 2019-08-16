import struct

class PoppableBytes:
    def __init__(self, b):
        self.marker = 0
        self.b = b
    def pop(self, much):
        self.marker += much
        if self.marker > len(self.b):
            raise
        return self.b[self.marker-much:self.marker]
    def peek(self, much):
        return self.b[self.marker:self.marker+much]

def bytes_to_i32(b):
    return struct.unpack("<i", b)[0]

def byte_to_u8(b):
    return struct.unpack("<B", b)[0]

def bytes_to_u16(b):
    return struct.unpack("<H", b)[0]

def bytes_to_u32(b):
    return struct.unpack("<I", b)[0]

def bytes_to_u64(b):
    return struct.unpack("<Q", b)[0]

def pop_varint(b):
    first_byte = byte_to_u8(b.pop(1))
    if first_byte < 0xfd:
        return first_byte
    elif first_byte == 0xfd:
        return bytes_to_u16(b.pop(2))
    elif first_byte == 0xfe:
        return bytes_to_u32(b.pop(4))
    elif first_byte == 0xff:
        return bytes_to_u64(b.pop(8))
    else:
        raise

def pop_txin(tx):
    txid = tx.pop(32)[::-1].hex()
    txout_index = bytes_to_u32(tx.pop(4))
    script_sig_len = pop_varint(tx)
    script_sig = tx.pop(script_sig_len).hex()
    sequence_no = tx.pop(4).hex()
    return {'txid': txid, 'txout_index': txout_index, 'script_sig': script_sig, 'sequence_no': sequence_no}

def pop_txout(tx):
    value = bytes_to_u64(tx.pop(8))
    script_pubkey_len = pop_varint(tx)
    script_pubkey = tx.pop(script_pubkey_len).hex()
    return {'value': value, 'script_pubkey': script_pubkey}

def pop_stack_item(b):
    l = pop_varint(b)
    return b.pop(l)

def pop_witness(tx):
    witness_len = pop_varint(tx)
    if witness_len == 0:
        return None
    else:
        return pop_stack_item(tx)

def pop_txins(tx):
    txin_len = pop_varint(tx)
    return [pop_txin(tx) for _ in range(txin_len)]

def pop_txouts(tx):
    txout_len = pop_varint(tx)
    return [pop_txout(tx) for _ in range(txout_len)]

def pop_witness_flag(tx):
    flag = tx.peek(2)
    contains_witness = False
    if flag == b"\x00\x01":
        contains_witness = True
        tx.pop(2)
    return contains_witness

def pop_witnesses(tx, n):
    return [pop_witness(tx).hex() for _ in range(n)]

def pop_version(tx):
    return bytes_to_i32(tx.pop(4))

def parse_tx(tx):
    tx = PoppableBytes(tx)
    version = pop_version(tx)
    contains_witness = pop_witness_flag(tx)
    txins = pop_txins(tx)
    txouts = pop_txouts(tx)

    result = {'version': version, 'txins': txins, 'txouts': txouts}
    if contains_witness:
        witnesses = pop_witnesses(tx, len(txins))
        result = {**result, 'witnesses': witnesses}
    return result

def main(tx_raw):
    print(parse_tx(bytes.fromhex(tx_raw)))

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('tx_raw')
    args = parser.parse_args()
    main(args.tx_raw)