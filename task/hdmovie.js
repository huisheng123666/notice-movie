const cp = require('child_process');
const { resolve } = require('path');
const mongoose = require('mongoose');
const Movie = mongoose.model('Movie')

const movieTask = (type) => {
  const script = resolve(__dirname, '../crawler/movie')

  return new Promise((resolve, reject) => {
    const child = cp.fork(script, [type])
    let invoke = false

    child.on('error', err => {
      if (invoke) return

      invoke = true

      console.log('error', err)

      reject(err)
    })

    child.on('exit', code => {
      if (invoke) return

      invoke = false

      let err = code === 0 ? null : new Error('exit code' + code)
      console.log(err)
      resolve()
    })

    child.on('message', async data => {
      let result = data.result
      for (let i = 0; i < result.length; i++) {
        let movie = await Movie.findOne({id: result[i].id})
        if (!movie) {
          movie = new Movie(result[i])
          await movie.save()
        }
      }

      resolve()
    })
  })
}

module.exports = movieTask
