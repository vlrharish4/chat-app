const express = require("express");
const router = express.Router();
const { createRoom, getRoom, checkPassword } = require("./rooms");

router.get("/", (req, res) => {
  res.send("Server is up and running");
});

router.post("/rooms/create", (req, res) => {
  res.send(createRoom(req.body));
});

router.get("/rooms/:id/users/:name", (req, res) => {
  const room = getRoom(req.params.id);
  if (room) {
    const { id, isPrivate, ...roomDetails } = room;
    const user = room.users.find((user) => user.name === req.params.name);
    if (user) {
      res.send({ error: "Username taken." });
    } else {
      res.send({ id, isPrivate });
    }
  } else {
    res.send({ error: "Room does not exist" });
  }
});

router.post("/rooms/:id/auth", (req, res) => {
  const room = getRoom(req.params.id);
  if (room) {
    res.send({ status: checkPassword(req.params.id, req.body.password) });
  } else {
    res.send({ error: "Room does not exist" });
  }
});

module.exports = router;
