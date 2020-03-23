/*
  The Chat has 3 events: Join room, Send Message and Disconnect

  Join Room: Is the event that occurs when the users joins the room.
    When this event occurs, the 50 previous messages are retrieved from MongoDB and displayed to the user
    Notify every user in the room that the new user has just joined

  Send Message: Is the event that occurs when the user types a message and press Enter or clicks Send
    It saves the message to the database and send a message for the entire room or
    it requests stock quotes to the bot and sends the message only for the user that requested the stock quote

  Disconnect: Closes the channel. Otherwise the channel will be up even after logout and will cause bugs.
*/
const Chat = require("../model/Chat");
const stockJob = require("../service/stocks");
const { addUser, removeUser, getUser, getUsersInRoom } = require("../users");
let channel;

module.exports = (io) => {
  io.on("connect", (socket) => {
    socket.on("join", ({ name, room }, callback) => {
      const { error, user } = addUser({ id: socket.id, name, room });

      if (error) return callback(error);

      socket.join(user.room);

      // Find only the last 50 messages
      Chat.aggregate([
        {
          $match: { roomname: user.room }
        },
        {
          $unwind: "$messages"
        },
        {
          $sort: { "messages.date": -1 }
        },
        {
          $limit: 50
        },
        {
          $group: { _id: "$_id", messages: { $push: "$messages" } }
        },
        {
          $project: { messages: 1, _id: 0 }
        }
      ])
        .then((data) => {
          if (data) {
            socket.emit("loadMessages", data[0]);
          }
        })
        .catch((err) => {
          console.log("Something went wrong");
          throw err;
        });

      // Notify every user in the room that the new user has just joined
      socket.broadcast
        .to(user.room)
        .emit("message", { user: "admin", text: `${user.name} has joined!` });

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

      /* 
        Create a room if there isn't one in database yet.
    */
      Chat.findOne({ roomname: user.room })
        .then((chatRoom) => {
          if (!chatRoom) {
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
            /*
                    Checks if the message is a command to request stock
                    Example: "/stock=aapl.us"
                  */
            if (message.match(/\/stock=.+/)) {
              stockJob
                .start()
                .then((channel) => {
                  this.channel = channel;
                  // Function that sends the command message to the queue using RabbitMQ
                  stockJob.assertAndSendToQueue(channel, message);

                  /*
                          Function that receives the stock quotes from the bot using RabbitMQ
                            and sends the result back just to the user that requested it, via socket
                        */
                  stockJob.assertAndConsumeQueue(channel, socket);
                })
                .catch((err) => {
                  if (err) throw err;
                });
            } else {
              /* 
                      If the message is not a command, it's a stardard message.
                      Hence send the message to everybody in the room and save the message in the database
                    */
              chatRoom.messages.push(newMessage);
              chatRoom
                .save()
                .then(() => {
                  console.log("data saved successfully");
                })
                .catch((err) => {
                  console.log("something wrong when saving");
                  console.log(err);
                });
              io.to(user.room).emit("message", {
                user: user.name,
                text: message
              });
              callback();
            }
          }
        })
        .catch((err) => {});
    });

    // Closes the channel. Otherwise the channel will be up even after logout and will cause bugs.
    socket.on("disconnect", () => {
      const user = removeUser(socket.id);
      if (channel) {
        channel.close();
      }

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
};
