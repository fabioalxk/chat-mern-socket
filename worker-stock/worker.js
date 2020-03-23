/*
  Strategy:

  1) The worker will start listening to qeue to receive a message with the stock_code in it
  2) Once the message is received, the worker will consume the message
  3) The worker will call the Stock API, get the results and parse it
  4) The worker will send the stock quotes result back to the server using another queue
*/

const amqp = require("amqplib");
const { resolve } = require("bluebird");
const axios = require("axios");
const config = require("config");
const assertQueueOptions = { durable: true };
const consumeQueueOptions = { noAck: false };
const uri = config.get("uri");
const stockRequestQueue = config.get("stockRequestQueue");
const stockResponseQueue = config.get("stockResponseQueue");
const sendToQueueOptions = { persistent: true };

const assertAndSendToQueue = (channel, data) => {
  const bufferedData = Buffer.from(data);

  return channel
    .assertQueue(stockResponseQueue, assertQueueOptions)
    .then(() =>
      channel.sendToQueue(stockResponseQueue, bufferedData, sendToQueueOptions)
    );
};

const requestStockApi = (channel, msg) =>
  resolve(console.log("Message received: " + msg.content.toString())).then(
    () => {
      let stockCode = msg.content.toString().split("=")[1];
      let STOCK_ENDPOINT = `https://stooq.com/q/l/?s=${stockCode}&f=sd2t2ohlcv&h&e=csv`;
      axios
        .get(STOCK_ENDPOINT)
        .then((response) => {
          const str = response.data.split(/\n|,/);
          let data;
          if (str[14].match(/^\d.*/)) {
            data = `${str[8]} quote is $${str[14]} per share`;
          } else {
            data = "There is no data for this stock code";
          }
          assertAndSendToQueue(channel, data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  );

const assertAndConsumeQueue = (channel) => {
  console.log("Worker is running! Waiting for new messages...");

  const ackMsg = (consumedMessage) =>
    resolve(consumedMessage)
      .tap((consumedMessage) => requestStockApi(channel, consumedMessage))
      .then((consumedMessage) => channel.ack(consumedMessage));

  return channel
    .assertQueue(stockRequestQueue, assertQueueOptions)
    .then(() => channel.prefetch(1))
    .then(() =>
      channel.consume(stockRequestQueue, ackMsg, consumeQueueOptions)
    );
};

const listenToQueue = () =>
  amqp
    .connect(uri)
    .then((connection) => connection.createChannel())
    .then((channel) => {
      assertAndConsumeQueue(channel);
    });

module.exports = listenToQueue();
