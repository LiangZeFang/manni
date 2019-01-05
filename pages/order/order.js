//index.js
//获取应用实例
var app = getApp();
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
                tabTitleName: "待发货订单",
            },
            {
                tabTitleName: "已发货订单",
            },
        ],

        curIndex: 0,
        statusActive: 'all',
        shippingText:'配送中...',
        shippingHidden:false,
        "copyright": app.globalData.support,
    },
    onLoad: function (e) {
        eobj = e;
    },
    onShow: function () {
        var that = this;
        if (eobj.all == 'all') {
            that.getTotal('all');
        }
        if (eobj.all == 'sent'){
            that.getTotal('sent');
        }
        if (eobj.all == 'pay') {
            that.getTotal('pay');
        }
        if (eobj.all == 'resv') {
            that.getTotal('resv');
        }
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
                console.log(res)
                    that.setData({
                        order: res.data,
                        orderTotal: res.data.total
                    })
                // else if (status == "pay") {
                //     console.log(res.data)
                //     that.setData({
                //         pay_total: res.data.total
                //     })
                // } else if (status == "sent") {
                //     console.log(res.data)
                //     that.setData({
                //         sent_total: res.data.total
                //     })
                // } else if (status == "resv") {
                //     console.log(res.data)
                //     that.setData({
                //         resv_total: res.data.total
                //     })
                // } else {
                //     console.log(res.data)
                // }

            },
            complete: function () {
                wx.hideLoading();
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

   confirmOrder: function (e) {
        var that = this;
        var order_serial = e.currentTarget.dataset.order;
        wx.showModal({
            title: '提示',
            content: '是否要确认收货？',
            success: function (e) {
                console.log(e)
                if (e.confirm) {
                    wx.showLoading({ title: '处理中' });
                    wx.request({
                        url: app.ajaxUrl.server_api_url + 'order/change',
                        header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
                        method: 'POST',
                        data: { order_serial },
                        success: function (es) {
                            console.log(es.data)
                            if (es.data.error == 0) {
                                that.setData({
                                    shippingHidden:true,
                                })
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
})