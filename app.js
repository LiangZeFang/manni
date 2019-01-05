//app.js

App({
    globalData: {
        support: '技术支持@泰斯特网络'
    },
    ajaxUrl: {
        // 请求主页域名
        url_base: 'https://esoramani.com/',
        //获取栏目
        url_get_topic: 'https://esoramani.com/api/topic',
        // 获取所有商品
        url_index_product: 'https://esoramani.com/category-0.html',
        // 栏目分类请求
        url_category: 'https://esoramani.com/wx_xcx/category',
        // 商品分类内容
        url_list_product: 'https://esoramani.com/wx_xcx/product-list',
        //自定义
        url_custom: 'https://esoramani.com/api/custom',
        // 服务器API地址
        server_api_url: 'https://esoramani.com/api/'
    },
    onLaunch: function (xr) {
        console.log(xr)
        var that = this;
        // 首次获取服务器请求TOKEN
        var token = wx.getStorageSync('server_token');

        var token_expire = wx.getStorageSync('server_token_expire');
        var nowTime = new Date();
        if (!token || nowTime > token_expire) {
            wx.login({
                success: function (e) {
                    if (e.code) {
                        console.log(e)
                        wx.request({
                            url: that.ajaxUrl.server_api_url + 'init',
                            data: { code: e.code },
                            method: 'POST',
                            success: function (res) {
                                console.log(res)
                                nowTime.setMinutes(nowTime.getMinutes() + 90, nowTime.getSeconds(), 0);
                                wx.setStorageSync('server_token', res.data.token);
                                wx.setStorageSync('server_token_expire', nowTime);
                                // 手机绑定状态设置
                                wx.setStorageSync('bind_phone', res.data.bind);
                                console.log('login success');
                            },
                            fail: function () {
                                console.log('login fail');
                            }
                        })
                    } else {
                        console.log('login error');
                    }
                }
            })
        }
       
    },

    onShow: function (options) {
        // Do something when show.
        console.log(options)
        wx.setStorageSync('options', options)

        wx.setStorage({
            key: 'options',
            data: options,
        })
    },
})








