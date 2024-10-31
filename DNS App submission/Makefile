# Makefile for DNS application

# Compiler
JAVAC = javac

# Source and output directories
SRC_DIR = .
OUT_DIR = .

# Source files
SRC = Client.java Server.java DNSZone.java ResourceRecord.java ZoneFactory.java

# Default rule
all: $(SRC:.java=.class)

# Rule to compile .java files to .class files in the OUT_DIR
%.class: %.java
	$(JAVAC) -d $(OUT_DIR) $(SRC_DIR)/$<

# Clean rule to remove .class files
clean:
	rm -f *.class

.PHONY: all clean
