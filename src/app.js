/**
 * Mingle App - Main Application Entry Point
 * 
 * This file sets up the Express server, configures middleware, and defines routes.
 * Based on Express.js framework patterns covered in BUCI028H6 course materials.
 * 
 * References:
 * - Express.js: https://expressjs.com/en/guide/routing.html
 * - REST API design: Fielding, R.T. (2000) Architectural Styles
 */

// Load environment variables from .env file (MongoDB URI, JWT secret, PORT)
require('dotenv').config();

// Initialize database connection - this must run before any routes
require('./config/db');

// Import Express framework for building REST API
const express = require('express');
const app = express();

// Middleware: Parse incoming JSON request bodies
// This allows us to access req.body in route handlers
app.use(express.json());

// Root endpoint - confirms API is operational
app.get('/', (req, res) => {
  res.json({ message: 'Mingle API is running.' });
});

// API info endpoint - provides identification information
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Mingle App coursework by Jamie Allen' });
});

// Import and mount authentication routes
// Handles: register, login, and current user endpoints
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

// Import and mount user routes
// Handles: listing all users (protected)
const usersRoute = require('./routes/user');
app.use('/api/users', usersRoute);

// Import and mount post routes
// Handles: create, list, like, dislike, comment, delete posts (all protected)
const postsRoute = require('./routes/posts');
app.use('/api/posts', postsRoute);

// Start the Express server
// Uses PORT from .env or defaults to 3000
// Binds to 0.0.0.0 to accept connections from any network interface
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
   console.log(`Mingle API listening on port ${PORT}`));
