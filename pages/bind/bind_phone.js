var app = getApp();
var tipNum = true;
var x = 120;
var mobile;
Page({
    data: {
        vcode: '获取验证码',
        color: '#f31',
        btnStyle: 'default',
        disabled: true,
        btnload: false
    },
    getPhoneNumber: function (e) {
        console.log(e.detail)
        console.log(e.detail.iv)
        console.log(e.detail.encryptedData)
    },
    mobileInput: function(e){
        mobile = e.detail.value;
        console.log(mobile);
    },
    onLoad: function(){
        // 手机绑定状态设置
        if(wx.getStorageSync('bind_phone') == 'yes'){
            wx.reLaunch({url: '../me/me'});
        }
    },
    getVcode: function(e){
        var that = this;
        if(!mobile) return false;
        var regMobile = /^1\d{10}$/;
        if(!regMobile.test(mobile)){
            wx.showModal({
                title: '提示',
                content: '手机号码错误',
                showCancel: false
            })
            return false;
        }
        if(tipNum){
            tipNum = false;
            wx.showLoading({title: '验证码发送'});
            wx.request({
                url: app.ajaxUrl.server_api_url + 'sent-sms',
                header: {"Authorization": "Bearer " + wx.getStorageSync('server_token')},
                data: {phone: mobile},
                method: "POST",
                success: function(res){
                    if(res.data.error && res.data.error != 0){
                        wx.showModal({
                            content: res.data.message,
                            showCancel: false
                        });
                    }else{
                        that.setData({
                            color: '#aaa',
                            btnStyle: 'warn',
                            disabled: false
                        });
                        wx.showModal({
                            title: '提示',
                            content: res.data.message,
                            showCancel: false
                        })
                    }
                },
                complete: function(){
                    wx.hideLoading();
                }
            })
            var resolve = setInterval(function(){
                if(x <= 0){
                    tipNum = true;
                    this.setData({
                        vcode: '获取验证码',
                        color: '#f31'
                    });
                    x = 120;
                    clearInterval(resolve);
                }else{
                    this.setData({
                        vcode: x + 's'
                    });
                    x--;
                }
            }.bind(this),1000);
        }
    },
    submitForm: function(e){
        var that = this;
        if(!e.detail.value.phone){
            wx.showModal({
                title: '提示',
                content: '手机号码错误',
                showCancel: false
            })
            return false;
        }
        if(!e.detail.value.phonecode){
            wx.showModal({
                title: '提示',
                content: '请输入验证码',
                showCancel: false
            })
            return false;
        }
        this.setData({
            disabled: true,
            btnload: true
        });
        wx.showLoading({
            title:'绑定手机中',
            icon: 'loading',
            mask: true,
            success: function(){
                wx.request({
                    url: app.ajaxUrl.server_api_url + 'bind',
                    header: {"Authorization": "Bearer " + wx.getStorageSync('server_token')},
                    data: e.detail.value,
                    method: "POST",
                    success: function(res){
                        wx.hideLoading();
                        if(res.data.error && res.data.error != 0){
                            wx.showModal({
                                content: res.data.message,
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
                        }else{
                            wx.showToast({
                                title: res.data.message,
                            })
                            // 手机绑定状态设置
                            wx.setStorageSync('bind_phone', 'yes');
                            setTimeout(function(){
                                wx.switchTab({
                                    url: '../me/me'
                                })
                            }, 1000)
                        }
                    }
                })
            },
            fail: function(){
                this.setData({
                    disabled: false,
                    btnload: false
                });
            }
        })
    }
})