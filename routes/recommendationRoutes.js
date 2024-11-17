const express = require('express');
const { getPropertyRecommendations } = require('../controllers/recommendationController');

const router = express.Router();


router.post('/', async (req, res) => {
    try {
        const {
            minBeds,
            minBaths,
            rentOrBuy,
            priceMin,
            priceMax,
            age,
            homeValuePriority,
            filterByMedianAge,
            anchorAddresses,
            propsToReturn,
        } = req.body;
        

        // Validate the required fields
        if (minBeds == null || minBaths == null || !["rent", "buy"].includes(rentOrBuy) || priceMin == null || priceMax == null) {
            return res.status(400).json({
                message: 'Please provide minBeds, minBaths, rentOrBuy, priceMin, and priceMax.',
            });
        }

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
            data: recommendations
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
