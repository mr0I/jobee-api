class IndexController {
    static async index(req, res, next) {
        res.status(200).json({
            success: true,
            user: req.user,
            message: 'index page'
        })
    }
}


export const index_controller = IndexController;