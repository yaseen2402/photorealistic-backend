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
        // rentOrBuy = rentOrBuy === 'rent' ? 'for_rent' : 'for_sale';

        // // Get properties matching basic criteria
        // const propQuery = `
        //     SELECT property_id, zip_code_id, coordinate_lat, coordinate_lon
        //     FROM properties
        //     WHERE num_beds >= $1
        //         AND num_baths >= $2
        //         AND status = $3
        //         AND price BETWEEN $4 AND $5
        // `;
        // const propResult = await pool.query(propQuery, [minBeds, minBaths, rentOrBuy, priceMin, priceMax]);
        // const propTable = propResult.rows;

        // // Get zip code data
        // const zipQuery = 'SELECT * FROM zip_codes';
        // const zipResult = await pool.query(zipQuery);
        // const zipCodeTable = zipResult.rows;

        // // Create zip code info dictionary
        // const zipInfo = {};
        // zipCodeTable.forEach(row => {
        //     zipInfo[row.zip_code] = {
        //         median_age: row.median_age,
        //         home_value_forecast: row.home_value_forecast
        //     };
        // });

        // let meanHomeValueForecast = 0;
        // if (rentOrBuy === 'for_sale' && homeValuePriority) {
        //     const forecasts = Object.values(zipInfo)
        //         .map(x => x.home_value_forecast || 0);
        //     meanHomeValueForecast = forecasts.reduce((a, b) => a + b, 0) / forecasts.length;
        // }

        // const propLoc = new Map();
        // let ageFilterTracker = age;
        // let loopCounter = 10;

        // while (propLoc.size < propsToReturn && loopCounter > 0) {
        //     const ageFilteredZipCodes = new Set();
        //     const lowForecastZipCodes = new Set();

        //     for (const [zipCode, data] of Object.entries(zipInfo)) {
        //         if (rentOrBuy === 'for_sale' && homeValuePriority) {
        //             if (data.home_value_forecast < meanHomeValueForecast) {
        //                 lowForecastZipCodes.add(zipCode);
        //             }
        //         }

        //         if (age !== null && filterByMedianAge && data.median_age !== null) {
        //             const ageLowBound = Math.min(ageFilterTracker - Math.pow(ageFilterTracker/10, 1.5), 50);
        //             const ageHighBound = ageFilterTracker + Math.pow(ageFilterTracker/10, 1.5);
        //             const aroundMedianAge = data.median_age >= ageLowBound && data.median_age <= ageHighBound;
        //             if (!aroundMedianAge) {
        //                 ageFilteredZipCodes.add(zipCode);
        //             }
        //         }
        //     }

        //     const highForecastZipCodes = new Set(
        //         Object.keys(zipInfo).filter(zip => !lowForecastZipCodes.has(zip))
        //     );
        //     const ageAppropriateZipCodes = new Set(
        //         Object.keys(zipInfo).filter(zip => !ageFilteredZipCodes.has(zip))
        //     );
        //     const filteredZipCodes = new Set(
        //         [...highForecastZipCodes].filter(zip => ageAppropriateZipCodes.has(zip))
        //     );

        //     for (const prop of propTable) {
        //         const key = `${prop.coordinate_lat},${prop.coordinate_lon}`;
        //         if (filteredZipCodes.has(prop.zip_code_id) && !propLoc.has(key)) {
        //             propLoc.set(key, prop.property_id);
        //         }
        //     }

        //     if (rentOrBuy === 'for_sale' && homeValuePriority) {
        //         meanHomeValueForecast -= 0.5;
        //     }
        //     if (age !== null && filterByMedianAge) {
        //         ageFilterTracker -= 5;
        //     }

        //     loopCounter--;
        // }

        // const propertyRecs = [];
        // if (anchorAddresses && anchorAddresses.length > 0) {
        //     let radius = 1;
        //     while (propertyRecs.length < propsToReturn && radius < R) {
        //         for (const [coords, propId] of propLoc.entries()) {
        //             const [lat, lon] = coords.split(',').map(Number);
        //             let isPropInRadius = true;

        //             for (const [anchorLat, anchorLon] of anchorAddresses) {
        //                 if (!isLatLonInRadius(anchorLat, anchorLon, lat, lon, radius)) {
        //                     isPropInRadius = false;
        //                     break;
        //                 }
        //             }

        //             if (isPropInRadius && !propertyRecs.some(rec => rec[0] === propId)) {
        //                 propertyRecs.push([propId, lat, lon]);
        //             }

        //             if (propertyRecs.length === propsToReturn) break;
        //         }
        //         radius *= 2;
        //     }
        // } else {
        //     for (const [coords, propId] of propLoc.entries()) {
        //         const [lat, lon] = coords.split(',').map(Number);
        //         propertyRecs.push([propId, lat, lon]);
        //         if (propertyRecs.length === propsToReturn) break;
        //     }
        // }
        propertyRecs = 'it works?'
        return propertyRecs;
    } catch (error) {
        console.error('Error in getPropertyRecommendations:', error);
        throw error;
    }
};

module.exports = {
    getPropertyRecommendations
};
