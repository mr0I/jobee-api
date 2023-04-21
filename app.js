import express from "express";
import dotenv from "dotenv";
import { routes } from "./routes.js";
import bodyParser from "body-parser";
const app = express();


dotenv.config({ path: '.env' });
app.use(bodyParser.json());
routes(app);
app.use((err, req, res, next) => {
    res.status(422).send({ error: err.message });
});


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`🚀 Server started on port ${port}`);
})