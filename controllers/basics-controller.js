const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const fs = require('fs');
const Patient = require('../models/patient');
const User = require('../models/user');

const getBasics = async (req, res, next) => {
    const patientId = req.params.pid;
    console.log('patientId:', patientId)
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Κάτι πήγε λάθος,δεν φορτώθηκαν τα στοιχεία του ασθενή.', 500));
    }
    res.json(patient)

};
const createImageBasics = async (req, res, next) => {
    const myId = mongoose.Types.ObjectId();
    const { patientId, sirname, name, amka, tel, dateOfBirth, placeOfBirth, job, familyStatus, gender, address, area, postalCode, email, fathersName, uid } = req.body;
    const file = req.file.path;
    let patient;

    try {
        patient = await Patient.findOne({ amka: amka });
    } catch (err) {
        return next(new HttpError('Κάτι πήγε λάθος,παρακαλώ προσπαθήστε ξανά.'));
    }
    if (patient && (patientId === null)) {
        return next(new HttpError('Υπάρχει ήδη καταχωρημένος ασθενής με αυτό το ΑΜΚΑ.'));
    } else {
        const createdBasics = new Patient({
            _id: myId,
            sirname,
            name,
            amka,
            tel,
            dateOfBirth,
            placeOfBirth,
            job,
            familyStatus,
            fathersName,
            gender,
            address,
            area,
            postalCode,
            email,
            doctor: uid,
            basic: null,
            anamnistiko: null,
            files: file,
            visits: []
        });
        let doctor;
        try {
            doctor = await User.findById(uid);
        } catch (err) {
            console.log(err)
            return next(new HttpError('Creating new Patient failed.', 500));
        }
        if (!doctor) {
            return next(new HttpError('Could not find a User for provided id.', 404));
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdBasics.save({ session: sess });
            doctor.patients.push(createdBasics);
            await doctor.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Creating patient failed, please try again.',
                500
            );
            return next(error);
        }

        res.status(201).json({ patient: createdBasics });
    }
}


const createBasics = async (req, res, next) => {
    const myId = mongoose.Types.ObjectId();
    const { patientId, sirname, name, amka, tel, dateOfBirth, placeOfBirth, job, familyStatus, gender, address, area, postalCode, email, fathersName, uid } = req.body;
    let patient;

    try {
        patient = await Patient.findOne({ amka: amka });
    } catch (err) {
        return next(new HttpError('Κάτι πήγε λάθος,παρακαλώ προσπαθήστε ξανά.'));
    }
    if (patient && (patientId === null)) {
        return next(new HttpError('Υπάρχει ήδη καταχωρημένος ασθενής με αυτό το ΑΜΚΑ.'));
    } else {
        const createdBasics = new Patient({
            _id: myId,
            sirname,
            name,
            amka,
            tel,
            dateOfBirth,
            placeOfBirth,
            job,
            familyStatus,
            fathersName,
            gender,
            address,
            area,
            postalCode,
            email,
            doctor: uid,
            basic: null,
            anamnistiko: null,

            visits: []
        });
        let doctor;
        try {
            doctor = await User.findById(uid);
        } catch (err) {
            console.log(err)
            return next(new HttpError('Creating new Patient failed.', 500));
        }
        if (!doctor) {
            return next(new HttpError('Could not find a User for provided id.', 404));
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdBasics.save({ session: sess });
            doctor.patients.push(createdBasics);
            await doctor.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Creating patient failed, please try again.',
                500
            );
            return next(error);
        }

        res.status(201).json({ patient: createdBasics });
    }
}



const updateImageBasics = async (req, res, next) => {
    console.log('here')
    const { sirname, name, amka, tel, dateOfBirth, placeOfBirth, job, familyStatus, gender, address, area, postalCode, email, fathersName } = req.body;
    let patient;
    const patientId = req.params.pid
    const file = req.file.path;

    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Κάτι πήγε λάθος,δεν βρέθηκε αυτός ο ασθενής.'));
    }

    if (!!patient.files) {
        fs.unlink(`uploads/images/${patient.files.split('\\')[2]}`, (err) => {
            console.log(err)
        });
    }


    patient.sirname = sirname
    patient.name = name
    patient.amka = amka
    patient.tel = tel
    patient.dateOfBirth = dateOfBirth
    patient.placeOfBirth = placeOfBirth
    patient.job = job
    patient.familyStatus = familyStatus
    patient.fathersName = fathersName
    patient.gender = gender
    patient.address = address
    patient.area = area
    patient.postalCode = postalCode
    patient.email = email
    patient.files = file;


    try {
        await patient.save();
    } catch (err) {
        const error = new HttpError('Αποτυχία ενημέρωσης στοιχείων ασθενή,παρακαλώ προσπαθήστε ξανά.', 500);
        return next(error);
    };

    res.status(201).json(patient);

}

const updateBasics = async (req, res, next) => {
    const { sirname, name, amka, tel, dateOfBirth, placeOfBirth, job, familyStatus, gender, address, area, postalCode, email, fathersName } = req.body;
    let patient;
    const patientId = req.params.pid

    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Κάτι πήγε λάθος,δεν βρέθηκε αυτός ο ασθενής.'));
    }
    patient.sirname = sirname
    patient.name = name
    patient.amka = amka
    patient.tel = tel
    patient.dateOfBirth = dateOfBirth
    patient.placeOfBirth = placeOfBirth
    patient.job = job
    patient.familyStatus = familyStatus
    patient.fathersName = fathersName
    patient.gender = gender
    patient.address = address
    patient.area = area
    patient.postalCode = postalCode
    patient.email = email


    try {
        await patient.save();
    } catch (err) {
        console.log(err)
        const error = new HttpError('Αποτυχία ενημέρωσης στοιχείων ασθενή,παρακαλώ προσπαθήστε ξανά.', 500);
        return next(error);
    };

    res.status(201).json(patient);

}

exports.createImageBasics = createImageBasics;
exports.getBasics = getBasics;
exports.createBasics = createBasics;
exports.updateBasics = updateBasics;
exports.updateImageBasics = updateImageBasics;