const mongoose =require('mongoose');
const uniqueValidator=require('mongoose-unique-validator');

const Schema=mongoose.Schema;

const userSchema=Schema({
    name:{type:String,required:true},
    name:{type:String,required:true , unique:true},
    password:{type:String,required:true},
    // patients:[{type:mongoose.Types.ObjectId,required:true,ref:'Patient'}]
})

userSchema.plugin(uniqueValidator);

module.exports=mongoose.model('User',userSchema);