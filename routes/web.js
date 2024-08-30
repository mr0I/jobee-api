import { index_controller } from "../controllers/indexController.js";
import limiter from "../utils/limiter.js";

export const web = (app) => {
  app.get(`/home`, limiter.pageLimiter, index_controller.home);
  app.get(`/subscribe`, limiter.pageLimiter, index_controller.subscribe);
  app.get(`/dog/name/:name`, limiter.pageLimiter, index_controller.getDog);
};
