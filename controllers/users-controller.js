const HttpError = require('../models/http-error');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signup = async (req, res, next) => {
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Signing Up failed,please try again later', 500));
    }

    if (existingUser) {
        return next(new HttpError('Email exists already,please login instead', 422));
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError('Could not create user,please try again', 500));
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        patients: [],
        visits: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        console.log(err)
        const error = new HttpError('Signing up failed,please try again.', 500);
        return next(error);
    };

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            'supersecret_dont_share',
            { expiresIn: '1h' }
        );
    } catch (err) {
        return next(new HttpError('Signing up failed,please try again.', 500));
    }

    res.status(201).json({ user: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Logging in failed,please try again later', 500));
    }
    if (!existingUser) {
        return next(new HttpError('Invalid credentials,could not log you in', 401));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(new HttpError('Could not log you in ,please check your credentials again.', 500))
    }
    if (!isValidPassword) {
        return next(new HttpError('Invalid credentials,could not log you in', 401));
    }
    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            'supersecret_dont_share',
            { expiresIn: '1h' }
        )
    } catch (err) {
        return next(new HttpError('Logging in failed,please try again.', 500));
    }


    res.json({userId:existingUser.id,email:existingUser.email,token:token });
};

exports.signup = signup;
exports.login = login;