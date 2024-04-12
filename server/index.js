const express = require('express');
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const os = require('os');
const networkInterfaces = os.networkInterfaces();

let ipAddress;

// Iterate over network interfaces to find IPv4 addresses
Object.keys(networkInterfaces).forEach((iface) => {
    networkInterfaces[iface].forEach((ifaceInfo) => {
        // Check for IPv4 address and not internal network
        if (ifaceInfo.family === 'IPv4' && !ifaceInfo.internal) {
            ipAddress = ifaceInfo.address;
        }
    });
});

console.log("Server IP Address:", ipAddress);

// Create an HTTP server using Express
const server = http.createServer(app);

// Create a new instance of Socket.IO and attach it to the HTTP server
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000", `http://${ipAddress}:3000`],
        methods: ["GET", "POST"]
    }
});

// Listen for connections from clients
io.on("connection", (socket) => {
    console.log('user Connected: ' + socket.id);

    // Listen for the "send_message" event from clients
    socket.on("send_message", (data) => {
        console.log(data);
        // Broadcast the received message to all clients except the sender
        socket.broadcast.emit("receive_message", data);
    });

    // Listen for the "join_room" event from clients
    socket.on("join_room", (data) => {
        // Join the client to the specified room
        socket.join(data);
    });
});

// Start the server and listen on port 3001
server.listen(3001, () => {
    console.log("Everything is good");
});
