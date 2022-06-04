const HttpError = require('../models/http-error');
const Patient = require('../models/patient');


const DUMMY_PATIENTS = [{ id: 'p1', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' },
{ id: 'p2', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' },
{ id: 'p3', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' },
{ id: 'p4', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' },
{ id: 'p5', sirname: 'Μαργαρίτης', name: 'Γρηγόρης', fathersName: 'Βασίλειος', age: '23', tel: '6984651329', amka: '011019983232' }]

const getAllpatients = (req, res, next) => {
    res.json(DUMMY_PATIENTS)
    console.log(res.statusCode);
}

const findPatientById = async (req, res, next) => {
    const patientId = req.params.pid;
    // let patient;
    // try {
    //     patient = await Patient.findById(patientId);
    // } catch (err) {
    //     const error =new HttpError('Something went wrong,could not find a patient', 500);
    //     return next(error);
    // }
    // if (!patient) {
    //     console.log('here')
    //     return next(new HttpError('Could not find a patient for the provided id.', 404));
    // }
    // res.json({patient:patient.toObject({getters:true})});
    const patient=DUMMY_PATIENTS.find(p=>{return p.id===patientId})
    res.json(patient)
}

const findPatientByIdBasic = (req, res, next) => {
    const patientId = req.params.pid;
    console.log(patientId)
    res.json({ stop: "yes" })
}
const createPatient = async (req, res, next) => {
    const { sirname, name, fathersName, age, tel, amka } = req.body;
    console.log(req.body);
    console.log(sirname,name,fathersName,age,tel,amka);
    const createdPatient = new Patient({
        name,
        sirname,
        fathersName,
        age,
        tel,
        amka,
        visits:[]
    });
    try {
        await createdPatient.save();
    } catch (err) {
        const error = new HttpError('Could not create Patient,please try again.', 500);
        return next(error);
    };

    res.status(201).json({ patient: createdPatient })

}

exports.getAllpatients = getAllpatients;
exports.findPatientById = findPatientById;
exports.findPatientByIdBasic = findPatientByIdBasic;
exports.createPatient = createPatient;