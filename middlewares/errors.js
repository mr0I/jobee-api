import ErrorHandler from "../utils/errorHandler.js";

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    console.log('errors', process.env.NODE_ENV);
    console.log('yargs1', global.isDev);
    console.log('yargs2', global.isProd);

    if (global.isDev) {
        console.log('dev');

        res.status(err.statusCode).json({
            success: false,
            error: err,
            errorMessage: err.message,
            stack: err.stack
        });
    }
    if (global.isProd) {
        console.log('prod');
        let error = { ...err };
        error.message = err.message;

        // Wrong Mongoose Object ID Error
        if (err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new ErrorHandler(message, 404);
        }

        // Handling Mongoose Validation Error
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 400);
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
}