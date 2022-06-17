const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Visit = require('../models/visit');
const User=require('../models/user');

const getPatientVisit=async (req,res,next)=>{
    const userId=req.params.pid;
    let visits;
    try{
        visits=await Visit.find({patient:userId}).sort({ field: 'asc', _id: -1 });
    }catch(err){
        return next(new HttpError('Fetching visits failed,please try again later.',500));
    }
    res.json(visits)
}
const getPatientVisitDates=async (req,res,next)=>{
    const userId=req.params.pid;
    let visitDates;
    console.log(userId)
    try{
        visitDates=await Visit.find({patient:userId}).select('date').sort({ field: 'asc', _id: -1 });
    }catch(err){
        console.log(err)
        return next(new HttpError('Fetching visit dates failed,please try again later.',500));
    }
    console.log(visitDates)
    res.json(visitDates)
}
const getPatientVisitById=async (req,res,next)=>{
    const visitId=req.params.vid;
    let visit;
    try{
        visit=await Visit.findById(visitId);
    }catch(err){
        return next(new HttpError('Fetching visit info failed,please try again later.',500));
    }
    res.json(visit)
}


const createVisit = async (req, res, next) => {
    const patientId=req.params.pid;
    const { date, diagnosis,geniki_eikona,piesi,weight,height,sfiksis,tekt,smkt,test_volume,others,uid} = req.body;

    const createdVisit = new Visit({
        date,
        diagnosis,
        geniki_eikona,
        piesi,
        sfiksis,
        weight,
        height,
        smkt,
        tekt,
        test_volume,
        others,
        patient:patientId,
        doctor:uid
    });
    let visitor;
    let doctor;
    try {
        visitor = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Creating new Visit failed.', 500));
    }
    if (!visitor) {
        return next(new HttpError('Could not find a Patient for provided id.', 404));
    }

    try {
        doctor = await User.findById(uid);
    } catch (err) {
        return next(new HttpError('Creating new Visit failed.', 500));
    }
    if (!visitor) {
        return next(new HttpError('Could not find a user for provided id.', 404));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdVisit.save({ session: sess });
        visitor.visits.push(createdVisit);
        doctor.visits.push(createdVisit);
        await visitor.save({ session: sess });
        await doctor.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating visit failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ visit: createdVisit });
}

const updateVisit = async (req, res, next) => {
    const visitId = req.params.vid;
    const { date, diagnosis,geniki_eikona,piesi,weight,height,sfiksis,tekt,smkt,test_volume,others} = req.body;
    let visit;
    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        const error = new HttpError('Something went wrong,could not update visit', 500);
        return next(error);
    }
    visit.date = date;
    visit.diagnosis = diagnosis;
    visit.geniki_eikona = geniki_eikona;
    visit.piesi = piesi;
    visit.weight = weight;
    visit.height = height;
    visit.sfiksis = sfiksis;
    visit.tekt = tekt;
    visit.smkt = smkt;
    visit.test_volume = test_volume;
    visit.others = others;
    try {
        await visit.save();
    } catch (err) {
        const error = new HttpError('Could not update visit,please try again.', 500);
        return next(error);
    };
    res.status(200).json(visit);
}
const deleteVisit = async (req, res, next) => {
    const visitId = req.params.vid;
    let visit;
    try {
        visit = await Visit.findById(visitId).populate('patient').populate('doctor');
    } catch (err) {
        return next(new HttpError('Could not find the visit to delete,please try again later.', 500));
    }
    try {
        const sess=await mongoose.startSession();
        sess.startTransaction();
        await visit.remove({session:sess});
        visit.patient.visits.pull(visit);
        visit.doctor.visits.pull(visit);
        await visit.doctor.save({session:sess});
        await visit.patient.save({session:sess});
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Could not delete visit, please try again later.', 500));
    }
    res.json(visit);
};

exports.deleteVisit=deleteVisit;
exports.updateVisit=updateVisit;
exports.getPatientVisitById=getPatientVisitById;
exports.getPatientVisit=getPatientVisit;
exports.getPatientVisitDates=getPatientVisitDates;
exports.createVisit=createVisit;