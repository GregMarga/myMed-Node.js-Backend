const mongoose =require('mongoose');

const Schema=mongoose.Schema;

const visitSchmema=Schema({
    date:{type:String,required:true},
    diagnosis:{type:String,required:true},
    patient:{type:mongoose.Types.ObjectId,required:true,ref:'Patient'}
});

module.exports=mongoose.model('Visit',visitSchmema);