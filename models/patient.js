const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const patientSchema= new Schema({
    name:{type:String,required:true},
    sirname:{type:String,required:true},
    fathersName:{type:String,required:false},
    dateOfBirth:{type:Date,required:false},    
    tel:{type:String,required:true},
    amka:{type:String,required:true,unique:true},
    doctor:{type:mongoose.Types.ObjectId,required:true,ref:'User'},
    placeOfBirth: { type: String, required: false },
    job: { type: String, required: false },
    familyStatus: { type: String, required: false },
    gender: { type: String, required: false },
    address: { type: String, required: false },
    area: { type: String, required: false },
    postalCode: { type: String, required: false },
    email: { type: String, required: false },
    anamnistiko:{type:mongoose.Types.ObjectId,ref:'Anamnistiko'},
    blood:[{type:mongoose.Types.ObjectId,ref:'Anamnistiko'}],
    thyro:[{type:mongoose.Types.ObjectId,ref:'Thyro'}],
    parathyro:[{type:mongoose.Types.ObjectId,ref:'Parathyro'}],
    files:[{type:String,required:false}],
    // lab_tests:[{type:mongoose.Types.ObjectId,ref:'Visit'}],
    visits:[{type:mongoose.Types.ObjectId,required:true,ref:'Visit'}],
    
})

module.exports=mongoose.model('Patient',patientSchema);