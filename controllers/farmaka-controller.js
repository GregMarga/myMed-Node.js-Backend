const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Farmako = require("../models/farmako");
const Therapeia = require('../models/therapeia');
const Visit = require('../models/visit');



const getFarmakabyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let farmaka;
    try {
        farmaka = await Farmako.find({ patient: patientId })
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης φαρμακευτικής αγωγής.', 500))
    }
    res.json({ farmakaList: farmaka });
}


const createFarmako = async (req, res, next) => {
    const patientId = req.params.pid;
    const { name, ATC_name, dateOfStart, dateOfEnd } = req.body;


    const createdFarmako = new Farmako({
        _id: mongoose.Types.ObjectId(),
        name,
        ATC_name,
        dateOfStart,
        dateOfEnd,
        patient: patientId
    });
    let patient;

    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία της φαρμακευτικής αγωγής απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει ασθενής για την δημιουργία της φαρμακευτικής του αγωγής.', 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdFarmako.save({ session: sess });
        patient.farmako.push(createdFarmako);

        await patient.save({ session: sess });

        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η δημιουργία φαρμακευτικής αγωγής απέτυχε,παρακαλώ δοκιμάστε ξανά.',
            500
        );
        return next(error);
    }

    res.status(201).json({ farmako: createdFarmako });
}
const updateFarmako = async (req, res, next) => {
    const patientId = req.params.pid;
    const farmakoId = req.params.farmakoId;
    const { dateOfStart, dateOfEnd } = req.body;

    let farmako;
    try {
        farmako = await Farmako.findById(farmakoId).populate('patient');
    } catch (err) {
        console.log(err)
        return next(new HttpError('Δεν βρέθηκε η φαρμακευτική αγωγή προς ενημέρωση.', 500));
    }
    if (!farmako) {
        return next(new HttpError('Δεν βρέθηκε η φαρμακευτική αγωγή προς ενημέρωση.', 404));
    }
    farmako.dateOfEnd = dateOfEnd;
    farmako.dateOfStart = dateOfStart;
    try {
        await farmako.save()
    } catch (err) {
        const error = new HttpError('Αποτυχία ενημέρωσης φαρμακευτικής αγωγής,προσπαθήστε ξανά.', 500);
        return next(error);
    }
    res.json(farmako)
}

const deleteFarmako = async (req, res, next) => {
    const patientId = req.params.pid;
    const farmakoId = req.params.farmakoId;

    let farmako,therapeia,visit;

    try {
        farmako = await Farmako.findById(farmakoId).populate('patient');
    } catch (err) {
        console.log(err)
        return next(new HttpError('Δεν βρέθηκε η φαρμακευτική αγωγή προς διαγραφή.', 500));
    }
    for (let i = 0; i < farmako.therapeia.length; i++) {
        try {
            therapeia = await Therapeia.findById(farmako.therapeia[i]).populate('visit');
        } catch (err) {
            console.log(err)
            return next(new HttpError('Δεν βρέθηκε η φαρμακευτική αγωγή προς διαγραφή.', 500));
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            therapeia.deleteOne({ session: sess })
            therapeia.visit.therapeia.pull(therapeia);
            await therapeia.visit.save({ session: sess });
            await sess.commitTransaction();
    
        } catch (err) {
            console.log(err)
            const error = new HttpError('Αποτυχία διαγραφής φαρμακευτικής αγωγής,προσπαθήστε ξανά.', 500);
            return next(error);
        };
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await farmako.remove({ session: sess });
        farmako.patient.farmako.pull(farmako);
        await farmako.patient.save({ session: sess });
        await sess.commitTransaction();

    } catch (err) {
        console.log(err)
        const error = new HttpError('Αποτυχία διαγραφής φαρμακευτικής αγωγής,προσπαθήστε ξανά.', 500);
        return next(error);
    };

    res.json({ status: 'deleted' });
}


exports.getFarmakabyPatientId = getFarmakabyPatientId;
exports.createFarmako = createFarmako;
exports.updateFarmako = updateFarmako;
exports.deleteFarmako = deleteFarmako;