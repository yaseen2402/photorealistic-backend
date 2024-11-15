const express = require('express');
const { addFavorite, getFavorites, removeFavorite } = require('../controllers/favoritesController');

const router = express.Router();

router.post('/add', addFavorite);
router.get('/:userid', getFavorites);
router.delete('/remove', removeFavorite);

module.exports = router;