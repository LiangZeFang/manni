var app = getApp();
var cbv = [];
Page({
    data:{
        btnload: false,
        disabled: true
    },
    onLoad: function(e){
        var that = this;
        wx.request({
            url: app.ajaxUrl.server_api_url + '/address',
            // 设置Token头
            header: {"Authorization": "Bearer " + wx.getStorageSync('server_token')},
            method: 'POST',
            success: function(e){
                that.setData({
                    address: e.data
                })
                console.log('get success');
            },
            fail: function(e){
                console.error('get fail');
            }
        })
    },
    checkboxChange: function(e){
        cbv = e.detail.value;
        if(e.detail.value)
            this.setData({
                disabled: false
            })
        else
            this.setData({
                disabled: true
            })
    },
    del: function(e){
        if(cbv){
            wx.showModal({
                title: '提示',
                content: '是否要删除所选地址？',
                success: function (res) {
                    if (res.confirm){
                        wx.request({
                            url: app.ajaxUrl.server_api_url + '/address/del',
                            header: {"Authorization": "Bearer " + wx.getStorageSync('server_token')},
                            method: 'POST',
                            data: {id: cbv},
                            success: function(e){
                                if(e.data.error == 0){
                                    wx.redirectTo({url: '/pages/address/address'});
                                }else{
                                    wx.showModal({
                                        title: '提示',
                                        content: e.data.message,
                                        showCancel: false,
                                        success: function (res) {
                                            if (res.confirm) {
                                                that.setData({
                                                    disabled: false,
                                                    btnload: false
                                                });
                                            }
                                        }
                                    });
                                }
                            },
                            fail: function(e){
                                that.setData({
                                    disabled: false,
                                    btnload: false
                                });
                                console.error('get fail');
                            }
                        })
                    }
                }
            });
        }
        console.log(cbv)
    }
})