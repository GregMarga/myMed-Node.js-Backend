const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Visit = require('../models/visit');
const Farmako = require('../models/farmako');
const Diagnosis = require('../models/diagnosis');
const Ozos = require('../models/ozos')
const Condition = require('../models/condition');
const Therapeia = require('../models/therapeia');
const moment = require('moment')


const getBiometrics = async (req, res, next) => {
    const patientId = req.params.pid;
    let patient, visits = [];
    let BMI_data = [];
    let date, wght;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
    }
    if (patient.visits.length > 0) {
        try {
            visits = await Visit.find({ patient: patientId }).sort({ field: 'asc', _id: 1 });
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
        }
    }
    for (let i = 0; i < visits.length; i++) {

        wght = Number(visits[i].weight);
        let hght = Number(visits[i].height);
        date = moment(visits[i].date).format('DD-MM-YYYY')
        let bmi = wght / (hght * hght);
        BMI_data.push({ date: date, bmi: Number(bmi.toFixed(2)) })
        console.log(typeof (date))


    }
    res.status(201).json({ BMI_data })
}

const getOzosStat = async (req, res, next) => {
    const patientId = req.params.pid;
    let patient, visit, ozos;
    let sameOzosList = [];
    let namesList = [];
    let ozosVisit;
    let ozosData = [];
    let singleOzosData = [];
    let date, length, depth, height, volume;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
    }
    if (patient.visits.length > 0) {
        try {
            visit = await Visit.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
        }

        for (let i = 0; i < visit.ozos.length; i++) {
            singleOzosData = [];
            try {
                ozos = await Ozos.findById(visit.ozos[i]);
            } catch (err) {
                console.log(err)
                return next(new HttpError('Η φόρτωση της λίστας των όζων απέτυχε.', 500));
            }
            namesList.push(ozos.name)


            try {
                sameOzosList = await Ozos.find({ name: ozos.name,patient:patientId }).sort({ field: 'asc', _id: 1 });
            } catch (err) {
                console.log(err)
                return next(new HttpError('Η φόρτωση της λίστας των όζων απέτυχε.', 500));
            }


            for (let j = 0; j < sameOzosList.length; j++) {
                let ozosJson = {}
                length = Number(sameOzosList[j].length);
                height = Number(sameOzosList[j].height);
                depth = Number(sameOzosList[j].depth);
                volume = Number(depth * height * length)
                console.log(volume)
                try {
                    ozosVisit = await Visit.findById(sameOzosList[j].visit);
                } catch (err) {
                    console.log(err)
                    return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
                }
                date = moment(ozosVisit.date).format('DD-MM-YYYY')

                let columnName1 = ozos.name + 'date';
                ozosJson[columnName1] = date

                let columnName2 = ozos.name + 'volume';
                ozosJson[columnName2] = volume

                ozosData.push(ozosJson)

                // singleOzosData.push({ date: date, volume: volume })

            }
            // ozosData.push({ name: ozos.name, data: singleOzosData })


        }
    }
    res.status(201).json({ ozosData, namesList })
}

exports.getBiometrics = getBiometrics;
exports.getOzosStat = getOzosStat