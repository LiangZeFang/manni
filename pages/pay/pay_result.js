var app = getApp();
Page({
    data:{
        message: '未知错误'
    },
    onLoad: function(res){
        var that = this;
        wx.request({
            url: app.ajaxUrl.server_api_url + '/query',
            data: {id: res.oid},
            method: 'POST',
            dataType: 'json',
            success: function(e){
                if(e.data.error != 0){
                    that.setData({
                        pay_success: false,
                        pay_fail: true,
                        message: e.data.message
                    })
                    if(e.data.message)
                        that.setData({
                            message: e.data.message
                        })
                }else{
                    that.setData({
                        pay_success: true,
                        pay_fail: false
                    })
                }
            },
            fail: function(){
                that.setData({
                    pay_success: false,
                    pay_fail: true,
                    message: '未知错误'
                })
            }
        })
    }
})