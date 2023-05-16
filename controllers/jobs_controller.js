import { Job } from "../models/jobs.js";
import { geoCoder } from "../utils/geocoder.js";
import { nominatimClient } from "../utils/nominatimClient.js";
import validator from "validator";


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

    static async updateJob(req, res, next) {
        if (!validator.isMongoId(req.params.id)) {
            return res.status(400).json({
                message: 'invalid ID!'
            });
        }
        const job = await Job.findById(req.params.id);
        if (!job) {
            console.log('1');
            return res.status(404).json({
                message: 'job not found!'
            });
        }

        const data = await Job.findOneAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            message: 'successfully updated.',
            data
        });
    }

    static async deleteJob(req, res, next) {
        if (!validator.isMongoId(req.params.id)) {
            return res.status(400).json({
                message: 'invalid ID!'
            });
        }
        const job = await Job.findById(req.params.id);
        if (!job) {
            console.log('1');
            return res.status(404).json({
                message: 'job not found!'
            });
        }

        const data = await Job.findByIdAndRemove(req.params.id);

        res.status(200).json({
            message: 'successfully deleted.',
            data
        });
    }

    static async getNearbyJobs(req, res, next) {
        const { zipcode, distance } = req.params;
        const loc = await nominatimClient.search({
            q: zipcode, // zipcode or address or etc
            addressdetails: '1'
        });
        const latitude = loc[0].lat;
        const longitude = loc[0].lon;
        const radius = distance / 3963;

        const jobs = await Job.find({
            location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
        });

        res.status(200).json({
            'count': jobs.length,
            'data': jobs,
            'loc': loc
        });
    }
}


export const jobs_controller = JobsController;