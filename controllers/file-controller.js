const Patient = require('../models/patient');
const mongoose = require('mongoose');

const saveFile =async (req, res, next) => {
    const patientId = req.params.pid;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        const error = new HttpError('Something went wrong,could not find a patient', 500);
        return next(error);
    }
    if (!patient) {
        return next(new HttpError('Could not find a patient for the provided id.', 404));
    }
    patient.files.push(req.file.path);
    try {
        await patient.save();
    } catch (err) {
        const error = new HttpError('Could not save file,please try again.', 500);
        return next(error);
    };

    res.status(200).json(patient);
}
const getFiles=async (req, res, next) => {
    const patientId = req.params.pid;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        const error = new HttpError('Something went wrong,could not find file', 500);
        return next(error);
    }
    if (!patient) {
        return next(new HttpError('Could not find a patient for the provided id.', 404));
    }
    res.json(patient.files);
}

exports.saveFile = saveFile;
exports.getFiles=getFiles;