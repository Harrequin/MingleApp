/**
 * Authentication Routes
 * 
 * Handles user registration, login (JWT token generation), and current user endpoint.
 * Implements password hashing for security and token-based authentication.
 * 
 * References:
 * - JWT: https://jwt.io/introduction
 * - bcrypt hashing: https://www.npmjs.com/package/bcryptjs
 * - Authentication patterns from BUCI028H6 course materials
 */


const express = require('express')
const router = express.Router()

const User = require('../models/user')
const {registerValidation,loginValidation} = require('../validations/validation')

const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')


/**
 * POST /api/auth/register
 * Register a new user account
 * Body: { name, email, password }
 * Returns: User object without password
 */
router.post('/register', async(req,res)=>{

    const {error} = registerValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    const userExists = await User.findOne({email:req.body.email})
    if(userExists){
        return res.status(400).send({message:'User already exists'})
    }

    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password,salt)

    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
    })
    try{
        const savedUser = await user.save()
        const userResponse = savedUser.toObject()
        delete userResponse.password
        res.status(201).send(userResponse)
    }catch(err){
        res.status(400).send({message:err})
    }
    
})

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Body: { email, password }
 * Returns: { "auth-token": "<JWT>" }
 */
router.post('/login', async(req,res)=>{

    const {error} = loginValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    const user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(400).send({message:'User does not exist'})
    } 
    
    const passwordValidation = await bcryptjs.compare(req.body.password,user.password)
    if(!passwordValidation){
        return res.status(400).send({message:'Password is wrong'})
    }
    
    const token = jsonwebtoken.sign({_id:user._id}, process.env.TOKEN_SECRET)
    res.header('auth-token',token).send({'auth-token':token})

})

/**
 * GET /api/auth/me
 * Get current authenticated user's information
 * Protected route - requires valid JWT token in header
 * Returns: User object without password
 */
const verifyToken = require('../middleware/verifyToken')

router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password')
        if (!user) {
            return res.status(404).send({ message: 'User not found' })
        }
        res.json(user)
    } catch (err) {
        res.status(500).send({ message: 'Server error', error: err.message })
    }
})

module.exports=router
