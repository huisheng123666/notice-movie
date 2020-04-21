const mongoose = require('mongoose')
const db = 'mongodb://localhost/douban-trailer'
require('./schema')

mongoose.Promise = global.Promise

exports.connect = () => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true)
    }

    mongoose.connect(db)

    mongoose.connection.on('disconnected', () => {
      reject('db error')
      mongoose.connect(db)
    })

    mongoose.connection.on('error', (err) => {
      reject('db error')
      console.log(err)
    })

    mongoose.connection.on('open', () => {
      console.log('mongodb connected successfully')
      resolve()
    })
  })
}
