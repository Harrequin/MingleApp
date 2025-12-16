/**
 * JWT Authentication Middleware
 * 
 * Protects routes by verifying JSON Web Tokens sent in request headers.
 * Implementation based on JWT specification and course authentication patterns.
 * 
 * References:
 * - JWT: https://jwt.io/introduction
 * - RFC 7519: https://datatracker.ietf.org/doc/html/rfc7519
 * - Authentication patterns from BUCI028H6 course materials
 */

const jsonwebtoken = require('jsonwebtoken')

/**
 * Middleware function to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function auth(req, res, next) {
    // Extract token from 'auth-token' header
    const token = req.header('auth-token')
    
    // If no token provided, reject with 401 Unauthorized
    if (!token) {
        return res.status(401).send({ message: 'Access denied' })
    }
    
    try {
        // Verify token using secret key from environment variables
        // If valid, extracts payload (user ID) and attaches to request
        const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET)
        req.user = verified  // Makes user info available to route handlers
        next()  // Continue to the protected route
    } catch (err) {
        // Token is invalid, expired, or malformed
        return res.status(401).send({ message: 'Invalid token' })
    }
}

// Export middleware for use in protected routes
module.exports = auth