const express = require('express');
const { addUser, findUserByUsername } = require('../controllers/userController'); // Import the controller function

const router = express.Router();

router.post('/', addUser);
router.get('/find/:username', findUserByUsername);

module.exports = router;
