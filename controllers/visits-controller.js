const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Visit = require('../models/visit');

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
    try {
        visitor = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Creating new Visit failed.', 500));
    }
    if (!visitor) {
        return next(new HttpError('Could not find a Patient for provided id.', 404));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdVisit.save({ session: sess });
        visitor.visits.push(createdVisit);
        await visitor.save({ session: sess });
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

exports.getPatientVisitById=getPatientVisitById;
exports.getPatientVisit=getPatientVisit;
exports.createVisit=createVisit;