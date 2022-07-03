const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const appointmentSchema = Schema({
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    title: { type: String, required: false },
    notes: { type: String, required: false },
    doctor: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }

})


module.exports = mongoose.model('Appointment', appointmentSchema);