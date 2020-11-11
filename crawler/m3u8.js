const superagent = require('superagent')
var CryptoJS = require("crypto-js")

async function getHtml(url) {
  const res = await superagent.get(url)
  return res.text
}

function decode(key1, key2, data) {
  const k6c22c = CryptoJS.enc.Utf8.parse(key1)
  const iv = CryptoJS.enc.Utf8.parse(key2)
  const decrypted = CryptoJS.AES.decrypt(data, k6c22c, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7})
  return decrypted.toString(CryptoJS.enc.Utf8)
}

async function getM3u8(url) {
  let html = await getHtml(url)
  html = html.replace(/\r\n/g, '')
  const reg = /wp_nonce[\s\S]+decrypted.toString/g
  const urlMatch = /https\S+m3u8/
  let strs = html.match(reg)[0].replace(/\t/g, '').split(';')
  const data = strs[1].split('"')[1]
  const key1 = strs[2].split('"')[1]
  const key2 = strs[3].split('(')[1].split(')')[0]
  return decode(key1, key2, data).match(urlMatch)[0]
}

module.exports = getM3u8
