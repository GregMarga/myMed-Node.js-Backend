const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const anamnistikoSchema = Schema({
    allergies: { type: [{}], required: false },
    cleronomical: { type: [{}], required: false },
    conditions: { type: [{}], required: false },
    surgeries: { type: [{}], required: false },
    gynaikologiko: { type: [{}], required: false },


    patient: { type: mongoose.Types.ObjectId, required: true, ref: 'Patient' }
})

module.exports = mongoose.model('Anamnistiko', anamnistikoSchema);
