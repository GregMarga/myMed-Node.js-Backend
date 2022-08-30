const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const surgerySchema = Schema({
    title: { type: String, required: false },
    dateOfEntrance: { type: Date, required: false },
    dateOfExit: { type: Date, required: false },    
    hospital: { type: String, required: false },

    anamnistiko: { type: mongoose.Types.ObjectId, required: true, ref: 'Anamnistiko' },
    patient: { type: mongoose.Types.ObjectId, required: true, ref: 'Patient' }

})

module.exports = mongoose.model('Surgeries', surgerySchema);