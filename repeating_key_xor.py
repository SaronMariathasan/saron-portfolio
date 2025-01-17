import io

def repeating_key_xor_encoder(plaintext: str, key: str):
    curr_key_byte = 0
    ciphertext = ""

    for char in plaintext:
        cipher_byte = int.from_bytes(char.encode(), 'big') ^ int.from_bytes(key[curr_key_byte].encode(), 'big')
        ciphertext += cipher_byte.to_bytes(1, 'big').hex()
        curr_key_byte = (curr_key_byte + 1) % len(key)
    
    return ciphertext

# plaintext = "Burning 'em, if you ain't quick and nimble\nI go crazy when I hear a cymbal"
# print("Ciphertext:", repeating_key_xor_encoder(plaintext, "ICE"))
# print("stringcmp:", repeating_key_xor_encoder(plaintext, "ICE") in "0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f")


essay_file = open("heated.txt", "r", encoding='utf-8-sig')
text = essay_file.read()
# Have to remove BOM (Byte Order Mark) metadata from start of read-in string- already removed by providing encoding in line 19
print(repeating_key_xor_encoder(text, "beyonceisqueen"))

essay_file.close()