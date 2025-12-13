
require('dotenv').config();


// initialises DB connection (reads MONGO_URI from .env)
require('./config/db');
const express = require('express');
const app = express();

// Reads JSON from requests
app.use(express.json());


// Shows the app is running
app.get('/', (req, res) => {
  res.json({ message: 'Mingle API is running.' });
});

// API info route: generic welcome + API description
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Mingle App coursework by Jamie Allen' });
});

// Sign up, log in
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

// List users 
const usersRoute = require('./routes/user');
app.use('/api/users', usersRoute);

// Posts: create, read, like, dislike, comment
const postsRoute = require('./routes/posts');
app.use('/api/posts', postsRoute);

// Start the server on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
   console.log(`Mingle API listening on port ${PORT}`));
