const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Blood = require('../models/labTests/blood');



const deleteBloodLabTest = async (req, res, next) => {
    const labId = req.params.labId;
    let lab_test;
    try {
        lab_test = await Blood.findById(labId).populate('patient');
    } catch (err) {
        return next(new HttpError('Could not find the lab test to delete,please try again later.', 500));
    }
    try {
        const sess=await mongoose.startSession();
        sess.startTransaction();
        await lab_test.remove({session:sess});
        lab_test.patient.blood.pull(lab_test);
        await lab_test.patient.save({session:sess});
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Could not delete visit, please try again later.', 500));
    }
    res.json(lab_test);
};
const getBloodTests=async (req,res,next)=>{
    const labId = req.params.labId;
    let bloodTest;
    try{
        bloodTest=await Blood.findById(labId);
    }catch(err){
        return next(new HttpError('Fetching blood test info failed,please try again later.',500));
    }
    res.json(bloodTest)
};

exports.getBloodTests=getBloodTests;
exports.deleteBloodLabTest=deleteBloodLabTest;