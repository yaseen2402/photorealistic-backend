

const express = require('express');
const { getPropertiesByCoordinates } = require('../controllers/propertyController'); // Import the controller function

const router = express.Router();


router.get('/', getPropertiesByCoordinates);

module.exports = router;
