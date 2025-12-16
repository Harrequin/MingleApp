/**
 * User Routes
 * 
 * Handles user listing endpoint.
 * Protected by JWT authentication middleware.
 * 
 * References:
 * - Express routing: https://expressjs.com/en/guide/routing.html
 * - Code patterns from BUCI028H6 course materials
 */

const express = require('express');
const router = express.Router();

const User = require('../models/user');
const verifyToken = require('../middleware/verifyToken');

/**
 * GET /api/users
 * List all users (protected endpoint)
 * Requires: auth-token header
 * Returns: Array of users without passwords
 */
router.get('/', verifyToken, async (req, res) => {
	try {
		const users = await User.find().select('-password').limit(50).lean();
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

/**
 * POST /api/users
 * Create user endpoint (not recommended - use /api/auth/register instead)
 */
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
