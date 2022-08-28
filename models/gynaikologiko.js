const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const gynaikologikoSchema = Schema({
    emminarxi: { type: Number, required: false },
    stability:{type:Boolean,required:false},
    cycle_duration: { type: Number, required: false },
    period_duration: { type: Number, required: false },
    emminopausi: { type: Number, required: false },
    adk:{type:Boolean,required:false},
    tdk:{type:Boolean,required:false},

    maieutiko: [{ type: mongoose.Types.ObjectId, required: false, ref: 'Maieutiko' }],
    anamnistiko: { type: mongoose.Types.ObjectId, required: true, ref: 'Anamnistiko' }

})

module.exports = mongoose.model('Gynaikologiko', gynaikologikoSchema);