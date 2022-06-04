const HttpError = require('../models/http-error');
const Basics = require('../models/basics');

const getBasics=async (req,res,next)=>{
    const userId=req.params.pid;
    let basics;
    try{
        basics=await Basics.find({patient:userId});
    }catch(err){
        return next(new HttpError('Fetching basics info failed,please try again later.',500));
    }
    res.json(basics)
};
const createBasics=async(req,res,next)=>{
    const userId=req.params.pid;
    const { dateOfBirth, placeOfBirth, job, familyStatus, gender, address,area,postalCode } = req.body;
    const createdBasics = new Basics({
        dateOfBirth,
        placeOfBirth,
        job,
        familyStatus,
        gender,
        address,
        area,
        postalCode,
        // patient:userId
    });
    try {
        await createdBasics.save();
    } catch (err) {
        const error = new HttpError('Could not create Patient,please try again.', 500);
        return next(error);
    };

    res.status(201).json({ patient: createdBasics })
}

exports.getBasics=getBasics;
exports.createBasics=createBasics;