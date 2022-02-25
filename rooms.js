const { nanoid } = require("nanoid");

const rooms = [];

const createRoom = (details) => {
  const id = nanoid(8);
  const room = {
    id,
    isPrivate: details.isPrivate,
    password: details.password,
    users: [{ name: "admin", socketID: "admin" }],
  };
  rooms.push(room);
  const { password, ...roomDetails } = room;
  return roomDetails;
};

const removeRoom = (id) => {
  const roomIndex = rooms.findIndex((room) => room.id === id);
  if (roomIndex !== -1) {
    rooms.splice(roomIndex, 1);
  }
};

const getRoom = (id) => {
  return rooms.find((room) => room.id === id);
};

const checkPassword = (id, password) => {
  const room = getRoom(id);
  if (room.isPrivate) {
    return room.password === password;
  }
  return true;
};

const addUserToRoom = ({ roomID, name, socketID }) => {
  const user = { name, socketID };
  const roomIndex = rooms.findIndex((room) => room.id === roomID);
  if (roomIndex === -1) {
    return { error: "Room does not exist" };
  }
  const users = rooms[roomIndex].users;
  const existingUser = users.find((user) => user.name === name);
  if (existingUser) {
    return { error: "Username is taken" };
  }
  users.push(user);
  const { password, ...roomDetails } = rooms[roomIndex];
  return { user, roomDetails };
};

const removeUserFromRoom = (roomID, name) => {
  const roomIndex = rooms.findIndex((room) => room.id === roomID);
  if (roomIndex === -1) {
    return { error: "Room does not exist" };
  }
  const users = rooms[roomIndex].users;
  const userIndex = users.findIndex((user) => user.name === name);
  if (userIndex === -1) {
    return { error: "User does not exist" };
  }
  users.splice(userIndex, 1);
  const { password, ...roomDetails } = rooms[roomIndex];
  return { roomDetails };
};

const getUsersInRoom = (roomID) => {
  const room = getRoom(roomID);
  return room.users;
};

module.exports = {
  createRoom,
  removeRoom,
  getRoom,
  checkPassword,
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
};
