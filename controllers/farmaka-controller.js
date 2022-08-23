const mongoose = require('mongoose');
const HttpError = require('../models/http-error');

const test = async (req, res, next) => {
    const { test } = req.body
    console.log(test)
}

exports.test = test;