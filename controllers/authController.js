import User from "../models/User.js";
import {
    asyncErrorHandler
} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import {
    sanitizeObject
} from "../utils/helpers.js";
import Joi from "joi";


const userCreateSchema = Joi.object({
    name: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: {
            allow: ['com', 'net']
        }
    }).required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    // repeat_password: Joi.ref('password'),
    role: Joi.string().optional(),
    // native_attributes: Joi.object({
    //   price: Joi.object({
    //     min: Joi.number().optional(),
    //     max: Joi.number().optional(),
    //   }).optional(),
    //   inStock: Joi.bool().optional(),
    // }).optional(),
    // attributes: Joi.array()
    //   .items(
    //     Joi.object({
    //       key: Joi.string().required(),
    //       range_value: Joi.object({
    //         min: Joi.number().required(),
    //         max: Joi.number().required(),
    //       }).optional(),
    //       value: Joi.alternatives([Joi.number(), Joi.string()]).optional(),
    //     }).required()
    //   )
    //   .optional(),
})


class AuthController {
    static registerUser = asyncErrorHandler(async (req, res, next) => {
        const {
            error,
            value
        } = userCreateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                'success': false,
                'error': error.message
            })
        }
        const {
            name,
            email,
            password,
            role
        } = value;

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        sendToken(user, 200, res);
    });

    static loginUser = asyncErrorHandler(async (req, res, next) => {
        const {
            email,
            password
        } = await sanitizeObject(req.body);

        if (!email || !password) {
            return next(new ErrorHandler('Please Enter email and password', 400));
        }

        const user = await User.findOne({
            email
        }).select('+password');
        if (!user) {
            return next(new ErrorHandler('Invalid Email or Password.', 401))
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler('Invalid Email or Password', 401));
        }

        sendToken(user, 200, res);
    })

    static forgotPassword = asyncErrorHandler(async (req, res, next) => {
        const user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            return next(new ErrorHandler('No user found for this email'), 404);
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({
            validateBeforeSave: false
        });

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
        const message = `Your password reset link is as follow:\n\n${resetUrl}\n\n If you have not request this, then please ignore that.`

        try {
            await sendEmail({
                email: user.email,
                subject: 'Jobbee-API Password Recovery',
                message
            });

            res.status(200).json({
                success: true,
                message: `Email sent successfully to: ${user.email}`
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({
                validateBeforeSave: false
            });

            return next(new ErrorHandler('Email is not sent.'), 500);
        }
    });

    static resetPassword = asyncErrorHandler(async (req, res, next) => {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {
                $gt: Date.now()
            }
        });
        if (!user) {
            return next(new ErrorHandler('Reset password token is invalid or expired!', 400));
        }

        // Setup new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendToken(user, 200, res);
    });

    static logout = asyncErrorHandler(async (req, res, next) => {
        res.cookie('token', 'none', {
            expires: new Date(Date.now()),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully.'
        });
    });
}

export const auth_controller = AuthController;