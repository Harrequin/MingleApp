/**
 * Post Routes Module
 * 
 * Handles all post-related operations including CRUD and user interactions (likes, dislikes, comments).
 * Implements filtering by topic and status, sorting by interest, and enforces expiration constraints.
 * 
 * HTTP Status Codes Reference:
 * - 200: OK - successful GET/PUT request
 * - 201: Created - successful POST request
 * - 400: Bad Request - invalid input or missing required fields
 * - 403: Forbidden - authenticated user lacks permissions (e.g., cannot like own post, expired post)
 *   Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403
 * - 404: Not Found - post does not exist
 * - 500: Server Error - database or processing error
 * 
 * References:
 * - Express.js routing: https://expressjs.com/en/guide/routing.html
 * - HTTP Status Codes (MDN): https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * - HTTP RFC 7231: https://tools.ietf.org/html/rfc7231
 * - Mongoose schema patterns: https://mongoosejs.com/docs/guide.html
 * - Code patterns from BUCI028H6 Lab Sessions (University of Brighton)
 */

const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const verifyToken = require('../middleware/verifyToken');


// GET /api/posts - get all posts with filtering and sorting
router.get('/', async (req, res) => {
    try {
        const { topic, status, sortBy } = req.query;
        let query = {};

        // Filter by topic if provided
        if (topic) {
            query.topic = topic;
        }

        // Filter by status (Live or Expired)
        if (status) {
            // This will be computed on the fly based on expiration date
            const now = new Date();
            if (status === 'Live') {
                query.expiresAt = { $gt: now };
            } else if (status === 'Expired') {
                query.expiresAt = { $lte: now };
            }
        }

        let posts = await Post.find(query)
            .populate('author', 'name')
            .populate('comments.user', 'name');

        // Sort by interest (likes - dislikes) if requested
        if (sortBy === 'interest') {
            posts.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
        }

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// GET /api/posts/:id - get a single post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name')
            .populate('comments.user', 'name');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// POST /api/posts - create a new post (protected)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, content, topic, expirationHours } = req.body;

        if (!title || !content || !topic) {
            return res.status(400).json({ message: 'Title, content, and topic are required' });
        }

        const hours = expirationHours || 24;
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

        const post = new Post({
            title,
            content,
            topic,
            author: req.user._id,
            expiresAt
        });

        await post.save();
        await post.populate('author', 'name');

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// PUT /api/posts/:id/like - like a post (protected)
router.put('/:id/like', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Owner cannot like their own post
        if (post.author.toString() === req.user._id) {
            return res.status(403).json({ message: 'You cannot like your own post' });
        }

        // Cannot like expired posts
        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot like an expired post' });
        }

        // Prevent duplicate likes
        if (post.likedBy.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already liked this post' });
        }

        post.likes += 1;
        post.likedBy.push(req.user._id);
        await post.save();

        res.json({ message: 'Post liked', likes: post.likes });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// PUT /api/posts/:id/dislike - dislike a post (protected)
router.put('/:id/dislike', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Owner cannot dislike their own post
        if (post.author.toString() === req.user._id) {
            return res.status(403).json({ message: 'You cannot dislike your own post' });
        }

        // Cannot dislike expired posts
        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot dislike an expired post' });
        }

        // Prevent duplicate dislikes
        if (post.dislikedBy.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already disliked this post' });
        }

        post.dislikes += 1;
        post.dislikedBy.push(req.user._id);
        await post.save();

        res.json({ message: 'Post disliked', dislikes: post.dislikes });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// POST /api/posts/:id/comment - add a comment to a post (protected)
router.post('/:id/comment', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Cannot comment on expired posts
        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot comment on an expired post' });
        }

        post.comments.push({
            user: req.user._id,
            text
        });

        await post.populate('comments.user', 'name');

        res.status(201).json({ message: 'Comment added', comments: post.comments });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// DELETE /api/posts/:id - delete a post (author only, protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Author-only deletion
        if (post.author.toString() !== req.user._id) {
            return res.status(403).json({ message: 'Only the post author can delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
