const http = require("http");
const express = require("express");
const cors = require("cors");
const startSocket = require("./socket");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);
connectDB();
startSocket(server);

app.use(cors());
app.use(require("./routes/api/router"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
