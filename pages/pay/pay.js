var app = getApp();
var orderId;
Page({
    onLoad: function(res){
        console.log(this.data)
        orderId = res.id
        var that = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        this.setData({
            confirm_pay: false,
            no_order: false,
            is_payed: false
        })
        if(res.id){
            console.log(res.id)
            // 查询订单有效性
            wx.request({
                url: app.ajaxUrl.server_api_url + 'order/info',
                header: {"Authorization": "Bearer " + wx.getStorageSync('server_token')},
                method: 'POST',
                data: {order_serial: res.id},
                dataType: 'json',
                success: function(e){
                    var area1 = wx.getStorageSync('area1');
                    e.data.info.order_total = parseInt(e.data.info.order_total) + area1;
                    var order_total = e.data.info.order_total.toString();
                    e.data.info.order_total = order_total;
                    var fare =e.data.info.ship_fare.split('.00');
                    e.data.info.ship_fare = parseInt(fare[0]); 
                    that.setData({
                        info: e.data.info,
                        order_total: parseInt(e.data.info.order_total) + e.data.info.ship_fare
                    })
                    if(e.data.error != 0){
                        that.setData({
                            no_order: true
                        })
                    }else{
                        if(e.data.info.order_pay_status == 'NOPAY' || e.data.info.order_pay_status == 'FAIL'){
                            that.setData({
                                confirm_pay: true
                            })
                        }else{
                            that.setData({
                                is_payed: true
                            })
                        }
                    }
                },
                fail: function(){
                    that.setData({
                        no_order: true
                    })
                },
                complete: function(){
                    wx.hideLoading();
                }
            })
        }
    },
    goback: function(){
        wx.navigateBack({delta: 1})
    },
    //支付
    confirmPay: function(){
        console.log(orderId)
        wx.request({
            url: app.ajaxUrl.server_api_url + 'order/unifiedorder',
            header: {"Authorization": "Bearer " + wx.getStorageSync('server_token')},
            method: 'POST',
            data: { order_serial: orderId},
            dataType: 'json',
            success: function(e){
              console.log(e.data)
                if(e.data.error == 0){
                    wx.requestPayment({
                        timeStamp: e.data.JSAPI.timestamp,
                        nonceStr: e.data.JSAPI.nonceStr,
                        package: e.data.JSAPI.package,
                        signType: e.data.JSAPI.signType,
                        paySign: e.data.JSAPI.paySign,
                        // 支付成功
                        success: function(){
                            wx.redirectTo({ url: '../pay/pay_result?oid=' + orderId});
                        },
                        // 支付失败
                        fail: function(){
                            wx.navigateBack({delta: 1});
                        },
                        // 操作完成
                        complete: function(){

                        }
                    })
                }else{
                    wx.showModal({
                        title: '提示',
                        content: e.data.message,
                        showCancel: false,
                        success: function(e){
                            wx.navigateBack({delta: 1});
                        }
                    });
                }
            }
        })

    }
});