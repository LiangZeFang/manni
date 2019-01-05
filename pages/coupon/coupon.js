// pages/coupon/coupon.js

var app = getApp();
var coupons=[];
Page({
    data: {

    },

    onLoad: function (options) {
        var that = this;
        var result = [];
        wx.request({
            url: app.ajaxUrl.server_api_url + 'coupon',
            header: {
                "Authorization": "Bearer " + wx.getStorageSync('server_token')
            },
            method: 'post',
            data: [],
            dataType: 'json',
            success: function (res) {
                var obj = {};
                for (var i = 0; i < res.data.data.length; i++){
                    if (!obj[res.data.data[i].coupon_id]) {
                        result.push(res.data.data[i]);
                        obj[res.data.data[i].coupon_id] = true;
                    }
                    var o = res.data.data[i].coupon_off.split('.00');
                    res.data.data[i].coupon_off = o[0];
                    var a = res.data.data[i].coupon_threshold.split('.00');
                    res.data.data[i].coupon_threshold = a[0];
                }
                console.log(result)
                if (wx.getStorageSync('coupon')){
                   var coupon = wx.getStorageSync('coupon');
                   for (var i = 0; i < result.length; i++) {
                       for (var j = 0; j < coupon.length;j++){
                           if (coupon[j].coupon_id == result[i].coupon_id) {
                               if (coupon[j].is_use == "Y") {
                                   result[i].is_use = "Y"
                               }
                           }
                       }
                   }
               }
                that.setData({
                    coupon_list: result
                })
            }
        })
        // wx.request({
        //     url: app.ajaxUrl.server_api_url + '/cucoupon',
        //     header: {
        //         "Authorization": "Bearer " + wx.getStorageSync('server_token')
        //     },
        //     method: 'POST',
        //     data: [],
        //     dataType: 'json',
        //     success: function (res) {
        //         console.log(res.data)

        //         that.setData({
        //             coupon_list:res.data.data
        //         })

        //     }
        // })
    },
    coupon(e){
        var result =this.data.coupon_list
        var coupon=result.find((item) => item.coupon_id == e.currentTarget.dataset.id);
        console.log(result)
        coupon.is_use = "Y";
        for (var i = 0; i < result.length; i++) {
            if (coupon.coupon_id == result[i].coupon_id) {
                if (coupon.is_use == "Y") {
                    result[i].is_use = "Y";
                    this.setData({
                        coupon_list: result
                    })
                }
            }
        }
        if (wx.getStorageSync('coupon')) {
            coupons = wx.getStorageSync('coupon')
        }

        if (coupons.length < 1) {
            coupons[0] = coupon
            console.log(coupons)
            wx.setStorage({
                key: 'coupon',
                data: coupons,
            })
            wx.showToast({
                title: '领取成功',
                duration: 2000
            })
        } else {
            var resul = [];
            var obj = {};
            wx.getStorage({
                key: 'coupon',
                success: function (res) {
                    console.log(res.data)
                    res.data.push(coupon)
                    coupons = res.data;
                    for (var i = 0; i < coupons.length; i++) {
                        if (!obj[coupons[i].coupon_id]) {
                            resul.push(coupons[i]);
                            obj[coupons[i].coupon_id] = true;
                        }
                    }
                    wx.setStorage({
                        key: 'coupon',
                        data: resul,
                    })
                    console.log(resul)
                    wx.showToast({
                        title: '领取成功',
                        duration: 2000
                    })
                }
            })
        }
    },
    switchTab: function (e) {
        var that = this;
        console.log(e)
        if (this.data.curIndex === e.currentTarget.dataset.index) {
            return false;
        } else {
            that.setData({
                curIndex: e.currentTarget.dataset.index
            })
            if (e.currentTarget.dataset.index == 0) {
               
            } else if (e.currentTarget.dataset.index == 1) {
              
            } 
            else {
               
            }
        }
    },


})