import express from "express";
import errorMiddleware from "../middlewares/errors.js";
import ErrorHandler from "../utils/errorHandler.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors";
import favicon from "serve-favicon";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default (app) => {
    app.use(helmet());
    app.use(bodyParser.json({ limit: '8mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use(favicon(path.join(__dirname, '../public/assets', 'favicon.ico')));
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
    /** Viewengine */
    app.engine('handlebars', engine());
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, '../views'));
    /** Handle unhandled routes */
    app.all('*', (req, res, next) => {
        res.status(404).render('not_found', {
            layout: false,
            error: {
                message: 'صفحه یافت نشد',
                stack: '',
            }
        });
        // next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
    });
    app.enable('view cache');
    // app.get('/robots.txt', require('./routes/robots/index'));
    /** Middleware to handle errors */
    app.use(errorMiddleware);
}