/**
 * 疫情防控问卷相关代码
 * */

const request = require('../utils/request')

async function autoSubmit(info, token, wxToken) {
    // console.log(info, token)
    const postData = _assemblePostData(info)
    console.log("postData" + postData)
    const res = await request.post('https://yqfk.dgut.edu.cn/home/base_info/addBaseInfo', postData, {
        headers: {
            authorization: token
        }
    })
    console.log(res)
    if (res.data.hasOwnProperty('code')) {
        if (res.data.code === 200) {
            // 打卡成功
            console.log('INFO: 发送打卡成功微信通知')
            await request.post('https://msg.hsmus.top/notice/' + wxToken, {
                title: '自动打卡: 打卡成功,' + res.data.message,
                content: res.data.message,
                redirectUrl: 'https://yqfk.dgut.edu.cn/loading?access_token=' + token.slice('Bearer '.length)
            })
        } else {
            // 打卡失败
            console.log('INFO: 发送打卡失败微信通知')
            await request.post('https://msg.hsmus.top/notice/' + wxToken, {
                title: '自动打卡: 打卡失败,' + res.data.message,
                content: res.data.message,
                redirectUrl: 'https://yqfk.dgut.edu.cn/loading?access_token=' + token.slice('Bearer '.length)
            })
        }
    }
}

async function getTokenAndInfo(redirectUrl, wxToken) {
    const token = await _getYqfkAuthorizationToken(redirectUrl)
    if (!token) {
        return null
    }
    const info = await _getBaseInfo(token)

    if (info) {
        console.log('INFO: 发送微信通知')
        const dangerArea = await _getDangerArea(token)
        console.log('INFO: ' + dangerArea)
        await request.post('https://msg.hsmus.top/notice/' + wxToken, {
            title: '自动打卡: 基本信息获取成功,' + info['msg'],
            content: info['whitelist']['message'] + ', ' + dangerArea,
            redirectUrl: 'https://yqfk.dgut.edu.cn/loading?access_token=' + token.slice('Bearer '.length)
        })
    }
    return {info, token}
}

/***
 * 通过获取到的信息组装要提交的数据
 * */
function _assemblePostData(info) {
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
}

async function _getDangerArea(token) {
    const {data} = await request.get('https://yqfk.dgut.edu.cn/home/base_info/getImportantArea', {
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
}

async function _getBaseInfo(token) {
    try {
        const {data} = await request.get('https://yqfk.dgut.edu.cn/home/base_info/getBaseInfo', {
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

}

async function _getYqfkAuthorizationToken(requestUrl) {
    const {headers, data} = await request.get(requestUrl)
    if (data.code === 400) {
        console.error("ERROR: " + data.message)
        return null
    }
    await request.get(headers['location']) // 访问一下防止出现401
    const token = 'Bearer ' + /[?&]?access_token=[\w.]+[\\&]?/.exec(headers['location'])[0].split('=')[1]
    console.log('INFO: 获取疫情防控问卷token成功 ' + token)
    return token
}


module.exports = {
    autoSubmit, getTokenAndInfo
}
