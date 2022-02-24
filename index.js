const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

// Import room functions from rooms.js
const {
  createRoom,
  getRoom,
  checkPassword,
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
} = require("./rooms");

// Import router from router.js
const router = require("./router");

// Run it on 5000 port locally or on process.env.PORT when deployed
const PORT = process.env.PORT || 5001;

//  Create a new express app
const app = express();
app.use(express.json());

app.use(cors());

// Set up a http server
const server = http.createServer(app);

// Set a websocket server with cors to accept all origins
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, roomID }, callback) => {
    const { user, error, roomDetails } = addUserToRoom({
      roomID,
      name,
      socketID: socket.id,
    });

    if (error) {
      return callback(error);
    }

    socket.emit("message", {
      user: "admin",
      text: `${user.name} welcome to the room ${roomDetails.id}`,
    });

    // Broadcast the message to everyone in the room that a new user has joined
    socket.broadcast
      .to(roomDetails.id)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    socket.join(roomDetails.id);

    io.to(roomDetails.id).emit("roomData", {
      room: roomDetails.id,
      users: getUsersInRoom(roomDetails.id),
    });

    callback(user, roomDetails);
  });

  socket.on("sendMessage", (message, roomID, userName, callback) => {
    io.to(roomID).emit("message", { user: userName, text: message });
    callback();
  });

  socket.on("removeUser", ({ roomID, userName }, callback) => {
    const { roomDetails, error } = removeUserFromRoom(roomID, userName);
    if (roomDetails) {
      io.to(roomDetails.id).emit("message", {
        user: "admin",
        text: `${userName} has left!`,
      });
    }
    callback(roomDetails);
  });
});

// Use router in middleware
app.use(router);

server.listen(PORT, () => {
  console.log(`Server has started on ${PORT} port`);
});
