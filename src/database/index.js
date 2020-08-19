const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/starwarsdb', { useNewUrlParser: true})
mongoose.Promise = global.Promise

module.exports = mongoose