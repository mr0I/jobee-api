import User from "../models/User.js";
import asyncErrorHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/jwtToken.js";


class AuthController {
    static registerUser = asyncErrorHandler(async (req, res, next) => {
        const { name, email, password, role } = req.body;
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        const token = user.getJwtToken();

        sendToken(user, 200, res);
    });

    static loginUser = asyncErrorHandler(async (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler('Please Enter email and password', 400));
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new ErrorHandler('Invalid Email or Password.', 401))
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler('Invalid Email or Password', 401));
        }
        //const token = user.getJwtToken();

        // res.status(200).json({
        //     message: 'user loggedin :D',
        //     token
        // })

        sendToken(user, 200, res);
    })
}

export const auth_controller = AuthController;