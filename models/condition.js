const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const conditionSchema = Schema({
    name: { type: String, required: true },
    allergy: { type: Boolean, required: false },
    status: { type: String, required: false },
    dateOfDiagnosis: { type: Date, required: false },
    dateOfHealing: { type: Date, required: false },
    cleronomical: { type: Boolean, required: false },
    atomiko: { type: Boolean, required: false },
    diagnosis: { type: Boolean, required: false },

    visit: { type: mongoose.Types.ObjectId, required: false, ref: 'Visit' },
    patient: { type: mongoose.Types.ObjectId, required: true, ref: 'Patient' },




})

module.exports = mongoose.model('Condition', conditionSchema);