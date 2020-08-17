const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

const { host, port, user, pass } = require('../config/email.json')

const transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass },
})

transport.use('compile', hbs({
  viewEngine: {
    defaultLayout: undefined,
    partialsDir: path.resolve('./src/resources/email')
  },
  viewPath: path.resolve('./src/resources/email/'),
  extName: '.html',
}))

module.exports = transport