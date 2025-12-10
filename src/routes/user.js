const express = require('express');
const router = express.Router();

//import user model
const User = require('../models/user');

// GET - retrieves list of users
router.get('/', async (req, res) => {
	try {
		// return an array of users (do not expose passwords)
		const users = await User.find().select('name email createdAt').limit(50).lean();
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

// POST - creates a new user
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