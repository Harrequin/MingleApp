/**
 * MongoDB Database Connection Configuration
 * 
 * Establishes connection to MongoDB using Mongoose ODM.
 * Connection string loaded from environment variables for security.
 * 
 * References:
 * - Mongoose: https://mongoosejs.com/docs/guide.html
 * - MongoDB connection: https://www.mongodb.com/docs/manual/
 * - Code adapted from BUCI028H6 lab sessions and W3Schools tutorials
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Get MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGO_URI;

// Check if connection string is provided
if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is not set. Skipping MongoDB connection.');
} else {
  // Attempt to connect to MongoDB
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err.message || err));
}

// Export mongoose instance for use in models
module.exports = mongoose;