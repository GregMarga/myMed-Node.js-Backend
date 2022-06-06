const express= require('express');
const { route } = require('express/lib/application');

const patientControllers=require('../controllers/patients-controller');
const visitControllers=require('../controllers/visits-controller');
const basicsControllers=require('../controllers/basics-controller');

const router =express.Router();


router.get('/',patientControllers.getAllpatients);

router.post('/',patientControllers.createPatient);

router.get('/:pid',patientControllers.findPatientById);

router.patch('/:pid',patientControllers.updatePatient);

router.delete('/:pid',patientControllers.deletePatient);

router.get('/:pid/basic',basicsControllers.getBasics);

router.post('/:pid/visits',visitControllers.createVisit);

module.exports = router;