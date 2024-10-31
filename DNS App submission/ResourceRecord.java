/**
COMP3331 Computer Networks and Applications
Assignment - DNS Application
Written by Saron Mariathasan

This file contains the logic for the resouce records (RRs) generated from the 
master file.
 */
public class ResourceRecord {
    private String domainName;
    private String type;
    private String data;

    /**
     * Instantiate a RR.
     * 
     * @param domainName    Domain name of resource record.
     * @param type          RR type.
     * @param data          Value corresponding to record.
     */
    public ResourceRecord(String domainName, String type, String data) {
        this.domainName = domainName;
        this.type = type;
        this.data = data;
    }

    /**
     * Get domain name of resource record.
     * 
     */
    public String getDomainName() {
        return domainName;
    }

    /**
     * Get type of resource record.
     * 
     */
    public String getType() {
        return type;
    }

    /**
     * Get value of resource record.
     * 
     */
    public String getData() {
        return data;
    }

    /**
     * Print the qname, qtype and value of the RR.
     * 
     */
    @Override
    public String toString() {
        return domainName + "\t" + type + "\t" + data;
    }

}
