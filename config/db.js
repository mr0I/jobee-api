import mongoose from "mongoose";
import redis from "redis";
import * as config from "./constants.js";

const connection = () => {
  mongoose
    .connect(process.env.DB_URL, {
      autoIndex: false, // Don't build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4,
      connectTimeoutMS: 1000,
    })
    .then((conn) => {
      console.log(`Mongodb Connected on ${conn.connection.host} `);
    })
    .catch((err) => {
      console.error(err);
    });
};

(async () => {
  const client = redis.createClient(config.redisHost, config.redisPort);
  const subscriber = client.duplicate();
  await subscriber.connect();
  await subscriber.subscribe("requestsChannel", (message, channel) => {
    console.log("msg: ", message);
  });
})();

const publishClient = async () => {
  return await redis
    .createClient(config.redisHost, config.redisPort)
    .on("error", (err) => console.log("Publish Client Error", err))
    .connect();
};

export { connection as ConnectDb, publishClient };
