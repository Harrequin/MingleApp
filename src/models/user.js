/**
 * User Model
 * 
 * Defines the schema for user accounts in MongoDB.
 * Stores authentication credentials and basic profile information.
 * 
 * References:
 * - Mongoose schemas: https://mongoosejs.com/docs/guide.html
 * - Code guided by BUCI028H6 lab sessions
 */

const mongoose = require('mongoose');

// Define User schema structure
const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true  // User must provide a name
  },
  email: { 
    type: String, 
    required: true,  // Email required for login
    unique: true  // Prevents duplicate accounts with same email
  },
  password: { 
    type: String, 
    required: true  // Password stored as bcrypt hash, never plain text
  },
  createdAt: { 
    type: Date, 
    default: Date.now  // Automatically set timestamp on account creation
  }
});

// Export model for use in authentication and user routes
module.exports = mongoose.model('User', UserSchema);
