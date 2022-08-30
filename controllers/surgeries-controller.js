const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Surgery = require("../models/surgery");




const getSurgeriesbyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let surgeries;
    try {
        surgeries = Surgery.find({ patient: patientId })
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης ιστορικό χειρουργείων.', 500))
    }
    res.json({ SurgeriesList: surgeries });
}

exports.getSurgeriesbyPatientId=getSurgeriesbyPatientId;