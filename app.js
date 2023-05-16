import express from "express";
import dotenv from "dotenv";
import { routes } from "./routes.js";
import bodyParser from "body-parser";
import { ConnectDb } from "./config/db.js";
import http from "http";

http.Agent({ maxSockets: 100 });
dotenv.config({ path: '.env' });
const app = express();
ConnectDb();


const middleware = (req, res, next) => {
    // console.log('middleware');
    req.user = 'Ali';
    next();
}

app.use(middleware);

app.use(bodyParser.json());
routes(app);
app.use((err, req, res, next) => {
    res.status(422).send({ error: err.message });
});



const port = process.env.PORT;
const hostnName = '127.0.0.1';
app.listen(port, hostnName, () => {
    console.log(`🚀 Server started on http://${hostnName}:${port}`);
})