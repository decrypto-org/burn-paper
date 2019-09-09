import hashlib

def hash_by_algo(algo, b):
    h = hashlib.new(algo)
    h.update(b)
    return h.digest()

def sha256(b):
    return hash_by_algo('sha256', b)

def sha512(b):
    return hash_by_algo('sha512', b)

def ripemd160(b):
    return hash_by_algo('ripemd160', b)

def tag(b):
    pkh = ripemd160(sha256(b))
    return pkh[:-1] + (pkh[-1]^1).to_bytes(1, byteorder='little')

def main(t):
    if t[:2] == '0x':
        t = t[2:]
    print(tag(bytes.fromhex(t)).hex())

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('address', help='an ethereum address')
    args = parser.parse_args()
    main(args.address)
