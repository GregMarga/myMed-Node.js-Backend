const express= require('express');
const { route } = require('express/lib/application');

const HttpError=require('../models/http-error');
const patientControllers=require('../controllers/patients-controller');

const router =express.Router();


router.get('/',patientControllers.getAllpatients);

router.post('/',patientControllers.createPatient);

router.get('/:pid',patientControllers.findPatientById);

router.get('/:pid/basic',patientControllers.findPatientByIdBasic);

module.exports = router;