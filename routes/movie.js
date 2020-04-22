const router = require('koa-router')()
const mongoose = require('mongoose');
const Movie = mongoose.model('Movie')

router.prefix('/api')

router.get('/list/:tag', async (ctx, next) => {
  const tag = ctx.params.tag
  const { page } = ctx.query
  let list = await Movie.find({tag}, '-_id')
  const total_page = Math.ceil(list.length / 10)
  list = list.slice((page - 1) * 10, page * 10)
  ctx.body = {
    code: 0,
    list,
    total_page,
  }
})

module.exports = router
