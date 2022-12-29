const util = require('../../utils/util.js')
const templateId = 'OFEAr11jqhgpU_imwX6A7xTy2ckcxRMNa3kE8-d7CQI'
const defaultLogName = {
  work: '正事',
  rest: '钓鱼'
}
const encourageFishTip = ', 让我们尽情来钓一把鱼？'
const defaultFishTip = '晴空万里，醉翁心情正好' + encourageFishTip
const actionName = {
  stop: '结束',
  start: '开始'
}
const initDeg = {
  left: 45,
  right: -45,
}

Page({

  data: {
    remainTimeText: '',
    timerType: 'work',
    log: {},
    completed: false,
    isRuning: false,
    leftDeg: initDeg.left,
    rightDeg: initDeg.right,
    vibison: '',
    fishTip: '',
    secondFisherName: '老深',
    // 是否展示心情输入框
    isShowConfirm: false,
    // 用户今日心情
    user_mood: ''
  },

  //输入框中的值
  setValue: function (e) {
    // 不断更新最新输入的用户心情
    this.setData({
      user_mood: e.detail.value
    })
    console.log('用户输入的钓鱼心情（还没点确认的）：', e.detail.value)
  },
  //点击取消按钮
  cancel: function () {
    var that = this
    that.setData({
      isShowConfirm: false,
    })
  },
  //点击确认按钮
  confirmAcceptance: function () {
    var that = this
    that.setData({
      isShowConfirm: false,

    })
    console.log('用户确认了输入的今日心情: ', this.data.user_mood)
  },


  getUserFishingMood: function (e) {
    console.log('用户输入的今日心情: ', e.detail.value)
  },

  onLoad: function (options) {},

  onShow: function () {
    if (this.data.isRuning) return
    let workTime = util.formatTime(wx.getStorageSync('workTime'), 'HH')
    let restTime = util.formatTime(wx.getStorageSync('restTime'), 'HH')
    this.setData({
      workTime: workTime,
      restTime: restTime,
      remainTimeText: workTime + ':00'
    })
  },

  startTimer: function (e) {
    let startTime = Date.now()
    let startTimeShow = this.getTime() //（安卓与iOS时间显示不一致）转换时间为统一格式显示。
    let isRuning = this.data.isRuning
    let timerType = e.target.dataset.type
    let showTime = this.data[timerType + 'Time']
    let keepTime = showTime * 60 * 1000
    let logName = this.logName || defaultLogName[timerType]
    this.vibshort()
    if (!isRuning) {
      this.timer = setInterval((function () {
        this.updateTimer()
        this.startNameAnimation()
      }).bind(this), 1000)
    } else {
      // 只有点击结束，才弹窗输入心情，点击钓鱼也会走这个函数，但是不弹窗输入心情
      this.setData({
        isShowConfirm: true
      })
      this.stopTimer()
    }

    this.setData({
      isRuning: !isRuning,
      completed: false,
      timerType: timerType,
      remainTimeText: showTime + ':00',
      taskName: logName,
    })

    this.data.log = {
      name: logName,
      startTime: Date.now(),
      startTimeShow: startTimeShow,
      keepTime: keepTime,
      endTime: keepTime + startTime,
      action: actionName[isRuning ? 'stop' : 'start'],
      type: timerType
    }
    this.saveLog(this.data.log)
  },

  startNameAnimation: function () {
    let animation = wx.createAnimation({
      duration: 450
    })
    animation.opacity(0.2).step()
    animation.opacity(1).step()
    this.setData({
      nameAnimation: animation.export()
    })
  },

  stopTimer: function () {
    // reset circle progress
    this.setData({
      leftDeg: initDeg.left,
      rightDeg: initDeg.right
    })
    this.viblong()
    this.timer && clearInterval(this.timer)
    //  震动 ；clear timer
  },

  viblong: function () {
    let vibison = wx.getStorageSync('vibison') //页面传参，以缓存形式
    this.setData({
      vibison: vibison
    })
    if (vibison) { //振动功能的开闭
      wx.vibrateLong()
    } else {}
  },

  vibshort: function () {
    let vibison = wx.getStorageSync('vibison') //页面传参，以缓存形式
    this.setData({
      vibison: vibison
    })
    if (vibison) { //振动功能的开闭
      wx.vibrateShort()
    } else {}
  },

  updateTimer: function () {
    let log = this.data.log
    let now = Date.now()
    let remainingTime = Math.round((log.endTime - now) / 1000)
    let H = util.formatTime(Math.floor(remainingTime / (60 * 60)) % 24, 'HH')
    let M = util.formatTime(Math.floor(remainingTime / (60)) % 60, 'MM')
    let S = util.formatTime(Math.floor(remainingTime) % 60, 'SS')
    let halfTime

    // update text
    if (remainingTime > 0) {
      let remainTimeText = (H === "00" ? "" : (H + ":")) + M + ":" + S
      this.setData({
        remainTimeText: remainTimeText
      })
    } else if (remainingTime == 0) {
      this.setData({
        completed: true
      })
      this.stopTimer()
      return
    }

    // update circle progress
    halfTime = log.keepTime / 2
    if ((remainingTime * 1000) > halfTime) {
      this.setData({
        leftDeg: initDeg.left - (180 * (now - log.startTime) / halfTime)
      })
    } else {
      this.setData({
        leftDeg: -135
      })
      this.setData({
        rightDeg: initDeg.right - (180 * (now - (log.startTime + halfTime)) / halfTime)
      })
    }
  },

  changeFishTip: function (e) {
    let fishTip = defaultFishTip
    if (e.detail.value) {
      fishTip = '醉翁此刻挺' + e.detail.value + encourageFishTip
    }

    this.fishTip = fishTip
    console.log('fishTip: ', this.fishTip)
  },

  saveLog: function (log) {
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(log)
    wx.setStorageSync('logs', logs)
  },
  onShareAppMessage: function (res) {

    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
      return {
        title: '生活需要释放，醉翁钓鱼助你快乐每一天！！',
        path: '/pages/index/index',
        imageUrl: '/image/share.jpg' //不设置则默认为当前页面的截图
      }
    }
  },
  onShareTimeline: function (res) {
    return {
      title: '生活需要释放，醉翁钓鱼助你快乐每一天！！',
      query: {
        // key: 'value' //要携带的参数 
      },
      imageUrl: '/image/about.png'
    }

  },


  getTime() {
    let date1 = new Date();
    let year = this.appendZero(date1.getFullYear());
    let month = this.appendZero(date1.getMonth() + 1)
    let day = this.appendZero(date1.getDate());
    let hours = this.appendZero(date1.getHours());
    let minutes = this.appendZero(date1.getMinutes());
    let seconds = this.appendZero(date1.getSeconds());
    return year + "年 " + month + "月" + day + '日 ' + "\xa0\xa0\xa0" + hours + ":" + minutes + ":" + seconds
  },
  //过滤补0
  appendZero(obj) {
    if (obj < 10) {
      return "0" + obj;
    } else {
      return obj;
    }
  }

})