const mongoose = require('mongoose');

// Comment Schema
const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


// Main Post Schema
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topics: { 
    type: [String], 
    required: true,
    enum: ['Politics', 'Health', 'Sport', 'Tech'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one topic is required'
    }
  },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

// check if post is expired
postSchema.virtual('status').get(function() {
  return new Date() > this.expiresAt ? 'Expired' : 'Live';
});

// check time left until expiration
postSchema.virtual('timeLeft').get(function() {
  const now = new Date();
  const diff = this.expiresAt - now;
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
});

// ensures virtual fields are included when converting to JSON or Object
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Exports the Post model
module.exports = mongoose.model('Post', postSchema);