const pool = require('../db');

// Function to get properties by target coordinates
const getPropertiesByCoordinates = async (req, res) => {
  const { target_lat, target_lon } = req.query;

  // Validate if target_lat and target_lon are provided
  if (!target_lat || !target_lon) {
    return res.status(400).json({ error: 'target_lat and target_lon are required' });
  }

  try {
    // SQL query to find properties near the target coordinates
    const query = `
      SELECT num_beds, num_baths, size_sqft, property_type, price
      FROM properties
      WHERE ABS(coordinate_lat - ${target_lat}) <= 0.00001 AND ABS(coordinate_lon - ${target_lon}) <= 0.00001;
    `;

    const result = await pool.query(query);

    // If properties found, return them; otherwise, return a not found message
    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ message: 'No properties found near the target coordinates' });
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
};

module.exports = { getPropertiesByCoordinates };
