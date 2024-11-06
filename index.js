require('dotenv').config();
const express=require("express");
const propertyRoutes = require('./routes/propertyRoutes'); 
const app = express();
const PORT = 8080; 


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
