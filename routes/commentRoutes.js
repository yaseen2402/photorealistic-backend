
const express = require('express');
const { addComment, getComments } = require('../controllers/commentController'); 

const router = express.Router();


router.get('/:zipcode', (req, res) => getComments(req, res)); 
router.post('/add', (req, res) => addComment(req, res)); 

module.exports = router;
