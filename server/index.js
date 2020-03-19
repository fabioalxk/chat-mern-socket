const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const Chat = require("./model/Chat");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

connectDB();
app.use(cors());
app.use(router);

// const loadAllMessages = (roomname) => {
//   Chat.find({ roomname })
//     .then((data) => {
//       const json = JSON.stringify(data);
//       socket.emit("loadMessages", json);
//       return data;
//     })
//     .catch((err) => {
//       console.log("Something went wrong");
//       throw err;
//     });
// };

io.on("connect", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    Chat.find({ roomname: user.room })
      .then((data) => {
        if (data) {
          const json = JSON.stringify(data[0]);
          socket.emit("loadMessages", data[0]);
        }
      })
      .catch((err) => {
        console.log("Something went wrong");
        throw err;
      });

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    console.log("message sent");
    const user = getUser(socket.id);

    const newChat = new Chat({
      roomname: user.room,
      message: []
    });

    const newMessage = {
      user: user.name,
      text: message
    };

    Chat.findOne({ roomname: user.room })
      .then((chatRoom) => {
        if (!chatRoom) {
          // create room and save message
          newChat.messages.unshift(newMessage);

          newChat
            .save()
            .then((data) => {
              console.log("Room created and Message saved to the database");
              io.to(user.room).emit("message", {
                user: user.name,
                text: message
              });
              callback();
            })
            .catch((err) => {
              console.log("something wrong when saving");
              console.log(err);
            });
        } else {
          // dont creat just, just unshift message
          chatRoom.messages.push(newMessage);
          chatRoom
            .save()
            .then((data) => {
              console.log("Message unshifted and saved to the database");
              io.to(user.room).emit("message", {
                user: user.name,
                text: message
              });
              callback();
            })
            .catch((err) => {
              console.log("something wrong when saving");
              console.log(err);
            });
        }
      })
      .catch((err) => {});
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
