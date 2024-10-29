# Exercise: Single byte XOR cipher (ciphering every byte in the plaintext with an encryption key, in
# this case, a single char)

# xor_decode()

def xor_decode(cipher_text_hex: str):
    numBytes = len(cipher_text_hex) // 2
    
    # alphabet letters in descending order of frequency
    possible_keys = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'd', 'l', 'c', 'u', 'm', 'w', 'f', 'g', 'y', 'p', 'b', 'v', 'k', 'j', 'x', 'q', 'z', ' ']
    sorted_alphabet = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'd', 'l', 'c', 'u', 'm', 'w', 'f', 'g', 'y', 'p', 'b', 'v', 'k', 'j', 'x', 'q', 'z']
    
    maximum_score = 0
    str = ""
    key = ''
    
    for i in range(27):
        curr_total = 0
        # cipher text xor each letter of the alphabet
        result = int(cipher_text_hex, 16) ^ int.from_bytes(((possible_keys[i]*numBytes).lower()).encode(), 'big')
        
        # decode the binary into str
        result_bytes = result.to_bytes(numBytes, 'big')
        
        if (result_bytes.isascii() == False):
            continue
        
        result_str = result_bytes.decode()
        # for each char in str, add it's frequency value to a running total
        
        for char in result_str:
            char = char.lower()
            
            if (char not in sorted_alphabet):
                continue
            curr_total += (26 - sorted_alphabet.index(char))
        
        if (curr_total > maximum_score):
            maximum_score = curr_total
            str = result_str
            key = possible_keys[i]

    return key


