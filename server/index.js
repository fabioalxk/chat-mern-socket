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
