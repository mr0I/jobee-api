import User from "../models/users.js";
import asyncErrorHandler from "../middlewares/catchAsyncErrors.js";


class AuthController {
    static registerUser = asyncErrorHandler(async (req, res, next) => {
        const { name, email, password, role } = req.body;
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        res.status(200).json({
            message: 'user created:)',
            data: user
        })
    })
}

export const auth_controller = AuthController;