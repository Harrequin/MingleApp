// verifyToken.js middleware to protect routes
const jsonwebtoken = require('jsonwebtoken')
// Middleware function to verify token
function auth(req, res, next) {
    const token = req.header('auth-token')
    // If no token, deny access
    if (!token) {
        return res.status(401).send({ message: 'Access denied' })
    }
    try {
        const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    } catch (err) {
        return res.status(401).send({ message: 'Invalid token' })
    }
}
// Export the middleware
module.exports = auth