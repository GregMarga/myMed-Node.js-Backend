const HttpError = require('../models/http-error');
const Anamnistiko = require('../models/anamnistiko');

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
const createAnamnistiko=async(req,res,next)=>{
    const userId=req.params.pid;
    const { allergies,cleronomical,personal,surgeries,drug_usage,others } = req.body;
    const createdAnamnistiko = new Anamnistiko({
        allergies,
        cleronomical,
        personal,
        surgeries,
        drug_usage,
        others
        // patient:userId
    });
    try {
        await createdAnamnistiko.save();
    } catch (err) {
        const error = new HttpError("Could not create Patient's History,please try again.", 500);
        return next(error);
    };

    res.status(201).json({ anamnistiko: createdAnamnistiko})
}

exports.getAnamnstiko=getAnamnstiko;
exports.createAnamnistiko=createAnamnistiko;