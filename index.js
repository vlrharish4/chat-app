const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

// Import helper functions from users.js
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

// Import router from router.js
const router = require("./router");

// Run it on 5000 port locally or on process.env.PORT when deployed
const PORT = process.env.PORT || 5001;

//  Create a new express app
const app = express();

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
  socket.on("join", ({ name, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback(error);
    }

    socket.emit("message", {
      user: "admin",
      text: `${user.name} welcome to the room ${user.room}`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback(user);
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left!`,
      });
    }
  });
});

// Use router in middleware
app.use(router);

server.listen(PORT, () => {
  console.log(`Server has started on ${PORT} port`);
});
