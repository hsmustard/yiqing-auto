const request = require('../utils/request')

async function getCasLoginToken(loginInfo) {
    const casInfo = await _getCasTokenAndCookies()
    const loginData = {
        username: loginInfo.username,
        password: loginInfo.password,
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
    } else {
        console.error(loginRes.data.message)
        return null
    }

}

async function _getCasTokenAndCookies() {
    const casRes = await request.get("https://cas.dgut.edu.cn/home/Oauth/getToken/appid/illnessProtectionHome/state/home.html")
    const token = /var token = "\w{32}/.exec(casRes.data)[0].slice('var token = "'.length)
    console.log('INFO: cas token 获取成功：' + token.slice(3, 8))
    return {
        token,
        cookies: casRes.headers['set-cookie']
    }
}

module.exports = {
    getCasLoginToken
}
