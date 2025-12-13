const mongoose = require('mongoose');

//must load env file to get MONGO_URI
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

//pre-connection check for MONGO_URI, doesn't try if missing.
if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is not set. Skipping MongoDB connection.');
} else {
  // if the URI is present, tries to connect. Returns error on failure.
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err.message || err));
}

module.exports = mongoose;
