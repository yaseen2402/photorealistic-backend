const express = require('express');
const { saveUserPreferences, saveProfessionalProfile } = require('../controllers/preferencesController');

const router = express.Router();

router.post('/user', saveUserPreferences);
router.post('/professional', saveProfessionalProfile);

module.exports = router;