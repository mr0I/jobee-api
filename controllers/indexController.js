import { publishClient } from "../config/redis.js";
import { asyncErrorRenderer } from "../middlewares/catchAsyncErrors.js";
// import Job from "../models/Job.js";
import { redisClient } from "../config/redis.js";

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
}

export const index_controller = IndexController;
