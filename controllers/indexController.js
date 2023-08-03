import { asyncErrorRenderer } from "../middlewares/catchAsyncErrors.js";

class IndexController {
    static home = asyncErrorRenderer(async (req, res, next) => {
        res.render('home', { title: 'Home Page' })
    });

}


export const index_controller = IndexController;