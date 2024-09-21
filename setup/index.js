import expressApp from "./express.js";
import mongodb from "./db.js";
import { redisClient } from "./redis.js";

export default async (app) => {
  const db = await mongodb();
  console.log(`Mongodb Connected on ${db.connection.host}`);
  await redisClient.connect();
  console.log("redis client initiated.");
  await expressApp(app);
  console.log("express app initiated.");
};
