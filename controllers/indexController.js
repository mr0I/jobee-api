class IndexController {
    static async home(req, res, next) {
        res.render('home', { title: 'Home Page' })
    }
}


export const index_controller = IndexController;