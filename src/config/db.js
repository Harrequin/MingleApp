// Connect to MongoDB using MONGO_URI from .env
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

// If MONGO_URI is missing, skip connecting
if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is not set. Skipping MongoDB connection.');
} else {
  // Try to connect
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err.message || err));
}

module.exports = mongoose;
