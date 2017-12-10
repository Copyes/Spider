const request = require('request')
const iconv = require('iconv-lite')
const fs = require('fs')
const path = require('path')
// 获取代理网站的IP列表
const getProxyList = () => {
  var apiURL =
    'http://www.66ip.cn/mo.php?sxb=&tqsl=100&port=&export=&ktip=&sxa=&submit=%CC%E1++%C8%A1&textarea=http%3A%2F%2Fwww.66ip.cn%2F%3Fsxb%3D%26tqsl%3D100%26ports%255B%255D2%3D%26ktip%3D%26sxa%3D%26radio%3Dradio%26submit%3D%25CC%25E1%2B%2B%25C8%25A1'

  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      url: apiURL,
      gzip: true,
      encoding: null,
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
        'User-Agent':
          'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
        referer: 'http://www.66ip.cn/'
      }
    }

    request(options, function(err, res, body) {
      if (err) {
        reject(err)
      }
      try {
        if (/meta.*charset=gb2312/.test(body)) {
          body = iconv.decode(body, 'gbk')
        }
        var ret = body.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,4}/g)
        resolve(ret)
      } catch (e) {
        reject(e)
      }
    })
  })
}
// 将爬下来的IP保存到文件中
const saveData = useful => {
  fs.writeFileSync(
    path.join(__dirname, '../dist/proxys.json'),
    JSON.stringify(useful)
  )
  console.log('Save finished!')
}
const checkIp = ip => {
  return new Promise((resolve, reject) => {
    let targetOptions = {
      method: 'GET',
      url: 'http://ip.chinaz.com/getip.aspx',
      timeout: 2000,
      encoding: null
    }
    targetOptions.proxy = 'http://' + ip
    request(targetOptions, (err, res, body) => {
      if (!err) {
        if (res.statusCode == 200) {
          console.log(res.request['proxy']['href'], 'useful!')
          resolve(res.request['proxy']['href'])
        } else {
          resolve('')
        }
      } else {
        resolve('')
      }
    })
  })
}
;(async () => {
  let ipList = await getProxyList()
  let result = []

  console.log(ipList)
  for (let ip of ipList) {
    console.log(`testing ${ip}`)
    result.push(await checkIp(ip))
  }
  result = result.filter(item => {
    return item !== ''
  })
  saveData(result)
})()
