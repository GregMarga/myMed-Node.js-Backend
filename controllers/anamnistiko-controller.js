const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Surgery = require('../models/surgery');
const Condition = require('../models/condition');
const Gynaikologiko = require('../models/gynaikologiko');
const Maieutiko = require('../models/maieutiko');
const Patient = require('../models/patient');
const Diagnosis = require('../models/diagnosis')
const Visit = require('../models/visit')




const getConditions = async (req, res, next) => {
    const patientId = req.params.pid;
    let conditionsList = [];
    try {
        conditionsList = await Condition.find({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Η φόρτωση του ατομικού ιστορικού απέτυχε.', 500));
    }
    conditionsList = conditionsList.filter((condition) => {
        return condition.atomiko === true;
    })

    res.json(conditionsList)
}

const getAllergies = async (req, res, next) => {
    const patientId = req.params.pid;
    let allergiesList = [];
    try {
        allergiesList = await Condition.find({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Η φόρτωση του ιστορικού αλλεργιών απέτυχε.', 500));
    }
    allergiesList = allergiesList.filter((condition) => {
        return condition.allergy === true;
    })
    res.json(allergiesList)
}

const getKlironomiko = async (req, res, next) => {
    const patientId = req.params.pid;
    let cleronomicalList = [];
    try {
        cleronomicalList = await Condition.find({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Η φόρτωση του κληρονομικού ιστορικού απέτυχε.', 500));
    }
    cleronomicalList = cleronomicalList.filter((condition) => {
        return condition.cleronomical === true;
    })
    res.json(cleronomicalList)
}

const getGynaikologiko = async (req, res, next) => {
    const patientId = req.params.pid;
    let gynaikologiko;
    try {
        gynaikologiko = await Gynaikologiko.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Η φόρτωση του κληρονομικού ιστορικού απέτυχε.', 500));
    }

    res.json(gynaikologiko)
}

const createAtomikoCondition = async (req, res, next) => {
    const patientId = req.params.pid;
    const { _id, name, status, dateOfDiagnosis, dateOfHealing } = req.body;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η δημιουργία του ατομικού αναμνηστικού απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }
    const createdCondition = new Condition({
        _id,
        name,
        allergy: false,
        status,
        dateOfDiagnosis,
        dateOfHealing,
        atomiko: true,
        cleronomical: false,

        patient: patientId,


    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdCondition.save({ session: sess });
        patient.conditions.push(createdCondition);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }
    res.json(createdCondition)
}

const createAtomikoAllergies = async (req, res, next) => {
    const patientId = req.params.pid;
    const { allergies } = req.body;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του ατομικού αναμνηστικού αλλεργιών απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    for (let i = 0; i < allergies.length; i++) {
        console.log(allergies[i])
        const createdCondition = new Condition({
            _id: allergies[i]._id,
            name: allergies[i].name,
            allergy: true,
            patient: patientId,

        })
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdCondition.save({ session: sess });
            patient.conditions.push(createdCondition);
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }

    }
    res.json(allergies)
}

const addAtomikoAllergy = async (req, res, next) => {
    const patientId = req.params.pid;
    const { _id, name } = req.body;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του ατομικού αναμνηστικού αλλεργιών απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    const createdCondition = new Condition({
        _id,
        name,
        allergy: true,
        patient: patientId,
    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdCondition.save({ session: sess });
        patient.conditions.push(createdCondition);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }


    res.json({ allergy: createdCondition })
}


const removeAtomikoAllergy = async (req, res, next) => {
    const patientId = req.params.pid;
    const allergyId = req.params.allergyId;

    let patient, condition;

    console.log(patientId, allergyId)
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η διαγραφή της αλλεργίας απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }



    try {
        condition = await Condition.findById(allergyId);
    } catch (err) {
        console.log(err)
        return next(new HttpError('Η διαγραφή της αλλεργίας απέτυχε.', 500));
    }
    if (!condition) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη αυτή η πάθηση.', 404));
    }


    if (patient.conditions.includes(condition._id)) {
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await condition.deleteOne({ session: sess });
            patient.conditions.pull(condition);
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η διαγραφή της αλλεργίας απέτυχε.',
                500
            );
            return next(error);
        }
    }
    res.json(condition)
}

const removeKlironomikoCondition = async (req, res, next) => {
    const patientId = req.params.pid;
    const klironomikoId = req.params.klironomikoId;

    let patient, condition;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η διαγραφή της πάθησης του κληρονομικού απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }



    try {
        condition = await Condition.findById(klironomikoId);
    } catch (err) {
        return next(new HttpError('Η διαγραφή της πάθησης του κληρονομικού απέτυχε.', 500));
    }
    if (!condition) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη αυτή η πάθηση.', 404));
    }


    if (patient.conditions.includes(condition._id)) {
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await condition.deleteOne({ session: sess });
            patient.conditions.pull(condition);
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η διαγραφή της αλλεργίας απέτυχε.',
                500
            );
            return next(error);
        }
    }
    res.json(condition)
}

const createKlironomiko = async (req, res, next) => {
    const patientId = req.params.pid;
    const { cleronomical } = req.body;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του ατομικού αναμνηστικού αλλεργιών απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    for (let i = 0; i < cleronomical.length; i++) {
        console.log(cleronomical[i])
        const createdCondition = new Condition({
            _id: cleronomical[i]._id,
            name: cleronomical[i].name,
            allergy: false,
            cleronomical: true,
            patient: patientId,


        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdCondition.save({ session: sess });
            patient.conditions.push(createdCondition);
            await patient.save({ session: sess });
            await sess.commitTransaction();
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Η δημιουργία του κληρονομικού αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
                500
            );
            return next(error);
        }

    }
    res.json(cleronomical)
}

const addKlironomiko = async (req, res, next) => {
    const patientId = req.params.pid;
    const { _id, name } = req.body;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του κληρονομικού αναμνηστικού απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    const createdCondition = new Condition({
        _id,
        name,
        allergy: false,
        cleronomical: true,
        patient: patientId,


    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdCondition.save({ session: sess });
        patient.conditions.push(createdCondition);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }
    res.json(createdCondition)

}


const createSurgery = async (req, res, next) => {
    const patientId = req.params.pid;
    const { _id, title, dateOfEntrance, dateOfExit, hospital } = req.body;
    let patient;
    console.log(_id)

    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του ιστορικού χειρουργείων απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    const createdSurgery = new Surgery({
        _id,
        title,
        dateOfEntrance,
        dateOfExit,
        hospital,

        patient: patientId
    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdSurgery.save({ session: sess });
        patient.surgeries.push(createdSurgery);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }
    res.json(createdSurgery)
}

const updateSurgery = async (req, res, next) => { //////////////////////////////////////////////////////////////////////////////////
    const patientId = req.params.pid;
    const surgeryId = req.params.surgeryId;
    const { title, dateOfEntrance, dateOfExit, hospital } = req.body;
    let patient;
    let surgery;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η ενημέρωση του χειρουργείου  απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }
    try {
        surgery = await Surgery.findById(surgeryId);
    } catch (err) {
        return next(new HttpError('Η ενημέρωση του χειρουργείου  απέτυχε.', 500));
    }

    surgery.title = title
    surgery.dateOfEntrance = dateOfEntrance
    surgery.dateOfExit = dateOfExit
    surgery.hospital = hospital


    try {
        await surgery.save();

    } catch (err) {
        console.log(err)
        const error = new HttpError('Η ενημέρωση του χειρουργείου απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500);
        return next(error);
    }

    res.json(surgery)
}



const createGynaikologiko = async (req, res, next) => { //////////////////////////////////////////////////////////////////////////////////
    const patientId = req.params.pid;
    const { emminarxi, stability, cycle_duration, period_duration, emminopausi, adk, tdk } = req.body;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του γυναικολογικού αναμνηστικού απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }


    const createdGynaikologiko = new Gynaikologiko({
        emminarxi,
        stability,
        cycle_duration,
        period_duration,
        emminopausi,
        adk,
        tdk,

        patient: patientId,

    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdGynaikologiko.save({ session: sess });
        patient.gynaikologiko = (createdGynaikologiko);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η δημιουργία του γυναικολογικού αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }

    res.json(createdGynaikologiko)
}

const updateGynaikologiko = async (req, res, next) => { //////////////////////////////////////////////////////////////////////////////////
    const patientId = req.params.pid;
    const { emminarxi, stability, cycle_duration, period_duration, emminopausi } = req.body;
    let patient;
    let gynaikologiko;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η ενημέρωση του γυναικολογικού αναμνηστικού απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }
    try {
        gynaikologiko = await Gynaikologiko.findOne({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Η ενημέρωση του γυναικολογικού αναμνηστικού απέτυχε.', 500));
    }

    gynaikologiko.emminarxi = emminarxi
    gynaikologiko.stability = stability
    gynaikologiko.cycle_duration = cycle_duration
    gynaikologiko.period_duration = period_duration
    gynaikologiko.emminopausi = emminopausi



    try {
        await gynaikologiko.save();

    } catch (err) {
        console.log(err)
        const error = new HttpError('Η ενημέρωση του γυναικολογικού αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.', 500);
        return next(error);
    }

    res.json(gynaikologiko)
}



const getPregnacies = async (req, res, next) => {
    const patientId = req.params.pid;
    let pregnaciesList = [];
    try {
        pregnaciesList = await Maieutiko.find({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Η φόρτωση του μαιευτικού ιστορικού απέτυχε.', 500));
    }
    res.json(pregnaciesList)
}

const getSurgeries = async (req, res, next) => {
    const patientId = req.params.pid;
    let surgeriesList = [];
    try {
        surgeriesList = await Surgery.find({ patient: patientId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Η φόρτωση των χειρουργείων απέτυχε.', 500));
    }
    res.json(surgeriesList)
}


const removeSurgery = async (req, res, next) => {
    const patientId = req.params.pid;
    const surgeryId = req.params.surgeryId;

    console.log(surgeryId)

    let patient, surgery;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η διαγραφή του χειρουργείου απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    try {
        surgery = await Surgery.findById(surgeryId);
    } catch (err) {
        return next(new HttpError('Η διαγραφή του χειρουργείου απέτυχε.', 500));
    }
    if (!surgery) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος αυτό το χειρουργείο.', 404));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await surgery.deleteOne({ session: sess });
        patient.surgeries.pull(surgery);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η διαγραφή του χειρουργείου απέτυχε.',
            500
        );
        return next(error);
    }

    res.json(surgery)
}
const removeCondition = async (req, res, next) => {
    const patientId = req.params.pid;
    const conditionId = req.params.conditionId;


    let patient, visit, condition, diagnosis;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η διαγραφή της πάθησης απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }



    try {
        condition = await Condition.findById(conditionId);
    } catch (err) {
        return next(new HttpError('Η διαγραφή της πάθησης απέτυχε.', 500));
    }
    if (!condition) {
        console.log(conditionId)
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένη αυτή η πάθηση.', 404));
    }


    if (!!condition.diagnosis) {
        for (let i = 0; i < condition.diagnosis.length; i++) {
            try {
                diagnosis = await Diagnosis.findById(condition.diagnosis[i]);
            } catch (err) {
                return next(new HttpError('Η διαγραφή της πάθησης απέτυχε.', 500));
            }
            if (!diagnosis) {
                console.log(condition.diagnosis[i])
                return next(new HttpError('Δεν υπάρχει καταγεγραμμένη αυτή η διάγνωση.', 404));
            }

            try {
                visit = await Visit.findById(diagnosis.visit);
            } catch (err) {
                return next(new HttpError('Η διαγραφή της πάθησης απέτυχε.', 500));
            }
            if (!visit) {
                console.log(conditionId)
                return next(new HttpError('Δεν υπάρχει καταγεγραμμένη αυτή η επίσκεψη.', 404));
            }

            try {
                const sess = await mongoose.startSession();
                sess.startTransaction();
                await diagnosis.deleteOne({ session: sess });
                visit.diagnosis.pull(condition);
                await visit.save({ session: sess });
                await sess.commitTransaction();
            } catch (err) {
                console.log(err)
                const error = new HttpError(
                    'Η διαγραφή της πάθησης απέτυχε.',
                    500
                );
                return next(error);
            }
        }
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await condition.deleteOne({ session: sess });
        patient.conditions.pull(condition);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η διαγραφή της πάθησης απέτυχε.',
            500
        );
        return next(error);
    }
   
    res.json(condition)
}


const createPregnacy = async (req, res, next) => {
    const patientId = req.params.pid;

    const { _id, date_of_birth, gennisi, baby_weight, comments } = req.body;

    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του μαιευτικού ιστορικού απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    const createdMaieutiko = new Maieutiko({
        _id,
        date_of_birth,
        gennisi,
        baby_weight,
        comments,

        patient: patientId
    })

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdMaieutiko.save({ session: sess });
        patient.pregnacies.push(createdMaieutiko);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η δημιουργία του μαιευτικού ιστορικού απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }

    res.json(createdMaieutiko)
}


const updatePregnacy = async (req, res, next) => {
    const pregnacyId = req.params.pregnacyId;


    const { date_of_birth, gennisi, baby_weight, comments } = req.body;

    let pregnacy;
    try {
        pregnacy = await Maieutiko.findById(pregnacyId);
    } catch (err) {
        return next(new HttpError('Η ενημερώση του μαιευτικού ιστορικού απέτυχε.', 500));
    }
    if (!pregnacy) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένο μαιευτικό ιστορικό.', 404));
    }

    pregnacy.date_of_birth = date_of_birth;
    pregnacy.gennisi = gennisi;
    pregnacy.baby_weight = baby_weight;
    pregnacy.comments = comments;


    try {
        await pregnacy.save()
    } catch (err) {
        const error = new HttpError(
            'Η ενημερώση του μαιευτικού ιστορικού απέτυχε, παρακαλώ προσπαθήστε ξανά.',
            500
        );
        return next(error);
    }

    res.json(pregnacyId)
}


const removePregnacy = async (req, res, next) => {
    const patientId = req.params.pid;
    const pregnacyId = req.params.pregnacyId;

    let patient, pregnacy;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η διαγραφή του χειρουργείου απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }

    try {
        pregnacy = await Maieutiko.findById(pregnacyId);
    } catch (err) {
        return next(new HttpError('Η διαγραφή του χειρουργείου απέτυχε.', 500));
    }
    if (!pregnacy) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος αυτό το χειρουργείο.', 404));
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await pregnacy.deleteOne({ session: sess });
        patient.pregnacies.pull(pregnacy);
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Η διαγραφή του χειρουργείου απέτυχε.',
            500
        );
        return next(error);
    }

    res.json(pregnacy)
}


exports.getConditions = getConditions;
exports.getAllergies = getAllergies;
exports.getKlironomiko = getKlironomiko;
exports.getGynaikologiko = getGynaikologiko;
exports.createAtomikoCondition = createAtomikoCondition;
exports.createAtomikoAllergies = createAtomikoAllergies;
exports.addAtomikoAllergy = addAtomikoAllergy;
exports.removeAtomikoAllergy = removeAtomikoAllergy;
exports.createKlironomiko = createKlironomiko;
exports.addKlironomiko = addKlironomiko;
exports.removeKlironomikoCondition = removeKlironomikoCondition;
exports.createSurgery = createSurgery;
exports.getSurgeries = getSurgeries;
exports.getPregnacies = getPregnacies;
exports.updateSurgery = updateSurgery;
exports.removeSurgery = removeSurgery;
exports.createGynaikologiko = createGynaikologiko;
exports.updateGynaikologiko = updateGynaikologiko;
exports.createPregnacy = createPregnacy;
exports.updatePregnacy = updatePregnacy;
exports.removePregnacy = removePregnacy;
exports.removeCondition = removeCondition;
