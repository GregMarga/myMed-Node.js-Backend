const express = require('express');

const usersControllers = require('../controllers/users-controller');

const router = express.Router();



router.post('/signup', usersControllers.signup);

router.post('/login', usersControllers.login);


module.exports = router;