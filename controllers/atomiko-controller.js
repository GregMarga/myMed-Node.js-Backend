const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Visit=require('../models/visit')
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
    const { name, status, dateOfDiagnosis, dateOfHealing, _id } = req.body;

    let atomiko, anamnistiko, patient;
    try {
        anamnistiko = await Anamnistiko.findOne({ patient: patientId });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία νέας πάθησης  απέτυχε.', 500));
    }
    if (!anamnistiko) {         /////////// an den yparxei anamnistiko dhmioyrgia toy

        let anamnistikoId = mongoose.Types.ObjectId();
        let atomikoId = mongoose.Types.ObjectId();
        try {
            patient = await Patient.findById(patientId);
        } catch (err) {
            return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
        }
        if (!patient) {
            return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
        }
        const createdAnamnistiko = new Anamnistiko({
            _id: anamnistikoId,
            surgeries: [],
            patient: patientId
        })
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdAnamnistiko.save({ session: sess });
            patient.anamnistiko = createdAnamnistiko;
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η Δημιουργία αναμνηστικού απέτυχε,παρακαλώ προσπαθηστε ξανά.',
                500
            );
            return next(error);
        }
        try {
            anamnistiko = await Anamnistiko.findById(anamnistikoId);
        } catch (err) {
            return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
        }
        if (!anamnistiko) {
            return next(new HttpError('Δεν υπάρχει καταγεγραμμένο αναμνηστικό.', 404));
        }
        const createdAtomiko = new Atomiko({
            _id: atomikoId,
            conditions: [],
            anamnistiko: anamnistikoId
        });
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdAtomiko.save({ session: sess });
            anamnistiko.atomiko = createdAtomiko;

            await anamnistiko.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η δημιουργία της πάθησης απέτυχε, δοκιμάστε ξανά.',
                500
            );
            return next(error);
        }
        try {
            atomiko = await Atomiko.findById(atomikoId);
        } catch (err) {
            return next(new HttpError('Η δημιουργία της πάθησης απέτυχε.', 500));
        }
        if (!atomiko) {
            return next(new HttpError('Δεν υπάρχει ατομικό αναμνηστικό.', 404));
        }
        const createdCondition = new Condition({
            _id: _id,
            name: name,
            allergy: false,
            dateOfDiagnosis: dateOfDiagnosis,
            dateOfHealing: dateOfHealing,
            atomiko: atomikoId,
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
                'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }








    }


    /////////////////////////////////////////////////////// an yparxei anamnistiko apla prosthiki pathisis
    else {
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
}


const getConditionsbyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let conditions, conditionsList = []
    try {
        conditions = await Condition.find({ patient: patientId })
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
        conditions = await Condition.find({ patient: patientId })
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
   
    const patientId = req.params.pid;
    let conditions, allergiesList = []
    try {
        conditions = await Condition.find({ patient: patientId })
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
    const conditionId = req.params.conditionId;
   
    let condition, atomiko, klironomiko, diagnosis,visit;
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
            visit = await Visit.findById(diagnosis.visit)
        } catch (err) {
            console.log(err)
            return next(new HttpError('Αποτυχία διαγραφής πάθησης.', 500))
        }

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            visit.diagnosis.pull(diagnosis);
            await visit.save({ session: sess });
            await diagnosis.deleteOne({ session: sess });
            await condition.deleteOne({ session: sess });
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
const updateConditionsbyId = async (req, res, next) => {
    const conditionId = req.params.conditionId;
    const {status,dateOfDiagnosis,dateOfHealing}=req.body;
   
    let condition;
    try {
        condition = await Condition.findById(conditionId)
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία ενημέρωσης πάθησης.', 500))
    }
    condition.status=status;
    condition.dateOfDiagnosis=dateOfDiagnosis;
    condition.dateOfHealing=dateOfHealing;
    try{
        await condition.save()
    }catch(err){
        console.log(err)
        return next(new HttpError('Αποτυχία ενημέρωσης πάθησης.', 500))
    }


    

    res.json({ conditionsList: condition });

}

exports.getId = getId;
exports.createConditionAtomiko = createConditionAtomiko;
exports.deleteConditionsbyId = deleteConditionsbyId;
exports.getConditionsbyPatientId = getConditionsbyPatientId;
exports.getAllergiesbyPatientId = getAllergiesbyPatientId;
exports.getKlironomikobyPatientId = getKlironomikobyPatientId;
exports.updateConditionsbyId=updateConditionsbyId;