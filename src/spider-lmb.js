const request = require('request')
const moment = require('moment')
const crypto = require('crypto')
// const zlib = require('zlib')
// const gunzipStream = zlib.createGunzip()
const http = require('http')
const fs = require('fs')
const path = require('path')
// md5加密
const md5 = text => {
  return crypto
    .createHash('md5')
    .update(text)
    .digest('hex')
}

const app_key = '97147148'
const secret = 'f46f623b35359dfd4e347cbdb2959656'
//蚂蚁动态代理的相关host
const host = 's2.proxy.mayidaili.com'
const port = '8123'
//待抓取对网址（不带http://前缀）
// const path = 'www.XXX.com'

const keygen = {
  app_key: app_key,
  timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
}
// 生成签名
const getKey = () => {
  var list = [secret]
  var param = []
  for (var p in keygen) {
    str = p + '' + keygen[p]
    list.push(str)
  }
  for (var p in keygen) {
    str = p + '=' + keygen[p]
    param.push(str)
  }
  list.push(secret)
  var m5 =
    'MYH-AUTH-MD5 sign=' +
    md5(list.join('')).toUpperCase() +
    '&' +
    param.join('&')
  return m5
}

let baseUrl =
  'http://121.52.225.16/zaojiao-milestone/index?IDFA=AE930065-0B3B-4179-BB4D-58B5CA0C17E3&IDFV=EFBA7C65-2879-4CBE-A1FC-4D3FC4EAD88E&client_flag=lmbang&client_ver=7.5.20&device_id=287b850b42b2166e846c530b29c467da5e1652e2&device_model=iPhone%207&market=App%20Store&mvc=1&network_type=4g&op_company=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&os=ios&os_ver=11.1&respond_type=750x1334&timestamp=1512722806&v=1&sign=3879692e51021cf4a867f57b638f9bdc&'

// 增加相关header信息
const defaultHeader = url => {
  return {
    method: 'GET',
    url: url,
    // path: url,
    host: host,
    port: port,
    headers: {
      Accept: '*/*',
      'Accept-Language': 'zh-Hans-CN;q=1',
      Host: 'open.lmbang.com',
      'Proxy-Authorization': getKey(),
      // Referer:
      //   'https://www.douban.com/group/search?cat=1019&q=%E8%AF%B7%E4%B8%8D%E8%A6%81%E5%AE%B3%E7%BE%9E',
      Cookie:
        't_skey=00a0208618a5725eac158c268afe186f;LMB_AUTH_CODE=00a0208618a5725eac158c268afe186f;__TOKEN_NEW=SESS_8edfBxpL3UdVUFZjvFpTbhOwfUFZA%2BA54zgrb71utx1fbYeReJLAkJORilrmT5%2BUWQDADXXBNc3c4DcnxESA5EnZYxnFLky9QBZuV3KHeJbrPd7cNpZ1eo8',
      'User-Agent':
        'LMBangModuleMainAppStore/7.5.20 (iPhone; iOS 11.1.2; Scale/2.00)'
    }
  }
}
// 获取辣妈帮早教课堂主页的数据
const getIndexCourses = () => {
  let url =
    'http://121.52.225.16/zaojiao-milestone/index?IDFA=AE930065-0B3B-4179-BB4D-58B5CA0C17E3&IDFV=EFBA7C65-2879-4CBE-A1FC-4D3FC4EAD88E&client_flag=lmbang&client_ver=7.5.20&device_id=287b850b42b2166e846c530b29c467da5e1652e2&device_model=iPhone%207&market=App%20Store&mvc=1&network_type=4g&op_company=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&os=ios&os_ver=11.1&respond_type=750x1334&timestamp=1512722806&v=1&sign=3879692e51021cf4a867f57b638f9bdc&'
  return new Promise((resolve, reject) => {
    request(defaultHeader(url), (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(body)
      }
    })
  })
}
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
// 保存首页的数据
const saveIndexData = data => {
  fs.writeFileSync(
    path.join(__dirname, '../dist/index.json'),
    JSON.stringify(JSON.parse(data)),
    {
      encoding: 'utf8'
    }
  )
  console.log('Save finished!')
}
// 每个年龄段的数据
const saveStageData = (data, name) => {
  fs.writeFileSync(
    path.join(__dirname, `../dist/${name}.json`),
    JSON.stringify(JSON.parse(data)),
    {
      encoding: 'utf8'
    }
  )
  console.log('Save finished!')
}
// 保存每个任务相关的数据
const saveTaskData = data => {
  fs.writeFileSync(
    path.join(__dirname, '../dist/stage.json'),
    JSON.stringify(JSON.parse(data)),
    {
      encoding: 'utf8'
    }
  )
  console.log('Save finished!')
}
// 获取单个年龄阶段的数据
const getAgeStageCourses = ageId => {
  let url = `http://121.52.225.24/zaojiao-milestone/showmsbyageid?IDFA=AE930065-0B3B-4179-BB4D-58B5CA0C17E3&IDFV=EFBA7C65-2879-4CBE-A1FC-4D3FC4EAD88E&age_id=${ageId}&client_flag=lmbang&client_ver=7.5.20&device_id=287b850b42b2166e846c530b29c467da5e1652e2&device_model=iPhone%207&market=App%20Store&mvc=1&network_type=4g&op_company=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&os=ios&os_ver=11.1&respond_type=750x1334&timestamp=1512959721&v=1&sign=126c4f9198c070f8515709066e7ddbc4&`
  return new Promise((resolve, reject) => {
    request(defaultHeader(url), (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(body)
      }
    })
  })
}
// 获取整个课程的任务
const getCourseTask = taskId => {
  let url = `http://121.52.225.24/zaojiao-milestone/taskinfo?IDFA=AE930065-0B3B-4179-BB4D-58B5CA0C17E3&IDFV=EFBA7C65-2879-4CBE-A1FC-4D3FC4EAD88E&client_flag=lmbang&client_ver=7.5.20&device_id=287b850b42b2166e846c530b29c467da5e1652e2&device_model=iPhone%207&market=App%20Store&mvc=1&network_type=4g&op_company=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&os=ios&os_ver=11.1&respond_type=750x1334&taskid=${taskId}&timestamp=1512959787&uid=31990221&v=1&sign=f1269226ce5645cf87c01eb0575cc2b8&`
  return new Promise((resolve, reject) => {
    request(defaultHeader(url), (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(body)
      }
    })
  })
}
;(async () => {
  let ageStages = await getIndexCourses()
  saveIndexData(ageStages)
  let indexData = JSON.parse(ageStages)
  let stageArr = indexData.data.age_stage
  for (let i = 0; i < stageArr.length; ++i) {
    sleep(1000)
    let course = await getAgeStageCourses(stageArr[i].id)
    saveStageData(course, stageArr[i].name)
  }
})()
