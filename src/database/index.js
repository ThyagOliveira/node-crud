const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/starwarsdb')
mongoose.Promise = global.Promise

module.exports = mongoose