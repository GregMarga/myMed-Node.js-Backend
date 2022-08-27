const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Basics = require('../models/basics');
const Patient = require('../models/patient');
const User = require('../models/user');

const getBasics = async (req, res, next) => {
    const patientId = req.params.pid;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Κάτι πήγε λάθος,δεν φορτώθηκαν τα στοιχεία του ασθενή.', 500));
    }
    res.json(patient)
    // let basics;
    // try {
    //     basics = await Basics.findOne({ patient: userId }).sort({ field: 'asc', _id: -1 });
    // } catch (err) {
    //     return next(new HttpError('Fetching basics info failed,please try again later.', 500));
    // }
    // res.json(basics)
};
const createBasics = async (req, res, next) => {
    const myId = mongoose.Types.ObjectId();
    const { patientId, sirname, name, amka, tel, dateOfBirth, placeOfBirth, job, familyStatus, gender, address, area, postalCode, email, fathersName, uid } = req.body;
    let patient;
    console.log(patientId)
    try {
        patient = await Patient.findOne({ amka: amka });
    } catch (err) {
        return next(new HttpError('Κάτι πήγε λάθος,παρακαλώ προσπαθήστε ξανά.'));
    }
    if (patient && (patientId === null)) {
        return next(new HttpError('Υπάρχει ήδη καταχωρημένος αυτός ο ασθενής.'));
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
            files: [],
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
const updateBasics = async (req, res, next) => {
    const { patientId, sirname, name, amka, tel, dateOfBirth, placeOfBirth, job, familyStatus, gender, address, area, postalCode, email, fathersName, uid } = req.body;
    let patient;
    console.log(patientId)
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
        const error = new HttpError('Αποτυχία ενημέρωσης στοιχείων ασθενή,παρακαλώ προσπαθήστε ξανά.', 500);
        return next(error);
    };

    res.status(201).json(patient);

}


exports.getBasics = getBasics;
exports.createBasics = createBasics;
exports.updateBasics = updateBasics;