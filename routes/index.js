import { api } from "./api.js";
import { web } from "./web.js";

export const routes = async (app) => {
  api(app), web(app);
};
