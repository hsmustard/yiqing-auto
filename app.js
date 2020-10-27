const Login = require('./src/login');

(async function run() {
    const arguments = process.argv.splice(2);
    if (arguments.length === 0) {
        console.error("ERROR: 命令格式: node app.js 学号 密码")
        return
    }
    const redirectLoginUrl = await Login.getCasLoginToken(arguments[0], arguments[1])
    console.log(redirectLoginUrl)
})()
