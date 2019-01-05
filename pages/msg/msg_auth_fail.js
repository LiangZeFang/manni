var app = getApp();
Page({
    data: {
        msg: '由于您拒绝授权予系统，将无法进行下一步的操作。若要使用购物或者个人中心等功能，请先授权后再进行操作。',
        copyright: app.globalData.support
    },
    rebackindex: function(e){
        wx.reLaunch({
            url: "../index/index"
        })
    },
    authagen: function(e){
        wx.openSetting({
            success: function(data){
                wx.getUserInfo({
                    success: function(res) {
                        wx.reLaunch({
                            url: "../me/me"
                        })
                    },
                    fail: function(res){
                        wx.navigateTo({
                            url: "../msg/msg_auth_fail"
                        })
                    }
                })
            }
        })
    }
});