const express = require('express');


const patientControllers = require('../controllers/patients-controller');
const visitControllers = require('../controllers/visits-controller');
const basicsControllers = require('../controllers/basics-controller');
const anaminstikoControllers = require('../controllers/anamnistiko-controller');
const labTestControllers = require('../controllers/labTests-controller');
const bloodLabTestControllers = require('../controllers/bloodTest-controller');
const parathyroLabTestControllers = require('../controllers/parathyro-controller');
const checkAuth = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');
const examsUpload=require('../middleware/exams-upload');
const examsController=require('../controllers/exams-controller');
const fileController = require('../controllers/file-controller');
const farmakaController = require('../controllers/farmaka-controller');
const farmakoController = require('../controllers/farmako-controller');
const conditionsController = require('../controllers/conditions-controller');

const router = express.Router();

router.post('/:pid/files', fileUpload.single('image'), fileController.saveFile);

router.post('/:pid/uploads/exams', examsUpload.single('exam'), examsController.saveFile);

router.patch('/:pid/files/:fileId', fileUpload.single('image'), fileController.updateFile);

router.use(checkAuth);

router.get('/getPatients/:userId', patientControllers.getAllpatients);

router.post('/getPatients/:userId/test', patientControllers.searchPatients);

router.post('/', patientControllers.createPatient);

router.get('/:pid', patientControllers.findPatientById);

router.patch('/:pid', patientControllers.updatePatient);

router.delete('/:pid', patientControllers.deletePatient);

router.get('/:pid/basic', basicsControllers.getBasics);

router.post('/:pid/basic', basicsControllers.createBasics);

router.patch('/:pid/basic', basicsControllers.updateBasics);

router.get('/:pid/anamnistiko', anaminstikoControllers.getAnamnstiko);

router.post('/:pid/anamnistiko', anaminstikoControllers.createAnamnistiko);


router.post('/:pid/farmaka', farmakaController.createFarmako);

router.delete('/:pid/farmaka/:farmakoId', farmakaController.deleteFarmako);

// router.post('/:pid/farmaka/name', farmakaController.test);

router.get('/:pid/farmako/name/:name', farmakoController.drugNameHits);

router.get('/:pid/farmako/ATC_name/:name', farmakoController.drugATCNameHits);

router.get('/:pid/conditions/name/:name', conditionsController.conditionHits);

router.get('/:pid/visits', visitControllers.getPatientVisit);

router.get('/:pid/visits.dates', visitControllers.getPatientVisitDates);

router.get('/:pid/visits/:vid', visitControllers.getPatientVisitById);

router.get('/visits/createVisitId', visitControllers.createVisitId);

router.patch('/:pid/visits/:vid', visitControllers.updateVisit);

router.delete('/:pid/visits/:vid', visitControllers.deleteVisit);

router.post('/:pid/visits', visitControllers.createVisit);

router.get('/:pid/lab_tests', labTestControllers.getLabTests);

router.delete('/:pid/lab_tests/blood/:labId', bloodLabTestControllers.deleteBloodLabTest);

router.delete('/:pid/lab_tests/parathyro/:labId', parathyroLabTestControllers.deleteParathyroLabTest);

router.get('/:pid/lab_tests/blood/:labId', bloodLabTestControllers.getBloodTests);

router.get('/:pid/lab_tests/parathyro/:labId', parathyroLabTestControllers.getParathyrodTests);

router.patch('/:pid/lab_tests/:labId', labTestControllers.updateLabTest);

router.post('/:pid/lab_tests', labTestControllers.createLabTest);

router.get('/:pid/files', fileController.getFiles);

router.delete('/:pid/files/:fileId', fileController.deleteFile);

router.delete('/:pid/uploads/exams/:examId', examsUpload.single('exam'), examsController.deleteExam);



module.exports = router;