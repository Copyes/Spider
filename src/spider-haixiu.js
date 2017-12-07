const request = require('request')
const cheerio = require('cheerio')
const http = require('http')
const fs = require('fs')

// 获取害羞小组主页的话题列表信息
const getIndexTopics = baseUrl => {
  return new Promise((resolve, reject) => {
    console.log('开始获取第一页的数据了～')
    let result = []
    request(defaultHeader(baseUrl), (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        let $ = cheerio.load(res.body.toString())
        let oTags = $('.olt .title a') // a标签html
        for (let i = oTags.length - 1; i >= 0; i--) {
          let href = oTags[i].attribs.href
          let title = oTags[i].attribs.title
          if (title.indexOf('晒') > -1) {
            result.push({
              href,
              title
            })
          }
        }
        resolve(result)
      }
    })
  })
}
// 爬取详情页里面的链接
const getTopicDetail = url => {
  return new Promise((resolve, reject) => {})
}
// 初始化header
const defaultHeader = url => {
  return {
    method: 'GET',
    url: url,
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
      Host: 'www.douban.com',
      Referer:
        'https://www.douban.com/group/search?cat=1019&q=%E8%AF%B7%E4%B8%8D%E8%A6%81%E5%AE%B3%E7%BE%9E',
      Cookie:
        'bid=vkXjYPjxO6E;ll="108258"; __utmt=1; _pk_id.100001.8cb4=01b2064f77e2447f.1498966886.1.1498966901.1498966886.; _pk_ses.100001.8cb4=*; __utma=30149280.416164627.1498966886.1498966886.1498966886.1; __utmb=30149280.29.0.1498966900716; __utmc=30149280; __utmz=30149280.1498966886.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
    }
  }
}
// 初始化爬虫
const init = () => {
  let baseUrl = 'https://www.douban.com/group/haixiuzu/discussion?start=0'
  getIndexTopics(baseUrl)
    .then(data => {
      console.log(data)
    })
    .catch(err => {
      console.log(err)
    })
}

init()
