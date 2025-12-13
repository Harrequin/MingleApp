const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
  topic: { type: String, required: false },
  content: { type: String, required: false },
  author: { type: String, required: false },
  likes: { type: Number, default: 0},
  dislikes: { type: Number, default: 0},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);