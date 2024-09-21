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
import morgan from "morgan";
import { xss } from "express-xss-sanitizer";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (app) => {
  app.use(bodyParser.json({ limit: "8mb" }));
  app.use(bodyParser.urlencoded({ extended: true }));
  /** logging request info */
  const ipFormat = global.isProd ? ":remote-addr" : "";
  const format = `${ipFormat} :method :url :status :response-time ms :user-agent :date`;
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "../logs/access.log"),
    { flags: "a" }
  );
  //   const reqLogger = morgan("combined");
  const reqLogger = morgan(format, {
    stream: accessLogStream,
  });
  app.use(reqLogger);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", "'fonts.gstatic.com'"],
        },
        reportOnly: false,
      },
    })
  );
  app.use(express.static("public"));
  app.use(favicon(path.join(__dirname, "../public/assets", "favicon.ico")));
  app.use(cookieParser());
  app.use(fileUpload());
  app.use(xss);
  /** Sanitize Data */
  app.use(mongoSanitize()); // prevent no sql injection
  /** Prevent HTTP Parameter Pollution attacks */
  app.use(
    hpp({
      whitelist: ["positions"],
    })
  );
  /** Rate Limit */
  app.use(
    rateLimit({
      windowMs: 10 * 60 * 1000, // 10 mins
      max: 100,
    })
  );
  /** Setup Cors */
  if (global.isProd) {
    app.use(cors({ origin: "url" }));
    app.options("*", cors({ origin: "url" }));
  } else {
    app.use(cors());
    app.options("*", cors());
  }
  /** Viewengine */
  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", path.join(__dirname, "../views"));
  /** Handle unhandled routes */
  app.all("*", (req, res, next) => {
    res.status(404).render("not_found", {
      layout: false,
      error: {
        message: "صفحه یافت نشد",
        stack: "",
      },
    });
    // next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
  });
  app.enable("view cache");
  // app.get('/robots.txt', require('./routes/robots/index'));
  /** Middleware to handle errors */
  app.use(errorMiddleware);
};
