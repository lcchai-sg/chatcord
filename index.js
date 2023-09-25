const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const PORT = process.env.PORt || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "Chatcord Bot";

// run when a client connects
io.on("connection", (socket) => {
    console.log("New websocket connection...");

    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to chatcord ..."));

        // broadcast when a user connects
        // broadcast to every client except current client
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat`));

        // send users and room info
        io.to(user.room).emit("roomusers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })

    // listen for chatMessage
    socket.on("chatMessage", (msg) => {
        console.log(msg);
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    // broadcast to everyone when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        console.log(user);

        if (user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));

            // send users and room info
            io.to(user.room).emit("roomusers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
