const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true,
        //secure: global.isProd ? true : false
    };

    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token
        });
}

export default sendToken;