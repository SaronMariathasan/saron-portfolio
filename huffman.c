// Implementation of the Huffman module
//
// Includes:
//  - Decoding of huffman encoded text
//  - Construction of huffman tree
//  - Encoding using a huffman tree
//
// mergeSort and merge functions adapted from UNSW Australia (2521 T323 W3 lecture slides)
// https://cgi.cse.unsw.edu.au/~cs2521/23T3/lectures/slides/week02mon-mergesort.pdf
//
// Author:
// Saron Mariathasan (z5419561@unsw.edu.au)
//
// Written: 09/10/2023


#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "Counter.h"
#include "File.h"
#include "huffman.h"

struct tokenEncoding {
    char *encoding;
    char token[MAX_TOKEN_LEN + 1];
};

static struct huffmanTree **itemToHuffmanTree(struct item *counterItemsArray,
                                              int numItems);
static struct huffmanTree *newHuffmanNode(char *token, int freq,
                                          struct huffmanTree *leftChild,
                                          struct huffmanTree *rightChild);
static void mergeSort(struct huffmanTree *items[], int lo, int hi);
static void merge(struct huffmanTree *items[], int lo, int mid, int hi);
static void counterItemsFree(struct item *counterItemsArray, int numItems);
static int bstHeight(struct huffmanTree *tree);
static struct tokenEncoding *encodeTreeTokens(
    struct huffmanTree *tree, struct tokenEncoding *tokenEncodingArray,
    char *currTokenEncoding, int encodingIndex, int *encodingArrayIndex);
static char *strConcat(char *encoding, char *tokenEncoding, int bytesEncoded);

// Task 1: Given a Huffman tree and the encoding, outputs the decoded text to a
// specified file. Uses a pre-written File ADT to read from and write to files. 
void decode(struct huffmanTree *tree, char *encoding, char *outputFilename) {
    File decoded_file = FileOpenToWrite(outputFilename);
    struct huffmanTree *curr_node = tree;
    //iterate through encoded string
    while (*encoding != '\0') {
        //traverse huffman tree according to encoding binary sequence
        if (*encoding == '0') {
            curr_node = curr_node->left;
        }
        if (*encoding == '1') {
            curr_node = curr_node->right;
        }
        //check if at a leaf node
        if ((curr_node->left == NULL) && (curr_node->right == NULL)) {
            FileWrite(decoded_file, curr_node->token);
            //Restart at root to decode next portion of encoding
            curr_node = tree;
        }
        encoding++;
    }
    FileClose(decoded_file);
}

/*
 Task 3: Given a text file, this function constructs a Huffman tree from the 
 tokens in the file. A File ADT is used to read tokens from the file and a Counter 
 ADT to count the number of occurrences of each token.
*/  
struct huffmanTree *createHuffmanTree(char *inputFilename) {
    File fileToEncode = FileOpenToRead(inputFilename);
    char buffer[MAX_TOKEN_LEN + 1];
    //Create new counter to store tokens read from text file
    Counter tokenCounter = CounterNew();
    //Read tokens from text file and add to counter
    while (FileReadToken(fileToEncode, buffer)) {
        CounterAdd(tokenCounter, buffer);
    }
    
    //Huffman Tree construction algorithm
    //1. Create a huffman tree leaf node for each token in counter. 
    int numItems = 0;
    // Use CounterItems operation to create array of huffmanTree nodes for each token
    struct item *counterTokensArray = CounterItems(tokenCounter, &numItems);
    // Helper function to convert struct in CounterItems output array to huffmanTree node
    struct huffmanTree **huffmanTreeArray =
        itemToHuffmanTree(counterTokensArray, numItems);
    // Sort huffmanTreeArray in ascending order of frequency
    mergeSort(huffmanTreeArray, 0, numItems - 1);
    
    //2. Join tokens with lowest frequencies
    int leftChildIndex = 0;
    int rightChildIndex = 1;

    while (leftChildIndex != (numItems - 1)) {
        int joinedNodeFreq = huffmanTreeArray[leftChildIndex]->freq +
                             huffmanTreeArray[rightChildIndex]->freq;
        // Replace right child of combined node with combined node in huffmanTree node array
        huffmanTreeArray[rightChildIndex] = newHuffmanNode(
            NULL, joinedNodeFreq, huffmanTreeArray[leftChildIndex],
            huffmanTreeArray[rightChildIndex]);

        // Remove left child of resulting node from Huffman node array
        huffmanTreeArray[leftChildIndex] = NULL;

        //re-sort huffman array after addition of joined 
        mergeSort(huffmanTreeArray, rightChildIndex, numItems - 1);

        //update index of next two nodes to be joined
        leftChildIndex++;
        rightChildIndex++;
    }
    //After joining, last node in huffmanTree node array will be root of huffmanTree 
    struct huffmanTree *root = huffmanTreeArray[leftChildIndex];
    huffmanTreeArray[leftChildIndex] = NULL;

    // Free malloc'd memory
    CounterFree(tokenCounter);
    counterItemsFree(counterTokensArray, numItems);
    free(huffmanTreeArray);
    FileClose(fileToEncode);
    return root;
}

/*
 Task 4: Given a Huffman tree and a text file, encode the text file. 
 Returns a string containing the encoding of the file.
 File ADT used to read tokens from the file.
*/
char *encode(struct huffmanTree *tree, char *inputFilename) {
    // Find height of tree to determine max len of a token encoding
    int MAX_ENCODING_LEN = bstHeight(tree);
    // String to store the current token's encoding
    char *tokenEncoding = (char *)malloc(sizeof(char) * (MAX_ENCODING_LEN + 1));
    if (tokenEncoding == NULL) {
        fprintf(stderr, "error: out of memory\n");
        exit(EXIT_FAILURE);
    }
    memset(tokenEncoding, 0, MAX_ENCODING_LEN);
    // Array to store each token and it's Huffman encoding
    struct tokenEncoding *tokenEncodingArray = NULL;
    //index to track position in token encoding array
    int *encodingArrayIndex = malloc(sizeof(int));
    *encodingArrayIndex = 0;
    
    // Traverse Huffman tree and store the encoding of each token in the array
    tokenEncodingArray = encodeTreeTokens(tree, tokenEncodingArray,
                                          tokenEncoding, 0, encodingArrayIndex);

    File fileToEncode = FileOpenToRead(inputFilename);
    char *encoding = (char *)malloc(sizeof(char));
    char buffer[MAX_TOKEN_LEN + 1];
    // Track the number of bytes of encoding to find end of encoding string
    int bytesEncoded = 0;
    int numTokensEncoded = 0;
    // Read each token from input file, obtain its encoding from tokenEncodingArray and add to output string
    while (FileReadToken(fileToEncode, buffer)) {
        //Find corresponding token encoding from tokenEncodingArray
        int i = 0;
        while (strcmp(buffer, tokenEncodingArray[i].token) != 0) i++;
        //add token encoding to output string
        encoding = (char *)realloc(encoding,
            (numTokensEncoded + 1) * MAX_ENCODING_LEN * sizeof(char) + 1); 
        if (encoding == NULL) {
            fprintf(stderr, "error: out of memory\n");
            exit(EXIT_FAILURE);
        }
        // Concatenate token encoding to file encoding
        encoding = strConcat(encoding, tokenEncodingArray[i].encoding, bytesEncoded);
        bytesEncoded += strlen(tokenEncodingArray[i].encoding);
        numTokensEncoded++;
    }
    encoding[bytesEncoded] = '\0';
    //free malloc'd memory
    free(tokenEncoding);
    for (int i = 0; i < *encodingArrayIndex; i++) {
        free(tokenEncodingArray[i].encoding);
    }
    free(tokenEncodingArray);
    free(encodingArrayIndex);
    FileClose(fileToEncode);
    return encoding;
}

/*
 Given array of tokens in a counter, create new array of pointers to 
 huffmanTree nodes. Each node will contain a copy of tokens from counter.
*/
static struct huffmanTree **itemToHuffmanTree(struct item *counterItemsArray,
                                              int numItems) {
    // Malloc memory for array of pointers
    struct huffmanTree **huffmanTreeArray =
        calloc(numItems, sizeof(struct huffmanTree *));
    if (huffmanTreeArray == NULL) {
        fprintf(stderr, "error: out of memory\n");
        exit(EXIT_FAILURE);
    }
    // Copy nodes from counterItemsArray to huffman node pointer array
    for (int i = 0; i < numItems; i++) {
        huffmanTreeArray[i] = newHuffmanNode(
            counterItemsArray[i].token, counterItemsArray[i].freq, NULL, NULL);
    }
    return huffmanTreeArray;
}

/*
 Create and initialise a new huffmanTree node
*/
static struct huffmanTree *newHuffmanNode(char *token, int freq,
                                          struct huffmanTree *leftChild,
                                          struct huffmanTree *rightChild) {
    struct huffmanTree *newNode = malloc(sizeof(struct huffmanTree));
    if (newNode == NULL) {
        fprintf(stderr, "error: out of memory\n");
        exit(EXIT_FAILURE);
    }
    // newNode function is called when joining two leaf nodes of huffman tree, so 
    // check if parent nodes have token values.
    if (token != NULL) {
        newNode->token = (char *)malloc(strlen(token) + 1);
        if (newNode->token == NULL) {
            fprintf(stderr, "error: out of memory\n");
            exit(EXIT_FAILURE);
        }
        strcpy(newNode->token, token);
    }
    // When joining two nodes for createHuffmanTree function, set token value to NULL
    if (token == NULL) {
        newNode->token = NULL;
    }
    newNode->freq = freq;
    newNode->left = leftChild;
    newNode->right = rightChild;
    return newNode;
}

// Merge Sort algorithm implementation, customised to sort an array of 
// Huffman tree nodes
static void mergeSort(struct huffmanTree *items[], int lo, int hi) {
    if (lo >= hi)
        return;
    int mid = (lo + hi) / 2;
    mergeSort(items, lo, mid);
    mergeSort(items, mid + 1, hi);
    merge(items, lo, mid, hi);
}

static void merge(struct huffmanTree *items[], int lo, int mid, int hi) {
    struct huffmanTree **tmp =
        malloc((hi - lo + 1) * sizeof(struct huffmanTree *));
    int i = lo, j = mid + 1, k = 0;
    // Scan both segments, copying to `tmp'.
    while (i <= mid && j <= hi) {
        if (items[i]->freq < items[j]->freq) {
            tmp[k++] = items[i++];
        } else {
            tmp[k++] = items[j++];
        }
    }
    // Copy items from unfinished segment.
    while (i <= mid) {
        tmp[k++] = items[i++];
    }
    while (j <= hi) {
        tmp[k++] = items[j++];
    }
    // Copy `tmp' back to main array.
    for (i = lo, k = 0; i <= hi; i++, k++) {
        items[i] = tmp[k];
    }
    free(tmp);
}

// Free an array output by CounterItems operation
static void counterItemsFree(struct item *counterItemsArray, int numItems) {
    for (int i = 0; i < numItems; i++) {
        free(counterItemsArray[i].token);
    }
    free(counterItemsArray);
}

// Find height of a bst
static int bstHeight(struct huffmanTree *tree) {
    // Base case: reached leaf node
    if ((tree->left == NULL) && (tree->right == NULL))
        return 0;

    // Recursive step: Find height of left substree
    int leftSubtreeHeight = bstHeight(tree->left) + 1;
    // Find height of left substree
    int rightSubtreeHeight = bstHeight(tree->right) + 1;
    //Returns larger height
    if (leftSubtreeHeight >= rightSubtreeHeight)
        return leftSubtreeHeight;
    return rightSubtreeHeight;
}


// Traverse Huffman tree and add encoding of each leaf node (token) to an array
static struct tokenEncoding *encodeTreeTokens(
    struct huffmanTree *tree, struct tokenEncoding *tokenEncodingArray,
    char *currTokenEncoding, int encodingIndex, int *encodingArrayIndex) {
    // Base case: Reached leaf node; add token and its encoding to an array of token encodings
    if (tree->left == NULL && tree->right == NULL) {
        currTokenEncoding[encodingIndex] = '\0';
        // Expand array containing token encodings to accomodate another current token
        tokenEncodingArray = (struct tokenEncoding *)realloc(tokenEncodingArray,
            (*encodingArrayIndex + 1) * sizeof(struct tokenEncoding));
        if (tokenEncodingArray == NULL) {
            fprintf(stderr, "error: out of memory\n");
            exit(EXIT_FAILURE);
        }
        // Copy token and its encoding into tokenEncoding array
        strcpy(tokenEncodingArray[*encodingArrayIndex].token, tree->token);
        tokenEncodingArray[*encodingArrayIndex].encoding =
            (char *)malloc(sizeof(char) * (strlen(currTokenEncoding) + 1));
        strcpy(tokenEncodingArray[*encodingArrayIndex].encoding, currTokenEncoding);
        (*encodingArrayIndex)++;
        // Replace null terminator at end of tokenEncoding string to be random value
        currTokenEncoding[encodingIndex] = '2';
        return tokenEncodingArray;
    }
    //Encode leaf nodes on left subtree
    currTokenEncoding[encodingIndex] = '0';
    tokenEncodingArray = encodeTreeTokens(tree->left, tokenEncodingArray, currTokenEncoding,
                         encodingIndex + 1, encodingArrayIndex);
    //Encode leaf nodes on right subtree
    currTokenEncoding[encodingIndex] = '1';
    tokenEncodingArray = encodeTreeTokens(tree->right, tokenEncodingArray, currTokenEncoding,
                         encodingIndex + 1, encodingArrayIndex);
    return tokenEncodingArray;
}

// Concatenate two strings
static char *strConcat(char *encoding, char *tokenEncoding, int bytesEncoded) {
    char *concatStart = &(encoding[bytesEncoded]);
    strcpy(concatStart, tokenEncoding);
    return encoding;
}