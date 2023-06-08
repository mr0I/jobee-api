import User from "../models/User.js";
import asyncErrorHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/jwtToken.js";


class UserController {
    static getUserProfile = asyncErrorHandler(async (req, res, next) => {
        const user = await User.findById(req.user.id);

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
        //deleteUserData(req.user.id, req.user.role);

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