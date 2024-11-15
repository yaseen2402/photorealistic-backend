// Converted from Python recommendation_calculator.py
const pool = require('../db');

// Approximate radius of earth in km
const R = 6373.0;

// Helper function to convert degrees to radians
const radians = (degrees) => {
    return degrees * (Math.PI/180);
};

// Check if coordinates are within radius
const isLatLonInRadius = (lat1, lon1, lat2, lon2, radiusKm) => {
    if ([lat1, lon1, lat2, lon2].some(x => x === null)) {
        return false;
    }
    
    [lat1, lon1, lat2, lon2] = [lat1, lon1, lat2, lon2].map(x => radians(x));

    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;

    const a = Math.sin(dlat / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance <= radiusKm;
};

const getPropertyRecommendations = async (
    minBeds,
    minBaths,
    rentOrBuy,
    priceMin,
    priceMax,
    age = null,
    homeValuePriority = false,
    filterByMedianAge = true,
    anchorAddresses = null,
    propsToReturn = 10
) => {
    try {
        // Convert rent_or_buy parameter
        rentOrBuy = rentOrBuy === 'rent' ? 'for_rent' : 'for_sale';

        // Get properties matching basic criteria
        const propQuery = `
            SELECT property_id, zip_code_id, coordinate_lat, coordinate_lon
            FROM properties
            WHERE num_beds >= $1
                AND num_baths >= $2
                AND status = $3
                AND price BETWEEN $4 AND $5
        `;
        const propResult = await pool.query(propQuery, [minBeds, minBaths, rentOrBuy, priceMin, priceMax]);
        const propTable = propResult.rows;

        // Query Zip Codes
        const zipQuery = 'SELECT * FROM zip_codes';
        const zipCodeRes = await client.query(zipQuery);
        const zipCodeTable = zipCodeRes.rows;

        const dZipInfo = zipCodeTable.reduce((acc, row) => {
            acc[row.zip_code_id] = { median_age: row.median_age, home_value_forecast: row.home_value_forecast };
            return acc;
        }, {});

        let meanHomeValueForecast = 0;
        if (rentOrBuy === 'buy' && homeValuePriority) {
            meanHomeValueForecast = Object.values(dZipInfo).reduce((sum, data) => sum + (data.home_value_forecast || 0), 0) / Object.keys(dZipInfo).length;
        }

        let dPropLoc = {};
        let ageFilterTracker = age;
        let loopCounter = 10;
        while (Object.keys(dPropLoc).length < propsToReturn && loopCounter > 0) {
            let ageFilteredZipCodes = new Set();
            let lowForecastZipCodes = new Set();
            for (let [zipCode, data] of Object.entries(dZipInfo)) {
                if (rentOrBuy === 'buy' && homeValuePriority && data.home_value_forecast < meanHomeValueForecast) {
                    lowForecastZipCodes.add(zipCode);
                }
                if (age !== null && filterByMedianAge && data.median_age !== null) {
                    const ageLowBound = Math.min(ageFilterTracker - (ageFilterTracker / 10) ** 1.5, 50);
                    const ageHighBound = ageFilterTracker + (ageFilterTracker / 10) ** 1.5;
                    if (!(data.median_age >= ageLowBound && data.median_age <= ageHighBound)) {
                        ageFilteredZipCodes.add(zipCode);
                    }
                }
            }

            const highForecastZipCodes = Object.keys(dZipInfo).filter(zipCode => !lowForecastZipCodes.has(zipCode));
            const ageAppropriateZipCodes = Object.keys(dZipInfo).filter(zipCode => !ageFilteredZipCodes.has(zipCode));
            const filteredZipCodes = new Set([...highForecastZipCodes, ...ageAppropriateZipCodes]);

            for (let e of propTable) {
                if (filteredZipCodes.has(e.zip_code_id) && !(e.coordinate_lat, e.coordinate_lon) in dPropLoc) {
                    dPropLoc[[e.coordinate_lat, e.coordinate_lon]] = e.property_id;
                }
            }

            if (rentOrBuy === 'buy' && homeValuePriority) meanHomeValueForecast -= 0.5;
            if (age !== null && filterByMedianAge) ageFilterTracker -= 5;

            loopCounter -= 1;
        }

        // Handle Anchor Locations
        let propertyRecs = [];
        if (anchorAddresses && anchorAddresses.length > 0) {
            let radius = 1;
            while (propertyRecs.length < propsToReturn && radius < R) {
                for (let [loc, pId] of Object.entries(dPropLoc)) {
                    const [lat, lon] = loc.split(',');
                    const isPropInRadius = anchorAddresses.every(([anchorLat, anchorLon]) => isLatLonInRadius(parseFloat(anchorLat), parseFloat(anchorLon), parseFloat(lat), parseFloat(lon), radius));
                    if (isPropInRadius && !propertyRecs.some(rec => rec[0] === pId)) {
                        propertyRecs.push([pId, lat, lon]);
                    }
                    if (propertyRecs.length === propsToReturn) break;
                }
                radius *= 2;
            }
        } else {
            for (let [loc, pId] of Object.entries(dPropLoc)) {
                propertyRecs.push([pId, loc.split(',')[0], loc.split(',')[1]]);
                if (propertyRecs.length === propsToReturn) break;
            }
        }

        return propertyRecs;
    } catch (error) {
        console.error('Error in getPropertyRecommendations:', error);
        throw error;
    }
};

module.exports = {
    getPropertyRecommendations
};
