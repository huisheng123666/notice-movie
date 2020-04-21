const router = require('koa-router')()
const mongoose = require('mongoose');
const Movie = mongoose.model('Movie')

router.prefix('/api')

router.get('/list/:tag', async (ctx, next) => {
  const tag = ctx.params.tag
  const list = await Movie.find({tag}, '-_id')
  ctx.body = {
    code: 0,
    list
  }
})

module.exports = router
