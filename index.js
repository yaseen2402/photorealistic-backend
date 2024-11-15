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

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8081/explore',
    'http://localhost:8081',
    'exp://192.168.*.*:8081',
    'https://photorealistic-backend-583139081352.us-central1.run.app'
  ],
  credentials: true,
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Authorization,Content-Type',
  maxAge: 3600
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight OPTIONS request for all routes

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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
