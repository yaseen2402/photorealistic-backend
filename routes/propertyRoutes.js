// routes/propertyRoutes.js

const express = require('express');
const { getPropertiesByCoordinates } = require('../controllers/propertyController'); // Import the controller function

const router = express.Router();

// Route to get properties by target coordinates
router.get('/', getPropertiesByCoordinates);

module.exports = router;
