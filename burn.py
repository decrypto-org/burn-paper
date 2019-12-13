import os
import hashlib

def sha256(data):
    digest = hashlib.new("sha256")
    digest.update(data)
    return digest.digest()


def ripemd160(x):
    d = hashlib.new("ripemd160")
    d.update(x)
    return d.digest()


def b58(data):
    B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

    if data[0] == 0:
        return "1" + b58(data[1:])

    x = sum([v * (256 ** i) for i, v in enumerate(data[::-1])])
    ret = ""
    while x > 0:
        ret = B58[x % 58] + ret
        x = x // 58

    return ret


def genBurnAddr(tag):
    hash160 = bytearray(ripemd160(sha256(tag.encode())))
    hash160[-1] ^= 0x01
    address = b"\x00" + hash160

    address = b58(address + sha256(sha256(address))[:4])
    return address


print("Address: " + genBurnAddr("ALGOHOLICS"))
