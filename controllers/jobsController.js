import Job from "../models/Job.js";
import {
    nominatimClient
} from "../utils/nominatimClient.js";
import validator from "validator";
import ErrorHandler from "../utils/errorHandler.js";
import {
    asyncErrorHandler
} from "../middlewares/catchAsyncErrors.js";
import ApiFilters from "../utils/apiFilters.js";
import path from "path";
import fs from "fs";
import constants from "../config/constants.js";
import nodeCache from 'node-cache';
const apiCache = new nodeCache();


class JobsController {

    static getJobs = asyncErrorHandler(async (req, res, next) => {
        const cacheKey = `getJobs`;
        const cachedResult = apiCache.get(cacheKey);
        if (cachedResult) {
            return res.status(200).json({
                message: 'jobs list...',
                count: cachedResult.length,
                data: cachedResult
            });
        }

        const apiFilters = new ApiFilters(Job.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .searchByQuery()
            .pagination();

        // console.log(apiFilters.query);

        const jobs = await apiFilters.query;
        apiCache.set(cacheKey, jobs, constants.cacheTimeToLive);

        res.status(200).json({
            message: 'jobs list...',
            count: jobs.length,
            data: jobs
        })
    });

    static getJob = asyncErrorHandler(async (req, res, next) => {
        const {
            id,
            slug
        } = req.params;

        try {
            const job = await Job.find({
                $and: [{
                    _id: id
                }, {
                    slug: slug
                }]
            }).populate({
                path: 'user',
                select: 'name'
            });

            res.status(200).json({
                data: job
            })
        } catch (error) {
            return next(new ErrorHandler('job not found!', 404));
        }
    });

    static createJob = asyncErrorHandler(async (req, res, next) => {
        req.body.user = req.user.id;
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

        // Check if the user is owner
        if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorHandler(`User(${req.user.id}) is not allowed to update this job.`))
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
        const job = await Job.findById(req.params.id).select('+applicantsApplied');
        if (!job) {
            return next(new ErrorHandler('job not found!', 404));
        }
        // Check if the user is owner
        if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorHandler(`User(${req.user.id}) is not allowed to delete this job.`))
        }
        // Deleting files associated with job
        for (let i = 0; i < job.applicantsApplied.length; i++) {
            let filepath = `${__dirname}/public/uploads/${job.applicantsApplied[i].resume}`.replace('\\controllers', '');

            fs.unlink(filepath, err => {
                if (err) return console.log(err);
            });
        }

        const data = await Job.findByIdAndRemove(req.params.id);

        res.status(200).json({
            message: 'successfully deleted.',
            data
        });
    });

    static getNearbyJobs = asyncErrorHandler(async (req, res, next) => {
        const {
            zipcode,
            distance
        } = req.params;
        const loc = await nominatimClient.search({
            q: zipcode, // zipcode or address or etc
            addressdetails: '1'
        });
        const latitude = loc[0].lat;
        const longitude = loc[0].lon;
        const radius = distance / 3963;

        const jobs = await Job.find({
            location: {
                $geoWithin: {
                    $centerSphere: [
                        [longitude, latitude], radius
                    ]
                }
            }
        });

        res.status(200).json({
            'count': jobs.length,
            'data': jobs,
            'loc': loc
        });
    });

    static getStats = asyncErrorHandler(async (req, res, next) => {
        const topic = req.params.topic;
        const stats = await Job.aggregate([{
                $match: {
                    $text: {
                        $search: topic
                    }
                }
            },
            // { $match: { $text: { $search: "\"" + topic + "\"" } } },
            {
                $group: {
                    _id: {
                        $toUpper: '$experience'
                    },
                    totalJobs: {
                        $sum: 1
                    },
                    avgPositions: {
                        $avg: '$positions'
                    },
                    avgSalary: {
                        $avg: '$salary'
                    },
                    minSalary: {
                        $min: '$salary'
                    },
                    maxSalary: {
                        $max: '$salary'
                    },
                }
            }
        ]);

        if (stats.length === 0) {
            return next(new ErrorHandler(`No stats found for ${topic}`, 404));
        }

        res.status(200).json({
            data: stats
        })
    });

    static applyJob = asyncErrorHandler(async (req, res, next) => {
        let job = await Job.findById(req.params.id).select('+applicantsApplied');
        if (!job) {
            return next(new ErrorHandler('Job not found.', 404));
        }
        // Check that if job last date has been passed or not
        if (job.lastDate < new Date(Date.now())) {
            return next(new ErrorHandler('You can not apply to this job. Date is over.', 400));
        }
        // Check if user has applied before
        for (const applicant of job.applicantsApplied) {
            if (applicant.id === req.user.id) {
                return next(new ErrorHandler('You have already applied for this job.', 400))
            }
        }
        // Check the files
        if (!req.files) {
            return next(new ErrorHandler('Please upload file.', 400));
        }
        // Check file type
        const file = req.files.file;
        const supportedFiles = /.docx|.pdf/;
        if (!supportedFiles.test(path.extname(file.name))) {
            return next(new ErrorHandler('Please upload document file.', 400))
        }
        // Check doucument size
        if (file.size > constants.maxFileSize) {
            return next(new ErrorHandler('Please upload file less than 2MB.', 400));
        }
        // Renaming resume
        file.name = `${req.user.name.replace(' ', '_')}_${job._id}${path.parse(file.name).ext}`;

        file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err => {
            if (err) {
                console.log(err);
                return next(new ErrorHandler('Resume upload failed.', 500));
            }

            await Job.findByIdAndUpdate(req.params.id, {
                $push: {
                    applicantsApplied: {
                        id: req.user.id,
                        resume: file.name
                    }
                }
            }, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            });

            res.status(200).json({
                success: true,
                message: 'Applied to Job successfully.',
                data: file.name
            })
        })
    });

}


export const jobs_controller = JobsController;