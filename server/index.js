/*
  The Chat has 3 events: Join room, Send Message and Disconnect

  Join Room: Is the event that occurs when the users joins the room.
    When this event occurs, the 50 previous messages are retrieved from MongoDB and displayed to the user
    The user receives a greet message
    Notify every user in the room that the new user has just joined

  Send Message: Is the event that occurs when the user types a message and press Enter or clicks Send
    It saves the message to the database and send a message for the entire room or
    it requests stock quotes to the bot and sends the message only for the user that requested the stock quote

  Disconnect: Closes the channel. Otherwise the channel will be up even after logout and will cause bugs.
*/

const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const startChat = require("./chat/chat");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

connectDB();
app.use(cors());
startChat(io);

/* 
  Serves the data in Heroku if deployed
  Does not affect dev environment
*/
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.send(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`));
