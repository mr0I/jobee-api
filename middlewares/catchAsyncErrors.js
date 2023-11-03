export const asyncErrorHandler = function (callback) {
    return (req, res, next) => Promise.resolve(callback(req, res, next)).catch(next);
}

export const asyncErrorRenderer = function (callback) {
    return async (req, res, next) => {
        try {
            await callback(req, res, next);
        } catch (e) {
            res.status(500).render('error', {
                layout: false,
                error: global.isProd ? 'Fatal Error' : e
            });
        }
    }
}


