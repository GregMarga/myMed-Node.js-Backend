const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const patientSchema= new Schema({
    name:{type:String,required:true},
    sirname:{type:String,required:true},
    diagnosis:{type:String,required:false},
    age:{type:Number,required:false},    
    tel:{type:String,required:true},
    amka:{type:String,required:false},
    doctor:{type:mongoose.Types.ObjectId,required:true,ref:'User'},
    basic:{type:mongoose.Types.ObjectId,ref:'Basic'},
    anamnistiko:{type:mongoose.Types.ObjectId,ref:'Anamnistiko'},
    blood:[{type:mongoose.Types.ObjectId,ref:'Anamnistiko'}],
    thyro:[{type:mongoose.Types.ObjectId,ref:'Thyro'}],
    parathyro:[{type:mongoose.Types.ObjectId,ref:'Parathyro'}],
    files:[{type:String,required:false}],
    // lab_tests:[{type:mongoose.Types.ObjectId,ref:'Visit'}],
    visits:[{type:mongoose.Types.ObjectId,required:true,ref:'Visit'}],
    
})

module.exports=mongoose.model('Patient',patientSchema);