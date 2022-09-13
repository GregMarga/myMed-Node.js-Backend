const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
// const Anamnistiko = require('../models/anamnistiko');
// const Atomiko = require('../models/atomiko');
// const Klironomiko = require('../models/klironomiko');
const Surgery = require('../models/surgery');
const Condition = require('../models/condition');
const Gynaikologiko = require('../models/gynaikologiko');
const Maieutiko = require('../models/maieutiko');
const Patient = require('../models/patient');
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


    let patient, visit, condition;
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
    if (!!condition.visit) {
        try {
            visit = await Visit.findById(condition.visit);
        } catch (err) {
            return next(new HttpError('Η διαγραφή της πάθησης απέτυχε.', 500));
        }
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
                'Η διαγραφή της πάθησης απέτυχε.',
                500
            );
            return next(error);
        }


    }
    if (!!visit) {
        try {
            visit.conditions.pull(condition);
            await visit.save()
        } catch (err) {
            return next(new HttpError('Η διαγραφή της πάθησης απέτυχε.', 500))
        }
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

    pregnacy.date_of_birth=date_of_birth;
    pregnacy.gennisi=gennisi;
    pregnacy.baby_weight=baby_weight;
    pregnacy.comments=comments;


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
exports.updatePregnacy=updatePregnacy;
exports.removePregnacy = removePregnacy;
exports.removeCondition = removeCondition;
// const createAnamnistiko = async (req, res, next) => {
//     const patientId = req.params.pid;
//     const { allergies, cleronomical, conditions, surgeries, gynaikologiko } = req.body;
//     console.log(gynaikologiko)
//     console.log('in:', patientId)


//     let patient, anamnistiko, atomiko, klironomiko, surgery, gynaikologika;
//     let klironomikoId = mongoose.Types.ObjectId();
//     let anamnistikoId = mongoose.Types.ObjectId();
//     let atomikoId = mongoose.Types.ObjectId();
//     let surgeriesId;
//     let gynaikologikoId = mongoose.Types.ObjectId();
//     let maieutikoId;
//     try {
//         patient = await Patient.findById(patientId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!patient) {
//         return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
//     }
//     const createdAnamnistiko = new Anamnistiko({
//         _id: anamnistikoId,
//         surgeries: [],
//         patient: patientId
//     })
//     try {
//         const sess = await mongoose.startSession();
//         sess.startTransaction();
//         await createdAnamnistiko.save({ session: sess });
//         patient.anamnistiko = createdAnamnistiko;
//         await patient.save({ session: sess });
//         await sess.commitTransaction();
//     } catch (err) {
//         console.log(err)
//         const error = new HttpError(
//             'Η Δημιουργία αναμνηστικού απέτυχε,παρακαλώ προσπαθηστε ξανά.',
//             500
//         );
//         return next(error);
//     }
//     try {
//         anamnistiko = await Anamnistiko.findById(anamnistikoId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!anamnistiko) {
//         return next(new HttpError('Δεν υπάρχει καταγεγραμμένο αναμνηστικό.', 404));
//     }
//     const createdAtomiko = new Atomiko({
//         _id: atomikoId,
//         conditions: [],
//         anamnistiko: anamnistikoId
//     })

//     const createdGynaikologiko = new Gynaikologiko({
//         _id: gynaikologikoId,
//         emminarxi: gynaikologiko.emminarxi,
//         emminopausi: gynaikologiko.emminopausi,
//         cycle_duration: gynaikologiko.cycle_duration,
//         period_duration: gynaikologiko.period_duration,
//         adk: gynaikologiko.adk,
//         tdk: gynaikologiko.tdk,
//         stability: gynaikologiko.stability,
//         anamnistiko: anamnistikoId
//     })
//     const createdKlironomiko = new Klironomiko({
//         _id: klironomikoId,
//         anamnistiko: anamnistikoId
//     })
//     try {
//         const sess = await mongoose.startSession();
//         sess.startTransaction();
//         await createdAtomiko.save({ session: sess });
//         await createdKlironomiko.save({ session: sess })

//         await createdGynaikologiko.save({ session: sess });
//         anamnistiko.atomiko = createdAtomiko;
//         anamnistiko.klironomiko = createdKlironomiko;

//         anamnistiko.gynaikologiko = createdGynaikologiko;
//         await anamnistiko.save({ session: sess });
//         await sess.commitTransaction();
//     } catch (err) {
//         console.log(err)
//         const error = new HttpError(
//             'Creating atomiko failed, please try again.',
//             500
//         );
//         return next(error);
//     }


//     try {
//         atomiko = await Atomiko.findById(atomikoId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!atomiko) {
//         return next(new HttpError('Δεν υπάρχει ατομικό αναμνηστικό.', 404));
//     }

//     for (let i = 0; i < conditions.length; i++) {
//         const createdCondition = new Condition({
//             _id: conditions[i]._id,
//             name: conditions[i].name,
//             allergy: false,
//             status: conditions[i].status,
//             dateOfDiagnosis: conditions[i].dateOfDiagnosis,
//             dateOfHealing: conditions[i].dateOfHealing,
//             atomiko: atomikoId,
//             patient: patientId,
//             cleronomical: false

//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdCondition.save({ session: sess });
//             atomiko.conditions.push(createdCondition);
//             await atomiko.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }
//     for (let i = 0; i < allergies.length; i++) {
//         console.log(allergies[i])
//         const createdCondition = new Condition({
//             _id: allergies[i]._id,
//             name: allergies[i].name,
//             allergy: true,
//             patient: patientId,
//             atomiko: atomikoId

//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdCondition.save({ session: sess });
//             atomiko.conditions.push(createdCondition);
//             await atomiko.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }
//     try {
//         klironomiko = await Klironomiko.findById(klironomikoId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!klironomiko) {
//         return next(new HttpError('Δεν υπάρχει κληρονομικό αναμνηστικό.', 404));
//     }
//     for (let i = 0; i < cleronomical.length; i++) {

//         const createdCondition = new Condition({
//             name: cleronomical[i].name,
//             _id: cleronomical[i]._id,
//             allergy: false,
//             patient: patientId,
//             atomiko: atomikoId,
//             cleronomical: true

//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdCondition.save({ session: sess });
//             klironomiko.conditions.push(createdCondition);
//             await klironomiko.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }
//     // try {
//     //     surgery = await Surgery.findById(surgeriesId);
//     // } catch (err) {
//     //     return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     // }
//     // if (!surgery) {
//     //     return next(new HttpError('Δεν υπάρχει ιστορικό χειρουργείων.', 404));
//     // }
//     for (let i = 0; i < surgeries.length; i++) {
//         surgeriesId = mongoose.Types.ObjectId();
//         const createdSurgeries = new Surgery({
//             _id: surgeriesId,
//             title: surgeries[i].title,
//             dateOfEntrance: surgeries[i].dateOfEntrance,
//             dateOfExit: surgeries[i].dateOfExit,
//             hospital: surgeries[i].hospital,
//             anamnistiko: anamnistikoId,
//             patient: patientId
//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdSurgeries.save({ session: sess });
//             anamnistiko.surgeries.push(createdSurgeries);
//             await anamnistiko.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }
//     try {
//         gynaikologika = await Gynaikologiko.findById(gynaikologikoId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!gynaikologika) {
//         return next(new HttpError('Δεν υπάρχει γυναικολογικό αναμνηστικό.', 404));
//     }
//     for (let i = 0; i < gynaikologiko.pregnacyList.length; i++) {
//         console.log('hereeeeeeeeeeeeeeeee:', gynaikologiko.pregnacyList[i].date_of_birth)
//         let maieutikoId = mongoose.Types.ObjectId();
//         const createdMaieutiko = new Maieutiko({
//             _id: maieutikoId,
//             date_of_birth: gynaikologiko.pregnacyList[i].date_of_birth,
//             gennisi: gynaikologiko.pregnacyList[i].gennisi,
//             baby_weight: gynaikologiko.pregnacyList[i].baby_weight,
//             comments: gynaikologiko.pregnacyList[i].comments,
//             gynaikologiko: gynaikologikoId
//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdMaieutiko.save({ session: sess });
//             gynaikologika.maieutiko.push(createdMaieutiko);
//             await gynaikologika.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }



//     res.status(201).json({ _id: anamnistiko._id })
// }



// const deleteOldValues = async (patientId, next) => {
//     let anamnistiko, atomiko, klironomiko, gynaikologiko;
//     let klironomikoId;
//     let anamnistikoId;
//     let atomikoId;
//     let surgeriesId;
//     let gynaikologikoId;


//     try {
//         anamnistiko = await Anamnistiko.findOne({ patient: patientId });
//     } catch (err) {
//         return next(new HttpError('Η ενημέρωση του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!anamnistiko) {
//         return next(new HttpError('Δεν υπάρχει καταγεγραμμένο αναμνηστικό.', 404));
//     }
//     atomikoId = anamnistiko.atomiko;
//     klironomikoId = anamnistiko.klironomiko;
//     gynaikologikoId = anamnistiko.gynaikologiko;

//     try {
//         gynaikologiko = await Gynaikologiko.findById(gynaikologikoId)
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η ενημέρωση του αναμνηστικού απέτυχε.', 500));
//     }
//     for (let i = 0; i < gynaikologiko.maieutiko.length; i++) {
//         try {
//             await Maieutiko.findById(gynaikologiko.maieutiko[i]).deleteOne()
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Η ενημέρωση του αναμνηστικού απέτυχε.', 500));
//         }
//     }
//     gynaikologiko.deleteOne()

//     for (let i = 0; i < anamnistiko.surgeries.length; i++) {
//         try {
//             await Surgery.findById(anamnistiko.surgeries[i]).deleteOne()
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Η ενημέρωση του αναμνηστικού απέτυχε.', 500));
//         }
//     }
//     try {
//         atomiko = await Atomiko.findById(atomikoId)
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η ενημέρωση του αναμνηστικού απέτυχε.', 500));
//     }
//     for (let i = 0; i < atomiko.conditions.length; i++) {
//         try {
//             await Condition.findById(atomiko.conditions[i]).deleteOne()
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Η ενημέρωση του αναμνηστικού απέτυχε.', 500));
//         }
//     }
//     try {
//         atomiko.deleteOne()
//     } catch (err) {
//         console.log(err);
//     }

//     try {
//         console.log('klironomikoId:', klironomikoId)
//         klironomiko = await Klironomiko.findById(klironomikoId)
//     } catch (err) {
//         console.log(err)
//         return next(new HttpError('Η ενημέρωση του αναμνηστικού απέτυχε.', 500));
//     }
//     for (let i = 0; i < klironomiko.conditions.length; i++) {
//         try {
//             await Condition.findById(klironomiko.conditions[i]).deleteOne()
//         } catch (err) {
//             console.log(err)
//             return next(new HttpError('Η ενημέρωση του αναμνηστικού απέτυχε.', 500));
//         }
//     }
//     try {
//         klironomiko.deleteOne()
//     } catch (err) {
//         console.log(err);
//     }
//     try {
//         await Surgery.find({ anamnistiko: anamnistikoId }).deleteMany()
//     } catch (err) {
//         console.log(err)
//     }
//     try {
//         anamnistiko.deleteOne()
//     } catch (err) {
//         console.log(err);
//     }
//     res.json({ _id: anamnistiko._id })
// }


// const updateAnamnistiko = async (req, res, next) => {
//     const patientId = req.params.pid;
//     let { allergies, cleronomical, conditions, surgeries, gynaikologiko } = req.body;

//     console.log(allergies)



//     ///find all old values and delete
//     deleteOldValues(patientId, next);


//     //create new values

//     let patient, anamnistiko, atomiko, klironomiko, surgery, gynaikologika;
//     let klironomikoId = mongoose.Types.ObjectId();
//     let anamnistikoId = mongoose.Types.ObjectId();
//     let atomikoId = mongoose.Types.ObjectId();
//     let surgeriesId;
//     let gynaikologikoId = mongoose.Types.ObjectId();
//     let maieutikoId;
//     try {
//         patient = await Patient.findById(patientId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!patient) {
//         return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
//     }
//     const createdAnamnistiko = new Anamnistiko({
//         _id: anamnistikoId,
//         surgeries: [],
//         patient: patientId
//     })
//     try {
//         const sess = await mongoose.startSession();
//         sess.startTransaction();
//         await createdAnamnistiko.save({ session: sess });
//         patient.anamnistiko = createdAnamnistiko;
//         await patient.save({ session: sess });
//         await sess.commitTransaction();
//     } catch (err) {
//         console.log(err)
//         const error = new HttpError(
//             'Creating anamnistiko failed, please try again.',
//             500
//         );
//         return next(error);
//     }
//     try {
//         anamnistiko = await Anamnistiko.findById(anamnistikoId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!patient) {
//         return next(new HttpError('Δεν υπάρχει καταγεγραμμένο αναμνηστικό.', 404));
//     }
//     const createdAtomiko = new Atomiko({
//         _id: atomikoId,
//         conditions: [],
//         anamnistiko: anamnistikoId
//     })

//     const createdGynaikologiko = new Gynaikologiko({
//         _id: gynaikologikoId,
//         emminarxi: gynaikologiko.emminarxi,
//         emminopausi: gynaikologiko.emminopausi,
//         cycle_duration: gynaikologiko.cycle_duration,
//         period_duration: gynaikologiko.period_duration,
//         adk: gynaikologiko.adk,
//         tdk: gynaikologiko.tdk,
//         stability: gynaikologiko.stability,
//         anamnistiko: anamnistikoId
//     })
//     const createdKlironomiko = new Klironomiko({
//         _id: klironomikoId,
//         anamnistiko: anamnistikoId
//     })
//     try {
//         const sess = await mongoose.startSession();
//         sess.startTransaction();
//         await createdAtomiko.save({ session: sess });
//         await createdKlironomiko.save({ session: sess })

//         await createdGynaikologiko.save({ session: sess });
//         anamnistiko.atomiko = createdAtomiko;
//         anamnistiko.klironomiko = createdKlironomiko;

//         anamnistiko.gynaikologiko = createdGynaikologiko;
//         await anamnistiko.save({ session: sess });
//         await sess.commitTransaction();
//     } catch (err) {
//         console.log(err)
//         const error = new HttpError(
//             'Creating atomiko failed, please try again.',
//             500
//         );
//         return next(error);
//     }


//     try {
//         atomiko = await Atomiko.findById(atomikoId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!atomiko) {
//         return next(new HttpError('Δεν υπάρχει ατομικό αναμνηστικό.', 404));
//     }

//     for (let i = 0; i < conditions.length; i++) {
//         const createdCondition = new Condition({
//             _id: conditions[i]._id,
//             name: conditions[i].name,
//             allergy: false,
//             status: conditions[i].status,
//             dateOfDiagnosis: conditions[i].dateOfDiagnosis,
//             dateOfHealing: conditions[i].dateOfHealing,
//             atomiko: atomikoId,
//             patient: patientId,
//             cleronomical: false

//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdCondition.save({ session: sess });
//             atomiko.conditions.push(createdCondition);
//             await atomiko.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }
//     for (let i = 0; i < allergies.length; i++) {
//         console.log(allergies[i])
//         const createdCondition = new Condition({
//             _id: allergies[i]._id,
//             name: allergies[i].name,
//             allergy: true,
//             patient: patientId,
//             atomiko: atomikoId

//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdCondition.save({ session: sess });
//             atomiko.conditions.push(createdCondition);
//             await atomiko.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }
//     try {
//         klironomiko = await Klironomiko.findById(klironomikoId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!klironomiko) {
//         return next(new HttpError('Δεν υπάρχει κληρονομικό αναμνηστικό.', 404));
//     }
//     for (let i = 0; i < cleronomical.length; i++) {

//         const createdCondition = new Condition({
//             name: cleronomical[i].name,
//             _id: cleronomical[i]._id,
//             allergy: false,
//             patient: patientId,
//             atomiko: atomikoId,
//             cleronomical: true

//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdCondition.save({ session: sess });
//             klironomiko.conditions.push(createdCondition);
//             await klironomiko.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }
//     // try {
//     //     surgery = await Surgery.findById(surgeriesId);
//     // } catch (err) {
//     //     return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     // }
//     // if (!surgery) {
//     //     return next(new HttpError('Δεν υπάρχει ιστορικό χειρουργείων.', 404));
//     // }
//     for (let i = 0; i < surgeries.length; i++) {
//         let surgeriesId = mongoose.Types.ObjectId();
//         const createdSurgeries = new Surgery({
//             _id: surgeriesId,
//             title: surgeries[i].title,
//             dateOfEntrance: surgeries[i].dateOfEntrance,
//             dateOfExit: surgeries[i].dateOfExit,
//             anamnistiko: anamnistikoId,
//             patient: patientId
//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdSurgeries.save({ session: sess });
//             anamnistiko.surgeries.push(createdSurgeries);
//             await anamnistiko.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }
//     try {
//         gynaikologika = await Gynaikologiko.findById(gynaikologikoId);
//     } catch (err) {
//         return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
//     }
//     if (!atomiko) {
//         return next(new HttpError('Δεν υπάρχει γυναικολογικό αναμνηστικό.', 404));
//     }
//     for (let i = 0; i < gynaikologiko.pregnacyList.length; i++) {
//         let maieutikoId = mongoose.Types.ObjectId();
//         const createdMaieutiko = new Maieutiko({
//             _id: maieutikoId,
//             date_of_birth: gynaikologiko.pregnacyList[i].date_of_birth,
//             gennisi: gynaikologiko.pregnacyList[i].gennisi,
//             baby_weight: gynaikologiko.pregnacyList[i].baby_weight,
//             comments: gynaikologiko.pregnacyList[i].comments,
//             gynaikologiko: gynaikologikoId
//         })

//         try {
//             const sess = await mongoose.startSession();
//             sess.startTransaction();
//             await createdMaieutiko.save({ session: sess });
//             gynaikologika.maieutiko.push(createdMaieutiko);
//             await gynaikologika.save({ session: sess });
//             await sess.commitTransaction();
//         } catch (err) {
//             console.log(err)
//             const error = new HttpError(
//                 'Η δημιουργία του αναμνηστικό απέτυχε, παρακαλώ προσπαθήστε ξανά.',
//                 500
//             );
//             return next(error);
//         }

//     }




//     res.status(201).json({ anamnistiko: 'createdAnamnistiko' })
// }


// exports.updateAnamnistiko = updateAnamnistiko;
// exports.getAnamnstiko = getAnamnstiko;
// exports.createAnamnistiko = createAnamnistiko;