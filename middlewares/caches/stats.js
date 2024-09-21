import { redisClient } from "../../setup/redis.js";

export const getStatsCache = async (req, res, next) => {
  try {
    const key = "stats";
    const result = JSON.parse(await redisClient.get(key));
    if (!result) {
      next();
      return;
    }

    res.status(200).json({
      data: result,
    });
  } catch (err) {
    console.error(err);
    next();
  }
};
