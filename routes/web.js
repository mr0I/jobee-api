import { index_controller } from "../controllers/indexController.js";
import limiter from "../utils/limiter.js";

export const web = (app) => {
  app.get(`/home`, limiter.pageLimiter, index_controller.home);
  app.get(`/subscribe`, limiter.pageLimiter, index_controller.subscribe);
  app.get(`/dog/name/:name`, limiter.pageLimiter, index_controller.getDog);
  app.get(`/dog/all`, limiter.pageLimiter, index_controller.getAllDogs);
  app.get(`/aroundsb/:kms`, limiter.pageLimiter, index_controller.aroundSb);
  app.get(
    `/around/:long/:lat/:km/`,
    limiter.pageLimiter,
    index_controller.aroundLL
  );
  app.get("/room", limiter.pageLimiter, index_controller.simpleRoom);
  app.get(
    "/namespace-room",
    limiter.pageLimiter,
    index_controller.namespaceRoom
  );
};
