import express from "express";
import dotenv from "dotenv";
import { routes } from "./routes/index.js";
import bodyParser from "body-parser";
import { ConnectDb } from "./config/db.js";
import http from "http";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import errorMiddleware from "./middlewares/errors.js";
import ErrorHandler from "./utils/errorHandler.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors";

const argv = yargs(hideBin(process.argv)).argv

http.Agent({ maxSockets: 100 });
dotenv.config({ path: '.env' });
const app = express();
ConnectDb();

// Handling Uncaught Exception
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down due to uncaught exception.')
    process.exit(1);
});

// const middleware = (req, res, next) => {
//     req.user = 'Ali';
//     next();
// }
// app.use(middleware);

global.isDev = argv['dev'];
global.isProd = argv['prod'];

/** Setup Security Headers */
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(cookieParser());
app.use(fileUpload());

/** Sanitize Data */
app.use(mongoSanitize());
/** Prevent HTTP Parameter Pollution attacks */
app.use(hpp({
    whitelist: ['positions']
}));
/** Rate Limit */
app.use(rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
}));

/** Setup Cors */
app.use(cors());

routes(app);

// Handle unhandled routes
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

/** Middleware to handle errors */
app.use(errorMiddleware);



const port = process.env.PORT;
const hostName = '127.0.0.1';
const server = app.listen(port, hostName, () => {
    console.log(`🚀 Server started on http://${hostName}:${port}`);
});

// Handling Unhandled Promise Rejection
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled promise rejection.')
    server.close(() => {
        process.exit(1);
    })
});

