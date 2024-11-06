require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080; // Cloud Run uses PORT environment variable

const propertyRoutes = require('./routes/propertyRoutes'); 
// Hello World endpoint
app.get('/', (req, res) => {
    res.send('Hello, Hello, hello');
});

app.use('/api/properties', propertyRoutes);

// Custom message endpoint
app.get('/api/message', (req, res) => {
    const message = req.query.message || 'No message provided!';
    res.send(`Your message: ${message}`);
});

app.get('/properties', async (req, res) => {
    const { target_lat, target_lon } = req.query;
  
    if (!target_lat || !target_lon) {
      return res.status(400).json({ error: 'target_lat and target_lon are required' });
    }
  
    try {
     
      const query = `
        SELECT num_beds, num_baths, size_sqft, property_type, price
        FROM properties
        WHERE ABS(coordinate_lat - ${target_lat}) <= 0.00001 AND ABS(coordinate_lon - ${target_lon}) <= 0.00001;
      `;
  
      const result = await pool.query(query);
  
      if (result.rows.length > 0) {
        res.json(result.rows);  
      } else {
        res.status(404).json({ message: 'No properties found near the target coordinates' });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });
  

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
