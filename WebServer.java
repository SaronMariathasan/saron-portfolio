import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;

public class WebServer {
    public static void main(String[] args) throws IOException {
        // create socket (welcoming door) to listen to incoming requests for connection
        // if request is detected, create new connection socket exclusively for that
        // user
        // receive requests from user
        // parse request
        // retrieve requested resource
        // send response/ 404 error

        // if (Arrays.toString(args).length() == 0) {
        // System.out.println("usage: port");
        // return;
        // }

        int port = Integer.parseInt(args[0]);
        ServerSocket serverSocket = new ServerSocket(port);

        System.out.println("The server is ready to receive");
        while (true) {
            Socket connectionSocket = serverSocket.accept();
            connectionSocket.setKeepAlive(true);
            // System.out.print("hello world");
            // create input and output streams to receive and send resouces to client
            BufferedReader in = new BufferedReader(new InputStreamReader(connectionSocket.getInputStream()));
            DataOutputStream out = new DataOutputStream(connectionSocket.getOutputStream());

            // parse HTTP request with format GET <resource> HTTP/1.1
            String httpRequest = in.readLine();
            // Log request
            System.out.println(httpRequest);
            String[] parsedRequest = httpRequest.split(" ");
            String resourceName = parsedRequest[1].substring(1);

            // read file
            BufferedReader resource = null;
            try {
                resource = new BufferedReader(new FileReader(resourceName));
            } catch (FileNotFoundException e) {
                // if (resourceName.compareTo("favicon.ico") == 0) {
                // out.writeBytes("HTTP/1.1 204 No Content\r\n");
                // }
                // else {
                // out.writeBytes("HTTP/1.1 404 Not Found\r\n");
                // }
                out.writeBytes("HTTP/1.1 404 Not Found\r\n");
                out.writeBytes("\r\n");
                continue;
            }

            out.writeBytes("HTTP/1.1 200 OK\r\n");
            // Log reponse
            System.out.println("HTTP/1.1 200 OK");

            // header
            if (resourceName.endsWith("html")) {
                out.writeBytes("Content-Type: text/html\r\n");
            }
            if (resourceName.endsWith("png")) {
                out.writeBytes("Content-Type: image/png\r\n");
            }
            String line;
            int contentLength = 0;
            while ((line = resource.readLine()) != null) {
                contentLength += line.length() + 2; // +2 for \r\n
            }

            out.writeBytes("Content-Length: " + String.valueOf(contentLength) + "\r\n");
            out.writeBytes("Connection: keep-alive\r\n");

            // CRLF at the end of header
            out.writeBytes("\r\n");
            resource.close();

            // send message body
            resource = new BufferedReader(new FileReader(resourceName));
            String inputFile;
            while ((inputFile = resource.readLine()) != null) {
                out.writeBytes(inputFile + "\r\n");
            }
            resource.close();
            out.close();
            in.close();
            connectionSocket.close();
        }
    }
}