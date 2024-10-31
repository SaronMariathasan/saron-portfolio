/**
COMP3331 Computer Networks and Applications
Assignment - DNS Application
Written by Saron Mariathasan

This file contains the client implementation for a DNS Application.

The client uses UDP to send a request packet to the server containing the
query and prints the response received.
 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketTimeoutException;
import java.util.Random;

public class Client {
    public static void main(String[] args) throws IOException {
        if (args.length != 4) {
            System.out.println("Usage: Client.java server_port qname qtype timeout");
            return;
        }
        // Parse command line args
        int port = Integer.parseInt(args[0]);
        String qname = args[1];
        String qtype = args[2];
        int timeout = Integer.parseInt(args[3]) * 1000;

        // create socket
        DatagramSocket socket = new DatagramSocket();

        // set timeout
        socket.setSoTimeout(timeout);

        // Create qid
        Random random = new Random();
        int qid = random.nextInt((1 << 16) - 1);

        // add header to payload
        String payload = qid + "\n";

        // add query to payload
        payload += qname + " " + qtype + "\n";

        // send query
        DatagramPacket request = new DatagramPacket(payload.getBytes(), payload.length(),
                InetAddress.getByName("localhost"), port);

        socket.send(request);

        // receive answer
        DatagramPacket response = new DatagramPacket(new byte[5000], 5000);

        try {
            socket.receive(response);
        } catch (SocketTimeoutException e) {
            System.out.println("Query timed out.");
            socket.close();
            return;
        }

        // print response
        Client.printData(response);

        socket.close();
    }

    /**
     * Print response message received from server.
     * 
     * @param response  The response packet received from server.
     */
    public static void printData(DatagramPacket response) throws IOException {
        String answer = new String(response.getData());
        BufferedReader reader = new BufferedReader(new StringReader(answer));

        // print header
        System.out.println("HEADER:\nID: " + reader.readLine());

        String[] numRecords = reader.readLine().split("[ ]+");

        // print question
        System.out.println("QUESTION:\n" + reader.readLine());

        // print answer
        System.out.println("ANSWER:");
        for (int i = 0; i < Integer.parseInt(numRecords[0]); i++) {
            System.out.println(reader.readLine());
        }

        // print authority
        System.out.println("AUTHORITY:");
        for (int i = 0; i < Integer.parseInt(numRecords[1]); i++) {
            System.out.println(reader.readLine());
        }

        // print additional
        System.out.println("ADDITIONAL:");
        for (int i = 0; i < Integer.parseInt(numRecords[2]); i++) {
            System.out.println(reader.readLine());
        }
    }

}