import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketTimeoutException;
import java.util.Date;
import java.util.Random;

public class PingClient {
    public static void main(String[] args) throws IOException {
        final int ORIGIN = 30000;
        final int BOUND = 40000;

        DatagramSocket socket = new DatagramSocket(); // set client to random port port number
        socket.setSoTimeout(600);

        // Get hostname of packet destination (i.e. server)
        InetAddress IPAddress = InetAddress.getByName(args[0]);
        // Get port of packet destination (i.e. server port)
        int port = Integer.parseInt(args[1]);

        Random random = new Random();
        int sequenceStart = random.nextInt(BOUND - ORIGIN) + ORIGIN;

        float max = Float.NEGATIVE_INFINITY;
        float min = Float.POSITIVE_INFINITY;
        long runningTotal = 0;
        long numReceived = 0;

        for (int i = 0; i < 15; i++) {
            Date sendTime = new Date();
            // Create payload
            String payload = "PING " + String.valueOf(sequenceStart + i) + " " + String.valueOf(sendTime.getTime())
                    + "\r\n";

            DatagramPacket request = new DatagramPacket(payload.getBytes(), payload.length(),
                    IPAddress, port);

            socket.send(request);

            // receive echoed packet
            DatagramPacket response = new DatagramPacket(new byte[1024], 1024);

            try {
                socket.receive(response);
            } catch (SocketTimeoutException e) {
                System.out.println("ping to 127.0.0.1, seq = " + (sequenceStart + i) + ", rtt = time out");
                continue;
            }

            Date receiveTime = new Date();

            // print ping if packet received
            long packetRTT = receiveTime.getTime() - sendTime.getTime();
            System.out.println("ping to 127.0.0.1, seq = " + (sequenceStart + i) + ", rtt = " + packetRTT + " ms");

            if (packetRTT < min)
                min = packetRTT;
            if (packetRTT > max)
                max = packetRTT;
            runningTotal += packetRTT;
            numReceived++;

        }

        socket.close();
        System.out.println(
                "minimum = " + min + " ms , maximum = " + max + " ms, average = " + runningTotal / numReceived + " ms");

        // concert to array; array class has static sort method
        // get first and last elements from array for min & max
        // use streams method to sum all elments in list, then divide by size
        // stream to sum
        // int numReceived = rtts.size();
        // Object[] rttsArray = rtts.toArray();
        // Arrays.sort(rttsArray);
        // rtts.stream().reduce((t, i) -> t += i).collect(Collectors.toList());
        // float avg = rtts.get(0) / numReceived;
        // output += avg + " ms";
        // System.out.println(output);
    }

    // create socket
    // create UDP packet
    // package payload
    // send packet
    // if no response within 600 ms, resend packet
    // print output
    // repeat 14 times
    // close socket connection
}