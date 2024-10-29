# Written by Saron Mariathasan

import base64
import math
import xor_cipher

def edit_distance(bytes1: bytes, bytes2: bytes):
    xor_result = int.from_bytes(bytes1, "big") ^ int.from_bytes(bytes2, "big")
    return xor_result.bit_count()

# Decrypts ciphertext encoded in base 64

def decoder(ciphertext: str):
    # Convert b64 to bytes
    ciphertext_bytes = base64.b64decode(ciphertext)
    ciphertext_len = len(ciphertext_bytes)

    #Determine likely keysize
    likely_keysize_1 = math.inf
    min_edit_dist = math.inf
    
    for keysize in range(2,41):
        num_blocks = ciphertext_len // keysize
        
        if (num_blocks % 2 != 0):
            num_blocks -= 1
        
        edit_dist_running_total = 0.0

        for i in range(0,num_blocks,2):
            edit_dist = edit_distance(ciphertext_bytes[i*keysize:(i+1)*keysize], ciphertext_bytes[(i+1)*keysize:(i+2)*keysize]) / keysize
            edit_dist_running_total += edit_dist
        
        avg_edit_dist = edit_dist_running_total / (num_blocks / 2)
        
        if (avg_edit_dist < min_edit_dist):
            likely_keysize_1 = keysize
            min_edit_dist = avg_edit_dist

    key = ""
    # obtain every nth byte for the ciphertext for n = likely_keysize, starting from byte 0, 1, 2, ... (n-1)
    for i in range(likely_keysize_1):
        transposed_block = ciphertext_bytes[i:ciphertext_len:likely_keysize_1]
        print(transposed_block.hex())
        key += xor_cipher.xor_decode(transposed_block.hex())
    
    print(key)

# Test case

fp = open('6.txt', 'r', encoding='utf-8-sig')
ciphetext64 = fp.read()
# print(ciphetext64[1:])
print(decoder(ciphetext64))
# decoder(ciphetext64)
fp.close()