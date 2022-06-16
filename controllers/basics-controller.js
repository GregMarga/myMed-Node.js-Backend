const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Basics = require('../models/basics');
const Patient = require('../models/patient');

const getBasics=async (req,res,next)=>{
    const userId=req.params.pid;
    let basics;
    try{
        basics=await Basics.findOne({patient:userId}).sort({ field: 'asc', _id: -1 });
    }catch(err){
        return next(new HttpError('Fetching basics info failed,please try again later.',500));
    }
    res.json(basics)
};
const createBasics=async(req,res,next)=>{
    const patientId=req.params.pid;
    const { dateOfBirth, placeOfBirth, job, familyStatus, gender, address,area,postalCode,email } = req.body;
    const createdBasics = new Basics({
        dateOfBirth,
        placeOfBirth,
        job,
        familyStatus,
        gender,
        address,
        area,
        postalCode,
        email,
        patient:patientId
    });
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Creating basic info  failed.', 500));
    }
    if (!patient) {
        return next(new HttpError('Could not find a Patient for provided id.', 404));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdBasics.save({ session: sess });
        patient.basic=createdBasics;
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating basic info failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ patient: createdBasics });
}

exports.getBasics=getBasics;
exports.createBasics=createBasics;