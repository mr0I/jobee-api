import express from "express";
import dotenv from "dotenv";
import { routes } from "./routes/index.js";
import { ConnectDb } from "./config/db.js";
import http from "http";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import cluster from "cluster";
import { cpus } from "os";

const argv = yargs(hideBin(process.argv)).argv;
http.Agent({ maxSockets: 100 });
dotenv.config({ path: ".env" });
const app = express();
ConnectDb();

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down due to uncaught exception.");
  process.exit(1);
});

// const middleware = (req, res, next) => {
//     req.user = 'Ali';
//     next();
// }
// app.use(middleware);

global.isDev = argv["dev"];
global.isProd = argv["prod"];

// Cli operations
import { ops as operations } from "./utils/ops.js";
const op = argv["op"];
if (op && operations[op]) {
  operations[op]()
    .then((res) => {
      console.log(res);
    })
    .catch((e) => console.error(e));
}

routes(app);

import m from "./app/setup.js";
m(app);

if (cluster.isPrimary && !isDev) {
  for (let i = 0; i < cpus().length; i++) {
    cluster.fork(); // Fork workers.
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const port = process.env.PORT || 3000;
  const hostName = "127.0.0.1";
  const server = app.listen(port, hostName, () => {
    console.log(
      `🚀 Server started on http://${hostName}:${port} and worker ${process.pid}`
    );
  });

  // Handling Unhandled Promise Rejection
  process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to Unhandled promise rejection.");
    server.close(() => {
      process.exit(1);
    });
  });
}
