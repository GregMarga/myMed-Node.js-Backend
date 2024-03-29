const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const therapeiaSchmema = Schema({
    condition: { type: String, required: false },
    epanalipsi: { type: String, required: false },
    posotita: { type: String, required: false },
    syxnotita: { type: String, required: false },
    duration: { type: String, required: false },
    drugName: { type: String, required: false },
    ATC_name: { type: String, required: false },

    visit: { type: mongoose.Types.ObjectId, required: true, ref: 'Visit' },
    farmako: { type: mongoose.Types.ObjectId, required: false, ref: 'Farmako' }
});

module.exports = mongoose.model('Therapeia', therapeiaSchmema);