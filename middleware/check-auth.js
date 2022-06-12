const HttpError= require('../models/http-error');
const jwt=require('jsonwebtoken');

module.exports = (req, res, next) => {
    if(req.method==='OPTIONS'){
        next();
    }
    
    try {
        console.log(req.headers)
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return next(new HttpError('Authentication failed!',401));
        }
        const decodedToken=jwt.verify(token,'supersecret_dont_share');
        req.userData={userId:decodedToken.userId};
        next();
    } catch (err) {
        return next(new HttpError('Authentication failed !', 401));
    }
}