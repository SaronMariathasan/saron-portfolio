import aes_ecb_decryption
import random
import base64
import sys
import math

RAND_KEY = random.randbytes(16)
UNKNOWN_STRING = "Um9sbGluJyBpbiBteSA1LjAKV2l0aCBteSByYWctdG9wIGRvd24gc28gbXkgaGFpciBjYW4gYmxvdwpUaGUgZ2lybGllcyBvbiBzdGFuZGJ5IHdhdmluZyBqdXN0IHRvIHNheSBoaQpEaWQgeW91IHN0b3A/IE5vLCBJIGp1c3QgZHJvdmUgYnkK"
BLOCK_SIZE = 16
NUM_PADDED_BYTES = 6
HEX_TO_BYTES = 2


# This function takes pt bytes, appends an unknown sequence of bytes to it and returns the ciphertext in hex.
def ecb_rand_enc(pt: str):
    pt_bytes = bytes(pt, "utf-8") + base64.b64decode(UNKNOWN_STRING)

    return aes_ecb_decryption.aes_ecb_enc(pt_bytes, RAND_KEY, BLOCK_SIZE)


def ecb_rand_enc_bytes(pt: bytes):
    pt_bytes = pt + base64.b64decode(UNKNOWN_STRING)

    return aes_ecb_decryption.aes_ecb_enc(pt_bytes, RAND_KEY, BLOCK_SIZE)


def decode_unknown_str():
    # Determine the number of blocks in the unknown string (including padded block)
    unknown_str_ct = ecb_rand_enc("")
    num_blocks = len(unknown_str_ct) // (HEX_TO_BYTES * BLOCK_SIZE)
    decoded_str = ""

    for i in range(num_blocks):
        # Set initial input string length to be 16
        comparison_str_len = BLOCK_SIZE
        non_padded_block_len = 0

        # check if curr block is a padded block, to ensure only decoding non-padded bytes
        if i < (num_blocks - 1):
            non_padded_block_len = BLOCK_SIZE
        else:
            non_padded_block_len = BLOCK_SIZE - NUM_PADDED_BYTES

        # create comparison str
        for j in range(non_padded_block_len):
            comparison_str_len -= 1
            comparison_str_payload = "A" * comparison_str_len
            # feed input str to oracle and obtain i-th block of ct as comparison str
            comparison_str_ct = ecb_rand_enc(comparison_str_payload)[
                i * (HEX_TO_BYTES * BLOCK_SIZE) : (i + 1) * (HEX_TO_BYTES * BLOCK_SIZE)
            ]

            test_str = ""

            if i == 0:
                # if decoding first block, then test str payload is going consist of 'A's
                test_str += comparison_str_payload
                test_str += decoded_str
            else:
                # if decoding any other block, then test str payload should consist of decoded str charss
                test_str += decoded_str[-15:]
            # test each ascii character and compare test str ct with comparison str ct
            for k in range(128):
                test_str_payload = test_str + chr(k)
                # feed test input str to oracle and compare i-th block of ct output with comparison str
                test_str_ct = ecb_rand_enc(test_str_payload)[:32]
                if comparison_str_ct == test_str_ct:
                    decoded_str += chr(k)
                    break

    return decoded_str


# # Test case
print(decode_unknown_str())

""""
Algorithm to find unknown string:

Determine the number of blocks in the unknown string (including padded block)

Let unknown_str be an empty str

For i in range(num_blocks):
    Set initial input string length to be 16
    if block is a non-padded block:
        set num_bytes_to_decode to be 16
    else:
        set num_bytes_to_decode to be 10
    for j in range(num_bytes_to_decode):
        decrement input str len
        make an input str of the form A*(input str len)
        feed input str to oracle and obtain i-th block of ct as comparison str
        
        if (i=1):
            let test str be input str
        else:
            let test str be last 15 chars of unknown_str
        for k in range(128):
            append kth ascii char to test str
            feed test input str to oracle and compare i-th block of ct output with comparison str
            if strings match:
                append kth char to the unknown_string
                break the loopz


Above algorithm will only work for first block- will not work for subsequent blocks.

Better approach:
    after first block has been decoded using above method, have to start adding 'A's (instead of reducing them) to input str.
    So, our actual comparison strong (or 'input str', if we adopt the previous terminology) will be the last 15 bytes of the first block (instead of 15 bytes of 'A's.)
    E.g. if the first block is 'REALHOUSEWIVESNY', then our input str to decode the second block is 'A'*15. The output of this will be 'AAAA AAAA AAAA AAAR EALH OUSE WIVE SNY?'. 
    Then our test strings will be 'EALH OUSE WIVE SNYi', where i is an ascii character.

    This method also works for the padded block since it allows us to decode bytes from the start of the block instead of the end (where the padded bytes are). Therefore, we don't need
    to worry about the padded bytes

Algorithm:

"""
