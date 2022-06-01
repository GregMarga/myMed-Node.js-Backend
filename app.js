const express = require ('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');

const HttpError=require('./models/http-error');

require('dotenv').config();

const patientsRouter=require('./routes/patients-routes');

const app=express();

app.use(bodyParser.json())

app.use('/patients',patientsRouter);

app.use((req,res,next)=>{
    const error=new HttpError('Could not find this route.',404);
    throw error;

})

app.use((error,req,res,next)=>{
    if (res.headerSent){
        return next(error);
    }
    res.status(error.code||500);
    res.json({message:error.message|| 'An unknown error occured!'})

});

mongoose
.connect('mongodb+srv://Gregory:01101998@cluster0.rjbiqnx.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{
    app.listen(5000);
})
.catch((error)=>{
    console.log(error);
});

