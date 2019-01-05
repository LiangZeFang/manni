var app = getApp();
var Zan = require('../../widget/quantity/index');
var WxParse = require('../../wxParse/wxParse.js');
var template = require('../../tabbar/tabbar.js');
var arrcoupon=[];
var storageArr = [];
Page({
  /**
   * 页面的初始数据
   */
  data: {
    text: "这是一条会滚动的文字滚来滚去这是一条会滚动的文字滚来滚去的文字跑马灯，不错哟的文字跑马灯，不错哟",
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    marquee_margin: 30,
    size: 14,
    interval: 20 // 时间间隔
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that = this;
      template.tabbar("tabBar",0, this)//1表示第二个tabbar
      that.getMessage('message');
      that.getBanner('banner');
      that.getBtn('index-btn');
      that.getHot('product');
      that.getFashion('list');
      that.getluxury('list');
      that.getNewarrival('list');
      that.getExplosive('list');
      that.getCoupon('coupon');
  },
  getBanner(banner){
      var that = this;
      wx.request({
          url: app.ajaxUrl.server_api_url+banner,
          method:'POST',
          header:{'content-type':'application/json'},
          success(res){
              that.setData({
                banner:res.data.banners
              })
          }
      })
  },
  getBtn(btn){
      var that = this;
      wx.request({
          url: app.ajaxUrl.server_api_url + btn,
          method: 'POST',
          header: {
              'content-type': 'application/json'
          },
          success(res) {
              that.setData({
                  topicList: res.data.custom_lists
              })
          }
      })
  },
    getCoupon(cucoupons){
      var that = this;
      setTimeout(function(){
          wx.request({
              url: app.ajaxUrl.server_api_url + 'coupon',
              header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
              method: 'POST',
              success(res) {
                  var obj = {};
                  console.log(res);
                  for (var i = 0; i < res.data.data.length; i++) {
                      if (!obj[res.data.data[i].coupon_id]) {
                          arrcoupon.push(res.data.data[i]);
                          arrcoupon = arrcoupon.slice(0, 2)
                          obj[res.data.data[i].coupon_id] = true;
                      }

                      var o = res.data.data[i].coupon_off.split('.00');
                      res.data.data[i].coupon_off = o[0];
                      var a = res.data.data[i].coupon_threshold.split('.00');
                      res.data.data[i].coupon_threshold = a[0]
                  }
                  if (wx.getStorageSync('coupon')) {
                      var coupon = wx.getStorageSync('coupon');
                      for (var i = 0; i < arrcoupon.length; i++) {
                          for (var j = 0; j < coupon.length; j++) {
                              if (arrcoupon[i].coupon_id == coupon[j].coupon_id) {
                                  if (coupon[j].is_use == "Y") {
                                      arrcoupon[i].is_use = "Y";
                                  }
                              }
                          }
                      }
                  }
                  that.setData({
                      cucoupon: arrcoupon
                  })
              }
          })
      },1500)
  },
  cucoupon(e){
      console.log(this)
      var coupon = arrcoupon.find((item) => item.coupon_id == e.currentTarget.dataset.id);
          console.log(coupon)
          coupon.is_use = 'Y';
      for (var i = 0; i < arrcoupon.length; i++) {
          if (coupon.coupon_id == arrcoupon[i].coupon_id) {
                  if (coupon.is_use == "Y") {
                      arrcoupon[i].is_use = "Y";
                      this.setData({
                          cucoupon: arrcoupon
                      })
                  }
              }
          }
          if (wx.getStorageSync('coupon')) {
              storageArr = wx.getStorageSync('coupon')
          }

          if (storageArr.length < 1) {
              storageArr[0] = coupon
              console.log(storageArr)
              wx.setStorage({
                  key: 'coupon',
                  data: storageArr,
              })
              wx.showToast({
                  title: '领取成功',
                  duration: 2000
              })
          } else {
              var result = [];
              var obj = {};
              wx.getStorage({
                  key: 'coupon',
                  success: function (res) {
                      console.log(res.data)
                      res.data.push(coupon)
                      storageArr = res.data;
                      for (var i = 0; i < storageArr.length; i++){
                          if (!obj[storageArr[i].coupon_id]) {
                              result.push(storageArr[i]);
                              obj[storageArr[i].coupon_id] = true;
                          }
                      }
                      wx.setStorage({
                          key: 'coupon',
                          data: result,
                      })
                      console.log(result)
                      wx.showToast({
                          title: '领取成功',
                          duration: 2000
                      })
                  }
              })
          }
  },
  getMessage(message){
      var that = this;
      wx.request({
          url: app.ajaxUrl.url_custom,
          method: 'POST',
          data:{
              cid:2,
              ct:'wxxcx',
              cty:message
          },
          header: {'content-type': 'application/json'},
          success(res) {
              that.setData({
                  information: res.data.base.custom_synopsis
              })
          }
      })
  },
  getHot(product){
      var that = this;
      wx.request({
          url: app.ajaxUrl.url_custom,
          method:'POST',
          header: { 'content-type': 'application/json' },
          data:{
              ct: 'wxxcx',
              cid:2,
              cty:product
          },
          success(res){
              console.log(res)
              for(var i = 0; i<res.data.info.length;i++){
                  var o = res.data.info[i].price.split('.00')
                  res.data.info[i].price = o[0]
              }
              that.setData({
                  product:res.data.info,
                  hotname: res.data.base
              })
              if (res.data.base.custom_name) {
                  WxParse.wxParse('custom_name', 'html', res.data.base.custom_name, that, 5);
              }
          }
      })
  },
  getFashion(list){
      var that = this;
      wx.request({
          url: app.ajaxUrl.url_custom,
          method: 'POST',
          header: { 'content-type': 'application/json' },
          data: {
              ct: 'shop',
              cid: 1,
              cty: list
          },
          success(res) {
              that.setData({
                  fashion: res.data.info,
                  fashion_name: res.data.base
              })
              if (res.data.base.custom_synopsis) {
                  WxParse.wxParse('custom_synopsis', 'html', res.data.base.custom_synopsis, that, 5);
              }
          }
      })
  },
  getluxury(list) {
        var that = this;
        wx.request({
            url: app.ajaxUrl.url_custom,
            method: 'POST',
            header: { 'content-type': 'application/json' },
            data: {
                ct: 'shop',
                cid: 2,
                cty: list
            },
            success(res) {
                that.setData({
                    luxury: res.data.info,
                    luxury_name: res.data.base
                })
                if (res.data.base.custom_synopsis) {
                    WxParse.wxParse('luxury_custom', 'html', res.data.base.custom_synopsis, that, 5);
                }
            }
        })
  },
  getNewarrival(list) {
        var that = this;
        wx.request({
            url: app.ajaxUrl.url_custom,
            method: 'POST',
            header: { 'content-type': 'application/json' },
            data: {
                ct: 'pc',
                cid: 13,
                cty: list
            },
            success(res) {
                that.setData({
                    Newarrival: res.data.info,
                    Newarrival_name: res.data.base
                })
                if (res.data.base.custom_name) {
                    WxParse.wxParse('Newarrival_custom', 'html', res.data.base.custom_name, that, 5);
                }
            }
        })
  },
  getExplosive(list) {
        var that = this;
        wx.request({
            url: app.ajaxUrl.url_custom,
            method: 'POST',
            header: { 'content-type': 'application/json' },
            data: {
                ct: 'wxxcx',
                cid: 2,
                cty: list
            },
            success(res) {
                that.setData({
                    Explosive: res.data.info,
                    Explosive_name: res.data.base
                })
                if (res.data.base.custom_desc) {
                    WxParse.wxParse('Explosive_custom', 'html', res.data.base.custom_desc, that, 5);
                }
            }
        })
  },
  onShow: function () {
    // 页面显示
    var that = this;
    var length = that.data.text.length * that.data.size;//文字长度
    var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
    //console.log(length,windowWidth);
    that.setData({
      length: length,
      windowWidth: windowWidth
    });
    that.scrolltxt();// 第一个字消失后立即从右边出现
  },

  scrolltxt: function () {
    var that = this;
    var length = that.data.length;//滚动文字的宽度
    var windowWidth = that.data.windowWidth;//屏幕宽度
    if (length > windowWidth) {
      var interval = setInterval(function () {
        var maxscrollwidth = length + that.data.marquee_margin;//滚动的最大宽度，文字宽度+间距，如果需要一行文字滚完后再显示第二行可以修改marquee_margin值等于windowWidth即可
        var crentleft = that.data.marqueeDistance;
        if (crentleft < maxscrollwidth) {//判断是否滚动到最大宽度
          that.setData({
            marqueeDistance: crentleft + that.data.marqueePace
          })
        }
        else {
          //console.log("替换");
          that.setData({
            marqueeDistance: 0 // 直接重新滚动
          });
          clearInterval(interval);
          that.scrolltxt();
        }
      }, that.data.interval);
    }
    else {
      that.setData({ marquee_margin: "1000" });//只显示一条不滚动右边间距加大，防止重复显示
    }
    },
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    search: function (e) {
        wx.navigateTo({
            url: '../plist/plist?search=' + e.detail.value
        })
        console.log(e.detail.value);
    },
})