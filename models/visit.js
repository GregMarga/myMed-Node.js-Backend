const mongoose =require('mongoose');

const Schema=mongoose.Schema;

const visitSchmema=Schema({
    date:{type:Date,required:true},
    diagnosis:{type:String,required:false},
    geniki_eikona:{type:String,required:false},
    piesi:{type:String,required:false},
    sfiksis:{type:String,required:false},
    weight:{type:String,required:false},
    height:{type:String,required:false},
    tekt:{type:Number,required:false,enum:[0,1,2,3,4,5]},
    smkt:{type:Number,required:false,enum:[0,1,2,3,4,5]},
    test_volume:{type:String,required:false},
    others:{type:String,required:false},
    patient:{type:mongoose.Types.ObjectId,required:true,ref:'Patient'},
    doctor:{type:mongoose.Types.ObjectId,required:true,ref:'User'}
});

module.exports=mongoose.model('Visit',visitSchmema);