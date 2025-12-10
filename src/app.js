// Import the Express library
require('dotenv').config();
// initialize DB connection (reads MONGO_URI from .env)
require('./config/db');
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Root route: redirect or basic info
app.get('/', (req, res) => {
  res.json({ message: 'Mingle API is running.' });
});

// API info route: generic welcome + API description
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Mingle App coursework by Jamie Allen' });
});

// Add the Users routes
const usersRoute = require('./routes/user');
app.use('/api/users', usersRoute);

// Start the server on port 3000 (or from env)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
   console.log(`Mingle API listening on port ${PORT}`));