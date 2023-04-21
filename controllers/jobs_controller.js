class JobsController {
    static async index(req, res, next) {
        res.status(200).json({
            success: true,
            message: 'jobs page'
        })
    }
}


export const jobs_controller = JobsController;