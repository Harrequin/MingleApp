
//code taken from     cc/Class-4/Lab4.1-Building-the-MiniFilm-application.md
const express = require('express')
const router = express.Router()

const User = require('../models/user')
const {registerValidation,loginValidation} = require('../validations/validation')

const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

router.post('/register', async(req,res)=>{

    // Validation 1 to check user input
    const {error} = registerValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    // Validation 2 to check if user exists!
    const userExists = await User.findOne({email:req.body.email})
    if(userExists){
        return res.status(400).send({message:'User already exists'})
    }

    // I created a hashed represenation of my password!
    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password,salt)

    // Code to insert data
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
    })
    try{
        const savedUser = await user.save()
        res.send(savedUser)
    }catch(err){
        res.status(400).send({message:err})
    }
    
})

router.post('/login', async(req,res)=>{

    // Validation 1 to check user input
    const {error} = loginValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    // Validation 2 to check if user exists!
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(400).send({message:'User does not exist'})
    } 
    
    // Validation 3 to check user password
    const passwordValidation = await bcryptjs.compare(req.body.password,user.password)
    if(!passwordValidation){
        return res.status(400).send({message:'Password is wrong'})
    }
    
    // Generate an auth-token
    const token = jsonwebtoken.sign({_id:user._id}, process.env.TOKEN_SECRET)
    res.header('auth-token',token).send({'auth-token':token})

})

// GET /me - returns current authenticated user info
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