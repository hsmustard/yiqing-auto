const Login = require('./src/login');
const Yqfk = require('./src/yqfk');


(async function run() {
    const arguments = process.argv.splice(2);
    if (arguments.length === 0) {
        console.error("ERROR: 命令格式: node app.js 学号 密码 微信通知token")
        return
    }
    const loginInfo = {
        username: arguments[0],
        password: arguments[1],
        wx_token: arguments[2]
    }
    await _loginCasAndYqfk(loginInfo, Yqfk.autoSubmit, loginInfo.wx_token)
})()

async function _loginCasAndYqfk(loginInfo, callback, wxToken) {
    const redirectLoginUrl = await Login.getCasLoginToken(loginInfo)
    if (!redirectLoginUrl) {
        console.error("ERROR: 登录错误，可能是账号密码不正确！")
        return null
    }
    const {info, token} = await Yqfk.getTokenAndInfo(redirectLoginUrl, loginInfo.wx_token)
    if (!info) {
        // 登录失败
        setTimeout(async function () {
            await _loginCasAndYqfk(loginInfo, callback, wxToken);
        }, 2000)
        return null
    }
    console.log("信息获取成功", info.name, token.slice(0, 8))
    callback && await callback(info, token, wxToken)
    return {
        info, token
    }
}
