const express= require('express');
const { route } = require('express/lib/application');

const patientControllers=require('../controllers/patients-controller');
const visitControllers=require('../controllers/visits-controller');

const router =express.Router();


router.get('/',patientControllers.getAllpatients);

router.post('/',patientControllers.createPatient);

router.get('/:pid',patientControllers.findPatientById);

router.get('/:pid/basic',patientControllers.findPatientByIdBasic);

router.post('/:pid/visits',visitControllers.createVisit);

module.exports = router;