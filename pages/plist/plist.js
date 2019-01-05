var app = getApp();
var list = [];
var page = 1;
var tid;
var search;
var limit;
var eobj;
var topicId;
var sx;
var product;
Page({
    data: {
        productList: [],
        allchecked: false,
        curIndex: 0,
        totalPrice: 0,
        shopcartNum: 0,
        searchBar: false,
        selectedAll: false,
        sliderOffset: 0,
    },
    onLoad: function (e) {
        wx.showLoading({
            title: '正在加载',
        })
        eobj = e;
        sx = e.limit;
        topicId = e.tid;
        var that = this;
        limit = eobj.limit;
        if (topicId) {
            wx.request({
                url: app.ajaxUrl.url_get_topic,
                data: eobj,
                dataType: 'json',
                method: 'POST',
                success: function (res) {
                    console.log(res)
                    if (res.data[0]){
                        res.data[0].checked = 'Y'
                        tid = res.data[0].topic_id
                        that.setData({
                            topicName: res.data,
                            product: res.data[0].list.data,
                        });
                        product = res.data;
                        if (res.data[0].list.data.length<6){
                            that.setData({
                                none: 'none'
                            })
                        }else{
                            that.setData({
                                none: 'block'
                            })
                        }
                    }else{
                        that.setData({
                            topicName: res.data,
                            product: res.data.front_topic.list.data,
                        });
                        product = res.data.front_topic.list.data;
                        tid= topicId;
                        if (res.data.front_topic.list.data.length < 6) {
                            that.setData({
                                none: 'none'
                            })
                        } else {
                            that.setData({
                                none: 'block'
                            })
                        }
                    }
                },
                complete: function () {
                    wx.hideLoading();
                }
            })
        }
    },
    onShow: function () {
        console.log(eobj.search)
        if (list == '') {
            var that = this;
            var datas = {
                'wx_xcx': 'yes'
            };

            if (eobj.search != undefined) {
                datas = Object.assign(datas, {
                    'search': eobj.search
                });
                search = eobj.search;
                that.setData({
                    search: eobj.search,
                    searchBar: true
                });
                wx.request({
                    url: app.ajaxUrl.url_list_product,
                    data: datas,
                    dataType: 'json',
                    method: 'GET',
                    success: function (ep) {
                        console.log(ep)
                        var product_list = ep.data;
                        if (product_list) {
                            for (var i = 0; i < product_list.length; i++) {
                                product_list[i].checked = false;
                                product_list[i].num = 1;
                            }
                        }

                        that.setData({
                            product: ep.data.data,
                            block: 'none',
                            none:'none',
                            sousuo: '搜索结果'
                        });
                    },
                    complete: function () {
                        wx.hideLoading();
                    }
                })
            }
        } else {
            this.setData({
                list: list
            });
        }

    },
    topicName(e){
        product.find(function (item) {
            item.checked = 'N';
        })
        tid = e.currentTarget.dataset.id;
        var products = product.find((item) => item.topic_id == tid);
        products.checked ='Y';
        console.log(products)
        if (products.list.data.length<6){
            this.setData({
                none:'none'
            })
        }else{
            this.setData({
                none:'block'
            })
        }
        this.setData({
            topicName: product,
            product: products.list.data,
            sliderOffset: e.currentTarget.offsetLeft + 5,
        });
    },
    //下拉刷新
    onPullDownRefresh: function (e) {
        wx.showNavigationBarLoading() //在标题栏中显示加载
        //模拟加载
        console.log(tid)
        console.log(topicId)
        if (eobj.tid) {
            eobj.tid = tid
        }
        else{
            eobj.tid = topicId
        }
        if (eobj.limit){
            eobj.limit = sx;
        }
        console.log(eobj)
        var that = this;
        setTimeout(function () {
            // complete
            wx.request({
                url: app.ajaxUrl.url_get_topic,
                data: eobj,
                dataType: 'json',
                method: 'POST',
                success: function (res) {
                    console.log(res)
                    let i = res.data.front_topic.list.data.length;
                    var product = res.data.front_topic.list.data
                    while (i) {
                        let j = Math.floor(Math.random() * i--);
                        [product[j], product[i]] = [product[i], product[j]];
                    }
                    wx.hideNavigationBarLoading() //完成停止加载
                    wx.stopPullDownRefresh() //停止下拉刷新
                    that.setData({
                        product: product
                    });
                }
            })
        }, 1500);
    },
    onReachBottom: function (e) {
        if (eobj.limit){
            eobj.limit = (+eobj.limit)+10
        }
        console.log(eobj.tid)
        if (eobj.tid){
            eobj.tid = tid
        }
        var that = this;

        setTimeout(() => {
            
            wx.request({
                url: app.ajaxUrl.url_get_topic,
                data: eobj,
                dataType: 'json',
                method: 'POST',
                success: function (res) {
                    if (res.data.front_topic.list.total<= eobj.limit){
                        that.setData({
                            none: 'none',
                        });
                    }
                    that.setData({
                        product: res.data.front_topic.list.data
                    });
                }
            })
        }, 1000)
    }
    ,
    onShareAppMessage() {
        return {
            title: '伊索曼妮',
            path: '/pages/plist/plist' + "?tid=" + this.options.tid,
            success: function (res) {
                console.log(res)// 转发成功
            },
            fail: function (res) {
                console.log(res)// 转发失败
            }
        }
    }
})