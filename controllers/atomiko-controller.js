const HttpError = require('../models/http-error');
const Condition = require('../models/condition');
const Atomiko = require('../models/atomiko');
const Klironomiko = require('../models/klironomiko');
const Diagnosis = require('../models/diagnosis')
const mongoose = require('mongoose');

const getId = async (req, res, next) => {
    id = mongoose.Types.ObjectId();
    res.json(id)
}
const getConditionsbyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let conditions,conditionsList=[]
    try {
        conditions = await Condition.find({ patientId: patientId })
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης του ατομικού ιστορικού.', 500))
    }
    for (let i=0;i<conditions.length;i++){
        if (!conditions[i].cleronomical){
            conditionsList.push(conditions[i])
        }
    }
    res.json({ conditionsList: conditionsList });

}


const getKlironomikobyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let conditions,conditionsList=[]
    try {
        conditions = await Condition.find({ patientId: patientId })
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης του ατομικού ιστορικού.', 500))
    }
    for (let i=0;i<conditions.length;i++){
        if (conditions[i].cleronomical){
            conditionsList.push(conditions[i])
        }
    }
    res.json({ klironomiko: conditionsList });

}


const getAllergiesbyPatientId = async (req, res, next) => {
    console.log('in')
    const patientId = req.params.pid;
    let conditions,allergiesList=[]
    try {
        conditions = await Condition.find({ patientId: patientId })
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία φόρτωσης  ιστορικού αλλεργιών. ', 500))
    }
    for (let i=0;i<conditions.length;i++){
        if (conditions[i].allergy){
            allergiesList.push(conditions[i])
        }
    }
    res.json({ allergiesList: allergiesList });

}


const deleteConditionsbyId = async (req, res, next) => {
    const conditionId = req.params.conditionId;
    let condition, atomiko, klironomiko;
    try {
        condition = await Condition.findById(conditionId)
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία διαγραφής πάθησης.', 500))
    }
    
    //an einai sto atomiko anamnistiko h pathisi

    if (!!condition.atomiko) {
        try {
            atomiko = await Atomiko.find({ condition: conditionId })
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
                'Creating anamnistiko failed, please try again.',
                500
            );
            return next(error);
        }
    }

    res.json({ conditionsList: condition });

}

exports.getId = getId;
exports.deleteConditionsbyId = deleteConditionsbyId;
exports.getConditionsbyPatientId = getConditionsbyPatientId;
exports.getAllergiesbyPatientId=getAllergiesbyPatientId;
exports.getKlironomikobyPatientId=getKlironomikobyPatientId;