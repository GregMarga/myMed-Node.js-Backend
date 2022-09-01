const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Visit = require('../models/visit');
const Farmako = require('../models/farmako');
const Diagnosis = require('../models/diagnosis')
const Condition = require('../models/condition');
const Therapeia = require('../models/therapeia');


const getAllVisits = async (req, res, next) => {
    const patientId = req.params.pid;
    let visits;
    try {
        visits = await Visit.find({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
    }
    res.status(201).json({ visitList: visits })
}

const getVisit = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId
    let visit, condition, diagnosis, diagnosisList = [], therapeias, farmako, therapeiaList = [];
    try {
        if (visitId === 'new') {                        /// an einai kainouria episkepsi fortwse ta dedomena tis pio prosfatis
            visit = await Visit.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
        } else {
            visit = await Visit.findById(visitId);
        }
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει ο συγκεκριμένος ασθενής για την εύρεση επίσκεψης.', 404));
    }


    try {
        diagnosis = await Diagnosis.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
    }
    console.log(diagnosis)
    for (let i = 0; i < diagnosis.length; i++) {
        try {
            condition = await Condition.findOne({ diagnosis: diagnosis[i]._id }).sort({ field: 'asc', _id: -1 });
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
        }
        console.log(condition)
        if (!!condition) {

            let enhancedDiagnsosis = {
                _id: mongoose.Types.ObjectId(),
                name: condition.name,
                dateOfDiagnosis: condition.dateOfDiagnosis,
                dateOfDiagnosis: condition.dateOfDiagnosis,

            }
            diagnosisList.push(enhancedDiagnsosis)
        }
    }



    try {
        therapeias = await Therapeia.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
    }
    for (let i = 0; i < therapeias.length; i++) {
        try {
            farmako = await Farmako.findOne({ therapeia: therapeias[i]._id }).sort({ field: 'asc', _id: -1 });
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
        }
        console.log(therapeias[i].posotita)
        let enhancedTherapeia = {
            _id: mongoose.Types.ObjectId(),
            condition: therapeias[i].condition,
            posotita: therapeias[i].posotita,
            syxnotita: therapeias[i].syxnotita,
            name: farmako.name,
            ATC_name: farmako.ATC_name,
        }
        therapeiaList.push(enhancedTherapeia)
    }



    res.json({ visit, diagnosisList, therapeiaList })
}


const createVisit = async (req, res, next) => {
    const patientId = req.params.pid;
    console.log('patient:',patientId)
    const { date, condition, posotita, syxnotita, farmakaList, therapeiaList, diagnosisList, geniki_eikona, aitia_proseleusis, piesi, weight, height, sfiksis, tekt, smkt, test_volume } = req.body;
    console.log(date, diagnosisList, therapeiaList, geniki_eikona)
    let visit, therapeia, diagnosis;
    let visitId = mongoose.Types.ObjectId();
    let therapeiaId= mongoose.Types.ObjectId();
    let diagnosisId = mongoose.Types.ObjectId();


    const createdVisit = new Visit({
        _id: visitId,
        date,
        aitia_proseleusis,
        geniki_eikona,
        piesi,
        sfiksis,
        weight,
        height,
        smkt,
        tekt,
        test_volume,

        patient: patientId,

    });
    let visitor;

    try {
        visitor = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Creating new Visit failed.', 500));
    }
    if (!visitor) {
        return next(new HttpError('Could not find a Patient for provided id.', 404));
    }


    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdVisit.save({ session: sess });
        visitor.visits.push(createdVisit);
        await visitor.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating visit failed, please try again.',
            500
        );
        return next(error);
    }

   
    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        return next(new HttpError('Creating new Visit failed.', 500));
    }
    



    for (let i = 0; i < diagnosisList.length; i++) {
        const createdDiagnosis = new Diagnosis({
            _id:diagnosisList[i]._id,
            visit: visitId
        })
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdDiagnosis.save({ session: sess });
            visit.diagnosis.push(createdDiagnosis);
            await visit.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Creating visit failed, please try again.',
                500
            );
            return next(error);
        }
        try {
            diagnosis = await Diagnosis.findById(diagnosisList[i]._id);
        } catch (err) {
            return next(new HttpError('Creating new Visit failed.', 500));
        }



        const createdCondition = new Condition({
          
            name: diagnosisList[i].name,
            allergy: false,
            dateOfDiagnosis: diagnosisList[i].dateOfDiagnosis,
            dateOfHealing: diagnosisList[i].dateOfHealing,
            diagnosis: diagnosisList[i]._id,
            cleronomical: false,
            patient: patientId

        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdCondition.save({ session: sess });
            diagnosis.condition = createdCondition;
            await diagnosis.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η δημιουργία επίσκεψης απέτυχε, παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }

    }




    for (let i = 0; i < therapeiaList.length; i++) {
    //    console.log('therapeia:',therapeiaList[i])

        const createdTherapeia = new Therapeia({
            _id:therapeiaList[i]._id,
            condition: therapeiaList[i].condition,
            posotita: therapeiaList[i].posotita,
            syxnotita: therapeiaList[i].syxnotita,
            visit: visitId
        })
        try {
            visit = await Visit.findById(visitId);
        } catch (err) {
            return next(new HttpError('Creating new Visit failed.', 500));
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdTherapeia.save({ session: sess });
            visit.therapeia.push(createdTherapeia);
            await visit.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Creating therapeia failed, please try again.',
                500
            );
            return next(error);
        }


        // for (let j = 0; j < therapeiaList[i].farmakaList.length; j++) {

        try {
            therapeia = await Therapeia.findById(therapeiaList[i]._id);
        } catch (err) {
            return next(new HttpError('Creating new Visit failed.', 500));
        }

        const createdFarmako = new Farmako({
            name: therapeiaList[i].name,
            ATC_name: therapeiaList[i].ATC_name,
            therapeia: therapeiaList[i]._id,
            patient:patientId

        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdFarmako.save({ session: sess });
            therapeia.farmako = createdFarmako;
            await therapeia.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η δημιουργία θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }

    }






    res.status(201).json({ visit: createdVisit });
}










const updateVisit = async (req, res, next) => {
    const patientId = req.params.pid;
    const { date, condition, posotita, syxnotita, farmakaList, therapeiaList, diagnosisList, geniki_eikona, aitia_proseleusis, piesi, weight, height, sfiksis, tekt, smkt, test_volume } = req.body;
    let visit, therapeia, diagnosis;
    let visitId;
    let therapeiaId
    let diagnosisId = mongoose.Types.ObjectId();

    try {
        visit = await Visit.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει ο συγκεκριμένος ασθενής για την εύρεση επίσκεψης.', 404));
    }
    visitId = visit._id;
    visit.geniki_eikona = geniki_eikona;
    visit.aitia_proseleusis = aitia_proseleusis;
    visit.piesi = piesi;
    visit.weight = weight;
    visit.height = height;
    visit.sfiksis = sfiksis;
    visit.smkt = smkt;
    visit.tekt = tekt;
    visit.test_volume = test_volume;


    try {
        await visit.save();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating visit failed, please try again.',
            500
        );
        return next(error);
    }
    ///find all values and delete
    let therapeias, farmako, conditio_to_delete;
    try {
        diagnosis = await Diagnosis.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η ενημέρωση της επίσκεψης απέτυχε.', 500));
    }
    for (let i = 0; i < diagnosis.length; i++) {
        try {
            conditio_to_delete = await Condition.findOne({ diagnosis: diagnosis[i]._id }).sort({ field: 'asc', _id: -1 }).deleteOne();
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η ενημέρωση της επίσκεψης απέτυχε.', 500));
        }
    }
    try {
        diagnosis = await Diagnosis.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 }).deleteMany();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η ενημέρωση της επίσκεψης απέτυχε.', 500));
    }



    try {
        therapeias = await Therapeia.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
    }
    for (let i = 0; i < therapeias.length; i++) {
        try {
            farmako = await Farmako.findOne({ therapeia: therapeias[i]._id }).sort({ field: 'asc', _id: -1 }).deleteOne();
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
        }
        try {
            therapeias[i].deleteOne();
        } catch (err) {
            console.log(err)
        }

    }


    ///create new values



    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        return next(new HttpError('Creating new Visit failed.', 500));
    } 



    for (let i = 0; i < diagnosisList.length; i++) {
        const createdDiagnosis = new Diagnosis({
            _id:diagnosisList[i]._id,
            visit: visitId
        })
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdDiagnosis.save({ session: sess });
            visit.diagnosis.push(createdDiagnosis);
            await visit.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Creating visit failed, please try again.',
                500
            );
            return next(error);
        }
        try {
            diagnosis = await Diagnosis.findById(diagnosisList[i]._id);
        } catch (err) {
            return next(new HttpError('Creating new Visit failed.', 500));
        }



        const createdCondition = new Condition({
          
            name: diagnosisList[i].name,
            allergy: false,
            dateOfDiagnosis: diagnosisList[i].dateOfDiagnosis,
            dateOfHealing: diagnosisList[i].dateOfHealing,
            diagnosis: diagnosisList[i]._id,
            cleronomical: false,
            patient: patientId

        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdCondition.save({ session: sess });
            diagnosis.condition = createdCondition;
            await diagnosis.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η δημιουργία επίσκεψης απέτυχε, παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }

    }




    for (let i = 0; i < therapeiaList.length; i++) {
        

        const createdTherapeia = new Therapeia({
            _id:therapeiaList[i]._id,
            condition: therapeiaList[i].condition,
            posotita: therapeiaList[i].posotita,
            syxnotita: therapeiaList[i].syxnotita,
            visit: visitId
        })
        try {
            visit = await Visit.findById(visitId);
        } catch (err) {
            return next(new HttpError('Creating new Visit failed.', 500));
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdTherapeia.save({ session: sess });
            visit.therapeia.push(createdTherapeia);
            await visit.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Creating therapeia failed, please try again.',
                500
            );
            return next(error);
        }


        // for (let j = 0; j < therapeiaList[i].farmakaList.length; j++) {

        try {
            therapeia = await Therapeia.findById(therapeiaList[i]._id);
        } catch (err) {
            return next(new HttpError('Creating new Visit failed.', 500));
        }

        const createdFarmako = new Farmako({
            name: therapeiaList[i].name,
            ATC_name: therapeiaList[i].ATC_name,
            therapeia: therapeiaList[i]._id,
            patient: patientId

        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdFarmako.save({ session: sess });
            therapeia.farmako = createdFarmako;
            await therapeia.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η δημιουργία θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }

    }






    res.status(201).json({ visit: visit });
}





exports.getAllVisits = getAllVisits;
exports.getVisit = getVisit;
exports.updateVisit = updateVisit;
exports.createVisit = createVisit;
