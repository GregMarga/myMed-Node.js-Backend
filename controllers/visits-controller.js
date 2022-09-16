const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Visit = require('../models/visit');
const Farmako = require('../models/farmako');
const Ozos = require('../models/ozos')
const Condition = require('../models/condition');
const Diagnosis = require('../models/diagnosis');
const Therapeia = require('../models/therapeia');
const Exam = require('../models/exams');



const getAllVisits = async (req, res, next) => {
    const patientId = req.params.pid;
    let patient, visits = [];

    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
    }

    try {
        visits = await Visit.find({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
    }


    res.json(visits)
}

// const getVisitsInfo = async (req, res, next) => {
//     const patientId = req.params.pid;
//     let patient, visit;

//     let hasConditions, hasTherapeias;
//     try {
//         patient = await Patient.findById(patientId);
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
//     }

//     try {
//         visit = await Visit.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
//     }
//     hasConditions = (visit.conditions.length > 0) ? true : false;
//     hasTherapeias = (visit.therapeia.length > 0) ? true : false;


//     res.json({ hasConditions, hasTherapeias })
// }


const getAntikeimeniki = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId;
    let patient, visit, exam;
    let filesList = [];


    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της αντικειμενικής εξέτασης απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }
    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της αντικειμενικής εξέτασης απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }

    for (let i = 0; i < patient.exams.length; i++) {
        try {
            exam = await Exam.findById(patient.exams[i]);
        } catch (err) {
            return next(new HttpError('Η ανάσυρση των αρχείων απέτυχε.', 500));
        }
        let examDateTemp = new Date(exam.dateOfVisit);
        let visitDateTemp = new Date(visit.date)

        if (examDateTemp.getTime() === visitDateTemp.getTime()) {
            filesList.push(exam)
        }
    }


    res.json({ visit, filesList })
}

const getOldAntikeimeniki = async (req, res, next) => {
    const patientId = req.params.pid;
    let patient, visit, height;

    console.log('patientId:', patientId)
    console.log('in')
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της αντικειμενικής εξέτασης απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }
    try {
        visit = await Visit.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της αντικειμενικής εξέτασης απέτυχε.', 500));
    }



    height = (!!visit) ? visit.height : null;

    res.json({ height })
}


const createAntikeimeniki = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId;
    const { date, teleutaia_emminos_risi, geniki_eikona, aitia_proseleusis, piesi, weight, height, sfiksis, tekt, smkt, test_volume } = req.body;

    let patient, condition;
    let _id = mongoose.Types.ObjectId();
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία της αντικειμενικής εξέτασης απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }
    const createdVisit = new Visit({
        _id,
        date,
        teleutaia_emminos_risi,
        geniki_eikona,
        aitia_proseleusis, piesi, weight,
        height, sfiksis,
        tekt,
        smkt,
        test_volume,
        diagnosis: [],
        patient: patientId
    })

    if (visitId === 'new' && patient.visits.length > 0) {
        let visit;
        let ozoi = []
            // , conditions = []
            , therapeias = [], diagnosis = [];
        try {
            visit = await Visit.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της λίστας των όζων απέτυχε.', 500));
        }
        if (!visit) {
            return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
        }

        try {
            ozoi = await Ozos.find({ visit: visit._id });
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της λίστας των όζων απέτυχε.', 500));
        }
        for (let i = 0; i < ozoi.length; i++) {
            // createdVisit.ozos.push(ozoi[i])
            const createdOzos = new Ozos({
                name: ozoi[i].name,
                length: ozoi[i].length,
                height: ozoi[i].height,
                depth: ozoi[i].depth,
                dateOfFinding: ozoi[i].dateOfFinding,

                patient: patientId,
                visit: _id
            })
            try {
                await createdOzos.save();
                createdVisit.ozos.push(createdOzos)
            } catch (err) {
                console.log(err)
                const error = new HttpError('Η δημιουργία της αντικειμενικής εξέτασης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500);
                return next(error);
            }


        }

        try {                                        //δεν βρίσκω παλιά πρέπει να δημιουργήσω νέα...
            diagnosis = await Diagnosis.find({ visit: visit._id }).populate('condition');
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της λίστας των διαγνώσεων απέτυχε.', 500));
        }
        for (let i = 0; i < diagnosis.length; i++) {    // an exei therapeytei min tin prostheseis
            let d1 = new Date();
            let d2 = new Date(diagnosis[i].condition.dateOfHealing)


            if (d1 > d2 && !!diagnosis[i].condition.dateOfHealing) {
                continue;
            }

            let condition;
            try {                                        //δεν βρίσκω παλιά πρέπει να δημιουργήσω νέα...
                condition = await Condition.findById(diagnosis[i].condition);
            } catch (err) {
                console.log(err)
                return next(new HttpError('Η φόρτωση της λίστας των διαγνώσεων απέτυχε.', 500));
            }

            const createdDiagnosis = new Diagnosis({
                conditionName: diagnosis[i].conditionName,
                status: diagnosis[i].status,
                dateOfDiagnosis: diagnosis[i].dateOfDiagnosis,
                dateOfHealing: diagnosis[i].dateOfHealing,

                visit: _id,     /////////////
                condition: condition._id
            })
            try {
                const sess = await mongoose.startSession();
                sess.startTransaction();
                condition.diagnosis.push(createdDiagnosis)
                await createdDiagnosis.save({ session: sess })
                await condition.save({ session: sess });
                createdVisit.diagnosis.push(createdDiagnosis)
                await sess.commitTransaction();
            } catch (err) {
                console.log(err)
                const error = new HttpError('Η δημιουργία της αντικειμενικής εξέτασης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500);
                return next(error);
            }
        }




        try {
            therapeias = await Therapeia.find({ visit: visit._id }).populate('farmako');
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της λίστας των όζων απέτυχε.', 500));
        }



        for (let i = 0; i < therapeias.length; i++) {    // an exei therapeytei min tin prostheseis
            let therapeiaId = mongoose.Types.ObjectId();
            let farmakoId = mongoose.Types.ObjectId();
            let dateOfEnd;
            console.log(therapeias[i])
            let days = Number(therapeias[i].duration.trim().split(/\s+/)[0])
            console.log(visit.date)
            console.log(therapeias[i].duration, days)
            switch (therapeias[i].epanalipsi) {
                case '1 μήνας':
                    dateOfEnd = new Date(date)
                    dateOfEnd = dateOfEnd.setDate(dateOfEnd.getDate() + days)
                    break;
                case '2 μήνες':
                    dateOfEnd = new Date(date)
                    dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 2)
                    break;
                case '3 μήνες':
                    dateOfEnd = new Date(date)
                    dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 3)
                    break;
                case '4 μήνες':
                    dateOfEnd = new Date(date)
                    dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 4)
                    break;
                case '5 μήνες':
                    dateOfEnd = new Date(date)
                    dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 5)
                    break;
                case '6 μήνες':
                    dateOfEnd = new Date(date)
                    dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 6)
                    break;

            }

            const createdFarmako = new Farmako({
                _id: farmakoId,
                name: therapeias[i].drugName,
                ATC_name: therapeias[i].ATC_name,
                dateOfStart: date,
                dateOfEnd: dateOfEnd,

                therapeia: therapeiaId,
                patient: patientId
            })


            const createdTherapeia = new Therapeia({
                _id: therapeiaId,
                condition: therapeias[i].condition,
                epanalipsi: therapeias[i].epanalipsi,
                posotita: therapeias[i].posotita,
                syxnotita: therapeias[i].syxnotita,
                duration: therapeias[i].duration,
                drugName: therapeias[i].drugName,
                ATC_name: therapeias[i].ATC_name,

                visit: _id,     /////////////
                farmako: farmakoId
            })
            try {
                const sess = await mongoose.startSession();
                sess.startTransaction();

                await createdTherapeia.save({ session: sess })
                await createdFarmako.save({ session: sess });
                createdVisit.therapeia.push(createdTherapeia)
                patient.farmako.push(createdFarmako);
                await sess.commitTransaction();
            } catch (err) {
                console.log(err)
                const error = new HttpError('Η δημιουργία της αντικειμενικής εξέτασης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500);
                return next(error);
            }
        }

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdVisit.save({ session: sess });
            patient.visits.push(createdVisit);
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η δημιουργία της αντικειμενικής εξέτασης απέτυχε, παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }
    }
    else {
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdVisit.save({ session: sess });
            patient.visits.push(createdVisit);
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η δημιουργία της αντικειμενικής εξέτασης απέτυχε, παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }
    }

    res.json(createdVisit)
}
const updateAntikeimeniki = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId;

    const { date, teleutaia_emminos_risi, geniki_eikona, aitia_proseleusis, piesi, weight, height, sfiksis, tekt, smkt, test_volume } = req.body;

    let patient;
    let visit
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η επεξεργασία της αντικειμενικής εξέτασης απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }
    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η επεξεργασία της αντικειμενικής εξέτασης απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }
    visit.date = date;
    visit.geniki_eikona = geniki_eikona;
    visit.aitia_proseleusis = aitia_proseleusis;
    visit.piesi = piesi;
    visit.weight = weight;
    visit.height = height;
    visit.sfiksis = sfiksis;
    visit.tekt = tekt;
    visit.smkt = smkt;
    visit.test_volume = test_volume;
    visit.teleutaia_emminos_risi = teleutaia_emminos_risi;


    try {
        await visit.save();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η επεξεργασία της αντικειμενικής εξέτασης απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }

    res.json(visit)
}
const getOzos = async (req, res, next) => {

    const visitId = req.params.visitId;
    let visit, ozoi = [];
    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της λίστας των όζων απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }

    try {
        ozoi = await Ozos.find({ visit: visitId });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της λίστας των όζων απέτυχε.', 500));
    }
    res.json(ozoi)

}



const createOzos = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId;

    const { name, length, height, depth, dateOfFinding, _id } = req.body;

    let visit;


    if (visitId === 'null' || visitId === 'new') {
        return next(new HttpError('Για την δημιουργία ενός νέου όζου, πρέπει πρώτα να δημιουργηθεί η αντικειμενική εξέταση', 404))
    }

    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία του όζου απέτυχε.', 500));
    }
    const createdOzos = new Ozos({
        _id, name, length, height, depth, dateOfFinding,
        patient: patientId,

        visit: visitId
    })


    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdOzos.save({ session: sess });
        visit.ozos.push(createdOzos);
        await visit.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία δημιουργίας νέου όζου,παρακαλώ προσπαθήστε ξανά', 500))
    }
    res.json(createdOzos)
}
const updateOzos = async (req, res, next) => {
    const ozosId = req.params.ozosId;

    const { length, height, depth, dateOfFinding } = req.body;
    console.log(req.body)

    let ozos;
    try {
        ozos = await Ozos.findById(ozosId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η επεξεργασία του όζου απέτυχε.', 500));
    }

    ozos.length = length;
    ozos.height = height;
    ozos.depth = depth;
    ozos.dateOfFinding = dateOfFinding;


    try {
        await ozos.save();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία επεξεργασίας όζου,παρακαλώ προσπαθήστε ξανά', 500))
    }
    res.json(ozos)
}
const removeOzos = async (req, res, next) => {
    const ozosId = req.params.ozosId;
    const visitId = req.params.visitId

    let ozos, visit;
    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή του όζου απέτυχε.', 500));
    }
    try {
        ozos = await Ozos.findById(ozosId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή του όζου απέτυχε.', 500));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await ozos.deleteOne({ session: sess });
        visit.ozos.pull(ozos);
        await visit.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Αποτυχία διαγραφής όζου,παρακαλώ προσπαθήστε ξανά', 500))
    }
    res.json(ozos)
}
const getDiagnosis = async (req, res, next) => {
    const visitId = req.params.visitId;
    let visit, diagnosis;
    try {
        visit = await Visit.findById(visitId).populate('diagnosis');
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση των διαγνώσεων απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }

    res.json(visit.diagnosis)


}
const createDiagnosis = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId

    const { _id, name, status, dateOfDiagnosis, dateOfHealing } = req.body;
    let patient, visit;

    let existingCondition;

    let diagnosisId = mongoose.Types.ObjectId();
    if (visitId === 'null' || visitId === 'new') {
        return next(new HttpError('Για την δημιουργία μιας διάγνωσης, πρέπει πρώτα να δημιουργηθεί η αντικειμενική εξέταση', 404))
    }


    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία της διάγνωσης απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία της διάγνωσης απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }


    const createdDiagnosis = new Diagnosis({
        _id: diagnosisId,
        conditionName: name,
        status,
        dateOfDiagnosis,
        dateOfHealing,
        condition: _id,
        visit: visitId
    })

    try {
        existingCondition = await Condition.findById(_id);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία της διάγνωσης απέτυχε.', 500));
    }
    if (!existingCondition) {
        const createdCondition = new Condition({
            _id,
            name,
            allergy: false,
            status,
            dateOfDiagnosis,
            dateOfHealing,
            atomiko: false,
            cleronomical: false,
            diagnosis: true,

            patient: patientId,
            diagnosis: [diagnosisId]
        })
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdCondition.save({ session: sess });
            await createdDiagnosis.save({ session: sess });
            patient.conditions.push(createdCondition);
            visit.diagnosis.push(createdDiagnosis);
            await patient.save({ session: sess });
            await visit.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η δημιουργία της διάγνωσης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
        }

    } else if (!!existingCondition) {//an yparxei h pathisi
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            existingCondition.diagnosis.push(createdDiagnosis)
            await createdCondition.save({ session: sess });
            await createdDiagnosis.save({ session: sess });
            patient.conditions.push(createdCondition);
            visit.diagnosis.push(createdDiagnosis);
            await patient.save({ session: sess });
            await visit.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η δημιουργία της διάγνωσης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
        }
    }


    res.json(createdDiagnosis)

}
const updateDiagnosis = async (req, res, next) => {
    const diagnosisId = req.params.diagnosisId

    const { status, dateOfDiagnosis, dateOfHealing } = req.body;

    console.log(status)

    let condition;
    let diagnosis;
    let latestDiagnsosis;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///ENIMEROSI DIAGNOSIS

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    try {
        diagnosis = await Diagnosis.findById(diagnosisId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η επεξεργασία της διάγνωσης απέτυχε.', 500));
    }
    if (!diagnosis) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη διάγνωση.', 404));
    }


    try {
        condition = await Condition.findById(diagnosis.condition);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η επεξεργασία της διάγνωσης απέτυχε.', 500));
    }
    if (!condition) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη πάθηση.', 404));
    }

    diagnosis.status = status;
    diagnosis.dateOfDiagnosis = dateOfDiagnosis;
    diagnosis.dateOfHealing = dateOfHealing;
    try {
        await diagnosis.save()
    } catch (err) {
        return next(new HttpError('Η επεξεργασία της διάγνωσης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));

    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// ELEGXOS GIA ENIMEROSI PATHISIS

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (condition.diagnosis[condition.diagnosis.length - 1] == diagnosisId) {   /// an einai h pio prosfati diagnosi aytis tis pathisis
        console.log('they are the fking same')
        condition.status = status;                                               ///enimerose kai tin pathisi
        condition.dateOfDiagnosis = dateOfDiagnosis;
        condition.dateOfHealing = dateOfHealing;
        try {
            await condition.save()
        } catch (err) {
            return next(new HttpError('Η επεξεργασία της διάγνωσης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));

        }
    }




    res.json(diagnosis)
}
const removeDiagnosis = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId
    const diagnosisId = req.params.diagnosisId;

    let patient, visit, condition, diagnosis;
    try {                                                   ///asthenis
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της διάγνωσης απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    try {                                                   ////episkepsi
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της διάγνωσης απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }

    console.log(diagnosisId)
    try {                                                   //diagnosis
        diagnosis = await Diagnosis.findById(diagnosisId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της διάγνωσης απέτυχε.', 500));
    }
    if (!diagnosis) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη διάγνωση.', 404));
    }

    try {                                                   ///pathisi
        condition = await Condition.findById(diagnosis.condition);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της διάγνωσης απέτυχε.', 500));
    }
    if (!condition) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη πάθηση.', 404));
    }


    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        condition.diagnosis.pull(diagnosis)
        condition.dateOfHealing = visit.date;
        if (condition.diagnosis.length > 0) {
            await condition.save({ session: sess });

        } else {
            await condition.deleteOne({ session: sess });
            patient.conditions.pull(condition);
            await patient.save({ session: sess });
        }

        diagnosis.deleteOne({ session: sess })

        visit.diagnosis.pull(diagnosis);
        await visit.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της διάγνωσης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
    }

    res.json(diagnosis)
}

const getTherapeia = async (req, res, next) => {
    const visitId = req.params.visitId;

    let visit, therapeiaList = [], therapeia;
    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της θεραπείας απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }
    for (let i = 0; i < visit.therapeia.length; i++) {
        try {
            therapeia = await Therapeia.findById(visit.therapeia[i]);
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της θεραπείας απέτυχε.', 500));
        }

        let enhancedTherapeia = {
            _id: therapeia._id,
            condition: therapeia.condition,
            epanalipsi: therapeia.epanalipsi,
            posotita: therapeia.posotita,
            syxnotita: therapeia.syxnotita,
            duration: therapeia.duration,
            name: therapeia.drugName,
            ATC_name: therapeia.ATC_name
        }
        therapeiaList.push(enhancedTherapeia)
    }
    res.json(therapeiaList)
}
const createTherapeia = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId

    const { _id, epanalipsi, condition, posotita, syxnotita, duration, name, ATC_name } = req.body;
    let patient, visit;


    let therapeiaId = mongoose.Types.ObjectId();
    let dateOfEnd;
    let days = Number(duration.trim().split(/\s+/)[0])





    if (visitId === 'null' || visitId === 'new') {
        return next(new HttpError('Για την δημιουργία μιας νέας θεραπείας, πρέπει πρώτα να δημιουργηθεί η αντικειμενική εξέταση', 404))
    }

    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία της θεραπείας απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία της θεραπείας απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }

    switch (epanalipsi) {
        case '1 μήνας':
            dateOfEnd = new Date(visit.date)
            dateOfEnd = dateOfEnd.setDate(dateOfEnd.getDate() + days)
            break;
        case '2 μήνες':
            dateOfEnd = new Date(visit.date)
            dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 2)
            break;
        case '3 μήνες':
            dateOfEnd = new Date(visit.date)
            dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 3)
            break;
        case '4 μήνες':
            dateOfEnd = new Date(visit.date)
            dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 4)
            break;
        case '5 μήνες':
            dateOfEnd = new Date(visit.date)
            dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 5)
            break;
        case '6 μήνες':
            dateOfEnd = new Date(visit.date)
            dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 6)
            break;

    }



    const createdTherapeia = new Therapeia({
        _id: therapeiaId,
        condition,
        epanalipsi,
        posotita,
        syxnotita,
        duration,
        drugName: name,
        ATC_name,

        farmako: _id,
        visit: visitId
    })

    const createdFarmako = new Farmako({
        _id,
        name: name,
        ATC_name: ATC_name,
        dateOfStart: visit.date,
        dateOfEnd: dateOfEnd,

        therapeia: therapeiaId,
        patient: patientId
    })
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdFarmako.save({ session: sess });
        await createdTherapeia.save({ session: sess });
        patient.farmako.push(createdFarmako);
        visit.therapeia.push(createdTherapeia);
        await patient.save({ session: sess });
        await visit.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία της διάγνωσης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
    }



    res.json(createdTherapeia)
}
const updateTherapeia = async (req, res, next) => {
    const therapeiaId = req.params.therapeiaId

    const { epanalipsi, duration, posotita, syxnotita } = req.body;

    let farmako;
    let therapeia;

    let dateOfEnd;
    let days = Number(duration.trim().split(/\s+/)[0]);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///ENIMEROSI THERAPEIAS

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    try {
        therapeia = await Therapeia.findById(therapeiaId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η επεξεργασία της θεραπείας απέτυχε.', 500));
    }
    if (!therapeia) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη θεραπεία.', 404));
    }

    therapeia.epanalipsi = epanalipsi;
    therapeia.posotita = posotita;
    therapeia.syxnotita = syxnotita;
    therapeia.duration = duration;

    try {
        await therapeia.save()
    } catch (err) {
        return next(new HttpError('Η επεξεργασία της θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// ELEGXOS GIA ENIMEROSI FARMAKOY

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    try {
        farmako = await Farmako.findById(therapeia.farmako);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η επεξεργασία της θεραπείας απέτυχε.', 500));
    }
    if (!!farmako) {    /// an  yparxei farmako
        let dateOfStart = farmako.dateOfStart;
        switch (epanalipsi) {
            case '1 μήνας':
                dateOfEnd = new Date(dateOfStart)
                dateOfEnd = dateOfEnd.setDate(dateOfEnd.getDate() + days)
                break;
            case '2 μήνες':
                dateOfEnd = new Date(dateOfStart)
                dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 2)
                break;
            case '3 μήνες':
                dateOfEnd = new Date(dateOfStart)
                dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 3)
                break;
            case '4 μήνες':
                dateOfEnd = new Date(dateOfStart)
                dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 4)
                break;
            case '5 μήνες':
                dateOfEnd = new Date(dateOfStart)
                dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 5)
                break;
            case '6 μήνες':
                dateOfEnd = new Date(dateOfStart)
                dateOfEnd = dateOfEnd.setMonth(dateOfEnd.getMonth() + 6)
                break;
        }
        farmako.dateOfEnd = dateOfEnd
        try {
            await farmako.save();
        } catch (err) {
            return next(new HttpError('Η επεξεργασία της θεραπείας απέτυχε.', 500));
        }
    }

    res.json(therapeia)
}


const removeTherapeia = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId;
    const therapeiaId = req.params.therapeiaId;

    let patient, visit, therapeia, farmako;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της θεραπείας απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της θεραπείας απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }


    console.log(therapeiaId)
    try {
        therapeia = await Therapeia.findById(therapeiaId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της θεραπείας απέτυχε.', 500));
    }
    if (!therapeia) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη θεραπεία.', 404));
    }
    try {
        farmako = await Farmako.findById(therapeia.farmako);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της θεραπείας απέτυχε.', 500));
    }
    if (!farmako) {   // an den iparxei farmako
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await therapeia.deleteOne({ session: sess });
            visit.therapeia.pull(therapeia);
            await visit.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η διαγραφή της θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
        }
    }
    if (!!farmako) {        // an iparxei farmako
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            farmako.deleteOne({ session: sess })
            patient.farmako.pull(farmako);
            await patient.save({ session: sess });
            await therapeia.deleteOne({ session: sess });
            visit.therapeia.pull(therapeia);
            await visit.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η διαγραφή της θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
        }
    }
    res.json(therapeia)
}



exports.getAllVisits = getAllVisits;
exports.getAntikeimeniki = getAntikeimeniki;
exports.getOldAntikeimeniki = getOldAntikeimeniki;
exports.createAntikeimeniki = createAntikeimeniki;
exports.updateAntikeimeniki = updateAntikeimeniki;
exports.getOzos = getOzos;
exports.createOzos = createOzos;
exports.updateOzos = updateOzos;
exports.removeOzos = removeOzos;
exports.getDiagnosis = getDiagnosis;
exports.createDiagnosis = createDiagnosis;
exports.updateDiagnosis = updateDiagnosis;
exports.removeDiagnosis = removeDiagnosis;
exports.getTherapeia = getTherapeia;
exports.createTherapeia = createTherapeia;
exports.updateTherapeia = updateTherapeia;
exports.removeTherapeia = removeTherapeia;


