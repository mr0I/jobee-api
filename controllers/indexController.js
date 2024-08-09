import { publishClient } from "../config/db.js";
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
}

export const index_controller = IndexController;
