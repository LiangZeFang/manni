//index.js
//获取应用实例
var app = getApp();
var template = require('../../tabbar/tabbar.js');
var list = {};
var page = 1;
var userInfo;
var list = [];
var page = 1;
var limit = 15;
var eobj;
var order_list_arr = []
Page({
    data: {
        shopcartNum: 0,
        tabTitles: [
            {
                tabTitleName: "全部订单",
            },
            {
                tabTitleName: "待支付订单",

            },
            {
                tabTitleName: "待收货订单",
            },
            {
                tabTitleName: "已完成订单",
            },
        ],

        curIndex: 0,
        statusActive: 'all',
        imgUrls: [
            '/images/banner.png'
        ],
        "copyright": app.globalData.support,
    },
    unbind: function (e) {
        var that = this;
        wx.request({
            url: app.ajaxUrl.server_api_url + 'unbind',
            // 设置Token头
            header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
            data: null,
            method: 'POST',
            success: function (e) {
                wx.showToast({
                    title: '解绑成功'
                });
                that.setData({
                    bindPhoneStatus: false
                })
                wx.setStorageSync('bind_phone', 'no');
            },
            fail: function (e) {
                wx.showToast({
                    title: '解绑失败',
                    icon: 'loading'
                })
            }
        })
    },
    onLoad: function (e) {
        template.tabbar("tabBar", 4, this)//1表示第二个tabbar
        eobj = e;
        this.orderList('all')
        if (wx.getStorageSync('bind_phone') == 'yes') {
            this.setData({
                bindPhoneStatus: true
            })
        } else {
            this.setData({
                bindPhoneStatus: false
            })
        }
        var that = this;
        // 判断用户是否已经绑定手机
        // 如果未绑定,就强制跳到绑定界面
        var bind_phone = wx.getStorageSync('bind_phone');
        if (bind_phone != 'yes') {
            wx.navigateTo({
                url: "../bind/bind_phone"
            })
        }

        wx.request({
            url: app.ajaxUrl.server_api_url + 'order?status=success',
            header: {
                "Authorization": "Bearer " + wx.getStorageSync('server_token')
            },
            method: 'POST',
            data: [],
            dataType: 'json',
            success: function (res) {
                console.log(res.data);
               
            }
            })
    },

    onShow:function(){

        var that = this;

        wx.request({
            url: app.ajaxUrl.server_api_url + 'shopcart',
            header: {
                "Authorization": "Bearer " + wx.getStorageSync('server_token')
            },
            method: 'POST',
            data: [],
            dataType: 'json',
            success: function (res) {
                console.log(res.data);
                that.setData({
                    shopcartNum: res.data.total
                })
            }
        })

        wx.getUserInfo({
            // withCredentials: true,
            success: function (res) {
                var userInfo = res.userInfo
                that.setData({
                    nickName: userInfo.nickName,
                    userPic: userInfo.avatarUrl
                });
                // 提交用户具体资料并保存,每过60分钟保存一次
                var nowTime = new Date();
                var save_user_expire = wx.getStorageSync('save_user_expire');
                if (!save_user_expire || nowTime > save_user_expire) {
                    nowTime.setMinutes(nowTime.getMinutes() + 60, nowTime.getSeconds(), 0);
                    wx.request({
                        url: app.ajaxUrl.server_api_url + 'save-user',
                        // 设置Token头
                        header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
                        data: {
                            nickname: userInfo.nickName,
                            sex: (userInfo.gender == 0 ? '未知' : (userInfo.gender == 1 ? '男' : '女')),
                            province: userInfo.province,
                            city: userInfo.city,
                            country: userInfo.country
                        },
                        method: 'POST',
                        success: function (e) {
                            // 设置超时时间
                            wx.setStorageSync('save_user_expire', nowTime);
                            console.log('save success');
                        },
                        fail: function (e) {
                            console.error('save fail');
                        }
                    })
                }
            },
            fail: function (res) {
                wx.navigateTo({
                    url: "../msg/msg_auth_fail"
                })
            }
        });

        this.getTotal('all');
        this.getTotal('pay');
        this.getTotal('sent');
        this.getTotal('resv');
    },


    getTotal: function (status) {
        var that = this
        wx.request({
            url: app.ajaxUrl.server_api_url + 'order?status=' + status,
            header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
            method: 'POST',
            data: [],
            dataType: 'json',
            success: function (res) {
                if (status == "all") {
                    console.log(res.data)
                    that.setData({
                        all_total: res.data.total
                    })
                } else if (status == "pay"){
                    console.log(res.data)
                    that.setData({
                        pay_total: res.data.total
                    })
                } else if (status == "sent") {
                    console.log(res.data)
                    that.setData({
                        sent_total: res.data.total
                    })
                } else if(status == "resv") {
                    console.log(res.data)
                    that.setData({
                        resv_total: res.data.total
                    })
                } else{
                    console.log(res.data)
                }

            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },
    bindcallouttap(e) {
        wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
                var latitude = res.latitude
                var longitude = res.longitude
                wx.openLocation({
                    latitude: 23.0629620000,
                    longitude: 113.1591860000,
                    scale: 28,
                    name: "广东蔼如生物科技有限公司",
                    address: "佛山市南海区桂澜北路28号万达广场E座2609室"
                })
            }
        })
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
                this.orderList('all')
            } else if (e.currentTarget.dataset.index == 1) {
                this.orderList('pay')
            } else if (e.currentTarget.dataset.index == 2) {
                this.orderList('sent')
            }
            else {
                this.orderList('resv')
            }
        }
    },

    orderList: function (status) {
        wx.showLoading({ title: '努力加载中' });
        var that = this;
        var status;
        var datas = {};
        if (eobj.limit != undefined) {
            limit = eobj.limit;
            datas = { limit: eobj.limit };
        } else
            datas = Object.assign(datas, { 'limit': limit });
        this.setData({
            statusActive: (eobj.status != undefined && eobj.status) ? eobj.status : 'all'
        });
        if (eobj.status && eobj.status != undefined) {
            datas = Object.assign(datas, { 'status': eobj.status });
            status = eobj.status;
        }
        wx.request({
            url: app.ajaxUrl.server_api_url + 'order?status=' + status,
            header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
            method: 'POST',
            data: datas,
            dataType: 'json',
            success: function (res) {
                console.log(res.data)
                that.setData({
                    order: res.data,
                    orderTotal: res.data.total
                })
                list = res.data;
                page++;
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },

    cancelOrder: function (e) {
        var that = this;
        var order_serial = e.currentTarget.dataset.order;
        wx.showModal({
            title: '提示',
            content: '是否要取消订单？',
            success: function (e) {
                if (e.confirm) {
                    wx.showLoading({ title: '处理中' });
                    wx.request({
                        url: app.ajaxUrl.server_api_url + 'order/cancel',
                        header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
                        method: 'POST',
                        data: { oid: order_serial },
                        success: function (es) {
                            if (es.data.error == 0) {
                                that.onShow();
                            } else {
                                wx.showModal({
                                    title: '提示',
                                    content: es.data.message,
                                    showCancel: false
                                });
                            }
                        },
                        fail: function () {
                            wx.showModal({
                                title: '提示',
                                content: '取消失败'
                            })
                        },
                        complete: function () {
                            wx.hideLoading();
                        }
                    })
                }
            }
        });
    },

    loadMore: function (e) {
        wx.showLoading({ title: '努力加载中' });
        var that = this
        wx.request({
            url: app.ajaxUrl.server_api_url + 'order',
            header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
            data: { limit: limit, page: page },
            dataType: 'json',
            method: 'POST',
            success: function (res) {
                list.current_page = res.data.current_page;
                list.data.push.apply(list.data, res.data.data);
                that.setData({
                    order: list
                });
                page++;
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },

    addressSet: function (e) {
        wx.chooseAddress({
            success: function (res) {
                wx.setStorageSync('defaultAddress', {
                    userName: res.userName,
                    postalCode: res.postalCode,
                    provinceName: res.provinceName,
                    cityName: res.cityName,
                    countyName: res.countyName,
                    detailInfo: res.detailInfo,
                    nationalCode: res.nationalCode,
                    telNumber: res.telNumber
                });
            }
        })
    }
    , 
    onShareAppMessage() {
        return {
            title: '伊索曼妮',
            path: '/pages/me/me',
            success: function (res) {
                console.log(res)// 转发成功
            },
            fail: function (res) {
                console.log(res)// 转发失败
            }
        }
    }
})