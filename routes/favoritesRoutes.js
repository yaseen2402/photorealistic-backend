const express = require('express');
const { addFavorite, getFavorites } = require('../controllers/favoritesController');

const router = express.Router();

router.post('/add', addFavorite);
router.get('/:userid', getFavorites);

module.exports = router;