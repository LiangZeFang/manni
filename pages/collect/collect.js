var Zan = require('../../widget/zanui-index/index');
var app = getApp();
Page({
    data: {
        statusActive: 'all',
        copyright: app.globalData.support,
        order: [],
        selectBo: true,
        editNow: true
    },
   
    onShow: function (e) {
        var that = this;
        var quantity = [];
        wx.showToast({
            icon:'loading',
            title: '加载中',
            duration:500
        })
        wx.getStorage({
            key: 'storageArr',
            success: function(res) {
                console.log(res.data)
                that.setData({
                    product: res.data,
                })
            },
        })
   
        this.setData({
            editType: 'default',
            subOrder: '',
            delOrder: 'hide',
            editText: '编辑'
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
    

    delProductList: function (e) {
        console.log(e)
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
                console.log(res.data)
                var delItemKey = [];
                for (var i = 0, lenI = res.data.product.length; i < lenI; ++i) {
                    if (res.data.product[i].product_id == item_pid) {
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
        console.log(this.data.order)
        var values = e.detail.value;
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
                this.data.order.total_price += this.data.order.product[i].num * this.data.order.product[i].price;
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
        var values = e.detail.value;
        this.data.order.total_price = 0;
        this.data.order.total = 0;
        for (var i = 0, lenI = this.data.order.product.length; i < lenI; ++i) {
            this.data.order.product[i].checked = values == 'ca' ? true : false;
            if (values == 'ca') {
                this.data.order.total_price += parseInt(this.data.order.product[i].price) * this.data.order.product[i].num;
                this.data.order.total += this.data.order.product[i].num;
            }
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
    }
});