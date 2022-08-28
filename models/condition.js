const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const conditionSchema = Schema({
    name: { type: String, required: true},
    allergy:{type:Boolean,required:false},
    dateOfDiagnosis: { type: Date, required: false },
    dateOfHealing: { type: Date, required: false },
    atomiko: { type: mongoose.Types.ObjectId, required: false, ref: 'Atomiko' },
    klironomiko: { type: mongoose.Types.ObjectId, required: false, ref: 'Klironomiko' },
    diagnosis: { type: mongoose.Types.ObjectId, required: false, ref: 'Diagnosis' }



})

module.exports = mongoose.model('Condition', conditionSchema);