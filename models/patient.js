const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const patientSchema= new Schema({
    name:{type:String,required:true},
    sirname:{type:String,required:true},
    fathersName:{type:String,required:false},
    age:{type:String,required:false},    
    tel:{type:String,required:true},
    amka:{type:String,required:false}
})

module.exports=mongoose.model('Patient',patientSchema);