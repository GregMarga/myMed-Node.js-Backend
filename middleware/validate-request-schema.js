// import { NextFunction, Request, Response } from "express";
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');


const validateRequestSchema = (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        return next(new HttpError(result.errors[0].msg, 400))
    }
    
    next()
}

module.exports = validateRequestSchema