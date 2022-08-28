const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const atomikoSchema = Schema({

    // allergies:[{ type: mongoose.Types.ObjectId, required: false, ref: 'Condition' }],
    conditions: [{ type: mongoose.Types.ObjectId, required: false, ref: 'Condition' }],
    anamnistiko: { type: mongoose.Types.ObjectId, required: true, ref: 'Anamnistiko' }

})

module.exports = mongoose.model('Atomiko', atomikoSchema);