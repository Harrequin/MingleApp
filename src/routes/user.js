// User routes
const express = require('express');
const router = express.Router();

// Use the User model
const User = require('../models/user');

// Checks the token
const verifyToken = require('../middleware/verifyToken');

// GET /api/users - list users
router.get('/', verifyToken, async (req, res) => {
	try {
		// return an array of users but excludes the password field
		const users = await User.find().select('-password').limit(50).lean();
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

// POST /api/users - create user 
router.post('/', async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const newUser = new User({ name, email, password });
		await newUser.save();
		res.status(201).json({ message: 'User created', userId: newUser._id });
	}
	catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});


module.exports = router;