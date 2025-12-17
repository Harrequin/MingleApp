/**
 * Post Model
 * 
 * Defines schema for posts (messages) with expiration, interactions, and comments.
 * Includes virtual properties for computed fields (status, timeLeft).
 * 
 * References:
 * - Mongoose schemas and virtuals: https://mongoosejs.com/docs/guide.html
 * - Code guided by BUCI028H6 lab sessions
 * - Virtual expiry logic: https://stackoverflow.com/questions/14597241/setting-expiry-time-for-a-collection-in-mongodb-using-mongoose
 */


const mongoose = require('mongoose');

// Comment sub-schema 
// Each comment references a user and includes text and timestamp
const commentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // References User model for population
    required: true 
  },
  text: { 
    type: String, 
    required: true  // Comment content
  },
  createdAt: { 
    type: Date, 
    default: Date.now  // Auto-set when comment created
  }
});


// Main Post schema
const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true  // Post must have a title
  },
  topics: { 
    type: [String],  // Array: posts can have multiple topics
    required: true,
    enum: ['Politics', 'Health', 'Sport', 'Tech'],  // Restrict to four categories
    validate: {
      validator: function(v) {
        return v && v.length > 0;  // At least one topic required
      },
      message: 'At least one topic is required'
    }
  },
  content: { 
    type: String, 
    required: true  // Main message body
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // References the User who created the post
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true  // When post stops accepting interactions
  },
  likes: { 
    type: Number, 
    default: 0  // Count of likes
  },
  dislikes: { 
    type: Number, 
    default: 0  // Count of dislikes
  },
  likedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'  // Track who liked to prevent duplicates
  }],
  dislikedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'  // Track who disliked to prevent duplicates
  }],
  comments: [commentSchema],  // Embedded comments array
  createdAt: { 
    type: Date, 
    default: Date.now  // Post creation timestamp
  }
});


// checks if post is expired
// Returns 'Live' if post hasn't expired, 'Expired' otherwise
// Not stored in database - calculated on access
postSchema.virtual('status').get(function() {
  return new Date() > this.expiresAt ? 'Expired' : 'Live';
});


// calculates remaining time until expiration
// returns a string like "2d 5h" or "15m"
// developed using lab session code and StackOverflow guidance:
// https://stackoverflow.com/questions/14597241/setting-expiry-time-for-a-collection-in-mongodb-using-mongoose
postSchema.virtual('timeLeft').get(function() {
  const now = new Date();
  const diff = this.expiresAt - now;  // Milliseconds until expiry
  
  if (diff <= 0) return 'Expired';

  // Convert milliseconds to days, hours, minutes
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  // Return most relevant unit for readability
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
});

// Include virtual fields when converting to JSON (for API responses)
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Export Post model for use in post routes
module.exports = mongoose.model('Post', postSchema);