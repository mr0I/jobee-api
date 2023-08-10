import { asyncErrorRenderer } from "../middlewares/catchAsyncErrors.js";

class IndexController {
    static home = asyncErrorRenderer(async (req, res, next) => {
        const data = [
            { name: 'ali', age: 30 },
            { name: 'reza', age: 20 }
        ];
        res.render('home', { title: 'Home Page', data: JSON.stringify(data) })
    });

}


export const index_controller = IndexController;