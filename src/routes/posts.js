const express = require('express')
const router = express.Router()

const Post = require ('../models/post')

router.post('/',  async (req, res) => {
    try {
        const { topic, content, author } = req.body

        if (!topic || !content || !author) {
            return res.status(400).json({ message: 'Topic, content, and author are required.' })
        }

        const newPost = new Post({ topic, content, author })

        await newPost.save();

        res.status(201).json({ message: 'Post created', postId: newPost._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });

    }
})
module.exports = router;