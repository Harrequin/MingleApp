// Imports the Express library
require('dotenv').config();


// initialises DB connection (reads MONGO_URI from .env)
require('./config/db');
const express = require('express');
const app = express();


// AI-generated: lightweight request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

//middleware
app.use(express.json());


// confirms the APII is running.
app.get('/', (req, res) => {
  res.json({ message: 'Mingle API is running.' });
});

// API info route: generic welcome + API description
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Mingle App coursework by Jamie Allen' });
});

// Add the Users routes (mounted at /api/users)
const usersRoute = require('./routes/user');
app.use('/api/users', usersRoute);

// Add the Posts routes (mounted at /api/posts)
const postsRoute = require('./routes/posts');
app.use('/api/posts', postsRoute);

// Starts the server on port 3000, or from the env file. 
const PORT = process.env.PORT || 3000;

// AI-generated: add listen error handler
const server = app.listen(PORT, "0.0.0.0", () =>
  console.log(`Mingle API listening on port ${PORT}`)
);

server.on('error', (err) => {
  console.error(`Server failed to start on port ${PORT}:`, err.message || err);
});