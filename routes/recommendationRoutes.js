const express = require('express');
const router = express.Router();
const { getPropertyRecommendations } = require('../controllers/recommendationController');

router.post('/', async (req, res) => {
    try {
        const {
            minBeds = 1,
            minBaths = 1,
            rentOrBuy = 'buy',
            priceMin = 0,
            priceMax = 1000000000,
            age = null,
            homeValuePriority = false,
            filterByMedianAge = true,
            anchorAddresses = null,
            propsToReturn = 3
        } = req.body;

        // Validate and parse anchor addresses if provided
        if (anchorAddresses && !Array.isArray(anchorAddresses)) {
            return res.status(400).json({ 
                error: 'Invalid anchor addresses format. Expected an array of [lat, lon] pairs.' 
            });
        }

        const recommendations = await getPropertyRecommendations(
            Number(minBeds),
            Number(minBaths),
            rentOrBuy,
            Number(priceMin),
            Number(priceMax),
            age ? Number(age) : null,
            Boolean(homeValuePriority),
            Boolean(filterByMedianAge),
            anchorAddresses,
            Number(propsToReturn)
        );

        res.json({
            success: true,
            recommendations: recommendations
        });
    } catch (error) {
        console.error('Error in recommendation route:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get property recommendations'
        });
    }
});

module.exports = router;
