const HttpError = require('../models/http-error');
const Condition = require('../models/condition');
const mongoose = require('mongoose');

const getId = async (req, res, next) => {
    id=mongoose.Types.ObjectId();
    res.json(id)
}
const getConditionsbyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let conditions
    try {
        conditions =await Condition.find({patientId:patientId})
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης του ατομικού ιστορικού.', 500))
    }
    res.json({ conditionsList: conditions });
   
}
const deleteConditionsbyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let conditions
    try {
        conditions =await Condition.find({patientId:patientId})
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης του ατομικού ιστορικού.', 500))
    }
    res.json({ conditionsList: conditions });
   
}

exports.getId=getId;
exports.deleteConditionsbyPatientId=deleteConditionsbyPatientId;
exports.getConditionsbyPatientId = getConditionsbyPatientId;