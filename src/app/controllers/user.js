const express = require('express')
const jwt = require('jsonwebtoken')

const authMiddleware = require('../middlewares/auth')
const User = require('../models/user')
const authConfig = require('../../config/auth')

const router = express.Router()
router.use(authMiddleware)

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret)
}

router.get('/', async(req, res) => {    
    try {
        const users = await User.find()

        return res.send({ users })
    } catch(error) {
        return res.status(400).send({ error: 'Erro ao carregar usuários' })
    }    
})

router.get('/:userId', async(req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        
        return res.send({ user })
    } catch(error) {
        return res.status(400).send({ error: 'Usuário não existe' })
    }
})

router.post('/', async(req, res) => {
    const { email } = req.body
    try {
        if (await User.findOne({ email }))            
            return res.status(400).send({ error: 'Usuário já existe'})
        
        const user = await User.create(req.body)

        user.password = undefined
        
        token = generateToken({ id: user.id })
        
        return res.send({ user, token })
    } catch(error) {
        return res.status(400).send({ error: 'Erro ao criar novo usuário' })
    }    
})

router.put('/:userId', async(req, res) => {
    try {                
        const { name, email } = req.body

        const user = await User.findByIdAndUpdate(req.params.userId, { name, email }, { new: true })
        
        return res.send({ user })
    } catch(error) {
        return res.status(400).send({ error: 'Erro ao atualizar usuário' })
    }    
})

router.delete('/:userId', async(req, res) => {
    try {                        
        await User.findByIdAndRemove(req.params.userId)
        
        return res.send()
    } catch(error) {
        return res.status(400).send({ error: 'Erro ao remover usuário' })
    }
})

module.exports = app => app.use('/user', router)