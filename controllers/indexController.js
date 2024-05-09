import { asyncErrorRenderer } from "../middlewares/catchAsyncErrors.js";
// import Job from "../models/Job.js";

class IndexController {
    static home = asyncErrorRenderer(async (req, res, next) => {
        const data = [
            { name: 'ali', age: 30 },
            { name: 'reza', age: 20 }
        ];

        const jobs = await Job.find(); // test error renderer
        res.render('home', { title: 'Home Page', data: JSON.stringify(data), jobs })
    });

}


export const index_controller = IndexController;