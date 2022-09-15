const express = require('express');
const { body } = require('express-validator');

const validateRequestSchema = require('../middleware/validate-request-schema')


const patientControllers = require('../controllers/patients-controller');
const visitControllers = require('../controllers/visits-controller');
const basicsControllers = require('../controllers/basics-controller');
const anaminstikoControllers = require('../controllers/anamnistiko-controller');
const checkAuth = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');
const statsController = require('../controllers/stats-controller');
const examsUpload = require('../middleware/exams-upload');
const examsController = require('../controllers/exams-controller');
const fileController = require('../controllers/file-controller');
const farmakaController = require('../controllers/farmaka-controller');
const farmakoController = require('../controllers/farmako-controller');
const conditionsController = require('../controllers/conditions-controller');
const atomikoController = require('../controllers/atomiko-controller');
const gynaikologikoController = require('../controllers/gynaikologiko-controller');

const router = express.Router();

router.post('/:pid/files', fileUpload.single('image'), fileController.saveFile);

router.post('/:pid/uploads/exams', examsUpload.single('exam'), examsController.saveFile);

router.patch('/:pid/files/:fileId', fileUpload.single('image'), fileController.updateFile);

router.post('/:pid/basic/image', fileUpload.single('image'),
    body('amka')
        .isLength({ min: 11, max: 11 })
        .withMessage('Το ΑΜΚΑ πρέπει να περιέχει ακριβώς 11 χαρακτήρες.')
        .matches('^[0-9]+$')
        .withMessage('Το ΑΜΚΑ πρέπει να περιέχει μόνο αριθμούς.'),
    validateRequestSchema, basicsControllers.createImageBasics);

router.patch('/:pid/basic/image', fileUpload.single('image'),
    body('amka')
        .isLength({ min: 11, max: 11 })
        .withMessage('Το ΑΜΚΑ πρέπει να περιέχει ακριβώς 11 χαρακτήρες.')
        .matches('^[0-9]+$')
        .withMessage('Το ΑΜΚΑ πρέπει να περιέχει μόνο αριθμούς.'),
    validateRequestSchema,
    basicsControllers.updateImageBasics);



router.use(checkAuth);

router.get('/getPatients/:userId', patientControllers.getAllpatients);

router.post('/getPatients/:userId/test', patientControllers.searchPatients);

router.post('/', patientControllers.createPatient);

router.get('/:pid', patientControllers.findPatientById);

router.patch('/:pid', patientControllers.updatePatient);

router.delete('/:pid', patientControllers.deletePatient);

router.get('/:pid/basic', basicsControllers.getBasics);


router.post('/:pid/basic',
    body('amka')
        .isLength({ min: 11, max: 11 }).
        withMessage('Το ΑΜΚΑ πρέπει να περιέχει ακριβώς 11 χαρακτήρες.')
        .matches('^[0-9]+$')
        .withMessage('Το ΑΜΚΑ πρέπει να περιέχει μόνο αριθμούς.'),
    validateRequestSchema,
    basicsControllers.createBasics);


router.patch('/:pid/basic',
    body('amka')
        .isLength({ min: 11, max: 11 }).
        withMessage('Το ΑΜΚΑ πρέπει να περιέχει ακριβώς 11 χαρακτήρες.')
        .matches('^[0-9]+$')
        .withMessage('Το ΑΜΚΑ πρέπει να περιέχει μόνο αριθμούς.'),
    validateRequestSchema,
    basicsControllers.updateBasics);

router.get('/:pid/anamnistiko/conditions', anaminstikoControllers.getConditions);

router.post('/:pid/anamnistiko/condition', anaminstikoControllers.createAtomikoCondition);

router.delete('/:pid/anamnistiko/condition/:conditionId', anaminstikoControllers.removeCondition);

router.get('/:pid/anamnistiko/allergies', anaminstikoControllers.getAllergies);

router.post('/:pid/anamnistiko/allergies', anaminstikoControllers.createAtomikoAllergies);

router.post('/:pid/anamnistiko/allergies_loaded', anaminstikoControllers.addAtomikoAllergy)

router.delete('/:pid/anamnistiko/allergies/:allergyId', anaminstikoControllers.removeAtomikoAllergy);

router.get('/:pid/anamnistiko/klironomiko', anaminstikoControllers.getKlironomiko);

router.post('/:pid/anamnistiko/klironomiko', anaminstikoControllers.createKlironomiko);

router.post('/:pid/anamnistiko/klironomiko_loaded', anaminstikoControllers.addKlironomiko);

router.delete('/:pid/anamnistiko/klironomiko/:klironomikoId', anaminstikoControllers.removeKlironomikoCondition);

router.post('/:pid/anamnistiko/surgery', anaminstikoControllers.createSurgery);

router.get('/:pid/anamnistiko/surgeries', anaminstikoControllers.getSurgeries);

router.patch('/:pid/anamnistiko/surgery/:surgeryId', anaminstikoControllers.updateSurgery);

router.delete('/:pid/surgery/:surgeryId', anaminstikoControllers.removeSurgery);

router.get('/:pid/anamnistiko/gynaikologiko/', anaminstikoControllers.getGynaikologiko);

router.post('/:pid/anamnistiko/gynaikologiko/', anaminstikoControllers.createGynaikologiko);

router.patch('/:pid/anamnistiko/gynaikologiko/', anaminstikoControllers.updateGynaikologiko);

router.get('/:pid/anamnistiko/gynaikologiko/pregnacies', anaminstikoControllers.getPregnacies);

router.post('/:pid/anamnistiko/gynaikologiko/pregnacy', anaminstikoControllers.createPregnacy);

router.patch('/:pid/anamnistiko/gynaikologiko/pregnacy/:pregnacyId', anaminstikoControllers.updatePregnacy);

router.delete('/:pid/anamnistiko/gynaikologiko/pregnacy/:pregnacyId', anaminstikoControllers.removePregnacy);

// router.get('/:pid/anamnistiko/:gender', anaminstikoControllers.getAnamnstiko);

// router.post('/:pid/anamnistiko', anaminstikoControllers.createAnamnistiko);

// router.patch('/:pid/anamnistiko', anaminstikoControllers.updateAnamnistiko);

router.get('/:pid/farmaka', farmakaController.getFarmakabyPatientId);

router.post('/:pid/farmaka', farmakaController.createFarmako);

router.patch('/:pid/farmaka/:farmakoId', farmakaController.updateFarmako);

router.delete('/:pid/farmaka/:farmakoId', farmakaController.deleteFarmako);

// router.post('/:pid/farmaka/name', farmakaController.test);

router.get('/:pid/farmako/name/:name', farmakoController.drugNameHits);

router.get('/:pid/farmako/ATC_name/:name', farmakoController.drugATCNameHits);

router.get('/:pid/conditions/name/:name', conditionsController.conditionHits);

router.get('/:pid/conditions', atomikoController.getConditionsbyPatientId);

// router.post('/:pid/conditions', atomikoController.createConditionAtomiko);

router.get('/:pid/allergies', atomikoController.getAllergiesbyPatientId);

router.get('/:pid/klironomiko', atomikoController.getKlironomikobyPatientId);

router.get('/:pid/conditions/id', atomikoController.getId);

router.delete('/:pid/conditions/:conditionId', atomikoController.deleteConditionsbyId);

router.patch('/:pid/conditions/:conditionId', atomikoController.updateConditionsbyId);

router.get('/:pid/gynaikologiko', gynaikologikoController.getGynaikologikobyPatientId);

router.get('/:pid/visits/oldAntikeimeniki', visitControllers.getOldAntikeimeniki);

router.get('/:pid/visits/:visitId', visitControllers.getAntikeimeniki);

router.patch('/:pid/visits/:visitId/antikeimeniki', visitControllers.updateAntikeimeniki);

router.get('/:pid/visits', visitControllers.getAllVisits);

// router.get('/:pid/visits/info', visitControllers.getVisitsInfo);

// router.get('/:pid/visits.dates', visitControllers.getPatientVisitDates);

// router.get('/:pid/visits/:vid', visitControllers.getPatientVisitById);

// router.get('/visits/createVisitId', visitControllers.createVisitId);

// router.patch('/:pid/visits/:visitId', visitControllers.updateVisit);

// router.delete('/:pid/visits/:vid', visitControllers.deleteVisit);

router.post('/:pid/visit/:visitId/antikeimeniki', visitControllers.createAntikeimeniki);

router.get('/:pid/visit/:visitId/ozos', visitControllers.getOzos);

router.post('/:pid/visit/:visitId/ozos', visitControllers.createOzos);

router.patch('/:pid/visit/:visitId/ozos/:ozosId', visitControllers.updateOzos);

router.delete('/:pid/visit/:visitId/ozos/:ozosId', visitControllers.removeOzos);

router.get('/:pid/visit/:visitId/diagnosis', visitControllers.getDiagnosis);

router.post('/:pid/visit/:visitId/diagnosis', visitControllers.createDiagnosis);

router.patch('/:pid/visit/:visitId/diagnosis/:diagnosisId', visitControllers.updateDiagnosis);

router.delete('/:pid/visit/:visitId/diagnosis/:diagnosisId', visitControllers.removeDiagnosis);

router.get('/:pid/visit/:visitId/therapeia', visitControllers.getTherapeia);

router.post('/:pid/visit/:visitId/therapeia', visitControllers.createTherapeia);

router.delete('/:pid/visit/:visitId/therapeia/:therapeiaId', visitControllers.removeTherapeia);

router.get('/:pid/exams', examsController.getFiles)

router.get('/:pid/statistics/biometrics', statsController.getBiometrics);

router.get('/:pid/statistics/ozoi', statsController.getOzosStat)
// router.get('/:pid/files', fileController.getFiles);

// router.delete('/:pid/files/:fileId', fileController.deleteFile);

router.delete('/:pid/uploads/exams/:examId', examsUpload.single('exam'), examsController.deleteExam);



module.exports = router;