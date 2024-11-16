const express = require('express');
const { addUser, findUserByUsername, findUserByUserId } = require('../controllers/userController'); 

const router = express.Router();

router.post('/', addUser);
router.get('/find/:username', findUserByUsername);
router.get('/:userid', findUserByUserId); 

module.exports = router;