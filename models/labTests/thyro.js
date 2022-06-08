const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ThyroSchema = Schema({
    date: { type: String, required: false },
    visitDate: { type: String, required: false },
    tsh:{ type: String, required: false },
    t4:{ type: String, required: false },
    ft4:{ type: String, required: false },
    t3:{ type: String, required: false },
    ft3:{ type: String, required: false },
    abtpo:{ type: String, required: false },
    trab:{ type: String, required: false },
    ct:{ type: String, required: false },
    tg:{ type: String, required: false },
    patient:{type:mongoose.Types.ObjectId,required:true,ref:'Patient'}
   
})

module.exports = mongoose.model('Thyro', ThyroSchema);