const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const parathyroSchema = Schema({
    date: { type: Date, required: true },
    visitDate: { type: Date, required: false },
    visitId: { type: String, required: false },
    pth:{ type: String, required: false },
    vitd:{ type: String, required: false },
    ca:{ type: String, required: false },
    p:{ type: String, required: false },
    alvoumini:{ type: String, required: false },
    kreatinini:{ type: String, required: false },
    patient:{type:mongoose.Types.ObjectId,required:true,ref:'Patient'}
   
})

module.exports = mongoose.model('Parathyro', parathyroSchema);