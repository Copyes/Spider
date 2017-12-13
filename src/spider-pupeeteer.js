const puppeteer = require('puppeteer')

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
puppeteer
  .launch({ headless: false })
  .then(async browser => {
    let page = await browser.newPage()
    page.setViewport({
      width: 1200,
      height: 600
    })

    // 获取sf上的文章
    try {
      await page.goto('https://segmentfault.com/news/frontend')
      await sleep(1000)
      var sfArticleList = await page.evaluate(() => {
        var list = [
          ...document.querySelectorAll('.news__list .news__item-title a')
        ]

        return list.map(el => {
          return { href: el.href.trim(), title: el.innerText }
        })
      })

      // console.log('SfFeArticleList:', sfArticleList)
      // 截屏
      await page.screenshot({ path: './dist/screen-shot/sf.png', type: 'png' })
    } catch (e) {
      console.log('sf err:', e)
    }

    // 登陆掘金
    try {
      await sleep(1000)
      await page.goto('https://juejin.im')
      await sleep(1000)

      let login = await page.$('.login')
      await login.click()

      let username = await page.$('[name=loginPhoneOrEmail]')
      await username.click()
      await page.type('[name=loginPhoneOrEmail]', '你的掘金账号', {
        delay: 20
      })

      let password = await page.$('[name=loginPassword]')
      await password.click()
      await page.type('[name=loginPassword]', '你的掘金密码', { delay: 20 })

      let loginBtn = await page.$('.panel .btn')
      await loginBtn.click()
    } catch (e) {
      console.log('juejin err:', e)
    }

    // 随机选一篇文章发布到掘金

    try {
      await sleep(3000)
      let seed = Math.floor(Math.random() * 30)
      let theArtile = sfArticleList[seed]

      await page.goto('https://juejin.im/new-entry')

      await sleep(2500)
      let shareUrl = await page.$('.entry-form-input .url-input')
      await shareUrl.click()
      await page.type('.entry-form-input .url-input', theArtile.href, {
        delay: 20
      })
      await sleep(1000)

      let shareTitle = await page.$('.entry-form-input .title-input')
      await shareTitle.click()
      await page.type('.entry-form-input .title-input', theArtile.title, {
        delay: 20
      })

      await sleep(1000)
      let shareDesc = await page.$('.entry-form-input .description-input')
      await shareDesc.click()
      await page.type('.entry-form-input .description-input', theArtile.title, {
        delay: 20
      })

      await page.evaluate(() => {
        let li = [
          ...document.querySelectorAll(
            '.category-list-box .category-list .item'
          )
        ]
        li.forEach(el => {
          if (el.innerText == '前端') el.click()
        })
      })

      let submitBtn = await page.$('.submit-btn')
      await submitBtn.click()
    } catch (e) {
      console.log(e)
      await page.screenshot({ path: './dist/screen-shot/err.png', type: 'png' })
    }
    await page.screenshot({ path: './dist/screen-shot/done.png', type: 'png' })
  })
  .catch(err => {
    console.log(err)
  })
