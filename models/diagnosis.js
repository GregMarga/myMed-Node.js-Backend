const mongoose =require('mongoose');

const Schema=mongoose.Schema;

const diagnosisSchmema=Schema({
    condition:{type:mongoose.Types.ObjectId,required:false,ref:'Condition'},
    visit:{type:mongoose.Types.ObjectId,required:true,ref:'Visit'},
   
});

module.exports=mongoose.model('Diagnosis',diagnosisSchmema);