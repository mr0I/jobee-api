import { publishClient, redisClient } from "../setup/redis.js";
import { asyncErrorRenderer } from "../middlewares/catchAsyncErrors.js";
// import Job from "../models/Job.js";

class IndexController {
  static home = asyncErrorRenderer(async (req, res, next) => {
    const data = [
      { name: "ali", age: 30 },
      { name: "reza", age: 20 },
    ];

    const jobs = await Job.find(); // test error renderer
    res.render("home", {
      title: "Home Page",
      data: JSON.stringify(data),
      jobs,
    });
  });

  static subscribe = asyncErrorRenderer(async (req, res, next) => {
    try {
      const pubClient = await publishClient();
      pubClient.publish(
        "requestsChannel",
        `request on ${req.socket.localPort} for ${req.url}`
      );
    } catch (err) {
      console.error("subscribe: ", err);
    }
    res.end();
  });

  static getDog = asyncErrorRenderer(async (req, res) => {
    const { name } = req.params;
    const now = Date.now();
    const dogIdentifier = `dog:name:${name}`;
    redisClient.ZADD("dog:last_lookup", {
      score: now,
      value: dogIdentifier,
    });
    const data = await redisClient.GET(dogIdentifier);
    const result = await redisClient.HGETALL(data);

    res.status(200).send({
      result,
    });
  });

  static getAllDogs = asyncErrorRenderer(async (req, res) => {
    const result = await redisClient.ZRANGE("dog:last_lookup", 0, -1);
    // latest dogs
    const now = Date.now();
    const minAgo = now - 60000;
    const latest = await redisClient.ZRANGE("dog:last_lookup", now, minAgo);

    redisClient.geoRadiusByMember;

    res.status(200).send({
      result,
      latest,
    });
  });

  static aroundSb = asyncErrorRenderer(async (req, res) => {
    const { km } = req.params;
    const result = await redisClient.geoRadiusByMember(
      "places",
      "Chicago",
      km,
      "km"
    );
    res.status(200).send({ result });
  });

  static aroundLL = asyncErrorRenderer(async (req, res) => {
    const { km, long, lat } = req.params;
    const result = await redisClient.geoRadius(
      "places",
      {
        longitude: long,
        latitude: lat,
      },
      parseInt(km),
      "km"
    );
    res.status(200).send({ result });
  });

  static simpleRoom = asyncErrorRenderer(async (req, res) => {
    return res.render("rooms");
  });

  static namespaceRoom = asyncErrorRenderer(async (req, res) => {
    return res.render("namespace-room");
  });
}

export const index_controller = IndexController;
