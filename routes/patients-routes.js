const express= require('express');
const { route } = require('express/lib/application');

const patientControllers=require('../controllers/patients-controller');
const visitControllers=require('../controllers/visits-controller');
const basicsControllers=require('../controllers/basics-controller');
const anaminstikoControllers=require('../controllers/anamnistiko-controller');
const labTestControllers=require('../controllers/labTests-controller');

const router =express.Router();


router.get('/',patientControllers.getAllpatients);

router.post('/',patientControllers.createPatient);

router.get('/:pid',patientControllers.findPatientById);

router.patch('/:pid',patientControllers.updatePatient);

router.delete('/:pid',patientControllers.deletePatient);

router.get('/:pid/basic',basicsControllers.getBasics);

router.post('/:pid/basic',basicsControllers.createBasics);

router.get('/:pid/anamnistiko',anaminstikoControllers.getAnamnstiko);

router.post('/:pid/anamnistiko',anaminstikoControllers.createAnamnistiko);

router.get('/:pid/visits',visitControllers.getPatientVisit);


router.get('/:pid/visits/:vid',visitControllers.getPatientVisitById);


router.post('/:pid/visits',visitControllers.createVisit);

router.post('/:pid/lab_tests',labTestControllers.createLabTest);

module.exports = router;