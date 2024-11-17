const pool = require('../db');

// Approximate radius of earth in km
const R = 6373.0;

// Helper function to convert degrees to radians
const radians = (degrees) => {
    return degrees * (Math.PI / 180);
};

// Check if coordinates are within radius
const isLatLonInRadius = (lat1, lon1, lat2, lon2, radiusKm) => {
    if ([lat1, lon1, lat2, lon2].some(x => x == null)) {
        console.log(`One or more coordinates are null.`);
        return false;
    }
    
    [lat1, lon1, lat2, lon2] = [lat1, lon1, lat2, lon2].map(x => radians(x));

    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;
    const a = Math.sin(dlat / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    console.log(`distance: ${distance} ${radiusKm}`);
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
    propsToReturn = 3
) => {
    try {
        console.log('Input parameters:', {
            minBeds,
            minBaths,
            rentOrBuy,
            priceMin,
            priceMax,
            age,
            homeValuePriority,
            filterByMedianAge,
            anchorAddresses,
            propsToReturn
        });
        
        if (anchorAddresses && !Array.isArray(anchorAddresses)){
            console.log('anchorAddresses is not an array');
        }
        else {
            console.log(`Anchor coords: ${anchorAddresses}`);
        }

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
        console.log(`Properties fetched: ${propTable.length}`);

        // Query Zip Codes
        const zipQuery = 'SELECT * FROM zip_codes';
        const zipCodeRes = await pool.query(zipQuery);
        const zipCodeTable = zipCodeRes.rows;
        console.log(`Zip code data fetched: ${zipCodeTable.length}`);
        const dZipInfo = zipCodeTable.reduce((acc, row) => {
            acc[row.zip_code_id] = { median_age: row.median_age, home_value_forecast: row.home_value_forecast };
            return acc;
        }, {});
        

        let meanHomeValueForecast = 0;
        if (rentOrBuy === 'for_sale' && homeValuePriority) {
            meanHomeValueForecast = Object.values(dZipInfo).reduce((sum, data) => sum + (data.home_value_forecast || 0), 0) / Object.keys(dZipInfo).length;
            console.log(`Mean home value forecast calculated: ${meanHomeValueForecast}`);
        }

        let dPropLoc = {};
        let ageFilterTracker = age;
        let loopCounter = 10;

        while (Object.keys(dPropLoc).length < propsToReturn && loopCounter > 0) {
            let ageFilteredZipCodes = new Set();
            let lowForecastZipCodes = new Set();
            
            for (let [zipCode, data] of Object.entries(dZipInfo)) {
                if (rentOrBuy === 'for_sale' && homeValuePriority && (data.home_value_forecast || 0) < meanHomeValueForecast) {
                    lowForecastZipCodes.add(zipCode);
                }

                if (age !== null && filterByMedianAge) {
                    const ageLowBound = Math.min(ageFilterTracker - (ageFilterTracker / 10) ** 1.5, 50);
                    const ageHighBound = ageFilterTracker + (ageFilterTracker / 10) ** 1.5;
                    if ((data.median_age === null) || !(data.median_age >= ageLowBound && data.median_age <= ageHighBound)) {
                        if (loopCounter > 1) {
                            ageFilteredZipCodes.add(zipCode);
                        }
                    }
                }
            }
            console.log(`ageFilterTracker: ${ageFilterTracker}`);
            console.log(`lowForecastZipCodes: ${lowForecastZipCodes.size}`);
            console.log(`ageFilteredZipCodes: ${ageFilteredZipCodes.size}`);

            const highForecastZipCodes = new Set();
            for (const zipCode of Object.keys(dZipInfo)) {
                if (!lowForecastZipCodes.has(zipCode)) {
                    highForecastZipCodes.add(zipCode);
                }
            }

            const ageAppropriateZipCodes = new Set();
            for (const zipCode of Object.keys(dZipInfo)) {
                if (!ageFilteredZipCodes.has(zipCode)) {
                    ageAppropriateZipCodes.add(zipCode);
                }
            }
            
            console.log(`highForecastZipCodes: ${highForecastZipCodes.size}`);
            console.log(`ageAppropriateZipCodes: ${ageAppropriateZipCodes.size}`);
            const filteredZipCodes = new Set([...highForecastZipCodes].filter((item) => ageAppropriateZipCodes.has(item)))
            
            for (let e of propTable) { 
                const locKey = `${e.coordinate_lat},${e.coordinate_lon}`; // Create a unique string key
                
                if (filteredZipCodes.has(e.zip_code_id.toString())) {
                    dPropLoc[locKey] = e.property_id;
                }
            }
            

            if (rentOrBuy === 'for_sale' && homeValuePriority) meanHomeValueForecast -= 0.5;
            if (age != null && filterByMedianAge && ageFilterTracker > 40) ageFilterTracker -= 5;

            loopCounter -= 1;

            console.log(`Filtered zip codes: ${filteredZipCodes.size}`);
        }
        

        // Handle Anchor Locations
        let propertyRecs = [];
        if (anchorAddresses && anchorAddresses.length > 0) {
            let radius = 1;
            while (propertyRecs.length < propsToReturn && radius < R) {
                for (let [locKey, pId] of Object.entries(dPropLoc)) {
                    const [lat, lon] = locKey.split(',').map(parseFloat);

                    let isPropInRadius = true;
                    for (const [alat, alon] of anchorAddresses) {
                        if (!isLatLonInRadius(parseFloat(alat), parseFloat(alon), lat, lon, radius)) {
                            isPropInRadius = false;
                            break;
                        }
                    }

                    const isPropinArray = propertyRecs.some((arr) => arr[0] === pId);

                    if (isPropInRadius && !isPropinArray) {
                        propertyRecs.push([pId, lat, lon]);
                    }

                    if (propertyRecs.length === propsToReturn) break;
                }
                radius *= 2;
            }
        } else {
            for (let [locKey, pId] of Object.entries(dPropLoc)) {
                const [lat, lon] = locKey.split(',').map(parseFloat);
                propertyRecs.push([pId, lat, lon]);
                if (propertyRecs.length === propsToReturn) break;
            }
        }

        console.log(`Final property recommendations: ${propertyRecs.length}`);
        return propertyRecs;
    } catch (error) {
        console.error('Error in getPropertyRecommendations:', error);
        throw error;
    }
};

module.exports = {
    getPropertyRecommendations
};
