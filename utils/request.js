const axios = require('axios');

module.exports = axios.create({
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
