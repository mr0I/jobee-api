import { Job } from "../models/jobs.js";
import { geoCoder } from "../utils/geocoder.js";
import { nominatimClient } from "../utils/nominatimClient.js";
import validator from "validator";
import ErrorHandler from "../utils/errorHandler.js";
import asyncErrorHandler from "../middlewares/catchAsyncErrors.js";
import ApiFilters from "../utils/apiFilters.js";


class JobsController {

    static getJobs = asyncErrorHandler(async (req, res, next) => {
        const apiFilters = new ApiFilters(Job.find(), req.query).filter();
        const jobs = await apiFilters.query;

        res.status(200).json({
            message: 'jobs list...',
            count: jobs.length,
            data: jobs
        })
    });

    static getJob = asyncErrorHandler(async (req, res, next) => {
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
            return next(new ErrorHandler('job not found!', 404));
        }
    });

    static createJob = asyncErrorHandler(async (req, res, next) => {
        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            message: 'job created :)',
            data: job
        })
    });

    static updateJob = asyncErrorHandler(async (req, res, next) => {
        // if (!validator.isMongoId(req.params.id)) {
        //     return res.status(400).json({
        //         message: 'invalid ID!'
        //     });
        // }
        const job = await Job.findById(req.params.id);
        if (!job) {
            return next(new ErrorHandler('job not found!', 404));
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
    });


    static deleteJob = asyncErrorHandler(async (req, res, next) => {
        if (!validator.isMongoId(req.params.id)) {
            return res.status(400).json({
                message: 'invalid ID!'
            });
        }
        const job = await Job.findById(req.params.id);
        if (!job) {
            return next(new ErrorHandler('job not found!', 404));
        }

        const data = await Job.findByIdAndRemove(req.params.id);

        res.status(200).json({
            message: 'successfully deleted.',
            data
        });
    });


    static getNearbyJobs = asyncErrorHandler(async (req, res, next) => {
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
    });

    static getStats = asyncErrorHandler(async (req, res, next) => {
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
            return next(new ErrorHandler(`No stats found for ${topic}`, 404));
        }

        res.status(200).json({
            data: stats
        })
    })

}


export const jobs_controller = JobsController;