# Exercise: Single byte XOR cipher (ciphering every byte in the plaintext with an encryption key, in
# this case, a single char)

# Method:
# xor input string with each char in english alphabet 
# decode the binary into str
# for each char in str, add it's frequency value to a running total
# repeat for all distinct letters in string and return string with highest total

def xor_decode():
    cipher_text_hex = input("Please enter the ciphertext in hex (no whitespace):")
    numBytes = len(cipher_text_hex) // 2
    # alphabet letters in descending order of frequency
    sorted_alphabet = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'd', 'l', 'c', 'u', 'm', 'w', 'f', 'g', 'y', 'p', 'b', 'v', 'k', 'j', 'x', 'q', 'z']
    maximum_score = 0
    str = ""
    
    for i in range(26):
        curr_total = 0
        # cipher text xor each letter of the alphabet
        result = int(cipher_text_hex, 16) ^ int.from_bytes(((sorted_alphabet[i]*numBytes).upper()).encode(), 'big')
        # decode the binary into str
        result_bytes = result.to_bytes(numBytes, 'big')
        if (result_bytes.isascii() == False):
            continue
        
        result_str = result_bytes.decode()
        # print("result_str is:", result_str)
        # for each char in str, add it's frequency value to a running total
        for char in result_str:
            if (char not in sorted_alphabet):
                continue
            curr_total += (26 - sorted_alphabet.index(char))
        if (curr_total > maximum_score):
            maximum_score = curr_total
            str = result_str
        # print("The plaintext string with key '", sorted_alphabet[i], "' is: ", result_str)

    print(str)


xor_decode()
