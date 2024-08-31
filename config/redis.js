import redis from "redis";
import * as config from "./constants.js";

const client = redis.createClient(config.redisHost, config.redisPort);
(async () => {
  await client.connect();
  const subscriber = client.duplicate();
  await subscriber.connect();
  await subscriber.subscribe("requestsChannel", (message, channel) => {
    console.log("msg: ", message);
  });
  // Setup redis data
  client.flushAll();
  client.HSET("dog:1", ["name", "gizmo", "age", "5"]);
  client.HSET("dog:2", ["name", "dexter", "age", "6"]);
  client.HSET("dog:3", ["name", "fido", "age", "4"]);
  client.SET("dog:name:gizmo", "dog:1");
  client.SET("dog:name:dexter", "dog:2");
  client.SET("dog:name:fido", "dog:3");
  // client.geoAdd("places", [, , "South Bend"]);
  client.geoAdd("places", {
    longitude: 86.252,
    latitude: 41.6764,
    member: "South Bend",
  });
  client.geoAdd("places", {
    longitude: 87.144,
    latitude: 41.8755,
    member: "Chicago",
  });
})();

const publishClient = async () => {
  return await redis
    .createClient(config.redisHost, config.redisPort)
    .on("error", (err) => console.log("Publish Client Error", err))
    .connect();
};

// const promiser = (resolve, reject) => {
//   return (err, data) => {
//     if (err) reject(err);
//     resolve(data);
//   };
// };

export { publishClient, client as redisClient };
