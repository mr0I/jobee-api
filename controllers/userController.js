import User from "../models/User.js";
import Job from "../models/Job.js";
import { asyncErrorHandler } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/jwtToken.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import APIFilters from "../utils/apiFilters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class UserController {
    static getUserProfile = asyncErrorHandler(async (req, res, next) => {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'jobsPublished',
                select: 'title postingDate'
            });

        res.status(200).json({
            success: true,
            data: user
        })
    });

    static updatePassword = asyncErrorHandler(async (req, res, next) => {
        const user = await User.findById(req.user.id).select('+password');
        const isMatched = await user.comparePassword(req.body.currentPassword);
        if (!isMatched) {
            return next(new ErrorHandler('Old Password is incorrect.', 401));
        }

        user.password = req.body.newPassword;
        await user.save();

        sendToken(user, 200, res);
    });

    static updateUser = asyncErrorHandler(async (req, res, next) => {
        const user = await User.findByIdAndUpdate(req.user.id, {
            name: req.body.name,
            email: req.body.email
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            data: user
        });
    });

    static deleteUser = asyncErrorHandler(async (req, res, next) => {
        deleteUserData(req.user.id, req.user.role);

        const user = await User.findByIdAndDelete(req.user.id);
        res.cookie('token', 'none', {
            expires: new Date(Date.now()),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Your account has been deleted.'
        })
    });

    static getAppliedJobs = asyncErrorHandler(async (req, res, next) => {
        const jobs = await Job.find({ 'applicantsApplied.id': req.user.id }).select('+applicantsApplied');

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        })
    });

    static getPublishedJobs = asyncErrorHandler(async (req, res, next) => {
        const jobs = await Job.find({ user: req.user.id });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        })
    });

    static getUsers = asyncErrorHandler(async (req, res, next) => {
        const apiFilters = new APIFilters(User.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .pagination();

        const users = await apiFilters.query;

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        })
    });

    static deleteUserAdmin = asyncErrorHandler(async (req, res, next) => {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
        }

        deleteUserData(user.id, user.role);
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User is deleted by Admin.'
        });
    });
}

// Delete user files and employeer jobs
async function deleteUserData(user, role) {
    if (role === 'employeer') {
        await Job.deleteMany({ user: user });
    }

    if (role === 'user') {
        const appliedJobs = await Job.find({ 'applicantsApplied.id': user }).select('+applicantsApplied');

        for (let i = 0; i < appliedJobs.length; i++) {
            let obj = appliedJobs[i].applicantsApplied.find(o => o.id === user);

            let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace('\\controllers', '');

            fs.unlink(filepath, err => {
                if (err) return console.log(err);
            });

            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id));

            await appliedJobs[i].save();
        }
    }
}

export const user_controller = UserController;