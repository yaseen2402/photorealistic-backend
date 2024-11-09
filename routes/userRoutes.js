
const express = require('express');
const { addUser } = require('../controllers/userController'); // Import the controller function

const router = express.Router();


router.post('/', addUser);

module.exports = router;
