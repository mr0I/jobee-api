import RateLimit from 'express-rate-limit';
import googleBotVerify from 'googlebot-verify';


const apiLimiterGoogleHandler = async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let isGoogleBot = false;
    try {
        isGoogleBot = await googleBotVerify(ip);
    } catch (e) {
        console.error('googlebot-verify', e.message);
        isGoogleBot = false;
    }

    if (!isGoogleBot) {
        return res.status(429).send("Too many requests, please try again later.");
    }
    next();
}

const apiLimiter = RateLimit({
    windowMs: 60 * 1000, // in ms
    max: 150, // limit each IP to {max} requests per {windowMs}
    handler: apiLimiterGoogleHandler,
});
const pageLimiter = RateLimit({
    windowMs: 60 * 1000,
    max: 150,
    handler: apiLimiterGoogleHandler,
});


export default {
    apiLimiter,
    pageLimiter
}