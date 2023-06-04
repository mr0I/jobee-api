import constants from "../config/constants.js";
import { jobs_controller } from "../controllers/jobsController.js";
import { auth_controller } from "../controllers/authController.js";


export const api = (app) => {
    app.get(`${constants.apiBaseUrl}/jobs`, jobs_controller.getJobs);
    app.post(`${constants.apiBaseUrl}/job/add`, jobs_controller.createJob);
    app.get(`${constants.apiBaseUrl}/jobs/:zipcode/:distance`, jobs_controller.getNearbyJobs);
    app.put(`${constants.apiBaseUrl}/job/:id`, jobs_controller.updateJob);
    app.delete(`${constants.apiBaseUrl}/job/:id`, jobs_controller.deleteJob);
    app.get(`${constants.apiBaseUrl}/job/:id/:slug`, jobs_controller.getJob);
    app.get(`${constants.apiBaseUrl}/stats/:topic`, jobs_controller.getStats);
    app.post(`${constants.apiBaseUrl}/register`, auth_controller.registerUser);
}