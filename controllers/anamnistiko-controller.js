const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Anamnistiko = require('../models/anamnistiko');
const Atomiko = require('../models/atomiko');
const Klironomiko = require('../models/klironomiko');
const Surgery = require('../models/surgery');
const Condition = require('../models/condition');
const Gynaikologiko = require('../models/gynaikologiko');
const Maieutiko = require('../models/maieutiko');
const Patient = require('../models/patient')

const getAnamnstiko = async (req, res, next) => {
    const userId = req.params.pid;
    console.log(userId)
    const gender = req.params.gender;
    let anamnistiko;
    let conditions;
    let conditionsList = [];
    let atomiko;
    let cleronomical;
    let cleronomicalList = [];
    let allergies = [];
    let surgeries;
    
    let maieutiko;
    let gynaikologiko;
    try {
        anamnistiko = await Anamnistiko.findOne({ patient: userId }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Απέτυχε η ανάκτηση του ιστορικού,παρακαλώ προσπαθήστε ξανά.', 500));
    }

    try {
        atomiko = await Atomiko.findOne({ anamnistiko: anamnistiko._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Δεν βρέθηκε το ατομικό αναμνηστικό.', 500));
    }
    try {
        conditions = await Condition.find({ atomiko: atomiko._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Fetching history info failed,please try again later.', 500));
    }
    for (let i = 0; i < conditions.length; i++) {
        
        if (!conditions[i].allergy) {
            conditionsList.push(conditions[i])
        } else {
            allergies.push(conditions[i])
        }
    }

    try {
        surgeries = await Surgery.find({ anamnistiko: anamnistiko._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Fetching history info failed,please try again later.', 500));
    }
   

    try {
        cleronomical = await Klironomiko.findOne({ anamnistiko: anamnistiko._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Fetching history info failed,please try again later.', 500));
    }
    try {
        conditions = await Condition.find({ klironomiko: cleronomical._id }).sort({ field: 'asc', _id: -1 });
    } catch (err) {
        return next(new HttpError('Fetching history info failed,please try again later.', 500));
    }
    for (let i = 0; i < conditions.length; i++) {
        cleronomical.push(conditions[i])

    }

    // try {
    //     conditions = await Condition.find({ atomiko: atomiko._id }).sort({ field: 'asc', _id: -1 });
    // } catch (err) {
    //     return next(new HttpError('Fetching history info failed,please try again later.', 500));
    // }
    if (gender === 'female') {
        try {
            gynaikologiko = await Gynaikologiko.findOne({ anamnistiko: anamnistiko._id }).sort({ field: 'asc', _id: -1 });
        } catch (err) {
            return next(new HttpError('Fetching history info failed,please try again later.', 500));
        }


        try {
            maieutiko = await Maieutiko.find({ gynaikologiko: gynaikologiko._id }).sort({ field: 'asc', _id: -1 });
        } catch (err) {
            return next(new HttpError('Fetching history info failed,please try again later.', 500));
        }
    }
    console.log(allergies)
    res.json({ allergies, conditionsList, surgeries, gynaikologiko, maieutiko })
};




const createAnamnistiko = async (req, res, next) => {
    const patientId = req.params.pid;
    const { allergies, cleronomical, conditions, surgeries, gynaikologiko } = req.body;
   
    let patient, anamnistiko, atomiko, klironomiko, surgery, gynaikologika;
    let klironomikoId = mongoose.Types.ObjectId();
    let anamnistikoId = mongoose.Types.ObjectId();
    let atomikoId = mongoose.Types.ObjectId();
    let surgeriesId = mongoose.Types.ObjectId();
    let gynaikologikoId = mongoose.Types.ObjectId();
    let maieutikoId = mongoose.Types.ObjectId();
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένος ο συγκεκριμένος ασθενής.', 404));
    }
    const createdAnamnistiko = new Anamnistiko({
        _id: anamnistikoId,
        surgeries: [],
        patient: patientId
    })
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdAnamnistiko.save({ session: sess });
        patient.anamnistiko = createdAnamnistiko;
        await patient.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating anamnistiko failed, please try again.',
            500
        );
        return next(error);
    }
    try {
        anamnistiko = await Anamnistiko.findById(anamnistikoId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
    }
    if (!patient) {
        return next(new HttpError('Δεν υπάρχει καταγεγραμμένο αναμνηστικό.', 404));
    }
    const createdAtomiko = new Atomiko({
        _id: atomikoId,
        conditions: [],
        anamnistiko: anamnistikoId
    })

    const createdGynaikologiko = new Gynaikologiko({
        _id: gynaikologikoId,
        emminarxi:gynaikologiko.emminarxi,
        emminopausi:gynaikologiko.emminopausi,
        cycle_duration:gynaikologiko.cycle_duration,
        period_duration:gynaikologiko.period_duration,
        adk:gynaikologiko.adk,
        tdk:gynaikologiko.tdk,
        stability:gynaikologiko.stability,
        anamnistiko: anamnistikoId
    })
    const createdKlironomiko = new Klironomiko({
        _id: klironomikoId,
        anamnistiko: anamnistikoId
    })
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdAtomiko.save({ session: sess });
        await createdKlironomiko.save({ session: sess })

        await createdGynaikologiko.save({ session: sess });
        anamnistiko.atomiko = createdAtomiko;
        anamnistiko.klironomiko = createdAnamnistiko;

        anamnistiko.gynaikologiko = createdGynaikologiko;
        await anamnistiko.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating atomiko failed, please try again.',
            500
        );
        return next(error);
    }


    try {
        atomiko = await Atomiko.findById(atomikoId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
    }
    if (!atomiko) {
        return next(new HttpError('Δεν υπάρχει ατομικό αναμνηστικό.', 404));
    }

    for (let i = 0; i < conditions.length; i++) {
        const createdCondition = new Condition({
            name: conditions[i].name,
            allergy: false,
            dateOfDiagnosis: conditions[i].dateOfDiagnosis,
            dateOfHealing: conditions[i].dateOfHealing,
            atomiko: atomikoId

        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdCondition.save({ session: sess });
            atomiko.conditions.push(createdCondition);
            await atomiko.save({ session: sess });
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
    for (let i = 0; i < allergies.length; i++) {
        console.log(allergies[i])
        const createdCondition = new Condition({
            name: allergies[i],
            allergy: true,

            atomiko: atomikoId

        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdCondition.save({ session: sess });
            atomiko.conditions.push(createdCondition);
            await atomiko.save({ session: sess });
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
    try {
        klironomiko = await Klironomiko.findById(klironomikoId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
    }
    if (!klironomiko) {
        return next(new HttpError('Δεν υπάρχει κληρονομικό αναμνηστικό.', 404));
    }
    for (let i = 0; i < cleronomical.length; i++) {
        console.log(cleronomical)
        console.log(allergies)
        const createdCondition = new Condition({
            name: cleronomical[i],
            allergy: true,

            atomiko: atomikoId

        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdCondition.save({ session: sess });
            klironomiko.conditions.push(createdCondition);
            await klironomiko.save({ session: sess });
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
    // try {
    //     surgery = await Surgery.findById(surgeriesId);
    // } catch (err) {
    //     return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
    // }
    // if (!surgery) {
    //     return next(new HttpError('Δεν υπάρχει ιστορικό χειρουργείων.', 404));
    // }
    for (let i = 0; i < surgeries.length; i++) {
        const createdSurgeries = new Surgery({
            _id: surgeriesId,
            title: surgeries[i].name,
            dateOfEntrance: surgeries[i].dateOfEntrance,
            dateOfExit: surgeries[i].dateOfExit,
            anamnistiko: anamnistikoId
        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdSurgeries.save({ session: sess });
            anamnistiko.surgeries.push(createdSurgeries);
            await anamnistiko.save({ session: sess });
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
    try {
        gynaikologika = await Gynaikologiko.findById(gynaikologikoId);
    } catch (err) {
        return next(new HttpError('Η δημιουργία του αναμνηστικού απέτυχε.', 500));
    }
    if (!atomiko) {
        return next(new HttpError('Δεν υπάρχει γυναικολογικό αναμνηστικό.', 404));
    }
    for (let i = 0; i < gynaikologiko.pregnacyList.length; i++) {
        const createdMaieutiko = new Maieutiko({
            _id: surgeriesId,
            date: gynaikologiko.pregnacyList[i].date,
            gennisi: gynaikologiko.pregnacyList[i].gennisi,
            baby_weight: gynaikologiko.pregnacyList[i].baby_weight,
            comments: gynaikologiko.pregnacyList[i].comments,
            gynaikologiko: gynaikologikoId
        })

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await createdMaieutiko.save({ session: sess });
            gynaikologika.maieutiko.push(createdMaieutiko);
            await gynaikologika.save({ session: sess });
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



    res.status(201).json({ anamnistiko: createdAnamnistiko })
}

exports.getAnamnstiko = getAnamnstiko;
exports.createAnamnistiko = createAnamnistiko;