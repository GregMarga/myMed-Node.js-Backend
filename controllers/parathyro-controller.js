const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Parathyro = require('../models/labTests/parathyro');



const deleteParathyroLabTest = async (req, res, next) => {
    const labId = req.params.labId;
    let lab_test;
    try {
        lab_test = await Parathyro.findById(labId).populate('patient');
    } catch (err) {
        return next(new HttpError('Could not find the lab test to delete,please try again later.', 500));
    }
    try {
        const sess=await mongoose.startSession();
        sess.startTransaction();
        await lab_test.remove({session:sess});
        lab_test.patient.parathyro.pull(lab_test);
        await lab_test.patient.save({session:sess});
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Could not delete visit, please try again later.', 500));
    }
    res.json(lab_test);
};
const getParathyrodTests=async (req,res,next)=>{
    const labId = req.params.labId;
    let parathyroTest;
    try{
        parathyroTest=await Parathyro.findById(labId);
    }catch(err){
        return next(new HttpError('Fetching parathyro test info failed,please try again later.',500));
    }
    res.json(parathyroTest)
};

exports.getParathyrodTests=getParathyrodTests;
exports.deleteParathyroLabTest=deleteParathyroLabTest;