const request = require('request')
const cheerio = require('cheerio')
const http = require('http')
const fs = require('fs')
const path = require('path')

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
const getTopicDetail = (url, baseUrl) => {
  return new Promise((resolve, reject) => {
    console.log(`正在爬取${url}里面的小姐姐哦～`)
    request(defaultHeader(url, baseUrl), (err, res) => {
      if (err) {
        reject(err)
      } else {
        let html = res.body.toString()
        resolve(getDetailPics(html))
      }
    })
  })
}
// 详细操作dom获取对应的信息
const getDetailPics = html => {
  let $ = cheerio.load(html)
  let name = $('.topic-doc .from a')
    .text()
    .trim()
  let shtml = $('.topic-figure img') // a标签html
  let pics = []
  for (let i = shtml.length - 1; i >= 0; i--) {
    let src = shtml[i].attribs.src
    pics.push(src)
  }
  return {
    name,
    pics
  }
}
// 创建相应的文件夹
const mkdirs = (dirpath, dirname) => {
  if (typeof dirname === 'undefined') {
    if (fs.existsSync(dirpath)) {
      return
    } else {
      mkdirs(dirpath, path.dirname(dirpath))
    }
  } else {
    if (dirname !== path.dirname(dirpath)) {
      mkdirs(dirpath)
      return
    }
    if (fs.existsSync(dirname)) {
      fs.mkdirSync(dirpath)
    } else {
      mkdirs(dirname, path.dirname(dirname))
      fs.mkdirSync(dirpath)
    }
  }
}

// 下载相关的图片
const downloadPics = obj => {
  let pics = obj.pics
  let name = obj.name
  pics.forEach(pic => {
    pic = pic.replace('https', 'http')
    let pathArr = pic.split('/')
    let picName = pathArr[pathArr.length - 1]
    let dir = `../dist/haixiu`
    mkdirs(path.join(__dirname, dir))
    let filename = path.join(__dirname, dir) + '/' + picName
    http.get(pic, res => {
      var imgData = ''
      res.setEncoding('binary')
      res.on('data', chunk => {
        imgData += chunk
      })
      res.on('end', function() {
        // 保存图片
        fs.writeFileSync(filename, imgData, 'binary', err => {
          if (err) {
            console.log(err)
          }
        })
      })
    })
  })
}
// 初始化header
const defaultHeader = (url, referer) => {
  return {
    method: 'GET',
    url: url,
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Host: 'www.douban.com',
      Referer: referer || '',
      Cookie:
        'bid=isi49STv1Vw; ll="118172"; _vwo_uuid_v2=32B934F953FA30DC7C30A2E3F0916C18|99b5957548a91166de9d050b5ab4f3f1; _pk_ref.100001.8cb4=%5B%22%22%2C%22%22%2C1512816046%2C%22https%3A%2F%2Fwww.baidu.com%2Flink%3Furl%3D-GQzWrW032tvhHSoXoTzZ_cO2m5VKhlxXNXuEemIZo7tklxUMtkl_2G979tGa-iYwlmFX9xAc_eGYOZQ6eSNIq%26wd%3D%26eqid%3Deb124b640001df1800000002597c05d7%22%5D; ct=y; __utmt=1; _pk_id.100001.8cb4=01b2064f77e2447f.1498966886.11.1512817217.1512657704.; _pk_ses.100001.8cb4=*; __utma=30149280.416164627.1498966886.1512657705.1512816049.14; __utmb=30149280.193.5.1512817216797; __utmc=30149280; __utmz=30149280.1506765420.10.5.utmcsr=baidu|utmccn=(organic)|utmcmd=organic',
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
      let result = data.map(item => {
        return getTopicDetail(item.href, baseUrl)
      })
      return Promise.all(result)
    })
    .then(data => {
      data.forEach(item => {
        downloadPics(item)
      })
    })
    .catch(err => {
      console.log(err)
    })
}

init()
