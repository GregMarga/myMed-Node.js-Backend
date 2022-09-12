const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const farmakoSchema = Schema({
    name: { type: String, required: false },
    ATC_name: { type: String, required: false },
    dateOfStart: { type: Date, required: false },
    dateOfEnd: { type: Date, required: false },
    patient: { type: mongoose.Types.ObjectId, required: true, ref: 'Patient' },
    therapeia:[{ type: mongoose.Types.ObjectId, required: false, ref: 'Therapeia'}]



})

module.exports = mongoose.model('Farmako', farmakoSchema);