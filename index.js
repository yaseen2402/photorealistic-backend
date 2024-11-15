require('dotenv').config();
const cors = require('cors');
const express=require("express");
const propertyRoutes = require('./routes/propertyRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const commentRoutes = require('./routes/commentRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const preferencesRoutes = require('./routes/preferencesRoutes');
const PORT = 8080||process.env.PORT; 
const pool = require('./db');
const app = express();
const wellknown = require('wellknown');


const corsOptions = {
  origin: '*',
  credentials: true,
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Authorization,Content-Type',
  maxAge: 3600
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin);
//   res.header('X-Frame-Options', 'DENY');
//   res.header('X-Content-Type-Options', 'nosniff');
//   res.header('X-XSS-Protection', '1; mode=block');
//   res.header('Content-Security-Policy', "default-src 'self'");
//   res.header('Strict-Transport-Security', 'max-age=31536000');
  
//   next();
// });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');  
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', '3600');
    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }
    next();
  });



app.use(express.json());


  
  // Middleware


app.use('/api/users',userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/comments',commentRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/preferences', preferencesRoutes);

//testing
app.get('/', (req, res) => {
    res.send('Hello, Hello, hello');
});
app.get('/api/message', (req, res) => {
    const message = req.query.message || 'No message provided!';
    res.send(`Your message: ${message}`);
});

app.get('/api/locations/:postalCode?', async (req, res) => {
  const postalCode = req.params.postalCode;

  try {
    // Check if postalCode is provided
    const query = postalCode
      ? 'SELECT postal_code, ST_AsText(geometry) AS geometry FROM postal_codes WHERE postal_code = $1'
      : 'SELECT postal_code, ST_AsText(geometry) AS geometry FROM postal_codes';

    const result = postalCode
      ? await pool.query(query, [postalCode])
      : await pool.query(query);

    // If no results for the specified postal code
    if (postalCode && result.rows.length === 0) {
      return res.status(404).json({ message: 'No polygons found for this postal code' });
    }

    // Format the response with GeoJSON geometry
    const locations = result.rows.map(row => ({
      postal_code: row.postal_code,
      geometry: wellknown.parse(row.geometry),
    }));

    res.json(locations);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to retrieve locations' });
  }
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
