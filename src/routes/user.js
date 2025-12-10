const express = require('express');
const router = express.Router();

const User = require('../routes/user'); // minimal user model

// Simple route to verify users route is loaded
router.get('/', async (req, res) => {
	try {
		// return an empty list (do not expose passwords)
		const users = await User.find().select('name email createdAt').limit(50).lean();
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

module.exports = router;