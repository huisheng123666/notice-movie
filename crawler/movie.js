const superagent = require('superagent')
const cheerio = require('cheerio')
const getM3u8 = require('./m3u8')

const listUrl = (type) => `https://www.magedn.com/${encodeURIComponent(type)}`

const type = process.argv[process.argv.length - 1]

let listIndex = 0

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

async function getList() {
  const res = await superagent.get(listUrl(type))
  const $ = cheerio.load(res.text)
  const movieLinks = []
  $('.bt_img ul li>a').map((index, ele) => {
    movieLinks.push($(ele).attr('href'))
  })
  return movieLinks
}

async function getHtml(url) {
  const res = await superagent.get(url)
  return res.text
}

async function getDetail(html, id, list) {
  const movie = {
    id,
    tag: type
  }
  const $ = cheerio.load(html)
  movie.url = $('.play_movie').attr('href')
  if (!movie.url) {
    list.splice(listIndex, 1)
    if (listIndex > 0) listIndex--
    return null
  }
  $('.moviedteail_list li').map((index, ele) => {
    let str = ''
    $(ele).find('a').map((idx, a) => {
      str = str + $(a).text() + '·'
    })
    $(ele).find('span').map((idx, a) => {
      str = str + $(a).text() + '·'
    })
    switch (index) {
      case 0:
        movie.type = str
        break
      case 1:
        movie.country = str
        break
      case 4:
        movie.open_time = str
        break
      case 6:
        movie.writer = str
        break
      case 5:
        movie.directory = str
        break
      case 8:
        movie.language = str
        break
    }
  })
  movie.description = $('.yp_context').text()
  movie.cover = $('.dyimg').find('img').eq(0).attr('src')
  movie.actors = []
  $('.gallery a').map((index, ele) => {
    movie.actors.push({
      avatar: $(ele).attr('href'),
      name: '',
      role: ''
    })
  })
  movie.title = $('.moviedteail_tt h1').text()
  movie.rate = $('.dbpingfen').text()

  await sleep(1000)
  movie.video_url = await getM3u8(movie.url)

  movie.cover_x = 0
  movie.playable = false
  movie.cover_y = 0
  movie.is_new = false

  return movie
}

;(async () => {
  const list = await getList()
  const result = []
  for (listIndex; listIndex < list.length; listIndex++) {
    const id = list[listIndex].split('/')[4].split('.')[0]
    const html = await getHtml(list[listIndex])
    const detail = await getDetail(html, id, list)
    if (!detail) continue;
    console.log(detail.video_url)
    result.push(detail)
    await sleep(1500)
  }

  process.send({ result })
  await sleep(1000)
  process.exit(0)
})()
