const { default: mongoose } = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const User = require('../models/user');



const getAllpatients = async (req, res, next) => {
    let patients;
    const userId = req.params.userId;
    const q = req.query;
    try {
        patients = await Patient.find({
            'doctor': userId,
            'name': { $regex: `^${q.name}`, '$options': 'xi' },
            'sirname': { $regex: `^${q.sirname}`, '$options': 'xi' },
            'diagnosis': { $regex: `^${q.diagnosis}`, '$options': 'xi' },
            // 'age':{$regex:'', '$options' : 'xi'},
            'tel': { $regex: `${q.tel}`, '$options': 'xi' },
            'amka': { $regex: `^${q.amka}`, '$options': 'xi' },
        }).sort('-date');
    } catch (err) {
        console.log(err)
        return next(new HttpError('Fetching patients failed,please try again later.', 500));
    }
    res.json(patients)

};
const searchPatients = async (req, res, next) => {
    let patients;
    const { name, sirname, tel, amka } = req.body;
    const userId = req.params.userId;
    try {
        patients = await Patient.find({
            'doctor': userId,
            'name': { $regex: `${name}`, '$options': 'xi' },
            'sirname': { $regex: `${sirname}`, '$options': 'xi' },
            // 'age':{$regex:'', '$options' : 'xi'},
            'tel': { $regex: `${tel}`, '$options': 'xi' },
            'amka': { $regex: `${amka}`, '$options': 'xi' },
        });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Fetching patients failed,please try again later.', 500));
    }
    res.json(patients)
    // console.log(res.statusCode);
};

const findPatientById = async (req, res, next) => {
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
    console.log(patient);
    res.json(patient);

};

const updatePatient = async (req, res, next) => {
    const patientId = req.params.pid;
    const { sirname, name, diagnosis, dateOfBirth, tel, amka } = req.body;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        const error = new HttpError('Something went wrong,could not update patient', 500);
        return next(error);
    }

    if (patient.doctor.toString() !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this patient', 401));
    }

    patient.name = name;
    patient.sirname = sirname;
    patient.dateOfBirth = dateOfBirth;
    patient.tel = tel;
    patient.amka = amka;
    try {
        await patient.save();
    } catch (err) {
        const error = new HttpError('Could not update Patient,please try again.', 500);
        return next(error);
    };

    res.status(200).json(patient);


}

const deletePatient = async (req, res, next) => {
    const patientId = req.params.pid;
    let patient;
    try {
        patient = await Patient.findById(patientId).populate('doctor');
    } catch (err) {
        return next(new HttpError('Could not find the patient to delete,please try again later.', 500));
    }
    if (patient.doctor.id !== req.userData.userId) {
        return next(new HttpError('You are not allowed to delete this patient', 401));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await patient.remove({ session: sess });
        patient.doctor.patients.pull(patient);
        await patient.doctor.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError('Could not delete patient, please try again later.', 500));
    }

    res.json(patient)
};
const createPatient = async (req, res, next) => {
    const { sirname, name, diagnosis, dateOfBirth, tel, amka, uid } = req.body;
    let patient;
    try {
        patient = await Patient.findOne({ amka: amka });
    } catch (err) {
        return next(new HttpError('Κάτι πήγε στραβά,παρακαλώ προσπαθήστε ξανά.'));
    }
    if (patient) {
        return next(new HttpError('Υπάρχει ήδη καταχωρημένος αυτός ο ασθενής.'));
    }
    const myId = mongoose.Types.ObjectId();
    const createdPatient = new Patient({
        _id: myId,
        name,
        sirname,
        diagnosis,
        dateOfBirth,
        tel,
        amka,
        doctor: uid,
        basic: null,
        anamnistiko: null,
        files: [],
        visits: [],
        exams: [],
        farmako:[]
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
        await createdPatient.save({ session: sess });
        doctor.patients.push(createdPatient);
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
    res.status(201).json({ _id: myId, name, sirname, diagnosis, dateOfBirth, tel, amka });

};


exports.getAllpatients = getAllpatients;
exports.searchPatients = searchPatients;
exports.findPatientById = findPatientById;
exports.updatePatient = updatePatient;
exports.deletePatient = deletePatient;
exports.createPatient = createPatient;