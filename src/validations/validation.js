/**
 * Input Validation Schemas using Joi
 * 
 * Validates user input for registration and login to prevent invalid data
 * from reaching the database. Based on validation patterns from course materials.
 * 
 * References:
 * - Joi documentation: https://joi.dev/
 * - Input validation from BUCI028H6 tutorials
 */

const joi = require('joi')

/**
 * Registration validation schema
 * Ensures name, email, and password meet minimum requirements
 * @param {Object} data - User registration data {name, email, password}
 * @returns {Object} Joi validation result with error details if invalid
 */
const registerValidation = (data) => {
    const schemaValidation = joi.object({
        name: joi.string().required().min(3).max(256),  // Name must be 3-256 chars
        email: joi.string().required().min(6).max(256).email(),  // Valid email required
        password: joi.string().required().min(6).max(1024)  // Password minimum 6 chars
    })
    return schemaValidation.validate(data)
}

/**
 * Login validation schema
 * Checks email and password format before authentication attempt
 * @param {Object} data - User login data {email, password}
 * @returns {Object} Joi validation result
 */
const loginValidation = (data) => {
    const schemaValidation = joi.object({
        email: joi.string().required().min(6).max(256).email(),
        password: joi.string().required().min(6).max(1024)
    })
    return schemaValidation.validate(data)
}

// Export validation functions for use in auth routes
module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation