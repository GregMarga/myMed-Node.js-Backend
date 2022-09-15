const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const diagnosisSchmema = Schema({
    conditionName: { type: String, required: false },
    status: { type: String, required: false },
    dateOfDiagnosis: { type: String, required: false },
    dateOfHealing: { type: String, required: false },

    condition: { type: mongoose.Types.ObjectId, required: false, ref: 'Condition' },
    visit: { type: mongoose.Types.ObjectId, required: true, ref: 'Visit' },

});

module.exports = mongoose.model('Diagnosis', diagnosisSchmema);