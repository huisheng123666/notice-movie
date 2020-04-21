const superagent = require('superagent')
const cheerio = require('cheerio')

const listUrl = (type) => `https://movie.douban.com/j/search_subjects?type=movie&tag=${encodeURIComponent(type)}&sort=time&page_limit=10&page_start=0`

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
  return res.body.subjects
}

async function getHtml(url) {
  const res = await superagent.get(url)
  return res.text
}

async function getVideoUrl(url) {
  const res = await superagent.get(url)
  const $ = cheerio.load(res.text)
  return $(`.video-js source`).attr('src')
}

async function getDetail(html, list) {
  const data = {}
  const $ = cheerio.load(html)
  const videoEl = $('.related-pic-video')
  const videoHref = videoEl.attr('href')
  if (!videoHref) {
    list.splice(listIndex, 1)
    if (listIndex > 0) listIndex--
    return
  }
  const info = $('#info').text().split(' ')
  info.map((item, index) => {
    if (item.indexOf('导演') > -1) data.directory = info[index + 1].replace(/\n/g, '')
    if (item.indexOf('编剧') > -1) data.writer = info[index + 1].replace(/\n/g, '')
    if (item.indexOf('类型') > -1) data.type = info[index + 1].replace(/\n/g, '')
    if (item.indexOf('地区') > -1) data.country = info[index + 1].replace(/\n/g, '')
    if (item.indexOf('语言') > -1) data.language = info[index + 1].replace(/\n/g, '')
    if (item.indexOf('上映') > -1) data.open_time = info[index + 1].replace(/\n/g, '')
  })

  data.description = $('#link-report span').eq(0).text().replace(/\n\n/g, '').replace(/ +/g, '')

  const actors = $('.celebrities-list .celebrity')

  data.actors = []

  actors.map((index, ele) => {
    const item = {}
    const eObj = $(ele)
    item.avatar = eObj.find('.avatar').attr('style') && eObj.find('.avatar').attr('style').split('(')[1].replace(')', '')
    item.name = eObj.find('.info a').text()
    item.role = eObj.find('.info .role').text()

    data.actors.push(item)
  })

  await sleep(1500)

  const video_url = await getVideoUrl(videoHref, list[listIndex].id)
  console.log(video_url)
  data.video_url = video_url

  data.tag = type

  return data
}

;(async () => {
  const list = await getList()
  for (listIndex; listIndex < list.length; listIndex++) {
    const html = await getHtml(list[listIndex].url)
    const detail = await getDetail(html, list)
    list[listIndex] = {
      ...list[listIndex],
      ...detail
    }
    await sleep(1500)
  }

  process.send({result: list})
  await sleep(1000)
  process.exit(0)

})()
