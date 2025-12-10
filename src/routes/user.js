const express = require('express');
const router = express.Router();
//import user model
const User = require('./models/user'); // minimal user model

//verify users route is loaded
router.get('/', async (req, res) => {
	try {
		// return an empty lists
		const users = await User.find().select('name email createdAt').limit(50).lean();
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: 'Server error', error: err.message });
	}
});

module.exports = router;