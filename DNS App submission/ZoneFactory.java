/**
COMP3331 Computer Networks and Applications
Assignment - DNS Application
Written by Saron Mariathasan

This file contains the logic to create the DNS namespace from a given master 
file.
 */
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.File;

public class ZoneFactory {
    /**
     * Creates a namespace of DNSZones, starting from the root zone, given a
     * master file of RRs.
     * 
     * @param path  Relative path of master file, name 'master.txt'
     */
    public static DNSZone createSpace(String path) throws IOException {
        DNSZone rootZone = new DNSZone(".");
        try {
            BufferedReader master = new BufferedReader(new FileReader(new File(path)));
            String record;
            while ((record = master.readLine()) != null) {
                String[] recordSplit = record.split("[ ]+");
                doCreateSpace(record, recordSplit[0], rootZone);
            }
            master.close();
            return rootZone;
        } catch (FileNotFoundException e) {
            System.err.println("File '" + path + "' not found");
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Takes a RR string and adds it to corresponding DNSZone.
     * 
     * @param record        Resource record string.
     * @param domainName    Domain name in RR.
     * @param root          Root zone of namespace.
     */
    private static void doCreateSpace(String record, String domainName, DNSZone root) {
        // BASE CASE: record's domainName is the root zone '.'
        if (domainName.equals(root.getLabel())) {
            root.addRecord(record);
            return;
        }
        // BASE CASE: have reached bottom level domain in domainName
        else if (domainName.length() == 0) {
            root.addRecord(record);
            return;
        }
        // RECURSION: create new DNS Zone for each label in domainName, starting from
        // TLD to last (i.e. leftmost) label
        else {
            String[] labels = domainName.split("[.]");
            DNSZone subLevelDomain = root.addChildren(labels[labels.length - 1]);
            doCreateSpace(record,
                    domainName.substring(0, domainName.length() - (subLevelDomain.getLabel().length() + 1)),
                    subLevelDomain);
        }

    }
}
