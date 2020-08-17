const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('../../modules/nodemailer')

const User = require('../models/user')
const authConfig = require('../../config/auth')

const router = express.Router()

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret)
}

router.post('/register', async(req, res) => {
    const { email } = req.body
    try {
        if (await User.findOne({ email }))            
            return res.status(400).send({ error: 'Usuário já existe'})        

        const newUser = await User.create(req.body)

        newUser.password = undefined
        
        token = generateToken({ id: newUser.id })

        return res.send({ newUser, token })
    } catch (error) {        
        return res.status(400).send({ error: 'Erro ao se registrar' })
    }
})

router.post('/login', async(req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user)
        return res.status(400).send({ error: 'Usuário não encontrado '})        

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Senha incorreta '})
    
    user.password = undefined

    token = generateToken({ id: user.id })
    
    res.send({ user, token })
    
})

router.post('/lost_password', async(req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado '})        
        
        const token = crypto.randomBytes(20).toString('hex')

        const now = new Date()
        now.setHours(now.getHours() + 1)

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                ResetToken: token,
                ResetTokenExpires: now,
            }
        })
        
        nodemailer.sendMail({
            to: email,
            from: 'thyago@cnt.com.br',
            template: 'auth/recovery',
            context: { token },
        }, (error) => {            
            if (error)
                return res.status(400).send({ erro: "Erro ao enviar email para recuperar senha" })
            return res.send()
        })
    } catch(error) {
        res.status(400).send({ error: 'Erro ao recuperar senha, tente novamente'})
    }
})

router.post('/recovery_password', async(req, res) => {
    const { email, token, password } = req.body

    try {
        const user = await User.findOne({ email }).select('+ResetToken ResetTokenExpires')

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado '})        
        
        if (token !== user.ResetToken)
            return res.status(400).send({ error: 'Token inválido' })
        
        const now = new Date()

        if (now > user.ResetTokenExpires)
            return res.status(400).send({ error: 'Token Expirado' })
        
        user.password = password

        await user.save()
        res.send()
    } catch(error) {
        res.status(400).send({ error: 'Erro ao recuperar senha, tente novamente'})        
    }
})

module.exports = app => app.use('/auth', router)