const Patient = require('../models/patient');
const Exam=require('../models/exams');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const fs = require('fs');

const saveFile = async (req, res, next) => {
    const patientId=req.params.pid;
    const {id,type,dateOfDiagnosis,dateOfVisit,name}=req.body;
    console.log('exam controller')

    const createdExam=new Exam({
        _id:id,
        file:req.file.path,
        name,
        type,
        dateOfDiagnosis,
        dateOfVisit,
        patient:patientId
    })
    let patient 
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η αποθήκευση του αρχείου απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν βρέθηκε ασθενής για την επισύναψη του αρχείου.', 404));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdExam.save({ session: sess });
        patient.exams.push(createdExam);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η αποθήκευση του αρχείου απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }
    res.status(201).json({ exam: createdExam });
    
}

const deleteExam = async (req, res, next) => {
    const examId = req.params.examId;
    let fileName;
    let exam;
    console.log('delete')
    console.log(examId)
    try {
        exam = await Exam.findById(examId).populate('patient');
    } catch (err) {
        console.log(err)
        return next(new HttpError('Δεν βρέθηκε το αρχείο προς διαγραφή.', 500));
    }
    fileName=exam.file
    try {
    
        const sess=await mongoose.startSession();
        sess.startTransaction();
        await exam.remove({session:sess});
        exam.patient.exams.pull(exam);
       
       
        await exam.patient.save({session:sess});

        await sess.commitTransaction();


    } catch (err) {
        console.log(err)
        const error = new HttpError('Could not delete file,please try again.', 500);
        return next(error);
    };
    fs.unlink(`${fileName}`, (err) => {
        console.log(err)
    });
    // fs.unlink(`uploads/exams/${examId}`, (err) => {
    //     console.log(err)
    // });
    res.json({status:'deleted'});
}


exports.saveFile=saveFile
exports.deleteExam=deleteExam