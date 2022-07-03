const express = require('express');
const appointmentsControllers = require('../controllers/appointment-controller');

const router = express.Router();



router.post('/:uid', appointmentsControllers.saveAppointments);

router.get('/:uid', appointmentsControllers.getAppointments);

router.patch('/:uid', appointmentsControllers.updateAppointments);

router.delete('/:uid/:appId',appointmentsControllers.deleteAppointment);


module.exports = router;