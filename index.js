const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const PORT = process.env.PORt || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// run when a client connects
io.on("connection", (socket) => {
    console.log("New websocket connection...");

    // welcome current user
    socket.emit("message", "Welcome to chatcord ...");

    // broadcast when a user connects
    // broadcast to every client except current client
    socket.broadcast.emit("message", "A user has joined the chat");

    // broadcast to everyone when client disconnects
    socket.on("disconnect", () => {
        io.emit("message", "A user has left the chat");
    });

    // listen for chatMessage
    socket.on("chatMessage", (msg) => {
        console.log(msg);
        io.emit("message", msg);
    });
});
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
