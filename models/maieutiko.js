const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const maieutikoSchema = Schema({
    date_of_birth: { type: Date, required: false },
    gennisi: { type: String, required: false },
    baby_weight: { type: Number, required: false },
    comments: { type: String, required: false },
   

    gynaikologiko: { type: mongoose.Types.ObjectId, required: true, ref: 'Gynaikologiko' },
    

})

module.exports = mongoose.model('Maieutiko', maieutikoSchema);