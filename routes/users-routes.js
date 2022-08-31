const express = require('express');
const { body } = require('express-validator');

const validateRequestSchema = require('../middleware/validate-request-schema')

const usersControllers = require('../controllers/users-controller');

const router = express.Router();



router.post('/signup',
    body('email').isEmail().withMessage('Παρακαλώ εισάγετε ένα έγκυρο Email.')
    , body('password').isLength({ min: 5 }).withMessage('Ο κωδικός πρέπει να περιέχει τουλάχιστον 5 χαρακτήρες.')
    , validateRequestSchema,
    usersControllers.signup);

router.post('/login'
    , body('email').isEmail().withMessage('Παρακαλώ εισάγετε ένα έγκυρο Email.')
    , body('password').isLength({ min: 5 }).withMessage('Ο κωδικός πρέπει να περιέχει τουλάχιστον 5 χαρακτήρες.')
    , validateRequestSchema,
    usersControllers.login);

router.get('/:userId/login', usersControllers.confirmUser);


module.exports = router;