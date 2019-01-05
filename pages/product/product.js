var Zan = require('../../widget/quantity/index');
var WxParse = require('../../wxParse/wxParse.js');
//获取应用实例
var app = getApp();
var pid;
var storageArr = []
var selection;
Page(Object.assign({}, Zan, {
    data: {
        currentTab: 0,
        tabArr: {
            curHdIndex: 0,
            curBdIndex: 0
        },
        indicatorDots: true,  //是否显示面板指示点
        autoplay: true,      //是否自动切换
        interval: 3000,       //自动切换时间间隔
        duration: 1000,       //滑动动画时长
        inputShowed: false,
        inputVal: "",
        detailQuantity: {
            quantity: 1,
            min: 1,
            max: 999,
            currentData: 0,
        },
        quantity: 1,
        shopcartNum: 0,
        firstIndex: -1,
        dataSku: [],
        vid: [],
        hideInfo: false,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        circular: true,
        currentData: 0,
        scrollTop: null,
        "copyright": app.globalData.support,
    },
    scroll: function (e) {
        this.setData({ scrollTop: e.detail.scrollTop })
    },
    onLoad: function (res) {
        pid = res.pid
        var that = this;
        wx.request({
            url: app.ajaxUrl.url_base + 'product-' + res.pid + '.html',
            data: {
                wx_xcx: 'yes'
            },
            dataType: 'json',
            method: 'GET',
            success: function (resp) {
                console.log(resp.data)
                resp.data.info.collected = false;
                that.setData({
                    info: resp.data.info,
                    sku: resp.data.sku,
                });

                //在本地设置缓存
                wx.setStorage({
                    key: 'list',
                    data: resp.data.sku
                });
                wx.setStorage({
                    key: 'info_content',
                    data: resp.data.info.content,
                })
                that.data.dataSku = resp.data.sku;
                that.distachAttrValue(that.data.dataSku);
                if (that.data.dataSku.length == 1) {
                    for (var i = 0; i < that.data.dataSku[0].vid.length; i++) {
                        that.data.vid[i].selectedValue = that.data.dataSku[0].vid[i].attrValue;
                    }
                    that.setData({
                        vid: that.data.vid
                    });
                }
                console.log(that.data.vid);
                if (resp.data.info.content) {
                    WxParse.wxParse('content', 'html', resp.data.info.content, that, 5);
                }
            },
            complete: function () {
                wx.getStorage({
                    key: 'storageArr',
                    success: function (res) {
                        console.log(res)
                        var cur_info = res.data.find((item) => item.product_id == pid)
                        console.log(cur_info)
                        if (cur_info) {
                            that.setData({
                                info: cur_info
                            })
                        }
                    }
                })
            }
        })

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
    },
    swiperTab: function (e) {
        var that = this;
        that.setData({
            currentTab: e.detail.current
        });
    },
    tabFun: function (e) {
        //获取触发事件组件的dataset属性  
        var _datasetId = e.target.dataset.id;
        console.log("----" + _datasetId + "----");
        var _obj = {};
        _obj.curHdIndex = _datasetId;
        _obj.curBdIndex = _datasetId;
        this.setData({
            tabArr: _obj
        });
    },
    //点击切换
    clickTab: function (e) {
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
    },
    selectSku: function (e) {
        this.setData({
            fade: 'fadeIn',
            slide: 'slideUp'
        })
    },
    closeShadow: function (e) {
        this.setData({
            fade: 'fadeOuts',
            slide: 'slideDown'
        })
    },
    /* 获取数据 */
    distachAttrValue: function (dataSku) {
        /**
          将后台返回的数据组合成类似
          {
            attrKey:'型号',
            vid:['1','2','3']
          }
        */
        // 把数据对象的数据（视图使用），写到局部内
        var vid = this.data.vid;
        console.log(dataSku)
        // 遍历获取的数据
        for (var i = 0; i < dataSku.length; i++) {
            for (var j = 0; j < dataSku[i].vid.length; j++) {
                var attrIndex = this.getAttrIndex(dataSku[i].vid[j].attrKey, vid);
                // console.log('属性索引', attrIndex);
                // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
                if (attrIndex >= 0) {
                    // 如果属性值数组中没有该值，push新值；否则不处理
                    if (!this.isValueExist(dataSku[i].vid[j].attrValue, vid[attrIndex].attrValues)) {
                        vid[attrIndex].attrValues.push(dataSku[i].vid[j].attrValue);
                    }
                    if (!this.isValueExist(dataSku[i].vid[j].attrVid, vid[attrIndex].attrVids)) {
                        vid[attrIndex].attrVids.push(dataSku[i].vid[j].attrVid);
                    }
                } else {
                    vid.push({
                        attrKey: dataSku[i].vid[j].attrKey,
                        attrValues: [dataSku[i].vid[j].attrValue],
                        attrVids: [dataSku[i].vid[j].attrVid]
                    });
                }
            }
        }
        console.log('result', vid)
        for (var i = 0; i < vid.length; i++) {
            for (var j = 0; j < vid[i].attrValues.length; j++) {
                if (vid[i].attrValueStatus) {
                    vid[i].attrValueStatus[j] = true;
                } else {
                    vid[i].attrValueStatus = [];
                    vid[i].attrValueStatus[j] = true;
                }
            }
        }
        this.setData({
            vid: vid
        });
    },

    onShow: function () {
        var that = this

        wx.getStorage({
            key: 'options',
             success: function (res) {
                 console.log(res.data)
                 if (res.data.scene == 1047) {
                     var product_id = res.data.query.pid
                     wx.redirectTo({
                         url: "../product/product?pid=" + product_id,
                     })
                 }
            }
        })
        wx.removeStorage({
            key: 'options',
            success: function (res) {
                console.log('清除成功')
            },
        })
    },
    getAttrIndex: function (attrName, vid) {
        // 判断数组中的attrKey是否有该属性值
        for (var i = 0; i < vid.length; i++) {
            if (attrName == vid[i].attrKey) {
                break;
            }
        }
        return i < vid.length ? i : -1;
    },
    isValueExist: function (value, valueArr) {
        // 判断是否已有属性值
        for (var i = 0; i < valueArr.length; i++) {
            if (valueArr[i] == value) {
                break;
            }
        }
        return i < valueArr.length;
    },
    /* 选择属性值事件 */
    selectAttrValue: function (e) {

        /*
    点选属性值，联动判断其他属性值是否可选
    {
      attrKey:'型号',
      vid:['1','2','3'],
      selectedValue:'1',
      attrValueStatus:[true,true,true]
    }
    console.log(e.currentTarget.dataset);
    */
        var _this = this;
        var vid = this.data.vid;
        var index = e.currentTarget.dataset.index; //属性索引
        var key = e.currentTarget.dataset.key;
        var value = e.currentTarget.dataset.value;
        wx.getStorage({
            key: 'list',
            success: function (res) {
                let lists = res.data;
                let currentSku;
                //遍历返回数据对象，返回当前id的条目
                if (vid.length>=2){
                    if (vid[0].selectedValue &&vid[1].selectedValue){
                        currentSku = lists.find((item) => item.priceId == vid[0].selectedValue +','+vid[1].selectedValue);
                    }else{
                        console.log(_this.data.sku)
                        currentSku = lists.find((item) => item.priceId == _this.data.sku[0].priceId);
                    }
                }else{
                    currentSku = lists.find((item) => item.priceId == value);
                }
                console.log(currentSku)
                for (var i = 0; i < currentSku.vid.length; i++){
                   selection = currentSku.vid[0].attrValue + currentSku.vid[i].attrValue
                }                
                //更新当前条目
                _this.setData({
                    currentSku: currentSku,
                    hideInfo: true,
                    selection: selection
                })
            }
        })
        if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
            if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
                // 取消选中
                this.disSelectValue(vid, index, key, value);
            } else {
                // 选中
                this.selectValue(vid, index, key, value);
            }
        }


    },
    /* 选中 */
    selectValue: function (vid, index, key, value, unselectStatus) {
        // console.log('firstIndex', this.data.firstIndex);
        var sku = [];
        if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
            var dataSku = this.data.dataSku;
            // 其他选中的属性值全都置空
            // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus);
            for (var i = 0; i < vid.length; i++) {
                for (var j = 0; j < vid[i].attrValues.length; j++) {
                    vid[i].selectedValue = '';
                }
            }
        } else {
            var dataSku = this.data.sku;
        }
        // console.log('选中', dataSku, index, key, value);
        for (var i = 0; i < dataSku.length; i++) {
            for (var j = 0; j < dataSku[i].vid.length; j++) {
                if (dataSku[i].vid[j].attrKey == key && dataSku[i].vid[j].attrVid == value) {
                    sku.push(dataSku[i]);
                }
            }
        }
        vid[index].selectedValue = value;
        // 判断属性是否可选
        for (var i = 0; i < vid.length; i++) {
            for (var j = 0; j < vid[i].attrValues.length; j++) {
                if (this.data.vid.length >= 2) {
                    vid[i].attrValueStatus[j] = true;
                }else{
                    vid[i].attrValueStatus[j] = false;
                }
            }
        }
        for (var k = 0; k < vid.length; k++) {
            for (var i = 0; i < sku.length; i++) {
                for (var j = 0; j < sku[i].vid.length; j++) {
                    if (vid[k].attrKey == sku[i].vid[j].attrKey) {
                        for (var m = 0; m < vid[k].attrVids.length; m++) {
                            if (vid[k].attrVids[m] == sku[i].vid[j].attrVid) {
                                vid[k].attrValueStatus[m] = true;
                            }
                        }
                    }
                }
            }
        }
        // console.log('结果', sku);
        this.setData({
            vid: vid,
            sku: sku
        });
        var count = 0;
        for (var i = 0; i < vid.length; i++) {
            for (var j = 0; j < vid[i].attrVids.length; j++) {
                if (vid[i].selectedValue) {
                    count++;
                    break;
                }
            }
        }
        if (count < 2) { // 第一次选中，同属性的值都可选
            this.setData({
                firstIndex: index
            });
        } else {
            this.setData({
                firstIndex: -1
            });
        }
    },
    /* 取消选中 */
    disSelectValue: function (vid, index, key, value) {
        var dataSku = this.data.dataSku;
        vid[index].selectedValue = '';

        // 判断属性是否可选
        for (var i = 0; i < vid.length; i++) {
            for (var j = 0; j < vid[i].attrValues.length; j++) {
                vid[i].attrValueStatus[j] = true;
            }
        }
        this.setData({
            sku: dataSku,
            vid: vid
        });

        for (var i = 0; i < vid.length; i++) {
            if (vid[i].selectedValue) {
                this.selectValue(vid, i, vid[i].attrKey, vid[i].selectedValue, true);
            }
        }
    },

    /* 点击确定 */
    submit: function (e) {
        wx.showLoading({
            title: '加入购物车'
        })
        var that = this;
        var value = [];
        var cur_quantity = e.currentTarget.dataset.quantity
        var pid = e.currentTarget.dataset.pid
        var buyNow = e.currentTarget.dataset.buynow
        console.log(e.currentTarget.dataset.quantity)

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
                var shopcarList = res.data.product
                if (shopcarList) {
                    var cur_shopcartcart_list = shopcarList.find((item) => item.product_id == pid)
                }

                if (cur_shopcartcart_list) {
                    var num = cur_shopcartcart_list.num + e.currentTarget.dataset.quantity
                    console.log(num)
                    for (var i = 0; i < that.data.vid.length; i++) {

                        if (!that.data.vid[i].selectedValue) {
                            break;
                        }
                        value.push(that.data.vid[i].selectedValue);
                    }
                    if (i < that.data.vid.length) {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: '请选择商品规格',
                            showCancel: false
                        });
                    } else {
                        var datas = { pid: e.currentTarget.dataset.pid };
                        if (e.currentTarget.dataset.quantity > 1) {
                            datas = Object.assign(datas, {
                                'num': num
                            });
                        }
                        var insku;
                        if (value) {
                            Object.assign(datas, { 'sku': value.join(',') });
                            insku = '&sku=' + value.join(',');
                        }
                        wx.request({
                            url: app.ajaxUrl.server_api_url + 'shopcart/add',
                            header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
                            data: datas,
                            dataType: 'json',
                            method: 'POST',
                            success: function (res) {
                                wx.hideLoading();
                                console.log(res.data)
                                if (res.data.error != 0) {
                                    wx.showModal({
                                        title: '提示',
                                        content: res.data.message,
                                        showCancel: false
                                    });
                                } else {
                                    wx.showToast({
                                        title: '成功添加购物车',
                                    })
                                    that.hideModal();
                                    that.setData({
                                        skus: selection
                                    })
                                }
                            }, fail() { },
                            complete() {
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
                                        var cur_shopcart_num = res.data.total
                                        that.setData({
                                            shopcartNum: cur_shopcart_num
                                        })
                                    }
                                })
                                if (buyNow) {
                                    wx.navigateTo({
                                        url: '../submitorder/submitorder'
                                    })
                                }
                            }

                        })
                    }
                } else {
                    for (var i = 0; i < that.data.vid.length; i++) {
                        if (!that.data.vid[i].selectedValue) {
                            break;
                        }
                        value.push(that.data.vid[i].selectedValue);
                    }
                    if (i < that.data.vid.length) {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: '请选择商品规格',
                            showCancel: false
                        });
                    } else {
                        var datas = { pid: e.currentTarget.dataset.pid };

                        datas = Object.assign(datas, {
                            'num': cur_quantity
                        });

                        var insku;
                        if (value) {
                            Object.assign(datas, { 'sku': value.join(',') });
                            insku = '&sku=' + value.join(',');
                        }
                        wx.request({
                            url: app.ajaxUrl.server_api_url + 'shopcart/add',
                            header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
                            data: datas,
                            dataType: 'json',
                            method: 'POST',
                            success: function (res) {
                                console.log(res.data.result.total)
                                wx.hideLoading();
                                if (res.data.error != 0) {
                                    wx.showModal({
                                        title: '提示',
                                        content: res.data.message,
                                        showCancel: false
                                    });
                                } else {
                                    wx.showToast({
                                        title: '成功添加购物车',
                                    })
                                    that.hideModal();
                                    that.setData({
                                        skus: selection
                                    })
                                }
                            }, fail() { },
                            complete() {
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
                                        var cur_shopcart_num = res.data.total
                                        that.setData({
                                            shopcartNum: cur_shopcart_num
                                        })

                                    }
                                })
                                if (buyNow) {
                                    wx.navigateTo({
                                        url: '../submitorder/submitorder'
                                    })
                                }
                            }

                        })
                    }
                }
            },
            fail: function () { },
            complete: function () { }
        })
    },
    
    //获取当前滑块的index
    bindchange: function (e) {
        const that = this;
        if (e.detail.current == 1){
            wx.createSelectorQuery().select('.details').boundingClientRect(function (rect) {
            that.setData({
                auto: parseInt(rect.height)+'px'
            })
        }).exec();
        }else {
            that.setData({
                auto: '1200rpx'
            })
        }
   
        that.setData({
            currentData: e.detail.current
        })
    },
    //点击切换，滑块index赋值
    checkCurrent: function (e) {
        const that = this;
        if (that.data.currentData === e.target.dataset.current) {
            return false;
        } else {

            that.setData({
                currentData: e.target.dataset.current
            })
        }
        if (e.target.dataset.current == '1') {
            wx.createSelectorQuery().select('.details').boundingClientRect(function (rect) {
                that.setData({
                    auto: parseInt(rect.height) + 'px'
                })
            }).exec();
        }else {
            that.setData({
                auto: '1200rpx'
            })
        }
    },

    scanCode: function () {
        var value = []
        var that = this
        wx.scanCode({
            success: function (res) {
                console.log(res.path)
                var product_id = res.path.substring(26, 30)
                console.log(product_id)
                wx.redirectTo({
                    url: "../product/product?pid=" + product_id,
                })
            },
            fail: function (res) { },
            complete: function (res) { },
        })
    },

    handleZanQuantityChange(e) {
        var componentId = e.componentId;
        var quantity = e.quantity;
        console.log(quantity)

        this.setData({
            [`${componentId}.quantity`]: quantity,
            quantity: quantity
        });
    },

    collectedStar: function (e) {
        var that = this
        console.log(e)
        if (e.currentTarget.dataset.collected) {
            console.log(1)
            this.data.info.collected = true
            var info = this.data.info
            if (wx.getStorageSync('storageArr')){
                storageArr = wx.getStorageSync('storageArr')
            }

            if (storageArr.length<1){
                storageArr[0] = this.data.info
                console.log(storageArr)
                wx.setStorage({
                    key: 'storageArr',
                    data: storageArr,
                })
                wx.showToast({
                    title: '收藏成功',
                    duration: 2000
                })
            }else{
                wx.getStorage({
                    key: 'storageArr',
                    success: function (res) {
                        console.log(res.data)
                        res.data.push(info)
                        storageArr = res.data
                        wx.setStorage({
                            key: 'storageArr',
                            data: storageArr,
                        })
                        console.log(storageArr)
                        wx.showToast({
                            title: '收藏成功',
                            duration: 2000
                        })
                    }
                })
            }

            this.setData({
                info: info
            })
 
        }
        else {
            console.log(2)
            this.data.info.collected = false
            var info = this.data.info
            this.setData({
                info: info
            })
            wx.getStorage({
                key: 'storageArr',
                success: function (res) {
                    for (var i = 0; i < res.data.length; i++) {
                        if (res.data[i].product_id == pid){
                            res.data.splice(i,1)
                            storageArr = res.data 
                            wx.setStorage({
                            key: 'storageArr',
                            data: storageArr,
                        })
                        }
                    }
                    wx.showToast({
                        title: '取消成功',
                    })
                }
            })
        }
    },
    selectAddress: function (e) {
        var that = this;
        that.setData({
            showModalStatus: true
        })
    },
    //显示对话框
    showModal: function () {
        // 显示遮罩层
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
            animationData: animation.export(),
            showModalStatus: true
        })
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation.export()
            })
        }.bind(this), 200)
    },
    //隐藏对话框
    hideModal: function () {
        if (this.data.address1 == undefined) {
            // 隐藏遮罩层
            var animation = wx.createAnimation({
                duration: 200,
                timingFunction: "linear",
                delay: 0
            })
            this.animation = animation
            animation.translateY(300).step()
            this.setData({
                animationData: animation.export(),
            })
            setTimeout(function () {
                animation.translateY(0).step()
                this.setData({
                    animationData: animation.export(),
                    showModalStatus: false
                })
            }.bind(this), 200)
        } else {

                // 隐藏遮罩层
                var animation = wx.createAnimation({
                    duration: 200,
                    timingFunction: "linear",
                    delay: 0
                })
                this.animation = animation
                animation.translateY(300).step()
                this.setData({
                    animationData: animation.export(),
                })
                setTimeout(function () {
                    animation.translateY(0).step()
                    this.setData({
                        animationData: animation.export(),
                        showModalStatus: false
                    })
                }.bind(this), 200)
        }

    },
    customBtn:function(){
        wx.makePhoneCall({
            phoneNumber: '075785664808',
        })
    },
    forward(e){
        this.onShareAppMessage();
    },
    onShareAppMessage(e) {
        console.log(e)
        console.log(this)
        return {
            title: '伊索曼妮',
            path: '/pages/product/product' + "?pid=" + this.options.pid,
            success: function (res) {
                console.log(res)// 转发成功
            },
            fail: function (res) {
                console.log(res)// 转发失败
            }
        }
    }
}));