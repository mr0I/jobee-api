import constants from "../config/constants.js";
import { jobs_controller } from "../controllers/jobsController.js";
import { auth_controller } from "../controllers/authController.js";
import { user_controller } from "../controllers/userController.js";
// middlwares
import { authMiddleware } from "../middlewares/auth.js";
import limiter from "../utils/limiter.js";


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
    app.get(`${constants.apiBaseUrl}/job/:id/:slug`, limiter.apiLimiter, jobs_controller.getJob);
    app.put(`${constants.apiBaseUrl}/job/:id/apply`,
        authMiddleware.isAuth,
        authMiddleware.authrizeRoles('user'),
        jobs_controller.applyJob);
    app.get(`${constants.apiBaseUrl}/stats/:topic`, jobs_controller.getStats);
    app.post(`${constants.apiBaseUrl}/register`, auth_controller.registerUser);
    app.post(`${constants.apiBaseUrl}/login`, auth_controller.loginUser);
    app.post(`${constants.apiBaseUrl}/password/reset`, auth_controller.forgotPassword);
    app.put(`${constants.apiBaseUrl}/password/reset/:token`, auth_controller.resetPassword);
    app.get(`${constants.apiBaseUrl}/logout`, authMiddleware.isAuth, auth_controller.logout);
    app.get(`${constants.apiBaseUrl}/me`, authMiddleware.isAuth, user_controller.getUserProfile);
    app.put(`${constants.apiBaseUrl}/password/update`, authMiddleware.isAuth, user_controller.updatePassword);
    app.put(`${constants.apiBaseUrl}/me/update`, authMiddleware.isAuth, user_controller.updateUser);
    app.delete(`${constants.apiBaseUrl}/me/delete`, authMiddleware.isAuth, user_controller.deleteUser);
    app.get(`${constants.apiBaseUrl}/jobs/applied`,
        authMiddleware.isAuth,
        authMiddleware.authrizeRoles('user'),
        user_controller.getAppliedJobs);
    app.get(`${constants.apiBaseUrl}/jobs/published`,
        authMiddleware.isAuth,
        authMiddleware.authrizeRoles('employer', 'admin'),
        user_controller.getPublishedJobs);
    app.get(`${constants.apiBaseUrl}/users`,
        authMiddleware.isAuth,
        authMiddleware.authrizeRoles('admin'),
        user_controller.getUsers);
    app.delete(`${constants.apiBaseUrl}/user/:id`,
        authMiddleware.isAuth,
        authMiddleware.authrizeRoles('admin'),
        user_controller.deleteUserAdmin);
}