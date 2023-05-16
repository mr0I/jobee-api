import { Job } from "../models/jobs.js";
import { geoCoder } from "../utils/geocoder.js";
import { nominatimClient } from "../utils/nominatimClient.js";
import validator from "validator";


class JobsController {
    static async getJobs(req, res, next) {
        const jobs = await Job.find();

        res.status(200).json({
            message: 'jobs list...',
            count: jobs.length,
            data: jobs
        })
    }

    static async getJob(req, res, next) {
        const { id, slug } = req.params;

        try {
            // const job = await Job.findById(req.params.id);
            const job = await Job.find({
                $and: [
                    { _id: id },
                    { slug: slug }
                ]
            });
            res.status(200).json({
                data: job
            })
        } catch (error) {
            console.log({ 'source': 'getJob', 'msg': error });
            res.status(404).json({
                message: 'Job not found!'
            })
        }
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

    static async getStats(req, res, next) {
        const topic = req.params.topic;
        const stats = await Job.aggregate([
            { $match: { $text: { $search: topic } } },
            // { $match: { $text: { $search: "\"" + topic + "\"" } } },
            {
                $group: {
                    _id: { $toUpper: '$experience' },
                    totalJobs: { $sum: 1 },
                    avgPositions: { $avg: '$positions' },
                    avgSalary: { $avg: '$salary' },
                    minSalary: { $min: '$salary' },
                    maxSalary: { $max: '$salary' },
                }
            }
        ]);

        if (stats.length === 0) {
            res.status(200).json({
                message: `No stats found for ${topic}`
            })
        }

        res.status(200).json({
            data: stats
        })
    }
}


export const jobs_controller = JobsController;