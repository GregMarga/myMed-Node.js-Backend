const HttpError = require('../models/http-error');

const Patient = require('../models/patient');
const Anamnistiko = require('../models/anamnistiko')
const Gynaikologiko = require('../models/gynaikologiko');
const Maieutiko=require('../models/maieutiko')

const mongoose = require('mongoose');


const getGynaikologikobyPatientId = async (req, res, next) => {
    const patientId = req.params.pid;
    let gynaikologiko, patient, anamnistiko, maieutiko, pregnacyList = []

    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Απέτυχε η ανάκτηση του γυναικολογικού ιστορικού,παρακαλώ προσπαθήστε ξανά.', 500));
    }
    console.log('anamnistiko id:', patient.anamnistiko)
    if (!patient.anamnistiko) { ////////////////////////////
        console.log('in')
        return res.json()
    }
    try {
        anamnistiko = await Anamnistiko.findById(patient.anamnistiko);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Απέτυχε η ανάκτηση του γυναικολογικού ιστορικού,παρακαλώ προσπαθήστε ξανά.', 500));
    }
    try {
        gynaikologiko = await Gynaikologiko.findById(anamnistiko.gynaikologiko);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Απέτυχε η ανάκτηση του γυναικολογικού ιστορικού,παρακαλώ προσπαθήστε ξανά.', 500));
    }


    try {
        maieutiko = await Maieutiko.find({ gynaikologiko: gynaikologiko._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Απέτυχε η ανάκτηση του γυναικολογικού ιστορικού,παρακαλώ προσπαθήστε ξανά.', 500));
    }

    console.log('maieytiko:', maieutiko)
    res.json({ gynaikologiko, pregnacyList: maieutiko })


}

exports.getGynaikologikobyPatientId = getGynaikologikobyPatientId