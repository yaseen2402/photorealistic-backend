
const express = require('express');
const { addComment, getComments } = require('../controllers/commentController'); 

const router = express.Router();

router.post('/add', (req, res) => addComment(req, res)); 
router.get('/', (req, res) => getComments(req, res)); 

module.exports = router;
