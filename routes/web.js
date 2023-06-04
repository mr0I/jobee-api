import { index_controller } from "../controllers/indexController.js";


export const web = (app) => {
    app.get(`/test`, index_controller.index);
}