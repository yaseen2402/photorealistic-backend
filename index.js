const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // Cloud Run uses PORT environment variable

// Hello World endpoint
app.get('/', (req, res) => {
    res.send('Hello, Hello');
});

// Custom message endpoint
app.get('/api/message', (req, res) => {
    const message = req.query.message || 'No message provided!';
    res.send(`Your message: ${message}`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
