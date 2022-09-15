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




const getConditionsbyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let conditions, conditionsList = []
    try {
        conditions = await Condition.find({ patient: patientId }).sort({ field: 'asc', _id: -1 });
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
exports.deleteConditionsbyId = deleteConditionsbyId;
exports.getConditionsbyPatientId = getConditionsbyPatientId;
exports.getAllergiesbyPatientId = getAllergiesbyPatientId;
exports.getKlironomikobyPatientId = getKlironomikobyPatientId;
exports.updateConditionsbyId=updateConditionsbyId;