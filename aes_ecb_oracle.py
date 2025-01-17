import secrets
import random


# Returns random 16-byte key for AES symmetric encryption
def rand_aes_key():
    return secrets.token_bytes(16)


""" 
This function encrypts a given input using AES in either ECB or CBC mode (each have equal probability of being encryption mode).
Prior to encryption, the function prepends 5-10 bytes to the plaintext and appends 5-10 bytes as well.

Generate random AES key
prepend and append random bytes
Randomise the mode to use
encrypt plaintext 
 """
import sys
import cbc_decrypt
import aes_ecb_decryption
import base64
import detect_ecb_in_aes


def encryption_oracle(plaintext: str, block_size: int):
    key = rand_aes_key()
    pt_bytes = bytearray(plaintext, "utf-8")

    # Prepend 5-10 bytes
    prepended_bytes = bytearray(random.randbytes(random.randint(5, 10)))
    prepended_bytes.extend(pt_bytes)
    pt_bytes = prepended_bytes

    # Append 5-10 bytes
    appended_bytes = bytearray(random.randbytes(random.randint(5, 10)))
    pt_bytes.extend(appended_bytes)

    # Randomise encryption mode
    mode = random.randrange(2)
    print("mode is", mode)

    if mode:
        # ecb encryption
        return aes_ecb_decryption.aes_ecb_enc(pt_bytes, key, block_size)
    else:
        # cbc encryption
        iv = random.randbytes(block_size)
        ct_b64 = cbc_decrypt.do_CBC_encrypt(pt_bytes, key, iv, block_size)
        return base64.b64decode(ct_b64).hex()


def decryption_oracle(ct_hex: str):
    if detect_ecb_in_aes.ecb_detector(ct_hex):
        print("The ciphertext is encoded in ECB")
    else:
        print("The ciphertext is NOT encoded in ECB")


# Test encryption oracle
try:
    with open("11_test.txt", encoding="utf-8-sig") as in_fp:
        pt = in_fp.read()
        ct = encryption_oracle(pt, 16)
        print(ct)
        decryption_oracle(ct)
except FileNotFoundError:
    sys.exit("Input file does not exist.")
