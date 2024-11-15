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
    'exp://localhost:8081',
    'exp://192.168.*.*:8081',
    'https://photorealistic-backend-583139081352.us-central1.run.app'
  ],
  credentials: true,
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Authorization,Content-Type',
  maxAge: 86400
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Content-Security-Policy', "default-src 'self'");
  res.header('Strict-Transport-Security', 'max-age=31536000');
  
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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
