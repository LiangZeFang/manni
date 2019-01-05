var app = getApp();
var Zan = require('../../widget/zanui-index/index');
var template = require('../../tabbar/tabbar.js');
Page(Object.assign({}, Zan.Quantity, {
    data: {
        statusActive: 'all',
        copyright: app.globalData.support,
        order: [],
        selectBo: true,
        editNow: true,
        placeOrder: true
    },
    onLoad: function (options) {
        template.tabbar("tabBar", 3, this)//1表示第二个tabbar
    },
    handleZanQuantityChange(e) {
        console.log(e)
        var componentId = e.componentId;
        var quantity = e.quantity;
        var max = e.max;
        var min = e.min;
        var pkey = e.pkey;
        var that = this;
        wx.showLoading({ title: '努力加载中' });
        wx.request({
            url: app.ajaxUrl.server_api_url + 'shopcart/change-num',
            header: {
                "Authorization": "Bearer " + wx.getStorageSync('server_token')
            },
            method: 'POST',
            data: {
                'num': quantity,
                'key': pkey
            },
            dataType: 'json',
            success: function (res) {
                console.log(res.data)
                if (res.data.error == 0) {
                    if (max == quantity) {
                        that.onShow();
                    } else {
                        if (res.data.checked == true) {
                            var total_price = that.data.order.total_price - (res.data.once_price * res.data.oldNum) + (res.data.once_price * quantity);
                        } else {
                            var total_price = that.data.order.total_price;
                        }
                        that.data.order.total_price = total_price;
                        that.data.order.total = res.data.total;
                        that.setData({
                            [`${componentId}.quantity`]: quantity,
                            [`${componentId}.max`]: max,
                            [`${componentId}.min`]: min,
                            total_price: total_price,
                            total: res.data.total
                        });
                    }
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },
    onShow: function (e) {
        var that = this;
        var quantity = [];
        wx.showLoading({ title: '努力加载中' });
        wx.request({
            url: app.ajaxUrl.server_api_url + 'shopcart',
            header: {
                "Authorization": "Bearer " + wx.getStorageSync('server_token')
            },
            method: 'POST',
            data: [],
            dataType: 'json',
            success: function (res) {
                that.data.order = res.data;
                that.data.order.total_price = 0;
                that.data.order.total = 0;
                for (var i = 0, lenI = res.data.product.length; i < lenI; i++) {
                    if (res.data.product[i].checked == undefined || res.data.product[i].checked == true) {
                        res.data.product[i].checked = false;
                        that.data.selectBo = false;
                        that.data.order.total_price += parseInt(res.data.product[i].price) * res.data.product[i].num;
                        that.data.order.total += res.data.product[i].num;
                    }
                    if (res.data.product[i].checked == false) {
                        that.data.order.total_price = 0;
                    }
                    // 设置数量与库存
                    quantity[i] = {
                        quantity: res.data.product[i].num,
                        min: 1,
                        max: res.data.product[i].lave,
                        pkey: i,
                        componentId: 'quantity[' + i + ']'
                    };
                }
                console.log(res.data)
                that.setData({
                    order: res.data,
                    totalDisabled: 22222,
                    quantity: quantity,
                    total_price: that.data.order.total_price,
                    total: that.data.order.total
                })
            },
            complete: function () {
                wx.hideLoading();
            }
        })
        this.setData({
            editType: 'default',
            subOrder: '',
            delOrder: 'hide',
            editText: '编辑'
        })
    },
    handleZanQuantityChange(e) {
        var componentId = e.componentId;
        var quantity = e.quantity;
        var max = e.max;
        var min = e.min;
        var pkey = e.pkey;
        var that = this;
        wx.showLoading({ title: '努力加载中' });
        wx.request({
            url: app.ajaxUrl.server_api_url + 'shopcart/change-num',
            header: {
                "Authorization": "Bearer " + wx.getStorageSync('server_token')
            },
            method: 'POST',
            data: {
                'num': quantity,
                'key': pkey
            },
            dataType: 'json',
            success: function (res) {
                if (res.data.error == 0) {
                    if (max == quantity) {
                        that.onShow();
                    } else {
                        if (res.data.checked == true) {
                            var total_price = that.data.order.total_price - (res.data.once_price * res.data.oldNum) + (res.data.once_price * quantity);
                        } else {
                            var total_price = that.data.order.total_price;
                        }
                        that.data.order.total_price = total_price;
                        that.data.order.total = res.data.total;
                        that.setData({
                            [`${componentId}.quantity`]: quantity,
                            [`${componentId}.max`]: max,
                            [`${componentId}.min`]: min,
                            total_price: total_price,
                            total: res.data.total
                        });
                    }
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },
    goOrder: function (e) {
        var that = this;
        this.setData({
            totalDisabled: true
        })
        wx.request({
            url: app.ajaxUrl.server_api_url + 'shopcart/ckp',
            header: {
                "Authorization": "Bearer " + wx.getStorageSync('server_token')
            },
            method: 'POST',
            data: [],
            dataType: 'json',
            success: function (res) {
                if (res.data.error != 0) {
                    wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel: false
                    });
                } else {
                    wx.navigateTo({
                        url: '../submitorder/submitorder'
                    })
                }
            },
            fail: function (res) {
                that.setData({
                    totalDisabled: false
                })
            }
        })
    },
    editOrder: function (e) {
        if (!this.editNow) {
            this.editNow = true;
            // 清空选择
            for (var i = 0, lenI = this.data.order.product.length; i < lenI; ++i) {
                this.data.order.product[i].checked = false;
            }
            this.setData({
                editType: 'warn',
                subOrder: 'hide',
                delOrder: '',
                editText: '完成',
                order: this.data.order,
                totalDisabled: true
            })
        } else {
            this.editNow = false;
            this.onShow();
        }
    },
    delProduct: function (e) {
        var delItemKey = [];
        var that = this;
        for (var i = 0, lenI = this.data.order.product.length; i < lenI; ++i) {
            if (this.data.order.product[i].checked == true) {
                delItemKey.push(i);
            }
        }
        if (delItemKey) {
            wx.request({
                url: app.ajaxUrl.server_api_url + 'shopcart/del-product',
                header: {
                    "Authorization": "Bearer " + wx.getStorageSync('server_token')
                },
                method: 'POST',
                data: {
                    item: delItemKey
                },
                dataType: 'json',
                success: function (res) {
                    if (res.data.error != 0) {
                        wx.showModal({
                            title: '提示',
                            content: res.data.message,
                            showCancel: false
                        });
                    } else
                        that.onShow();
                }
            })
        }
    },

    delProductList: function (e) {
        var that = this
        var item_pid = e.target.dataset.pid

        wx.request({
            url: app.ajaxUrl.server_api_url + 'shopcart',
            header: {
                "Authorization": "Bearer " + wx.getStorageSync('server_token')
            },
            method: 'POST',
            data: [],
            dataType: 'json',
            success: function (res) {
                var delItemKey = [];
                for (var i = 0, lenI = res.data.product.length; i < lenI; ++i) {
                    if (res.data.product[i].sku_link_id == item_pid) {
                        delItemKey.push(i);
                    }
                }
                wx.request({
                    url: app.ajaxUrl.server_api_url + 'shopcart/del-product',
                    header: {
                        "Authorization": "Bearer " + wx.getStorageSync('server_token')
                    },
                    method: 'POST',
                    data: {
                        item: delItemKey
                    },
                    dataType: 'json',
                    success: function (res) {
                        if (res.data.error != 0) {
                            wx.showModal({
                                title: '提示',
                                content: res.data.message,
                                showCancel: false
                            });
                        } else {
                            that.onShow()
                            wx.showToast({
                                title: '删除成功',
                                icon: 'success',
                                duration: 2000
                            })
                        }
                    }
                })
            }
        })

    },
    checkboxChange: function (e) {

        var values = e.detail.value;

        if (values.length > 0) {
            this.setData({
                placeOrder: true
            })
        } else {
            this.setData({
                placeOrder: false
            })
        }

        if (values.length == this.data.order.product.length) {
            this.setData({
                ca: true
            })
        } else {
            this.setData({
                ca: false
            })
        }

        for (var i = 0, lenI = this.data.order.product.length; i < lenI; ++i) {
            this.data.order.product[i].checked = false;

            for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
                if (i == values[j]) {
                    this.data.order.product[i].checked = true;
                    break;
                }
            }
        }
        this.data.selectBo = true;
        this.data.order.total = 0;
        this.data.order.total_price = 0;
        for (var i = 0, lenI = this.data.order.product.length; i < lenI; ++i) {
            if (this.data.order.product[i].checked == true) {
                this.data.selectBo = false;
                this.data.order.total += this.data.order.product[i].num;
                this.data.order.total_price += this.data.quantity[i].quantity * this.data.order.product[i].price;
            }
        }
        this.setData({
            order: this.data.order,
            totalDisabled: this.data.selectBo,
            total_price: this.data.order.total_price,
            total: this.data.order.total
        });
        if (!this.editNow) {
            var that = this;
            wx.request({
                url: app.ajaxUrl.server_api_url + 'shopcart/save',
                header: {
                    "Authorization": "Bearer " + wx.getStorageSync('server_token')
                },
                method: 'POST',
                data: {
                    shopcart: that.data.order
                },
                dataType: 'json'
            })
        }
    },
    checkAllChange: function (e) {
        console.log(e)
        var values = e.detail.value;
        this.data.order.total_price = 0;
        this.data.order.total = 0;
        for (var i = 0, lenI = this.data.order.product.length; i < lenI; ++i) {
            this.data.order.product[i].checked = values == 'ca' ? true : false;
            if (values == 'ca') {
                this.data.order.total_price += parseInt(this.data.order.product[i].price) * this.data.quantity[i].quantity;
                this.data.order.total += this.data.order.product[i].num;
            }
        }

        if (values.length == 0) {
            this.setData({
                placeOrder: false
            })
        }
        else {
            this.setData({
                placeOrder: true
            })
        }

        var ca = values == 'ca' ? true : false;
        this.data.selectBo = ca ? false : true;
        this.setData({
            order: this.data.order,
            ca: ca,
            totalDisabled: this.data.selectBo,
            total_price: this.data.order.total_price,
            total: this.data.order.total
        });
        if (!this.editNow) {
            var that = this;
            wx.request({
                url: app.ajaxUrl.server_api_url + 'shopcart/save',
                header: {
                    "Authorization": "Bearer " + wx.getStorageSync('server_token')
                },
                method: 'POST',
                data: {
                    shopcart: that.data.order
                },
                dataType: 'json'
            })
        }
    },
    onShareAppMessage() {
        return {
            title: '伊苏曼尼',
            path: '/pages/shopcart/shopcart',
            success: function (res) {
                console.log(res)// 转发成功
            },
            fail: function (res) {
                console.log(res)// 转发失败
            }
        }
    }
}));