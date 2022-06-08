const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Blood = require('../models/labTests/blood');
const Parathyro = require('../models/labTests/parathyro');
const Thyro = require('../models/labTests/thyro');
const Patient=require('../models/patient')

const getAnamnstiko=async (req,res,next)=>{
    const userId=req.params.pid;
    let anamnistiko;
    try{
        anamnistiko=await Anamnistiko.find({patient:userId});
    }catch(err){
        return next(new HttpError('Fetching history info failed,please try again later.',500));
    }
    res.json(anamnistiko)
};
const createLabTest=async(req,res,next)=>{
    const patientId=req.params.pid;
    const [type,date,visitDate]=[req.body.type,req.body.date,req.body.visitDate];
    if (type==='blood'){
        const { kallio,natrio,asbestio,ht,mcv,sgot,b12,hb } = req.body;
        const createdBlood = new Blood({
            date,
            visitDate,
            kallio,
            natrio,
            asbestio,
            ht,
            mcv,sgot,
            b12,
            hb,
            patient:patientId
        });
        let patient;
        try {
            patient = await Patient.findById(patientId);
        } catch (err) {
            return next(new HttpError('Creating blood tests  failed.', 500));
        }
        if (!patient) {
            return next(new HttpError('Could not find a Patient for provided id.', 404));
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdBlood.save({ session: sess });
            patient.blood=createdBlood;
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
    
        res.status(201).json({ blood: createdBlood})

    }else if(type==='Thyro'){
        const { tsh,t4,ft4,t3,ft3,abtpo,trab,ct,tg } = req.body;
        const createdThyro = new Thyro({
            date,
            visitDate,
            tsh,t4,ft4,ft3,t3,abtpo,trab,ct,tg,
            patient:patientId
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
            patient.thyro=createdBlood;
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
    
        res.status(201).json({ thyro: createdThyro})

    }else if(type==='parathyro'){
        const { pth,vitd,ca,p,alvoumini,kreatanini } = req.body;
        const createdParathyro = new Parathyro({
            date,
            visitDate,
            pth,vitd,ca,p,alvoumini,kreatanini,
            patient:patientId
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
            patient.parathyro=createdParathyro;
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
    
        res.status(201).json({ parathyro: createdParathyro})
    }

   
}

exports.createLabTest=createLabTest;