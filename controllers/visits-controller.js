const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Visit = require('../models/visit');

const createVisit = async (req, res, next) => {
    const { date, diagnosis, patient } = req.body;

    const createdVisit = new Visit({
        date,
        diagnosis,
        patient
    });
    let visitor;
    try {
        visitor = await Patient.findById(patient);
    } catch (err) {
        return next(new HttpError('Creating new Visit failed.', 500));
    }
    if (!visitor) {
        return next(new HttpError('Could not find a Patient for provided id.', 404));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdVisit.save({ session: sess });
        visitor.visits.push(createdVisit);
        await visitor.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating visit failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ place: createdVisit });
}

exports.createVisit=createVisit;