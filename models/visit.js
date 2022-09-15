const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const visitSchmema = Schema({
    date: { type: Date, required: true },
    aitia_proseleusis: { type: String, required: false },
    geniki_eikona: { type: String, required: false },
    piesi: { type: String, required: false },
    sfiksis: { type: String, required: false },
    weight: { type: String, required: false },
    height: { type: String, required: false },
    tekt: { type: Number, required: false, enum: [0, 1, 2, 3, 4, 5] },
    smkt: { type: Number, required: false, enum: [0, 1, 2, 3, 4, 5] },
    test_volume: { type: String, required: false },
    teleutaia_emminos_risi: { type: Date, required: false },

    patient: { type: mongoose.Types.ObjectId, required: true, ref: 'Patient' },
    ozos: [{ type: mongoose.Types.ObjectId, required: false, ref: 'Ozos' }],
    diagnosis: [{ type: mongoose.Types.ObjectId, required: false, ref: 'Diagnosis' }],
    therapeia: [{ type: mongoose.Types.ObjectId, required: false, ref: 'Therapeia' }]
});

module.exports = mongoose.model('Visit', visitSchmema);