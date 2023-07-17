import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncErrorHandler from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

const isAuth = asyncErrorHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    req.user = await User.findById((jwt.verify(token, process.env.JWT_SECRET)).id);
    next();
})

const authrizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role(${req.user.role}) is not allowed to access this resource.`, 403))
        }
        next();
    }
}


export const authMiddleware = {
    isAuth,
    authrizeRoles
}

