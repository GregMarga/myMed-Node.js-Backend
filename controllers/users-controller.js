const HttpError = require('../models/http-error');
const User = require('../models/user');

const signup =async (req, res, next) => {
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser =await User.findOne({ email: email });
    } catch(err){
        return next(new HttpError('Signing Up failed,please try again later',500));
    }

    if (existingUser){
        return next(new HttpError('Email exists already,please login instead',422));
    }

    const createdUser = new User({
        name,
        email,
        password,
        patients:[],
        visits:[]
    });
    
    try {
        await createdUser.save();
    } catch (err) {
        console.log(err)
        const error = new HttpError('Signing up failed,please try again.', 500);
        return next(error);
    };

    res.status(201).json({ user: createdUser.toObject({getters:true}) });
};

const login =async (req, res, next) => {
    const { email, password } = req.body;
    
    let existingUser;
    try {
        existingUser =await User.findOne({ email: email });
    } catch(err){
        return next(new HttpError('Logging in failed,please try again later',500));
    }
    if (!existingUser||existingUser.password!==password){
        return next(new HttpError('Invalid credentials,could not log you in',401));
    }

    res.json({ message: 'Login!',user:existingUser.toObject({getters:true})});
};

exports.signup = signup;
exports.login = login;