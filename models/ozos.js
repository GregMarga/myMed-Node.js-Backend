const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ozosSchmema = Schema({
    name: { type: String, required: false },
    length: { type: Number, required: false },
    height: { type: Number, required: false },
    depth: { type: Number, required: false },
    dateOfFinding: { type: Date, required: false },
    condition: { type: mongoose.Types.ObjectId, required: false, ref: 'Condition' },
    visit: { type: mongoose.Types.ObjectId, required: true, ref: 'Visit' },

});

module.exports = mongoose.model('Ozos', ozosSchmema);