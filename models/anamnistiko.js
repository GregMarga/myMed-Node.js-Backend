const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const anamnistikoSchema = Schema({
    allergies: { type: String, required: false },
    cleronomical: { type: String, required: false },
    personal: { type: String, required: false },
    surgeries: { type: String, required: false },
    drug_usage: { type: String, required: false },
    habits: { type: String, required: false },
    others: { type: String, required: false },
    
    patient:{type:mongoose.Types.ObjectId,required:true,ref:'Patient'}
})

module.exports = mongoose.model('Anamnistiko', anamnistikoSchema);
