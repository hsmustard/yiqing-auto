const axios = require('axios');
const cheerio = require('cheerio')


const request = axios.create({
    timeout: 10000,
    headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'referer': 'http://yqfk.dgut.edu.cn/'
    },

    // 防止抓不到location头信息
    maxRedirects: 0,
    validateStatus: function (status) {
        return status >= 200 && status < 303;
    },
});


async function getCasLoginToken(username, password) {
    const casInfo = await _getCasTokenAndCookies()
    const loginData = {
        username: username,
        password: password,
        __token__: casInfo['token'],
        wechat_verify: ''
    }
    const url = 'https://cas.dgut.edu.cn/home/Oauth/getToken/appid/illnessProtectionHome/state/home.html';
    const loginRes = await request.post(url, loginData, {
        headers: {
            'Cookie': casInfo['cookies']
        }
    })
    // console.log(loginRes.data)
    if (loginRes.data['code'] === 1) {
        console.log("INFO: cas登录成功")
        return loginRes.data['info']
    }
    return null
}

async function _getCasTokenAndCookies() {
    const casRes = await request.get("https://cas.dgut.edu.cn/home/Oauth/getToken/appid/illnessProtectionHome/state/home.html")
    const token = /var token = "\w{32}/.exec(casRes.data)[0].slice('var token = "'.length)
    console.log('INFO: cas token 获取成功：' + token)
    return {
        token,
        cookies: casRes.headers['set-cookie']
    }
}

module.exports = {
    getCasLoginToken
}
