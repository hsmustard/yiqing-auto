/***********************
 *    Request
 * ********************/

const axios = require('axios');

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
})


/***********************
 *     Yqfk
 * ********************/

const Yqfk = {
    /**
     * 疫情防控问卷相关代码
     * */
    async autoSubmit(info, token, wxToken) {
        // console.log(info, token)
        await request.get('http://yqfk.dgut.edu.cn/home/base_info/getGPSAddress?longitude=113.86965&latitude=22.90167&reject=1', {
            headers: {
                authorization: token
            }
        })
        const postData = Yqfk._assemblePostData(info)
        // console.log("postData" + postData)
        const res = await request.post('http://yqfk.dgut.edu.cn/home/base_info/addBaseInfo', postData, {
            headers: {
                authorization: token
            }
        })
        console.log(res.data)
        if (res.data.hasOwnProperty('code')) {
            if (res.data.code === 200) {
                // 打卡成功
                console.log('INFO: 发送打卡成功微信通知')
                await request.post('https://msg.hsmus.top/notice/' + wxToken, {
                    title: '自动打卡: 打卡成功,' + res.data.message,
                    content: res.data.message,
                    redirectUrl: 'http://yqfk.dgut.edu.cn/loading?access_token=' + token.slice('Bearer '.length)
                })
            } else {
                // 打卡失败
                console.log('INFO: 发送打卡失败微信通知')
                await request.post('https://msg.hsmus.top/notice/' + wxToken, {
                    title: '自动打卡: 打卡失败,' + res.data.message,
                    content: res.data.message,
                    redirectUrl: 'http://yqfk.dgut.edu.cn/loading?access_token=' + token.slice('Bearer '.length)
                })
            }
        }
    },

    async getTokenAndInfo(redirectUrl, wxToken) {
        const token = await Yqfk._getYqfkAuthorizationToken(redirectUrl)
        if (!token) {
            return null
        }
        const info = await Yqfk._getBaseInfo(token)

        if (info) {
            console.log('INFO: 发送微信通知')
            const dangerArea = await Yqfk._getDangerArea(token)
            console.log('INFO: ' + dangerArea)
            await request.post('https://msg.hsmus.top/notice/' + wxToken, {
                title: '自动打卡: 基本信息获取成功,' + info['msg'],
                content: info['whitelist']['message'] + ', ' + dangerArea
            })
        }
        return {info, token}
    },

    /***
     * 通过获取到的信息组装要提交的数据
     * */
    _assemblePostData(info) {
        const postData = JSON.parse(JSON.stringify(info)) // 深拷贝
        delete (postData.can_submit)
        delete (postData.continue_days)
        delete (postData.importantAreaMsg)
        delete (postData.msg)
        delete (postData.name)
        delete (postData.whitelist)
        if (postData.important_area.length === 0) {
            postData.important_area = null
        }
        if (postData.current_region.length === 0) {
            postData.current_region = null
        }
        return postData
    },

    async _getDangerArea(token) {
        const {data} = await request.get('http://yqfk.dgut.edu.cn/home/base_info/getImportantArea', {
            headers: {
                authorization: token
            }
        })
        if (data.code === 200) {
            let res = '重点区域：'
            for (let i = 0, len = data.info.length; i < len; i++) {
                res += data.info[i].label + ','
            }
            return res
        }
        return ''
    },

    async _getBaseInfo(token) {
        try {
            const {data} = await request.get('http://yqfk.dgut.edu.cn/home/base_info/getBaseInfo', {
                headers: {
                    authorization: token
                }
            })
            console.log("_getBaseInfo " + data.message)
            if (data.code === 200) {
                console.log("INFO: " + data.message)
                return data.info
            }
        } catch (e) {
            console.log('ERROR: 打卡登录失败，正在重试...')
        }
        return false

    },

    async _getYqfkAuthorizationToken(requestUrl) {
        const {headers, data} = await request.get(requestUrl)
        if (data.code === 400) {
            console.error("ERROR: " + data.message)
            return null
        }
        await request.get(headers['location']) // 访问一下防止出现401
        const token = 'Bearer ' + /[?&]?access_token=[\w.]+[\\&]?/.exec(headers['location'])[0].split('=')[1]
        console.log('INFO: 获取疫情防控问卷token成功 ' + token.slice(0, 10))
        return token
    }
}


/***********************
 *     Login
 * ********************/


const Login = {
    async getCasLoginToken(loginInfo) {
        const casInfo = await Login._getCasTokenAndCookies()
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

    },
    async _getCasTokenAndCookies() {
        const casRes = await request.get("https://cas.dgut.edu.cn/home/Oauth/getToken/appid/illnessProtectionHome/state/home.html")
        const token = /var token = "\w{32}/.exec(casRes.data)[0].slice('var token = "'.length)
        console.log('INFO: cas token 获取成功：' + token.slice(3, 8))
        return {
            token,
            cookies: casRes.headers['set-cookie']
        }
    }
}


/***********************
 *    Main
 * ********************/

async function run(arguments) {
    const loginInfo = {
        username: arguments.username,
        password: arguments.password,
        wx_token: arguments.wx_token
    }
    await _loginCasAndYqfk(loginInfo, Yqfk.autoSubmit, loginInfo.wx_token)
}

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
    console.log("信息获取成功", info.msg, token.slice(0, 10))
    try {
        callback && await callback(info, token, wxToken)
    } catch (e) {
        // 如果打卡失败了 就重新整
        console.log("ERROR: 打卡失败了 重新整")
        return await _loginCasAndYqfk(loginInfo, callback, wxToken);
    }

    return {
        info, token
    }
}


/***********************
 *    Exports
 * ********************/

exports.main = async (event = {}, context) => {
    await run(process.env);
    return "ok";
};

