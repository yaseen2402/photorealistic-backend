const express = require('express');
const { 
  addToBucketList, 
  getBucketList, 
  removeFromBucketList, 
  getPopularLocations,
  getSimilarUsers,
  getNearbyBucketList
} = require('../controllers/bucketListController');

const router = express.Router();

router.post('/add', addToBucketList);
router.get('/:username', getBucketList);
router.delete('/remove', removeFromBucketList);
router.get('/popular/locations', getPopularLocations);
router.get('/similar/:userid', getSimilarUsers);
router.get('/nearby', getNearbyBucketList);

module.exports = router;
