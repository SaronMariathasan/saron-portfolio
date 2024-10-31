/**
COMP3331 Computer Networks and Applications
Assignment - DNS Application
Written by Saron Mariathasan

This file contains the logic for DNSZones in the namespace generated from
the provided master file. A DNSZone consists of a label, resource records (RRs)
and child zones. 
 */
import java.io.IOException;
import java.util.ArrayList;
import java.util.stream.Collectors;

public class DNSZone {
    private String label;
    private ArrayList<ResourceRecord> records = new ArrayList<>();
    private ArrayList<DNSZone> children = new ArrayList<>();
    
    /**
     * Instantiate a DNSZone.
     * 
     * @param label    Label of the DNS Zone.
     */
    public DNSZone(String label) {
        this.label = label;
    }

    /**
     * Given an RR string, stores the RR object in this zone.
     * 
     * @param record    The resource record string to be stored at this zone.
     */
    public void addRecord(String record) {
        String[] recordSplit = record.split("[ ]+");
        records.add(new ResourceRecord(recordSplit[0], recordSplit[1], recordSplit[2]));
    }

    /**
     * Given a zone label, adds it as a child of the current zone.
     * 
     * @param childLabel The label of the child of the current zone.
     */
    public DNSZone addChildren(String childLabel) {
        // check if child already exists
        for (DNSZone c : children) {
            if (c.getLabel().equals(childLabel)) {
                return c;
            }
        }
        DNSZone child = new DNSZone(childLabel);
        children.add(child);
        return child;
    }

    /**
     * Queries the current zone for a given qname and qtype. If zone label 
     * matches entire qname, then return records from the current zone. 
     * Otherwise, recursively query children of the current zone, truncating the
     * zone label from the qname at each recursion.
     * 
     * @param qname Query name.
     * @param qtype Query type.
     */
    public ArrayList<ResourceRecord> query(String qname, String qtype) {
        ArrayList<ResourceRecord> response;
        if (qname.endsWith(label)) {
            // if qname is for parent node
            if (qname.length() == label.length()) {
                response = records;
                // check if RRs contain same qtype
                response.stream().filter(r -> r.getType().equals(qtype)).collect(Collectors.toList());
                if (response.size() == 0) {
                    response = records;
                    // if CNAME record exists and type != CNAME, recursive query on CNAME record
                    response.stream().filter(r -> r.getType().equals("CNAME")).collect(Collectors.toList());
                }
                return response;
            }
            // if qname contains other lower-level labels
            else {
                for (DNSZone child : children) {
                    String subqueryName;
                    if (label.equals(".")) {
                        subqueryName = qname.substring(0, qname.length() - label.length());
                    } else {
                        subqueryName = qname.substring(0, qname.length() - (label.length() + 1));
                    }
                    response = child
                            .query(subqueryName, qtype);
                    if (response.size() != 0) {
                        return response;
                    }
                }
            }
        }
        return new ArrayList<>();
    }

    /**
     * Return this zone's label.
     */
    public String getLabel() {
        return label;
    }

    /**
     * Return RRs stored at this zone.
     */
    public ArrayList<ResourceRecord> getRecords() {
        return records;
    }

}