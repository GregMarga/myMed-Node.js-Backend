const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const filesSchema = Schema({
    file:{ type: String, required: false },
    name: { type: String, required: false },
    type: { type: String, required: false },
    dateOfDiagnosis: { type: Date, required: false },
    dateOfVisit: { type: Date, required: false },
    patient: { type: mongoose.Types.ObjectId, required: true, ref: 'Patient' },



})

module.exports = mongoose.model('Files', filesSchema);