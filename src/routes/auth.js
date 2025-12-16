// Auth routes
// - Register: create user (password is safely stored)
// - Login: give a token if details are correct
// - Me: show current user (needs token)
const express = require('express')
const router = express.Router()

const User = require('../models/user')
const {registerValidation,loginValidation} = require('../validations/validation')

const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

// POST /api/auth/register
router.post('/register', async(req,res)=>{

    // Checks user input
    const {error} = registerValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    // checks user existence
    const userExists = await User.findOne({email:req.body.email})
    if(userExists){
        return res.status(400).send({message:'User already exists'})
    }

    // Hides the real password before saving
    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password,salt)

    // Saves user
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
    })
    try{
        const savedUser = await user.save()
        // Return user without password
        const userResponse = savedUser.toObject()
        delete userResponse.password
        res.status(201).send(userResponse)
    }catch(err){
        res.status(400).send({message:err})
    }
    
})

// POST /api/auth/login
router.post('/login', async(req,res)=>{

    //check user input
    const {error} = loginValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    // checks user existence
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(400).send({message:'User does not exist'})
    } 
    
    // check user password
    const passwordValidation = await bcryptjs.compare(req.body.password,user.password)
    if(!passwordValidation){
        return res.status(400).send({message:'Password is wrong'})
    }
    
    // Make a login token
    const token = jsonwebtoken.sign({_id:user._id}, process.env.TOKEN_SECRET)
    res.header('auth-token',token).send({'auth-token':token})

})

// GET /api/auth/me  current user info
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