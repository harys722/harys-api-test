const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(
  cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.options('*', cors());

app.get('/api/v1', (req, res) => {
  res.json({ message: 'API is working' });
});

app.get('/corsdemo', (req, res) => {
  res.json({ message: 'This is the /corsdemo endpoint. Ensure CORS headers are set.' });
});

module.exports = app;
