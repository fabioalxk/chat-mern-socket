const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  rooms: [
    {
      roomname: {
        type: String,
        required: true
      },
      messages: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "users"
          },
          name: {
            type: String,
            required: true
          }
        }
      ]
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Chat = mongoose.model("chat", ChatSchema);
