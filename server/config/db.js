const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

module.exports = () => {
  mongoose
    .connect(db, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    .then((result) => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error(err);
    });
};
