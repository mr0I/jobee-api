import { index_controller } from "./controllers/index_controller.js";
import { jobs_controller } from "./controllers/jobs_controller.js";

export const routes = (app) => {
    app.get('/test', index_controller.index);
    app.get('/api/v1/jobs', jobs_controller.getJobs);
    app.post('/api/v1/job/add', jobs_controller.createJob);
}
