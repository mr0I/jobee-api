import { index_controller } from "./controllers/index_controller.js";
import { jobs_controller } from "./controllers/jobs_controller.js";

export const routes = (app) => {
    app.get('/test', index_controller.index);
    app.get('/api/v1/jobs', jobs_controller.getJobs);
    app.post('/api/v1/job/add', jobs_controller.createJob);
    app.get('/api/v1/jobs/:zipcode/:distance', jobs_controller.getNearbyJobs);
    app.put('/api/v1/job/:id', jobs_controller.updateJob);
    app.delete('/api/v1/job/:id', jobs_controller.deleteJob);
    app.get('/api/v1/job/:id/:slug', jobs_controller.getJob);
    app.get('/api/v1/stats/:topic', jobs_controller.getStats);
}
