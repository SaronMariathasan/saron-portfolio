/**
COMP3331 Computer Networks and Applications
Assignment - DNS Application
Written by Saron Mariathasan

This file contains the server implementation for a DNS Application.

The server uses UDP to receive a DNS query packet from a client running on the 
localhost, executes the query on it's DNS cache and returns a response packet.
 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Date;
import java.util.Random;
import java.text.SimpleDateFormat;

public class Server {
    /**
     * Main server logic, including listening for query packets from client
     * and responding to them using multi-threading.
     * 
     * @param args  Command line arguments.
     */
    public static void main(String[] args) throws IOException, InterruptedException {
        // Get command line argument.
        if (args.length != 1) {
            System.out.println("Usage: Server.java port");
            return;
        }

        // read master file and create DNS namespace
        DNSZone rootZone = ZoneFactory.createSpace("master.txt");

        // bind to server_port of loopback interface (127.0.0.1)
        DatagramSocket serverSocket = new DatagramSocket(Integer.parseInt(args[0]));

        // delay query processing
        Random random = new Random();

        System.out.println("Server is serving on port " + args[0]);

        // process packets
        while (true) {
            // listen for packets
            DatagramPacket request = new DatagramPacket(new byte[1024], 1024);
            serverSocket.receive(request);
            
            // get received time; code adapted from https://stackoverflow.com/questions/6406470/java-simpledateformat
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SSS");
            Date receiveTime = new Date();

            // get processing delay
            int delay = random.nextInt(5);

            // parse request
            String requestPayload = new String(request.getData());
            BufferedReader reader = new BufferedReader(new StringReader(requestPayload));
            String qid = reader.readLine();
            String[] query = reader.readLine().split("[ ]+");
            String qname = query[0];
            String qtype = query[1];

            // log received packet
            System.out.println(dateFormat.format(receiveTime) + " rcv " + request.getPort() + ": " + qid + " " + qname + " "
                    + qtype + " (delay: " + delay + "s)");

            // create new thread to process received packet and send a response
            Thread child = new Thread(() -> processRequest(qid, qname, qtype, request, delay,
                    rootZone, serverSocket));
            child.start();
        }
    }

    /**
     * Processes a received packet; Delays processing, executes DNS query on 
     * cache and sends response packet to client.
     * 
     * @param qid           Request ID.
     * @param qname         Domain name of query.
     * @param qtype         RR type of query.
     * @param request       Request packet sent by client.
     * @param delay         Randomly generated delay, in s.
     * @param rootZone      Root zone of namespace generated from master file.
     * @param serverSocket  Socket server is running on.
     */
    public static void processRequest(String qid, String qname, String qtype, DatagramPacket request, int delay,
            DNSZone rootZone, DatagramSocket serverSocket) {
        // simulate delay
        try {
            Thread.sleep(delay * 1000);
        } catch (InterruptedException e) {
            System.out.println(Thread.currentThread().getName() + " was interrupted");
        }

        // get client info
        InetAddress clientHost = request.getAddress();
        int clientPort = request.getPort();

        // Resolve query
        ArrayList<ResourceRecord> result = rootZone.query(qname, qtype);

        // resolve CNAME records
        result = resolveCNAME(result, rootZone, qtype);

        String payload;
        // resolve referral if query returns no records
        if (result.size() == 0) {
            // get NS records of closest ancestor zone
            ArrayList<ResourceRecord> authorityRecords = getReferrals(rootZone, qname);

            // get type=A records of referrals
            ArrayList<ResourceRecord> additionalRecords = resolveReferrals(authorityRecords, rootZone);

            payload = generatePayload(qid, qname, qtype, result, authorityRecords, additionalRecords);
        }
        // resolve referral if CNAME records could not be resolved
        else if (!result.get(result.size() - 1).getType().equals(qtype)) {
            // get NS records of closest ancestor zone
            ArrayList<ResourceRecord> authorityRecords = getReferrals(rootZone, qname);

            // get type=A records of referrals
            ArrayList<ResourceRecord> additionalRecords = resolveReferrals(authorityRecords, rootZone);

            payload = generatePayload(qid, qname, qtype, result, authorityRecords, additionalRecords);
        }
        // query required no referrals
        else {
            payload = generatePayload(qid, qname, qtype, result, new ArrayList<>(), new ArrayList<>());
        }

        // construct response packet
        DatagramPacket response = new DatagramPacket(payload.getBytes(), payload.length(), clientHost, clientPort);

        // send response
        try {
            serverSocket.send(response);
        } catch (IOException e) {
            System.out.println("Response could not be sent.");
        }
        
        // get sent time- code adapted from https://stackoverflow.com/questions/6406470/java-simpledateformat
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SSS");
        Date sendTime = new Date();

        // log response packet
        System.out.println(dateFormat.format(sendTime) + " snd " + request.getPort() + ": " + qid + " " + qname + " "
                + qtype);

    }

    /**
     * Recursively solves CNAME records returned from query execution when 
     * qtype of query is NOT CNAME.
     * 
     * @param CNAMERecords  List of alias records for the query initiated by the
     *                      client.
     * @param rootZone      Root zone of namespace generated from master file.
     * @param qtype         RR type of the query.
     */
    private static ArrayList<ResourceRecord> resolveCNAME(ArrayList<ResourceRecord> CNAMERecords, DNSZone rootZone,
            String qtype) {
        // BASE CASE: query returns 0 results or query returns records with matching
        // qtype
        if (CNAMERecords.size() == 0 || CNAMERecords.get(0).getType().equals(qtype)) {
            return CNAMERecords;
        }
        // RECURSIVE CASE: returned records have qtype=CNAME and query qtype!=CNAME
        if (!CNAMERecords.get(0).getType().equals(qtype)) {
            ArrayList<ResourceRecord> result = new ArrayList<>();
            for (ResourceRecord r : CNAMERecords) {
                result.add(r);
                ArrayList<ResourceRecord> subQueryRecords = rootZone.query(r.getData(), qtype);
                result.addAll(resolveCNAME(subQueryRecords, rootZone, qtype));
            }
            return result;
        }
        return new ArrayList<>();
    }

    /**
     * Gets NS RRs of closest ancestor zone to the domain name of a query, if 
     * query could not be resolved.
     * 
     * @param rootZone  Root zone of namespace generated from master file.
     * @param qname     Domain name of query.
     * 
     */
    public static ArrayList<ResourceRecord> getReferrals(DNSZone rootZone, String qname) {
        // if qname is root server, i.e. "."
        if (qname.equals(".")) {
            return rootZone.query(qname, "NS");
        }

        ArrayList<ResourceRecord> authorityRecords = new ArrayList<>();

        // get authority records, i.e. NS records, for closest ancestor zone
        while (authorityRecords.size() == 0) {

            String[] labels = qname.split("[.]");
            qname = qname.substring(labels[0].length() + 1);

            // if reached root domain, return NS records for it
            if (qname.length() == 0) {
                qname = ".";
            }
            authorityRecords = rootZone.query(qname, "NS");
        }

        return authorityRecords;
    }

    // gets type=A records for referrals
    /**
     * Gets the type A records corresponding to the name server of RRs returned
     * by getReferrals method.
     * 
     * @param authorityRecord   List of NS RRs.
     * @param rootZone          Root zone of namespace generated from master file.
     */
    public static ArrayList<ResourceRecord> resolveReferrals(ArrayList<ResourceRecord> authorityRecords,
            DNSZone rootZone) {
        ArrayList<ResourceRecord> additionalRecords = new ArrayList<>();
        for (ResourceRecord r : authorityRecords) {
            ArrayList<ResourceRecord> tmp = rootZone.query(r.getData(), "A");
            additionalRecords.addAll(resolveCNAME(tmp, rootZone, "A"));
        }
        return additionalRecords;
    }

    // constructs response payload
    /**
     * Constructs the response payload to be delivered to the client.
     * 
     * @param qid               Id of query made by client.
     * @param qname             Domain name of query made by client.
     * @param qtype             Type of RR of query made by client.
     * @param answerRecords     List of answer records corresponding to query.
     * @param authorityRecords  List of authroity records corresponding to query.
     * @param additionalRecords List of additional records corresponding to query.
     */
    public static String generatePayload(String qid, String qname, String qtype,
            ArrayList<ResourceRecord> answerRecords, ArrayList<ResourceRecord> authorityRecords,
            ArrayList<ResourceRecord> additionalRecords) {
        // request qid (part of header)
        String payload = qid + "\n";

        // number of records per section (answer, authority, additional) (part of
        // header)
        payload += answerRecords.size() + " " + authorityRecords.size() + " " + additionalRecords.size() + "\n";

        // query
        payload += qname + " " + qtype + "\n";

        // add answer records to payload
        for (ResourceRecord r : answerRecords) {
            payload += r.toString() + "\n";
        }
        // add authority records to payload
        for (ResourceRecord r : authorityRecords) {
            payload += r.toString() + "\n";
        }
        // add additional records to payload
        for (ResourceRecord r : additionalRecords) {
            payload += r.toString() + "\n";

        }
        return payload;
    }

}
