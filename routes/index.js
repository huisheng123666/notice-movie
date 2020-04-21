const router = require('koa-router')()
const send = require('koa-send')
const path = require('path')

router.get('/download/music', async (ctx, next) => {
  await send(ctx, 'music.apk', {root: path.resolve(__dirname, '../public')})
})

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
