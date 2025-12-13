// Post routes

const express = require('express')
const router = express.Router()
//imports post model
const Post = require ('../models/post')
const verifyToken = require('../middleware/verifyToken')

// GET /api/posts - list posts with filters for topic or expired/live)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { topic, status, sortBy } = req.query;
        const filter = {};
        
        if (topic) {
            filter.topics = topic;
        }
        
        // Filter by status (Live/Expired) - TC19
        if (status === 'expired') {
            filter.expiresAt = { $lt: new Date() };
        } else if (status === 'live') {
            filter.expiresAt = { $gte: new Date() };
        }
        
        let query = Post.find(filter)
            .populate('author', 'name email')
            .populate('comments.user', 'name');
        
        // Sort by interest (likes + dislikes) - TC20
        if (sortBy === 'interest') {
            query = query.sort({ likes: -1, dislikes: -1 });
        } else {
            query = query.sort({ createdAt: -1 });
        }
        
        const posts = await query.limit(50);
        
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

// GET /api/posts/:id,, gets one post
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name email')
            .populate('comments.user', 'name');
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

// POST /api/posts,  creates a new post
router.post('/', verifyToken, async (req, res) => {
    // Expected body: { title, topics, content, expirationHours }
    try {
        const { title, topics, content, expirationHours } = req.body
        // Basic validation
        if (!title || !topics || !content) {
            return res.status(400).json({ message: 'Title, topics, and content are required.' })
        }

        // Calculate expiration time (defaults to 24 hours)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (expirationHours || 24));

        const newPost = new Post({ 
            title,
            topics: Array.isArray(topics) ? topics : [topics],
            content, 
            author: req.user._id,
            expiresAt
        })

        await newPost.save();
        await newPost.populate('author', 'name email');

        res.status(201).json({ message: 'Post created', post: newPost });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

// PUT /api/posts/:id/like - like a post (with expectations)
router.put('/:id/like', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // TC11: Owner cannot like their own post
        if (post.author.toString() === req.user._id) {
            return res.status(403).json({ message: 'You cannot like your own post' });
        }
        
        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot like an expired post' });
        }
        
        // Check if user already liked this post
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
})

// PUT /api/posts/:id/dislike - dislike a post (with expectations)
router.put('/:id/dislike', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // stops owner liking their own post
        if (post.author.toString() === req.user._id) {
            return res.status(403).json({ message: 'You cannot dislike your own post' });
        }
        
        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot dislike an expired post' });
        }
        
        // stops user disliking the same post twice
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
})

// POST /api/posts/:id/comment - add a comment (not expired)
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
        
        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot comment on an expired post' });
        }
        
        post.comments.push({
            user: req.user._id,
            text
        });
        
        await post.save();
        await post.populate('comments.user', 'name');
        
        res.status(201).json({ message: 'Comment added', comments: post.comments });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

// DELETE /api/posts/:id  deletes your own post
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if user is the author
        if (post.author.toString() !== req.user._id) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }
        
        await Post.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

module.exports = router;