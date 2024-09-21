import express from "express";
import dotenv from "dotenv";
import { routes } from "./routes/index.js";
import http from "http";
import cluster from "cluster";
import { cpus } from "os";
import { PORT as port } from "./config/configs.js";
import { logger } from "./utils/logger.js";
import { Server } from "socket.io";
import setup from "./setup/index.js";
dotenv.config({ path: ".env" });
http.Agent({ maxSockets: 100 });

// const middleware = (req, res, next) => {
//     req.user = 'Ali';
//     next();
// }
// app.use(middleware);

const exitHandler = (server) => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};
const unexpectedErrorHandler = (server) => {
  return function (err) {
    console.log(`ERROR: ${err.message}`);
    console.log("Shutting down due to uncaught exception.");
    exitHandler(server);
  };
};

const startServer = async () => {
  const app = express();
  await routes(app);
  await setup(app);

  if (cluster.isPrimary && !isDev) {
    for (let i = 0; i < cpus().length; i++) {
      cluster.fork(); // Fork workers.
    }
    cluster.on("online", (worker) => {
      console.log(`worker id is ${worker.id} and pid is ${worker.process.pid}`);
    });
    cluster.on("exit", (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      console.log("forking new worker...");
      cluster.fork();
    });
  } else {
    const hostName = "127.0.0.1";
    const server = app.listen(port, hostName, () => {
      logger.info(
        `🚀 Server started on http://${hostName}:${port} and worker ${process.pid}`
      );
    });
    // const server = app.listen(process.argv[2]); // eg: node app.js 8080, node app.js 8081, node app.js 8082 ## to use subscribe method
    process.on("uncaughtException", unexpectedErrorHandler(server));
    process.on("unhandledRejection", unexpectedErrorHandler(server));
    process.on("SIGTERM", () => {
      // Handling ctrl+c
      console.log("SIGTERM received!");
      if (server) {
        server.close();
      }
    });

    // socket.io
    const io = new Server(server);
    // io.on("connection", (socket) => {
    //   socket.on("room.join", (room) => {
    //     console.log(socket.rooms);
    //     Object.keys(socket.rooms)
    //       .filter((r) => r != socket.id)
    //       .forEach((r) => socket.leave(r));

    //     setTimeout(() => {
    //       socket.join(room);
    //       socket.emit("event", `joined room ${room}`);
    //       socket.broadcast.to(room).emit("event", `someone joined room ${room}`);
    //     }, 0);
    //   });

    //   socket.on("event", (e) => {
    //     socket.broadcast.to(e.room).emit("event", `${e.name} says hello`);
    //   });
    // });

    // socket.io using namespaces
    const namespaceHandler = (namespace) => {
      return (socket) => {
        socket.emit("event", "You joined " + namespace.name);
        //just resend it
        socket.on("event", (data) => {
          socket.broadcast.emit("event", data);
        });
      };
    };
    const one = io.of("/namespace1");
    const two = io.of("/namespace2");
    one.on("connection", namespaceHandler(one));
    two.on("connection", namespaceHandler(two));
  }
};

startServer();
