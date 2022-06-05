const { default: mongoose } = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');


const DUMMY_PATIENTS = [{ id: 'p1', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' },
{ id: 'p2', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' },
{ id: 'p3', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' },
{ id: 'p4', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' },
{ id: 'p5', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' }]

const getAllpatients =async (req, res, next) => {
    let patients;
    try{
        patients=await Patient.find({});
    }catch(err){
        return next (new HttpError('Fetching patients failed,please try again later.',500));
    }
    res.json(patients)
    // console.log(res.statusCode);
}

const findPatientById = async (req, res, next) => {
    const patientId = req.params.pid;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        const error =new HttpError('Something went wrong,could not find a patient', 500);
        return next(error);
    }
    if (!patient) {
        console.log('here')
        return next(new HttpError('Could not find a patient for the provided id.', 404));
    }
    res.json(patient);
    // res.json({patient:patient.toObject({getters:true})});
    // const patient=DUMMY_PATIENTS.find(p=>{return p.id===patientId})
    // res.json(patient)
}

const findPatientByIdBasic = (req, res, next) => {
    const patientId = req.params.pid;
    console.log(patientId)
    res.json({ stop: "yes" })
}
const createPatient = async (req, res, next) => {
    const { sirname, name, fathersName, age, tel, amka } = req.body;
    const myId=mongoose.Types.ObjectId();
    const createdPatient = new Patient({
        _id:myId,
        name,
        sirname,
        fathersName,
        age,
        tel,
        amka,
        visits:[]
    });
    let createdPatientId;
    try {
        await createdPatient.save(async (err,room)=>{
            createdPatientId=await room.id;
        });
    } catch (err) {
        const error = new HttpError('Could not create Patient,please try again.', 500);
        return next(error);
    };
    console.log(createdPatientId)
    res.status(201).json({_id:myId,name,sirname,fathersName,age,tel,amka});

}

exports.getAllpatients = getAllpatients;
exports.findPatientById = findPatientById;
exports.findPatientByIdBasic = findPatientByIdBasic;
exports.createPatient = createPatient;