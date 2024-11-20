require('dotenv').config();
const cors = require('cors');
const express=require("express");
const propertyRoutes = require('./routes/propertyRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const commentRoutes = require('./routes/commentRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const preferencesRoutes = require('./routes/preferencesRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const bucketListRoutes = require('./routes/bucketListRoutes');
const PORT = 8080||process.env.PORT; 
const pool = require('./db');
const app = express();
const wellknown = require('wellknown');


//DO NOT TOUCH THIS CODE 
const corsOptions = {
  origin: ['http://localhost:3000',
  'http://localhost:8081','https://geostate-frontend.vercel.app','https://www.geo.estate'],
//DO NOT TOUCH THIS CODE 
  credentials: true,
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: ['Authorization,Content-Type'],
  maxAge: 3600
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight OPTIONS request for all routes
//DO NOT TOUCH THIS CODE 

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');  
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader('Access-Control-Allow-Methods', '*');
//     res.setHeader('Access-Control-Allow-Headers', '*');
//     res.setHeader('Access-Control-Max-Age', '3600');
//     // Handle OPTIONS requests
//     if (req.method === 'OPTIONS') {
//       return res.status(204).send('');
//     }
//     next();
//   });



app.use(express.json());



app.use('/api/users',userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/comments',commentRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/bucket-list', bucketListRoutes);

//testing
app.get('/', (req, res) => {
    res.send('Hello, Hello, hello');
});
app.get('/api/message', (req, res) => {
    const message = req.query.message || 'No message provided!';
    res.send(`Your message: ${message}`);
});

app.get('/api/locations/:postalCode', async (req, res) => {
  const postalCode = req.params.postalCode;

  try {
    // Check if postalCode is provided
    const query = 
      `SELECT 
        zip_code, 
        population,
        median_age,
        median_age_male,
        median_age_female,
        male_pop,
        female_pop,
        vacancies_for_rent_percent,
        vacancies_for_sale_percent,
        home_value_forecast,
        ST_AsText(geometry) AS geometry 
        
        
        FROM zip_codes WHERE zip_code = $1`

    const result = await pool.query(query, [postalCode])

    // If no results for the specified postal code
    if (postalCode && result.rows.length === 0) {
      return res.status(404).json({ message: 'No polygons found for this postal code' });
    }

    // Format the response with GeoJSON geometry
    const locations = result.rows.map(row => ({
      postal_code: row.postal_code,
      geometry: wellknown.parse(row.geometry),
      population: row.population,
      medianAge: row.median_age,
      medianAgeMale: row.median_age_male,
      medianAgeFemale: row.median_age_female,
      malePop: row.male_pop,
      femalePop: row.female_pop,
      vacanciesForRentPercent: row.vacancies_for_rent_percent,
      vacanciesForSalePercent: row.vacancies_for_sale_percent,
      homeValueForecast: row.home_value_forecast
    }));

    res.json(locations);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to retrieve locations' });
  }
});

app.get('/api/locations', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          zip_code, 
          CONCAT(city, ', ', state) AS name
        FROM 
          zip_codes
        WHERE
          geometry IS NOT NULL;;
      `);
  
      // Format response
      const formattedData = result.rows.map(row => ({
        zipcode: row.zip_code,
        name: row.name,
      }));
  
      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching zipcodes:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
