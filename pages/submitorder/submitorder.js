var app = getApp();
var page = 1;
var address = require("../../mock/mock.js");
var total;
var coupon;
var result = [];
var num;
var coupo_id;
Page({
    data: {
        copyright: app.globalData.support,
        radioItems: [
            { name: 'formail', value: '邮寄发货', checked: 'true'},
        ],
        agreementChecked: false,
        animationAddressMenu: {},
        addressMenuIsShow: false,
        value: [0, 0, 0],
        provinces: [],
        citys: [],
        areas: [],
        areaInfo: '',
        province:"选择省份",
        city:"选择城市",
        area:"选择地区",
    },
    onLoad:function(res){
        // 默认联动显示北京
        var id = address.provinces[0].id
        var that=this;
        this.setData({
            provinces: address.provinces,
            citys: address.citys[id],
            areas: address.areas[address.citys[id][0].id],
        })
        var address1 =wx.getStorageSync('address1');
        if (address1){
            that.setData({
                address1: address1,
            })
        }
        wx.request({
            url: app.ajaxUrl.server_api_url + 'shopcart/order-product',
            header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
            method: 'POST',
            // data: [],
            dataType: 'json',
            success: function (res) {
                if (res.data.error != 0) {
                    wx.showModal({
                        title: '提示',
                        content: '请选择您需要购买的商品',
                        showCancel: false,
                        success: function () {
                            wx.redirectTo({
                                url: '../plist/plist?tid=1214&item=Y&limit=12',
                            })
                            return false;
                        }
                    });
                }
                total = res.data.total;
                num = res.data.num;
                that.setData({
                    // address: addr,
                    product: res.data.product,
                    total: res.data.total,
                    num: res.data.num
                })
            }
        })
    },
    onShow: function (e) {
        var animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'linear',
        })
        this.animation = animation;
        var that = this;
        if (wx.getStorageSync('freight')) {
            that.setData({
                prices: wx.getStorageSync('freight')
            })
        }
        coupon=wx.getStorageSync("coupon");
            var obj = {};
        for (var i = 0; i<coupon.length;i++){
            if (!obj[coupon[i].coupon_id]) {
                result.push(coupon[i]);
                obj[coupon[i].coupon_id] = true;
                console.log(result)
            }
        }
        console.log(result)
        if (result.length>=1){
            that.setData({
                coupons: result,
            })
        }
    },
    radioChange(e) {
        var coupo = coupon.find((item) => item.id == e.detail.value.split(',')[0]);
        coupo_id =coupo.id
        this.setData({
            text: e.detail.value.split(',')[1],
            discount: coupo.coupon_off
        })
        coupo.checked = true;
        for (var i = 0; i < result.length; i++) {
            if (coupo.coupon_id == result[i].coupon_id) {
                if (coupo.checked == true) {
                    result[i].checked = true;
                }
                this.setData({
                    coupons: result
                })
            }
            result[i].checked = false;
        }
        this.hideModal();
    },
    //地址选择
    selectAddress: function (e) {
        var that = this;
        var address1 = wx.getStorageSync('address1');
        console.log(address1)
        if (address1) {
            that.setData({
                username: address1.username,
                phone: address1.phone,
                post: address1.post,
                address: address1.address,
                province: address1.province,
                city: address1.city,
                area: address1.area,
            })
        }
        that.setData({
            showModalStatus: true
        })
    },
    //优惠券选择
    selectcoupon: function (e) {
        var that = this;
        that.setData({
            showModal: true
        })
    },
    formSubmit_dz:function (e){
        console.log(e.detail.value);
        var that = this;
        wx.request({
            url: app.ajaxUrl.server_api_url +'expfare/total',
            header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
            method: 'POST',
            data:{
                province: e.detail.value.province,
                city: e.detail.value.city,
                num:num
            },
            success(res){
                wx.setStorage({
                    key: 'freight',
                    data: res.data,
                })
                that.setData({
                    prices: res.data,
                })
            }
        })
        that.setData({
            address1: e.detail.value,
            province1: that.data.province,
            city1: that.data.city,
            area2: that.data.area,
        })
        wx.setStorage({
            key: 'address1',
            data: e.detail.value,
        })
        if (e.detail.value.username == "" || e.detail.value.phone == "" || e.detail.value.post == "" || e.detail.value.province == "选择省份"||e.detail.value.address == ""){
            if (e.detail.value.address == "") {
                wx.showModal({
                    title: '提示',
                    content: '详细地址不能为空',
                    showCancel: false
                });
            }
            if (e.detail.value.province == "选择省份") {
                console.log(888)
                wx.showModal({
                    title: '提示',
                    content: '请选择所在地',
                    showCancel: false
                });
            }
            if (e.detail.value.post == "") {
                wx.showModal({
                    title: '提示',
                    content: '邮政编码不能为空',
                    showCancel: false
                });
            }
            if (e.detail.value.phone == "") {
                wx.showModal({
                    title: '提示',
                    content: '手机号不能为空',
                    showCancel: false
                });
            }
            if (e.detail.value.username == "") {
                wx.showModal({
                    title: '提示',
                    content: '姓名不能为空',
                    showCancel: false
                });
            }
        }else{
            wx.showToast({
                title: '保存成功',
                icon: 'succes',
                duration: 1000,
                mask: true
            })
            this.hideModal();
        }
    },
    //订单提交
    formSubmit: function (e) {
        console.log(this.data)
        var that = this;
        var datas = e.detail.value
        that.orderSubmit(e)
    },

    orderSubmit: function (e) {
        console.log(typeof coupo_id)
        var datas = e.detail.value
        if (typeof coupo_id== 'number'){
            datas.coupon = coupo_id
        }
        console.log(datas)
        wx.request({
            url: app.ajaxUrl.server_api_url + 'shopcart/order-submit',
            header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
            method: 'POST',
            data: datas,
            dataType: 'json',
            success: function (res) {
                console.log(res)
                if (res.data.error != 0) {
                    console.log(res.data)
                    wx.showModal({
                        title: '提示',
                        content: '请完善收货信息',
                        showCancel: false,
                        success: function () {
                            return false;
                        }
                    });
                } else {
                    wx.showLoading({
                        title: res.data.message,
                        mask: true
                    })
                    setTimeout(function () {
                        wx.hideLoading();
                        // 进入支付
                        wx.navigateTo({ url: '../pay/pay?id=' + res.data.order_serial });
                    }, 1500)
                }
            }
        })
    },
    // 点击所在地区弹出选择框
    select: function (e) {
        // 如果已经显示，不在执行显示动画
        if (this.data.addressMenuIsShow) {
            return false
        } else {
            // 执行显示动画
            this.startAddressAnimation(true)
        }
    },
    // 执行动画
    startAddressAnimation: function (isShow) {
        if (isShow) {
            // vh是用来表示尺寸的单位，高度全屏是100vh
            this.animation.translateY(0 + 'vh').step()
        } else {
            this.animation.translateY(40 + 'vh').step()
        }
        this.setData({
            animationAddressMenu: this.animation.export(),
            addressMenuIsShow: isShow,
        })
    },
    // 点击地区选择取消按钮
    cityCancel: function (e) {
        this.startAddressAnimation(false)
    },
    // 点击地区选择确定按钮
    citySure: function (e) {
        var that = this
        var city = that.data.city
        var value = that.data.value
        this.startAddressAnimation(false)
        // 将选择的城市信息显示到输入框
        var province = that.data.provinces[value[0]].name
        var city = that.data.citys[value[1]].name
        var area = that.data.areas[value[2]].name
        that.setData({
            province: province,
            city: city,
            area: area
        })
    },
    // 处理省市县联动逻辑
    cityChange: function (e) {
        var value = e.detail.value
        var provinces = this.data.provinces
        var citys = this.data.citys
        var areas = this.data.areas
        var provinceNum = value[0]
        var cityNum = value[1]
        var countyNum = value[2]
        // 如果省份选择项和之前不一样，表示滑动了省份，此时市默认是省的第一组数据，
        if (this.data.value[0] != provinceNum) {
            var id = provinces[provinceNum].id
            this.setData({
                value: [provinceNum, 0, 0],
                citys: address.citys[id],
                areas: address.areas[address.citys[id][0].id],
            })
        } else if (this.data.value[1] != cityNum) {
            // 滑动选择了第二项数据，即市，此时区显示省市对应的第一组数据
            var id = citys[cityNum].id
            this.setData({
                value: [provinceNum, cityNum, 0],
                areas: address.areas[citys[cityNum].id],
            })
        } else {
            // 滑动选择了区
            this.setData({
                value: [provinceNum, cityNum, countyNum]
            })
        }
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
            animationcoupon: animation.export(),
            showModalStatus: true,
            showModal:true
        })
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation.export(),
                animationcoupon: animation.export(),
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
                animationcoupon: animation.export(),
            })
            setTimeout(function () {
                animation.translateY(0).step()
                this.setData({
                    animationData: animation.export(),
                    animationcoupon: animation.export(),
                    showModalStatus: false,
                    showModal: false,
                })
            }.bind(this), 200)
        } else {
            if (this.data.address1.address == "" || this.data.address1.area == "" || this.data.address1.city == "" || this.data.address1.phone == "" || this.data.address1.post == "" || this.data.address1.province == "选择省份" || this.data.address1.username == "") {
                wx.showModal({
                    title: '提示',
                    content: '请完善信息',
                    showCancel: false,
                    success: function () {
                    }
                });
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
                    animationcoupon: animation.export(),
                })
                setTimeout(function () {
                    animation.translateY(0).step()
                    this.setData({
                        animationData: animation.export(),
                        animationcoupon: animation.export(),
                        showModalStatus: false,
                        showModal: false,
                    })
                }.bind(this), 200)
            }
        }

    }
})