""" 
AES-128-ECB decryption algorithm
Input: input file for aes-128 ciphertext in b64, output file name, plaintext key
Ouput: null

create output file in write mode
read input file and get ciphertext
Convert base64 ciphertext to bytes
Pad ciphertext bytes (with null terminators??) until length is multiple of 16
Get the num of 16-byte blocks in ciphertext
For each 16-byte block in the ciphertext:
    call aes-128 func from openssl lib and pass block and key as params
    append output to out file
"""

import sys
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import pkcs_padding


def aes_ecb_enc(plaintext: bytes, key: bytes, block_size: int):
    # Initialise AES cipher context
    cipher = Cipher(algorithms.AES(key), modes.ECB())
    encryptor = cipher.encryptor()

    # pad plaintext bytes
    padded_pt = pkcs_padding.do_PKCS7_padding(plaintext, block_size)

    return encryptor.update(padded_pt).hex() + encryptor.finalize().hex()


def aes_ecb_dec(ciphertext: bytes, key: bytes):
    # Initialise AES cipher context
    cipher = Cipher(algorithms.AES(key), modes.ECB())
    decryptor = cipher.decryptor()

    return decryptor.update(ciphertext).decode() + decryptor.finalize().decode()


# if len(sys.argv) < 4:
#     print(
#         "Usage: aes_ecb_decryption.py <input file> <output file name> <plaintext key>"
#     )
#     sys.exit("Insufficient command line arguments")

# # open input file and read ciphertext
# try:
#     with open(str(sys.argv[1]), "r", encoding="utf-8-sig") as in_fp:
#         ciphertext_b64 = in_fp.read()
#         ciphertext_bytes = base64.b64decode(ciphertext_b64)
# except OSError:
#     sys.exit(sys.argv[1], "does not exist")


# # read key
# key = bytes(sys.argv[3], "utf-8")
# print(key)

# cipher = Cipher(algorithms.AES(key), modes.ECB())
# decryptor = cipher.decryptor()
# plaintext = decryptor.update(ciphertext_bytes)
# plaintext += decryptor.finalize()

# # create output file
# try:
#     with open(str(sys.argv[2]), "w") as out_fp:
#         out_fp.write(plaintext.decode())
# except BaseException:
#     sys.exit("Output file could not be created")
