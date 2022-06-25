const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Blood = require('../models/labTests/blood');
const Parathyro = require('../models/labTests/parathyro');
const Thyro = require('../models/labTests/thyro');
const Patient = require('../models/patient');

const getLabTests = async (req, res, next) => {
    const userId = req.params.pid;
    const visitId = req.query.visitId;

    let lab_tests = [];
    try {
        if ((visitId === 'null')) {
            blood_tests = await Blood.find({ patient: userId })
        } else {
            blood_tests = await Blood.find({ patient: userId, visitId: visitId })
        }
        blood_tests.map((test) => {
            test = { ...test, type: 'blood' }
            lab_tests.push(test)
        });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Fetching lab test info failed,please try again later.', 500));
    }
    try {
        if ((visitId === 'null')) {
            parathyro_tests = await Parathyro.find({ patient: userId });
        } else {
            parathyro_tests = await Parathyro.find({ patient: userId, visitId: visitId })
        }
        parathyro_tests.map((test) => {
            test = { ...test, type: 'parathyro' }
            lab_tests.push(test)
        });
    } catch (err) {
        return next(new HttpError('Fetching lab test info failed,please try again later.', 500));
    }
    try {
        if ((visitId === 'null')) {
            thyro_tests = await Thyro.find({ patient: userId });
        } else {
            thyro_tests = await Thyro.find({ patient: userId, visitId: visitId })
        }
        thyro_tests.map((test) => {
            test = { ...test, type: 'thyro' }
            lab_tests.push(test)
        });
    } catch (err) {
        return next(new HttpError('Fetching lab test info failed,please try again later.', 500));
    }
    res.json(lab_tests);
};
const createLabTest = async (req, res, next) => {
    console.log(req.body)
    const patientId = req.params.pid;
    const [type, date, visitId] = [req.body.type, req.body.date, req.body.visitId];
    if (type === 'blood') {
        const { kallio, natrio, asbestio, ht, mcv, sgot, b12, hb } = req.body;
        const createdBlood = new Blood({
            date,
            visitId,
            kallio,
            natrio,
            asbestio,
            ht,
            mcv, sgot,
            b12,
            hb,
            patient: patientId
        });
        let patient;

        try {
            patient = await Patient.findById(patientId);
        } catch (err) {
            console.log(err);
            return next(new HttpError('Creating blood tests  failed.', 500));
        }
        if (!patient) {
            return next(new HttpError('Could not find a Patient for provided id.', 404));
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdBlood.save({ session: sess });
            patient.blood.push(createdBlood);
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Creating blood tests failed, please try again.',
                500
            );
            return next(error);
        }

        res.status(201).json({ blood: createdBlood })

    } else if (type === 'Thyro') {
        const { tsh, t4, ft4, t3, ft3, abtpo, trab, ct, tg } = req.body;
        const createdThyro = new Thyro({
            date,
            visitId,
            tsh, t4, ft4, ft3, t3, abtpo, trab, ct, tg,
            patient: patientId
        });
        let patient;
        try {
            patient = await Patient.findById(patientId);
        } catch (err) {
            return next(new HttpError('Creating thyro tests  failed.', 500));
        }
        if (!patient) {
            return next(new HttpError('Could not find a Patient for provided id.', 404));
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdThyro.save({ session: sess });
            patient.thyro.push(createdThyro);
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Creating thyro tests failed, please try again.',
                500
            );
            return next(error);
        }

        res.status(201).json({ thyro: createdThyro })

    } else if (type === 'parathyro') {
        const { pth, vitd, ca, p, alvoumini, kreatanini } = req.body;
        const createdParathyro = new Parathyro({
            date,
            visitId,
            pth, vitd, ca, p, alvoumini, kreatanini,
            patient: patientId
        });
        let patient;
        try {
            patient = await Patient.findById(patientId);
        } catch (err) {
            return next(new HttpError('Creating parathyro tests  failed.', 500));
        }
        if (!patient) {
            return next(new HttpError('Could not find a Patient for provided id.', 404));
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdParathyro.save({ session: sess });
            patient.parathyro.push(createdParathyro);
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Creating parathyro tests failed, please try again.',
                500
            );
            return next(error);
        }

        res.status(201).json({ parathyro: createdParathyro })
    }
}
const updateLabTest = async (req, res, next) => {
    const labId = req.params.labId;
    const [type, date, visitId] = [req.body.type, req.body.date, req.body.visitId];
    let labTest;
    if (type === 'blood') {
        const { kallio, natrio, asbestio, ht, mcv, sgot, b12, hb } = req.body;
        try {
            labTest = await Blood.findById(labId);
        } catch (err) {
            const error = new HttpError('Something went wrong,could not update blood test', 500);
            return next(error);
        }
        labTest.date = date;
        labTest.visitId = visitId;
        labTest.kallio = kallio;
        labTest.natrio = natrio;
        labTest.asbestio = asbestio;
        labTest.sgot = sgot;
        labTest.ht = ht;
        labTest.mcv = mcv;
        labTest.b12 = b12;
        labTest.hb = hb;


        try {
            await labTest.save();
        } catch (err) {
            const error = new HttpError('Could not update blood test,please try again.', 500);
            return next(error);
        };
    }
    else if (type === 'thyro') {
        const { tsh, t4, ft4, t3, ft3, abtpo, trab, ct, tg } = req.body;
        try {
            labTest = await Thyro.findById(labId);
        } catch (err) {
            const error = new HttpError('Something went wrong,could not update thyro test', 500);
            return next(error);
        }
        labTest.date = date;
        labTest.visitId = visitId;
        labTest.tsh = tsh;
        labTest.t4 = t4;
        labTest.ft4 = ft4;
        labTest.ft3 = ft3;
        labTest.t3 = t3;
        labTest.abtpo = abtpo;
        labTest.trab = trab;
        labTest.ct = ct;
        labTest.tg = tg;
        try {
            await labTest.save();
        } catch (err) {
            const error = new HttpError('Could not update thyro test,please try again.', 500);
            return next(error);
        };
    }
    else if (type === 'parathyro') {
        const { pth, vitd, ca, p, alvoumini, kreatanini } = req.body;
        try {
            labTest = await Parathyro.findById(labId);
        } catch (err) {
            console.log(err)
            const error = new HttpError('Something went wrong,could not update parathyro test', 500);
            return next(error);
        }
        labTest.date = date;
        labTest.visitId = visitId;
        labTest.pth = pth;
        labTest.vitd = vitd;
        labTest.ca = ca;
        labTest.p = p;
        labTest.alvoumini = alvoumini;
        labTest.kreatanini = kreatanini;
        try {
            await labTest.save();
        } catch (err) {
            const error = new HttpError('Could not update parathyro test,please try again.', 500);
            return next(error);
        };
    }

    res.status(200).json(labTest);
}


exports.updateLabTest = updateLabTest;
exports.getLabTests = getLabTests;
exports.createLabTest = createLabTest;