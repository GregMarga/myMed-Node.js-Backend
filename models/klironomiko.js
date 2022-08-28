const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const klironomikoSchema = Schema({

    
    conditions: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Condition' }],
    anamnistiko: { type: mongoose.Types.ObjectId, required: true, ref: 'Anamnistiko' }

})

module.exports = mongoose.model('Klironomiko', klironomikoSchema);