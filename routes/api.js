import constants from "../config/constants.js";
import { jobs_controller } from "../controllers/jobsController.js";
import { auth_controller } from "../controllers/authController.js";
// middlwares
import { authMiddleware } from "../middlewares/auth.js";


export const api = (app) => {
    app.get(`${constants.apiBaseUrl}/jobs`, jobs_controller.getJobs);
    app.post(`${constants.apiBaseUrl}/job/add`,
        authMiddleware.isAuth,
        authMiddleware.authrizeRoles('employer', 'admin'),
        jobs_controller.createJob);
    app.get(`${constants.apiBaseUrl}/jobs/:zipcode/:distance`, jobs_controller.getNearbyJobs);
    app.put(`${constants.apiBaseUrl}/job/:id`,
        authMiddleware.isAuth,
        authMiddleware.authrizeRoles('employer', 'admin'),
        jobs_controller.updateJob);
    app.delete(`${constants.apiBaseUrl}/job/:id`,
        authMiddleware.isAuth,
        authMiddleware.authrizeRoles('employer', 'admin'),
        jobs_controller.deleteJob);
    app.get(`${constants.apiBaseUrl}/job/:id/:slug`, jobs_controller.getJob);
    app.get(`${constants.apiBaseUrl}/stats/:topic`, jobs_controller.getStats);
    app.post(`${constants.apiBaseUrl}/register`, auth_controller.registerUser);
    app.post(`${constants.apiBaseUrl}/login`, auth_controller.loginUser);
    app.post(`${constants.apiBaseUrl}/password/reset`, auth_controller.forgotPassword);
    app.put(`${constants.apiBaseUrl}/password/reset/:token`, auth_controller.resetPassword);
    app.get(`${constants.apiBaseUrl}/logout`, authMiddleware.isAuth, auth_controller.logout);
}