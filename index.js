require('dotenv').config();
const cors = require('cors');
const express=require("express");
const propertyRoutes = require('./routes/propertyRoutes'); 
const app = express();
const PORT = 8080||process.env.PORT; 

const corsOptions = {
    origin: '*', // Allow all origins
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Authorization,Content-Type',
    maxAge: 3600
  };
  
  // Middleware
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // Enable preflight OPTIONS request for all routes
  
  app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');  
      res.setHeader('Access-Control-Allow-Methods', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Max-Age', '3600');
      // Handle OPTIONS requests
      if (req.method === 'OPTIONS') {
        return res.status(204).send('');
      }
      next();
    });
  

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



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
