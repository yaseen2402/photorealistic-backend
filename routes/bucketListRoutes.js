const express = require('express');
const { addToBucketList, getBucketList, removeFromBucketList } = require('../controllers/bucketListController');

const router = express.Router();

router.post('/add', addToBucketList);
router.get('/:username', getBucketList);
router.delete('/remove', removeFromBucketList);

module.exports = router;
