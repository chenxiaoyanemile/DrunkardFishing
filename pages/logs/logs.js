var util = require('../../utils/util.js')
var wxCharts = require('../../utils/wxcharts.js')
var app = getApp()
var ringChart = null;
var lognum = 0;
var worknum = 0;
var restnum = 0;
Page({
  data: {
    logs: [],
    lognum: '',
    modalHidden: true,
    toastHidden: true,
    switchedGuestId: 0
  },

  // 点击嘉宾事件对应的函数
  focusSingleGuestItem: function () {
    console.log('进入嘉宾详情')
    this.setData({
      switchedGuestId: 1
    })

    console.log('选择的是', this.data.switchedGuestId, '号嘉宾')
  },

  onShow: function () {
    wx.setNavigationBarTitle({
      title: '钓鱼记录'
    })
    var logs = this.getLogs();

    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    // 绘制环形图
    ringChart = new wxCharts({
      animation: true,
      canvasId: 'ringCanvas',
      type: 'ring',
      extra: {
        ringWidth: 20,
        pie: {
          offsetAngle: -45
        }
      },
      title: {
        name: lognum / 2,
        color: '#7cb5ec',
        fontSize: 25
      },
      subtitle: {
        name: '钓鱼次数',
        color: '#666666',
        fontSize: 12
      },
      series: [{
        name: 'work',
        data: worknum / 2,
        stroke: true,
        color: '#3596f1'
      }, {
        name: 'rest',
        data: restnum / 2,
        stroke: false,
        color: '#0fc975'
      }],
      disablePieStroke: true,
      width: windowWidth * 0.96,
      height: 170,
      dataLabel: false,
      legend: false,
      background: '#f5f5f5',
      padding: 0,
    });
    ringChart.addEventListener('renderComplete', () => {
      console.log('绘图完成');
    });
    setTimeout(() => {
      ringChart.stopAnimation();
    }, 500);
  },
  set: function () {

  },
  getLogs: function () {
    let logs = wx.getStorageSync('logs')
    worknum = 0;
    restnum = 0;
    lognum = 0;
    logs.forEach(
      function (item, index, arry) {
        item.startTime = new Date(item.startTime).toLocaleString()
        lognum++;
        if (item.type == 'work') {
          worknum++
        };
        if (item.type == 'rest') {
          restnum++
        };
      }
    )
    this.setData({
      logs: logs
    })

  },
  onLoad: function () {},
  switchModal: function () {
    this.setData({
      modalHidden: !this.data.modalHidden
    })
    lognum = 0;
    worknum = 0;
    restnum = 0;
  },
  hideToast: function () {
    this.setData({
      toastHidden: true
    })
  },
  clearLog: function (e) {
    wx.setStorageSync('logs', [])
    this.switchModal()
    this.setData({
      toastHidden: false
    })
    this.getLogs()
    wx.vibrateShort()
  },
  goposter() {
    let t = this.data.worknum;
    wx.navigateTo({
      url: `/pages/poster/poster?lognum=${lognum}`
    })
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
  }

})