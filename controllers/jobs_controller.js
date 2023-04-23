import { Job } from "../models/jobs.js";

class JobsController {
    static async getJobs(req, res, next) {
        const jobs = await Job.find();

        res.status(200).json({
            message: 'jobs list...',
            data: jobs
        })
    }

    static async createJob(req, res, next) {
        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            message: 'job created :)',
            data: job
        })

    }
}


export const jobs_controller = JobsController;