<div align="center"> 
<h1 align="center">
自动打卡（提醒）工具
</h1>

[![GitHub stars](https://img.shields.io/github/stars/hsmustard/yiqing-auto?style=flat-square)](https://github.com/hsmustard/yiqing-auto/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/hsmustard/yiqing-auto?style=flat-square)](https://github.com/hsmustard/yiqing-auto/network)
[![GitHub issues](https://img.shields.io/github/issues/hsmustard/yiqing-auto?style=flat-square)](https://github.com/hsmustard/yiqing-auto/issues)
[![GitHub license](https://img.shields.io/github/license/hsmustard/yiqing-auto?style=flat-square)](https://github.com/hsmustard/yiqing-auto/blob/main/LICENSE) 
[![GitHub All Releases](https://img.shields.io/github/downloads/hsmustard/yiqing-auto/total?style=flat-square)](https://github.com/hsmustard/yiqing-auto/releases)
[![GitHub contributors](https://img.shields.io/github/contributors/hsmustard/yiqing-auto?style=flat-square)](https://github.com/hsmustard/yiqing-auto/graphs/contributors)

</div>

## 工具简介 
这是一个利用GitHub Action定时任务实现每日自动打卡、确认的工具。仅供学习交流使用，请每天自觉认真打卡。

## 使用步骤
### 0.首先，如果您没有github账户，您需要先注册一个。

### 1.star & fork 本项目 
![fork本项目于](https://s1.ax1x.com/2020/10/28/B1uyWV.png)

## 1.1 开启Actions (新用户才操作)
  - 点击Action，再点击I understand my workflows, go ahead and enable them

![开启Actions](https://s1.ax1x.com/2020/10/28/B1Ax2Q.png)


### 2. 创建Secret

 > 其中WX_TOKEN的创建方式为：
 >  1. 访问[Server Message](https://msg.hsmus.top/)
 >  2. 扫码关注公众号，第一次扫码是关注，关注后刷新网页再次扫码即可
 >  3. 获取WX_TOKEN(如：`https://msg.hsmus.top/notice/xxxxxxxxx` 中的 `xxxxxxxx` 即为 `WX_TOKEN` )

 ![创建Secret](https://s1.ax1x.com/2020/10/27/BlrQkq.png)



### 3. 修改打卡时间（可选操作，建议尽量修改，以免大家挤在同一时间导致失败）

 **建议修改时间段为凌晨2:00 - 6:00 人流少的时候**
 
 **建议修改时间段为凌晨2:00 - 6:00 人流少的时候**
 
 **建议修改时间段为凌晨2:00 - 6:00 人流少的时候**
 
![修改时间1](https://s1.ax1x.com/2020/10/27/Bls8UI.png)

![修改时间2](https://s1.ax1x.com/2020/10/27/BlsoI1.jpg)

> 时间修改方式
> 30 2 * * * 代表 每天凌晨2:30分（非北京时间，北京时间需要往后推8小时），即 第一位为分钟，第二位为小时，后面的*不建议修改

**注意：此处是UTC时间，比北京时间早8小时。**

参考配置：
 |   配置时间      | 北京时间  |
 | --------      | -------- |
 | `18 17 * * *` |  1:18    |
 | `32 18 * * *` |  2:32    |
 | `47 18 * * *` |  2:47    |
 | `13 19 * * *` |  3:13    |
 | `22 22 * * *` |  6:22    |
 | `22 23 * * *` |  7:22    |
 | `53 23 * * *` |  7:53    |

参考链接：
[Github Action 定时任务](https://docs.github.com/cn/free-pro-team@latest/actions/reference/events-that-trigger-workflows#%E8%AE%A1%E5%88%92)

### 4. 任意添加一个文件
 - ![添加文件1](http://www.s3tu.com/images/2020/10/27/add475d1.png)
--------
 - ![添加文件2](https://s1.ax1x.com/2020/10/27/BlDYdI.png)


### 5.大功告成
完成到这一步代表你是一个优秀的人，以后每天只需要留意微信服务号 `服务消息助手` 的通知即可。



[1]: https://docs.github.com/cn/free-pro-team@latest/actions/reference/events-that-trigger-workflows#%E8%AE%A1%E5%88%92
