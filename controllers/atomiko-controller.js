const HttpError = require('../models/http-error');
const Condition = require('../models/condition');
const Atomiko = require('../models/atomiko');
const Anamnistiko = require('../models/anamnistiko')
const Klironomiko = require('../models/klironomiko');
const Diagnosis = require('../models/diagnosis')
const mongoose = require('mongoose');


const getId = async (req, res, next) => {
    id = mongoose.Types.ObjectId();
    res.json(id)
}

const createConditionAtomiko = async (req, res, next) => {
    const patientId = req.params.pid;
    console.log(patientId)
    const { name, status, dateOfDiagnosis, dateOfHealing, _id } = req.body;
    console.log(name)
    let atomiko, anamnistiko;
    try {
        anamnistiko = await Anamnistiko.findOne({ patient: patientId });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία νέας πάθησης  απέτυχε.', 500));
    }
    if (!anamnistiko) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένο αναμνηστικό για τον συγκεκριμένο ασθενή.', 404));
    }
    try {
        atomiko = await Atomiko.findById(anamnistiko.atomiko);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία νέας πάθησης  απέτυχε.', 500));
    }
    if (!atomiko) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένο αναμνηστικό για τον συγκεκριμένο ασθενή.', 404));
    }
    const createdCondition = new Condition({
        _id: _id,
        name: name,
        status,
        allergy: false,
        dateOfDiagnosis: dateOfDiagnosis,
        dateOfHealing: dateOfHealing,
        atomiko: atomiko._id,
        patient: patientId,
        cleronomical: false

    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdCondition.save({ session: sess });
        atomiko.conditions.push(createdCondition);
        await atomiko.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η δημιουργία νέας πάθησης απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }

}


const getConditionsbyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let conditions, conditionsList = []
    try {
        conditions = await Condition.find({ patientId: patientId })
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης του ατομικού ιστορικού.', 500))
    }
    for (let i = 0; i < conditions.length; i++) {
        if (!conditions[i].cleronomical) {
            conditionsList.push(conditions[i])
        }
    }
    res.json({ conditionsList: conditionsList });

}


const getKlironomikobyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let conditions, conditionsList = []
    try {
        conditions = await Condition.find({ patientId: patientId })
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης του ατομικού ιστορικού.', 500))
    }
    for (let i = 0; i < conditions.length; i++) {
        if (conditions[i].cleronomical) {
            conditionsList.push(conditions[i])
        }
    }
    res.json({ klironomiko: conditionsList });

}


const getAllergiesbyPatientId = async (req, res, next) => {
    console.log('in')
    const patientId = req.params.pid;
    let conditions, allergiesList = []
    try {
        conditions = await Condition.find({ patientId: patientId })
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης  ιστορικού αλλεργιών. ', 500))
    }
    for (let i = 0; i < conditions.length; i++) {
        if (conditions[i].allergy) {
            allergiesList.push(conditions[i])
        }
    }
    res.json({ allergiesList: allergiesList });

}


const deleteConditionsbyId = async (req, res, next) => {
    const conditionId=req.params.conditionId;
    let condition, atomiko, klironomiko, diagnosis;
    try {
        condition = await Condition.findById(conditionId)
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία διαγραφής πάθησης.', 500))
    }

    //an einai sto atomiko anamnistiko h pathisi

    if (!!condition.atomiko) {
        try {
            atomiko = await Atomiko.findById(condition.atomiko)
        } catch (err) {
            console.log(err)
            return next(new HttpError('Αποτυχία διαγραφής πάθησης.', 500))
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            atomiko.conditions.pull(condition);
            await atomiko.save({ session: sess });
            await condition.deleteOne();
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Αποτυχία διαγραφής πάθησης,παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }

    }
    if (!!condition.diagnosis) {
        try {
            diagnosis = await Diagnosis.findById(condition.diagnosis)
        } catch (err) {
            console.log(err)
            return next(new HttpError('Αποτυχία διαγραφής πάθησης.', 500))
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            diagnosis.conditions.pull(condition);
            await diagnosis.save({ session: sess });
            await condition.deleteOne();
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Αποτυχία διαγραφής πάθησης,παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }
    }

    res.json({ conditionsList: condition });

}

exports.getId = getId;
exports.createConditionAtomiko=createConditionAtomiko;
exports.deleteConditionsbyId = deleteConditionsbyId;
exports.getConditionsbyPatientId = getConditionsbyPatientId;
exports.getAllergiesbyPatientId = getAllergiesbyPatientId;
exports.getKlironomikobyPatientId = getKlironomikobyPatientId;