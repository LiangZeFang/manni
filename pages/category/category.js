//index.js
//获取应用实例
var app = getApp()
Page({
        data: {
            "copyright": app.globalData.support
        },
        onLoad: function (res) {
            wx.showLoading({title: '努力加载中'});
            this.setData({
                currentTab: res.po != undefined ? res.po : 'normal'
            });
            var that = this;
            var datas = {'wx_xcx': 'yes', 'f': 'product', 'p': 0}; // p为父级tid
            if(res.po != undefined){
                datas = {wx_xcx: 'yes', 'po': res.po};
            }
            wx.request({
                url: app.ajaxUrl.url_category,
                data: datas,
                dataType: 'json',
                method: 'GET',
                success: function(resp){
                  console.log(resp.data)
                    that.setData({
                        category: resp.data
                    });
                },
                complete: function(){
                    wx.hideLoading();
                }
            })
        },
})
