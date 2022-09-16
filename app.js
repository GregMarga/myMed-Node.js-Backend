const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');


const HttpError = require('./models/http-error');

const patientsRouter = require('./routes/patients-routes');
const userRouter = require('./routes/users-routes');
const appointmentRouter = require('./routes/appointments-routes');

const app = express();

app.use(bodyParser.json());



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', "Origin,X-Requested-With,Content-Type,Authorization,Accept");
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    next();
})
app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use('/uploads/exams', express.static(path.join('uploads', 'exams')));

app.use('/users', userRouter)
app.use('/patients', patientsRouter);
// app.use('/appointments', appointmentRouter);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    return next(error);

})

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'Ουπς! Υπήρξε κάποιο άγνωστο σφάλμα.' })

});


mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rjbiqnx.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(process.env.PORT || 5000);
    })
    .catch((error) => {
        console.log(error);
    });

