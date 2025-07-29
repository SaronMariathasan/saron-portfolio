#include <stdio.h>
#include <dirent.h>
#include <sys/types.h>
#include <string.h>
#include <fcntl.h>
#include <sodium.h>
#include <stdlib.h>
#include <iostream>
using namespace std;
// CONSTANTS
#define MAX_FILE_LEN 2000
#define CHUNK_SIZE 4096
const unsigned char KEY[crypto_secretstream_xchacha20poly1305_KEYBYTES] = {0x6a, 0x07, 0xd3, 0x8a, 0x65, 0xbf, 0x14, 0xe8, 0x31, 0xb4, 0x25, 0xd0, 0xd1, 0x18, 0xc4, 0x22, 0xe5, 0xc9, 0xd5, 0x40, 0x29, 0x08, 0x44, 0x12, 0xe3, 0xf5, 0x2c, 0x1b, 0xc6, 0xe4, 0x1d, 0xa6};
// FUNC DEFN'S
int doDecryptDir(char dirname[], struct dirent *dp, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES]);
int decrypt(char *src_file, char *dest_file, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES]);

int main()
{
    char *target_folders[] = {"Documents", "Downloads", "Desktop"};
    if (sodium_init() != 0)
    {
        return 1;
    }
    // iterate through each target folder
    for (int i = 0; i < 3; ++i)
    {
        char dirname[MAX_FILE_LEN];
        snprintf(dirname, MAX_FILE_LEN, "%s/%s", getenv("HOME"), target_folders[i]);
        struct dirent *root;
        if (doDecryptDir(dirname, root, KEY) != 0)
        {
            return 1;
        }
    }
    return 0;
}

int doDecryptDir(char dirname[], struct dirent *dp, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES])
{
    // open curr dir
    DIR *dir = opendir(dirname);

    // print each file/subdirectory in the current dir
    while (dir)
    {
        dp = readdir(dir);
        // BASE CASE: reached end of subdirectory
        if (dp == NULL)
        {
            // printf("End or directory reached\n");
            closedir(dir);
            return 0;
        }
        // RECURSIVE CASE: print current file/dir in parent dir
        else
        {
            // decrypt file
            char *filename = dp->d_name;
            char filepath[MAX_FILE_LEN];
            char dec_file[MAX_FILE_LEN];
            snprintf(filepath, MAX_FILE_LEN, "%s/%s", dirname, filename);
            snprintf(dec_file, MAX_FILE_LEN, "%s.dec", filepath);

            if (strstr(filename, ".enc") != NULL)
            {
                if (decrypt(filepath, dec_file, key) != 0)
                {
                    return -1;
                }
            }
            // check if file or dir
            if (strchr(dp->d_name, (int)'.'))
            {
                continue;
            }
            char new_dirname[MAX_FILE_LEN];
            struct dirent *subdp = NULL;
            snprintf(new_dirname, MAX_FILE_LEN, "%s/%s", dirname, dp->d_name);
            doDecryptDir(new_dirname, subdp, key);
        }
    }
    closedir(dir);
}

int decrypt(char *src_file, char *dest_file, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES])
{
    // declare vars
    unsigned char buffer_in[CHUNK_SIZE + crypto_secretstream_xchacha20poly1305_ABYTES];
    unsigned char buffer_out[CHUNK_SIZE];
    unsigned char header[crypto_secretstream_xchacha20poly1305_HEADERBYTES];
    crypto_secretstream_xchacha20poly1305_state st;
    unsigned long long out_len;
    size_t rlen;
    int eof;
    unsigned char tag;

    // open pt file
    FILE *fd_s = fopen(src_file, "rb");
    FILE *fd_d = fopen(dest_file, "wb+");
    if (fd_s == NULL)
    {
        printf("Could not find file with path %s\n", src_file);
        return 1;
    }
    if (fd_d == NULL)
    {
        printf("Could not find file with path %s\n", dest_file);
        fclose(fd_s);
        return 1;
    }
    // read header from enc file
    fread(header, 1, sizeof header, fd_s);
    // initialise header
    if (crypto_secretstream_xchacha20poly1305_init_pull(&st, header, key) != 0)
    {
        printf("Error initialising the header of decrypted file\n");
        fclose(fd_d);
        fclose(fd_s);
        return -1;
    }
    do
    {
        // read pt bytes from source file
        rlen = fread(buffer_in, 1, sizeof buffer_in, fd_s);
        printf("Contents of decrypt buffer_in: %x\n", buffer_in);
        eof = feof(fd_s);
        // decrypt pt bytes
        if (crypto_secretstream_xchacha20poly1305_pull(&st, buffer_out, &out_len, &tag, buffer_in, rlen, NULL, 0) != 0)
        {
            printf("Error in decrypted file: corrupted bytes\n");
            fclose(fd_d);
            fclose(fd_s);
            return -1;
        }
        if (tag == crypto_secretstream_xchacha20poly1305_TAG_FINAL)
        {
            if (!eof)
            {
                printf("End of ciphertext stream reached before end of file\n");
                fclose(fd_d);
                fclose(fd_s);
                return -1;
            }
        }
        else
        {
            if (eof)
            {
                printf("End of file reached before end of ciphertext stream\n");
                fclose(fd_d);
                fclose(fd_s);
                return -1;
            }
        }
        // write encrypted text to out file
        fwrite(buffer_out, 1, (size_t)out_len, fd_d);
        printf("Contents of decrypt buffer_out: %x\n", buffer_out);
    } while (!eof);
    // close out file and delete src file
    fclose(fd_d);
    fclose(fd_s);
    remove(src_file);
    return 0;
}
