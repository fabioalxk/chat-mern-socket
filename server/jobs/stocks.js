const amqp = require("amqplib");
const { resolve } = require("bluebird");
const config = require("config");

const assertQueueOptions = { durable: true };
const sendToQueueOptions = { persistent: true };
const consumeQueueOptions = { noAck: false };

const uri = config.get("uri");
const stockRequestQueue = config.get("stockRequestQueue");
const stockResponseQueue = config.get("stockResponseQueue");
let socket;

const assertAndConsumeQueue = (channel, socket) => {
  this.socket = socket;

  const ackMsg = (msg) =>
    resolve(msg).then((msg) => {
      channel.ack(msg);
      console.log(msg.content.toString());
      this.responseMsg = msg.content.toString();
      socket.emit("message", {
        user: "Bot",
        text: msg.content.toString()
      });

      return msg;
    });

  console.log("Consumer is running! Waiting for new messages..!");

  return channel
    .assertQueue(stockResponseQueue, assertQueueOptions)
    .then(() => channel.prefetch(1))
    .then(() => {
      channel
        .consume(stockResponseQueue, ackMsg, consumeQueueOptions)
        .then((result) => {
          resolve("yes");
          return this.responseMsg;
        })
        .catch((err) => {
          console.log(err);
        });
    });
};
// end consumer

const assertAndSendToQueue = (channel, message) => {
  const bufferedData = Buffer.from(message);

  return channel
    .assertQueue(stockRequestQueue, assertQueueOptions)
    .then(() =>
      channel.sendToQueue(stockRequestQueue, bufferedData, sendToQueueOptions)
    );
};

const requestStock = (resolve, reject) =>
  amqp
    .connect(uri)
    .then((connection) => connection.createChannel())
    .then((channel) => {
      return channel;
    });

const start = () => {
  return requestStock();
};

const exportObject = {
  assertQueueOptions,
  sendToQueueOptions,
  consumeQueueOptions,
  uri,
  stockRequestQueue,
  stockResponseQueue,
  start,
  assertAndSendToQueue,
  assertAndConsumeQueue
};
module.exports = exportObject;
