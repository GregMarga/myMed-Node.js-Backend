const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Patient = require('../models/patient');
const Visit = require('../models/visit');
const Farmako = require('../models/farmako');
const Diagnosis = require('../models/diagnosis');
const Ozos = require('../models/ozos')
const Condition = require('../models/condition');
const Therapeia = require('../models/therapeia');


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

const getVisitsInfo = async (req, res, next) => {
    const patientId = req.params.pid;
    let patient, visit;

    let hasConditions, hasTherapeias;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
    }

    try {
        visit = await Visit.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση της λίστας των επισκέψεων απέτυχε.', 500));
    }
    hasConditions = (visit.conditions.length > 0) ? true : false;
    hasTherapeias = (visit.therapeia.length > 0) ? true : false;


    res.json({ hasConditions, hasTherapeias })
}


const getAntikeimeniki = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId;
    let patient, visit;

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
    res.json(visit)
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

    res.json(height)
}


const createAntikeimeniki = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId;
    const { date, geniki_eikona, aitia_proseleusis, piesi, weight, height, sfiksis, tekt, smkt, test_volume } = req.body;

    let patient;
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
        geniki_eikona,
        aitia_proseleusis, piesi, weight,
        height, sfiksis,
        tekt,
        smkt,
        test_volume,
        patient: patientId
    })

    if (visitId === 'new' && patient.visits.length > 0) {
        let visit;
        let ozoi = [],conditions=[],therapeias=[];
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

        try {
            conditions = await Condition.find({ visit: visit._id });
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της λίστας των όζων απέτυχε.', 500));
        }
        for (let i = 0; i < conditions.length; i++){
            const createdDiagnosis = new Condition({
                name:conditions[i].name,
                allergy: false,
                status:conditions[i].status,
                dateOfDiagnosis:conditions[i].dateOfDiagnosis,
                dateOfHealing:conditions[i].dateOfHealing,
                atomiko: false,
                cleronomical: false,
                diagnosis: true,
        
                patient: patientId,
                visit: _id
            })
            try {
                await createdDiagnosis.save();
                createdVisit.conditions.push(createdDiagnosis)
            } catch (err) {
                console.log(err)
                const error = new HttpError('Η δημιουργία της αντικειμενικής εξέτασης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500);
                return next(error);
            }

        }

        try {
            therapeias = await Therapeia.find({ visit: visit._id });
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της λίστας των όζων απέτυχε.', 500));
        }
        for (let i = 0; i < therapeias.length; i++){
            // const createdFarmako = new Farmako({
            //     name: name,
            //     ATC_name: ATC_name,
            //     therapeia: _id,
            //     patient: patientId
            // })
        
            // try {
            //     const sess = await mongoose.startSession();
            //     sess.startTransaction();
            //     await createdFarmako.save({ session: sess });
            //     createdTherapeia.farmako = createdFarmako;
            //     visit.therapeia.push(createdTherapeia);
            //     await createdTherapeia.save({ session: sess });
            //     await visit.save({ session: sess });
            //     await sess.commitTransaction();
            // } catch (err) {
            //     console.log(err)
            //     return next(new HttpError('Η δημιουργία της θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
            // }
            const createdTherapeia = new Therapeia({                
                condition:therapeias[i].condition,
                posotita:therapeias[i].posotita,
                syxnotita:therapeias[i].syxnotita,
                duration:therapeias[i].duration,
                patient: patientId,

                visit: _id
            })
            try {
                await createdTherapeia.save();
                createdVisit.therapeia.push(createdTherapeia)
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

    const { date, geniki_eikona, aitia_proseleusis, piesi, weight, height, sfiksis, tekt, smkt, test_volume } = req.body;

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
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση των διαγνώσεων απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }

    try {
        diagnosis = await Condition.find({ visit: visitId });
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η φόρτωση των διαγνώσεων απέτυχε απέτυχε.', 500));
    }
    res.json(diagnosis)


}
const createDiagnosis = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId

    const { _id, name, status, dateOfDiagnosis, dateOfHealing } = req.body;
    let patient, visit;

    if (visitId === 'null') {
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

    const createdDiagnosis = new Condition({
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
        visit: visitId
    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdDiagnosis.save({ session: sess });
        patient.conditions.push(createdDiagnosis);
        visit.conditions.push(createdDiagnosis);
        await patient.save({ session: sess });
        await visit.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία της διάγνωσης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
    }
    res.json(createdDiagnosis)

}
const updateDiagnosis = async (req, res, next) => {
    const diagnosisId = req.params.diagnosisId

    const { status, dateOfDiagnosis, dateOfHealing } = req.body;

    let condition;
    try {
        condition = await Condition.findById(diagnosisId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η επεξεργασία της διάγνωσης απέτυχε.', 500));
    }
    if (!condition) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη διάγνωση.', 404));
    }
    condition.status = status;
    condition.dateOfDiagnosis = dateOfDiagnosis;
    condition.dateOfHealing = dateOfHealing;
    try {
        await condition.save()
    } catch (err) {
        return next(new HttpError('Η επεξεργασία της διάγνωσης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));

    }
    res.json(condition)
}
const removeDiagnosis = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId
    const diagnosisId = req.params.diagnosisId;

    let patient, visit, condition;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της διάγνωσης απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    try {
        visit = await Visit.findById(visitId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της διάγνωσης απέτυχε.', 500));
    }
    if (!visit) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη επίσκεψη.', 404));
    }

    console.log(diagnosisId)
    try {
        condition = await Condition.findById(diagnosisId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της διάγνωσης απέτυχε.', 500));
    }
    if (!condition) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη διάγνωση.', 404));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await condition.deleteOne({ session: sess });
        patient.conditions.pull(condition);
        visit.conditions.pull(condition);
        await patient.save({ session: sess });
        await visit.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της διάγνωσης απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
    }
    res.json(condition)
}

const getTherapeia = async (req, res, next) => {
    const visitId = req.params.visitId;

    let visit, therapeiaList = [], farmako, therapeia;
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
        try {
            farmako = await Farmako.findOne({ therapeia: visit.therapeia[i] });
        } catch (err) {
            console.log(err)
            return next(new HttpError('Η φόρτωση της θεραπείας απέτυχε.', 500));
        }
        let enhancedTherapeia = {
            _id: therapeia._id,
            condition: therapeia.condition,
            posotita: therapeia.posotita,
            syxnotita: therapeia.syxnotita,
            duration: therapeia.duration,
            name: farmako.name,
            ATC_name: farmako.ATC_name
        }
        therapeiaList.push(enhancedTherapeia)
    }
    res.json(therapeiaList)
}
const createTherapeia = async (req, res, next) => {
    const patientId = req.params.pid;
    const visitId = req.params.visitId

    const { _id, condition, posotita, syxnotita, duration, name, ATC_name } = req.body;
    let patient, visit;

    if (visitId === 'null') {
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

    const createdTherapeia = new Therapeia({
        _id,
        condition,
        posotita,
        syxnotita,
        duration,
        patient: patientId,
        visit: visitId
    })
    const createdFarmako = new Farmako({
        name: name,
        ATC_name: ATC_name,
        therapeia: _id,
        patient: patientId
    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdFarmako.save({ session: sess });
        createdTherapeia.farmako = createdFarmako;
        visit.therapeia.push(createdTherapeia);
        await createdTherapeia.save({ session: sess });
        await visit.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία της θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
    }

    res.json(createdTherapeia)
}
const updateTherapeia = async (req, res, next) => { }
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

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await farmako.deleteOne({ session: sess });
        await therapeia.deleteOne({ session: sess });
        visit.therapeia.pull(therapeia);
        patient.farmako.pull(farmako);
        await patient.save({ session: sess });
        await visit.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500));
    }
    res.json(therapeia)
}



exports.getAllVisits = getAllVisits;
// exports.getVisitsInfo=getVisitsInfo
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


// const getVisit = async (req, res, next) => {
//     const patientId = req.params.pid;
//     const visitId = req.params.visitId
//     let visit, condition, diagnosis, diagnosisList = [], therapeias, farmako, ozos, therapeiaList = [], ozosList = [];
//     try {
//         if (visitId === 'new') {                        /// an einai kainouria episkepsi fortwse ta dedomena tis pio prosfatis
//             visit = await Visit.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
//         } else {
//             visit = await Visit.findById(visitId);
//         }
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
//     }
//     if (!visit) {
//         return res.json(visit, diagnosisList, therapeiaList, ozosList);
//     }

//     /////////////////////// find ozous
//     try {
//         ozos = await Ozos.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 });
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
//     }

//     for (let i = 0; i < ozos.length; i++) {

//         let enhancedOzos = {
//             _id: mongoose.Types.ObjectId(),
//             identifier: ozos[i].identifier,
//             name: ozos[i].name,
//             length: ozos[i].length,
//             height: ozos[i].height,
//             depth: ozos[i].depth,
//             dateOfFinding: ozos[i].dateOfFinding
//         }

//         ozosList.push(enhancedOzos)

//     }



//     ///////////////// find conditions/diagnoses
//     try {
//         diagnosis = await Diagnosis.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 });
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
//     }

//     for (let i = 0; i < diagnosis.length; i++) {
//         try {
//             condition = await Condition.findById(diagnosis[i].condition).sort({ field: 'asc', _id: -1 });
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
//         }

//         if (!!condition) {

//             let enhancedDiagnsosis = {
//                 _id: mongoose.Types.ObjectId(),
//                 conditionId: condition._id,
//                 name: condition.name,
//                 dateOfDiagnosis: condition.dateOfDiagnosis,
//                 dateOfDiagnosis: condition.dateOfDiagnosis,

//             }
//             diagnosisList.push(enhancedDiagnsosis)
//         }
//     }


//     ///// find therapeias farmaka
//     try {
//         therapeias = await Therapeia.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 });
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
//     }
//     for (let i = 0; i < therapeias.length; i++) {

//         try {
//             farmako = await Farmako.findById(therapeias[i].farmako);
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
//         }

//         let enhancedTherapeia = {
//             _id: mongoose.Types.ObjectId(),
//             farmakoId: farmako._id,
//             condition: therapeias[i].condition,
//             posotita: therapeias[i].posotita,
//             syxnotita: therapeias[i].syxnotita,
//             name: farmako.name,
//             ATC_name: farmako.ATC_name,
//         }
//         therapeiaList.push(enhancedTherapeia)
//     }



//     res.json({ visit, diagnosisList, therapeiaList, ozosList })
// }


// const createVisit = async (req, res, next) => {
//     const patientId = req.params.pid;
//     console.log('patient:', patientId)
//     const { date, ozosList, therapeiaList, diagnosisList, geniki_eikona, aitia_proseleusis, piesi, weight, height, sfiksis, tekt, smkt, test_volume } = req.body;
//     let condition, farmako;
//     console.log(ozosList)
//     let visit, therapeia, diagnosis;
//     let visitId = mongoose.Types.ObjectId();
//     let therapeiaId = mongoose.Types.ObjectId();
//     let diagnosisId = mongoose.Types.ObjectId();


//     const createdVisit = new Visit({
//         _id: visitId,
//         date,
//         aitia_proseleusis,
//         geniki_eikona,
//         piesi,
//         sfiksis,
//         weight,
//         height,
//         smkt,
//         tekt,
//         test_volume,

//         patient: patientId,

//     });
//     let visitor;

//     try {
//         visitor = await Patient.findById(patientId);
//     } catch (err) {
//         return next(new HttpError('Creating new Visit failed.', 500));
//     }
//     if (!visitor) {
//         return next(new HttpError('Could not find a Patient for provided id.', 404));
//     }


//     try {
//         const sess = await mongoose.startSession();
//         sess.startTransaction();
//         await createdVisit.save({ session: sess });
//         visitor.visits.push(createdVisit);
//         await visitor.save({ session: sess });
//         await sess.commitTransaction();
//     } catch (err) {
//         console.log(err)
//         const error = new HttpError(
//             'Creating visit failed, please try again.',
//             500
//         );
//         return next(error);
//     }


//     try {
//         visit = await Visit.findById(visitId);
//     } catch (err) {
//         return next(new HttpError('Creating new Visit failed.', 500));
//     }

//     for (let i = 0; i < ozosList.length; i++) {
//         const createdOzos = new Ozos({
//             _id: ozosList[i]._id,
//             name: ozosList[i].name,
//             identifier: ozosList[i].identifier,
//             depth: ozosList[i].depth,
//             length: ozosList[i].length,
//             height: ozosList[i].height,
//             dateOfFinding: ozosList[i].dateOfFinding,
//             visit: visitId
//         })
//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdOzos.save({ session: sess });
//             visit.ozos.push(createdOzos);
//             await visit.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία επίσκεψης απέτυχε,παρακαλώ δοκιμάστε ξανά.',
//                 500
//             );
//             return next(error);
//         }
//     }



//     for (let i = 0; i < diagnosisList.length; i++) {
//         const createdDiagnosis = new Diagnosis({
//             _id: diagnosisList[i]._id,
//             visit: visitId
//         })
//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdDiagnosis.save({ session: sess });
//             visit.diagnosis.push(createdDiagnosis);
//             await visit.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Creating visit failed, please try again.',
//                 500
//             );
//             return next(error);
//         }
//         try {
//             diagnosis = await Diagnosis.findById(diagnosisList[i]._id);
//         } catch (err) {
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }

//         try {
//             condition = await Condition.findById(diagnosisList[i].conditionId); /////////lathos
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }

//         if (!condition) {

//             condition = new Condition({

//                 name: diagnosisList[i].name,
//                 allergy: false,
//                 status: diagnosisList[i].status,
//                 dateOfDiagnosis: diagnosisList[i].dateOfDiagnosis,
//                 dateOfHealing: diagnosisList[i].dateOfHealing,
//                 diagnosis: diagnosisList[i]._id,
//                 cleronomical: false,
//                 patient: patientId

//             })
//         }
//         console.log('conditionId:', condition, condition._id)//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await condition.save({ session: sess });
//             diagnosis.condition = condition._id;
//             await diagnosis.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία επίσκεψης απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }




//     for (let i = 0; i < therapeiaList.length; i++) {
//         //    console.log('therapeia:',therapeiaList[i])

//         const createdTherapeia = new Therapeia({
//             _id: therapeiaList[i]._id,
//             condition: therapeiaList[i].condition,
//             posotita: therapeiaList[i].posotita,
//             syxnotita: therapeiaList[i].syxnotita,
//             visit: visitId
//         })
//         try {
//             visit = await Visit.findById(visitId);
//         } catch (err) {
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }
//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdTherapeia.save({ session: sess });
//             visit.therapeia.push(createdTherapeia);
//             await visit.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Creating therapeia failed, please try again.',
//                 500
//             );
//             return next(error);
//         }


//         // for (let j = 0; j < therapeiaList[i].farmakaList.length; j++) {

//         try {
//             therapeia = await Therapeia.findById(therapeiaList[i]._id);
//         } catch (err) {
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }

//         try {
//             farmako = await Farmako.findById(therapeiaList[i].farmakoId);
//         } catch (err) {
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }
//         console.log(farmako, therapeiaList[i].farmakoId)
//         if (!farmako) {

//             farmako = new Farmako({
//                 name: therapeiaList[i].name,
//                 ATC_name: therapeiaList[i].ATC_name,
//                 therapeia: therapeiaList[i]._id,
//                 patient: patientId

//             })
//         }
//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await farmako.save({ session: sess });
//             therapeia.farmako = farmako._id;
//             await therapeia.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }






//     res.status(201).json({ visit: createdVisit });
// }










// const updateVisit = async (req, res, next) => {
//     const patientId = req.params.pid;
//     const visitId = req.params.visitId;
//     console.log(patientId, visitId)
//     const { ozosList, date, posotita, syxnotita, farmakaList, therapeiaList, diagnosisList, geniki_eikona, aitia_proseleusis, piesi, weight, height, sfiksis, tekt, smkt, test_volume } = req.body;
//     let visit, therapeia, diagnosis, condition;
//     let therapeiaId
//     let diagnosisId = mongoose.Types.ObjectId();

//     try {
//         visit = await Visit.findById(visitId);
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
//     }
//     console.log(visit)
//     if (!visit) {
//         return next(new HttpError('Δεν υπάρχει ο συγκεκριμένος ασθενής για την εύρεση επίσκεψης.', 404));
//     }

//     visit.geniki_eikona = geniki_eikona;
//     visit.aitia_proseleusis = aitia_proseleusis;
//     visit.piesi = piesi;
//     visit.weight = weight;
//     visit.height = height;
//     visit.sfiksis = sfiksis;
//     visit.smkt = smkt;
//     visit.tekt = tekt;
//     visit.test_volume = test_volume;


//     try {
//         await visit.save();
//     } catch (err) {
//         console.log(err)
//         const error = new HttpError(
//             'Creating visit failed, please try again.',
//             500
//         );
//         return next(error);
//     }
//     ///find all values and delete
//     let therapeias, farmako, conditio_to_delete;

//     try {
//         await Ozos.find({ visit: visit._id }).deleteMany();
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η ενημέρωση της επίσκεψης απέτυχε.', 500));
//     }

//     try {
//         diagnosis = await Diagnosis.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 });
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η ενημέρωση της επίσκεψης απέτυχε.', 500));
//     }
//     for (let i = 0; i < diagnosis.length; i++) {
//         try {
//             conditio_to_delete = await Condition.findOne({ diagnosis: diagnosis[i]._id }).sort({ field: 'asc', _id: -1 }).deleteOne();
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Η ενημέρωση της επίσκεψης απέτυχε.', 500));
//         }
//     }
//     try {
//         diagnosis = await Diagnosis.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 }).deleteMany();
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η ενημέρωση της επίσκεψης απέτυχε.', 500));
//     }



//     try {
//         therapeias = await Therapeia.find({ visit: visit._id }).sort({ field: 'asc', _id: -1 });
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
//     }
//     for (let i = 0; i < therapeias.length; i++) {
//         try {
//             farmako = await Farmako.findOne({ therapeia: therapeias[i]._id }).sort({ field: 'asc', _id: -1 }).deleteOne();
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Η φόρτωση της επίσκεψης απέτυχε.', 500));
//         }
//         try {
//             therapeias[i].deleteOne();
//         } catch (err) {
//             console.log(err)
//         }

//     }


//     ///create new values



//     try {
//         visit = await Visit.findById(visitId);
//     } catch (err) {
//         return next(new HttpError('Creating new Visit failed.', 500));
//     }



//     for (let i = 0; i < ozosList.length; i++) {
//         console.log(ozosList[i])
//         const createdOzos = new Ozos({
//             _id: ozosList[i]._id,
//             name: ozosList[i].name,
//             identifier: ozosList[i].identifier,
//             depth: ozosList[i].depth,
//             length: ozosList[i].length,
//             height: ozosList[i].height,
//             dateOfFinding: ozosList[i].dateOfFinding,
//             visit: visitId
//         })
//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdOzos.save({ session: sess });
//             visit.ozos.push(createdOzos);
//             await visit.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία επίσκεψης απέτυχε,παρακαλώ δοκιμάστε ξανά.',
//                 500
//             );
//             return next(error);
//         }
//     }



//     for (let i = 0; i < diagnosisList.length; i++) {
//         const createdDiagnosis = new Diagnosis({
//             _id: diagnosisList[i]._id,
//             visit: visitId
//         })
//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdDiagnosis.save({ session: sess });
//             visit.diagnosis.push(createdDiagnosis);
//             await visit.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Creating visit failed, please try again.',
//                 500
//             );
//             return next(error);
//         }
//         try {
//             diagnosis = await Diagnosis.findById(diagnosisList[i]._id);
//         } catch (err) {
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }

//         try {
//             condition = await Condition.findById(diagnosisList[i].conditionId); /////////lathos
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }

//         if (!condition) {

//             condition = new Condition({

//                 name: diagnosisList[i].name,
//                 allergy: false,
//                 status: diagnosisList[i].status,
//                 dateOfDiagnosis: diagnosisList[i].dateOfDiagnosis,
//                 dateOfHealing: diagnosisList[i].dateOfHealing,
//                 diagnosis: diagnosisList[i]._id,
//                 cleronomical: false,
//                 patient: patientId

//             })
//         }
//         console.log('conditionId:', condition, condition._id)//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await condition.save({ session: sess });
//             diagnosis.condition = condition._id;
//             await diagnosis.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία επίσκεψης απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }




//     for (let i = 0; i < therapeiaList.length; i++) {
//         //    console.log('therapeia:',therapeiaList[i])

//         const createdTherapeia = new Therapeia({
//             _id: therapeiaList[i]._id,
//             condition: therapeiaList[i].condition,
//             posotita: therapeiaList[i].posotita,
//             syxnotita: therapeiaList[i].syxnotita,
//             visit: visitId
//         })
//         try {
//             visit = await Visit.findById(visitId);
//         } catch (err) {
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }
//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdTherapeia.save({ session: sess });
//             visit.therapeia.push(createdTherapeia);
//             await visit.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Creating therapeia failed, please try again.',
//                 500
//             );
//             return next(error);
//         }


//         // for (let j = 0; j < therapeiaList[i].farmakaList.length; j++) {

//         try {
//             therapeia = await Therapeia.findById(therapeiaList[i]._id);
//         } catch (err) {
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }

//         try {
//             farmako = await Farmako.findById(therapeiaList[i].farmakoId);
//         } catch (err) {
//             return next(new HttpError('Creating new Visit failed.', 500));
//         }
//         console.log(farmako, therapeiaList[i].farmakoId)
//         if (!farmako) {

//             farmako = new Farmako({
//                 name: therapeiaList[i].name,
//                 ATC_name: therapeiaList[i].ATC_name,
//                 therapeia: therapeiaList[i]._id,
//                 patient: patientId

//             })
//         }
//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await farmako.save({ session: sess });
//             therapeia.farmako = farmako._id;
//             await therapeia.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία θεραπείας απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }



//     res.status(201).json({ visit: visit });
// }





// exports.getAllVisits = getAllVisits;
// exports.getVisit = getVisit;
// exports.updateVisit = updateVisit;
// exports.createVisit = createVisit;
