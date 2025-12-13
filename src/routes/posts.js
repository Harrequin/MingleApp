const express = require('express')
const router = express.Router()

const Post = require ('../models/post')
const verifyToken = require('../middleware/verifyToken')

router.get('/', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find().limit(50).lean();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

router.post('/', verifyToken, async (req, res) => {
    try {
        const { topic, content } = req.body

        if (!topic || !content) {
            return res.status(400).json({ message: 'Topic and content are required.' })
        }

        const newPost = new Post({ topic, content, author: req.user._id })

        await newPost.save();

        res.status(201).json({ message: 'Post created', postId: newPost._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });

    }
})
module.exports = router;