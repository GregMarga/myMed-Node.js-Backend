const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Anamnistiko = require('../models/anamnistiko');
const Patient=require('../models/patient')

const getAnamnstiko=async (req,res,next)=>{
    const userId=req.params.pid;
    let anamnistiko;
    try{
        anamnistiko=await Anamnistiko.findOne({patient:userId}).sort({ field: 'asc', _id: -1 });
    }catch(err){
        return next(new HttpError('Fetching history info failed,please try again later.',500));
    }
    res.json(anamnistiko)
};
const createAnamnistiko=async(req,res,next)=>{
    const patientId=req.params.pid;
    const { allergies,cleronomical,conditions,surgeries,gynaikologiko } = req.body;
    const createdAnamnistiko = new Anamnistiko({
        allergies,
        cleronomical,
        conditions,
        surgeries,
        gynaikologiko,
        
        patient:patientId
    });
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdAnamnistiko.save({ session: sess });
        patient.anamnistiko=createdAnamnistiko;
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating anamnistiko failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ anamnistiko: createdAnamnistiko})
}

exports.getAnamnstiko=getAnamnstiko;
exports.createAnamnistiko=createAnamnistiko;