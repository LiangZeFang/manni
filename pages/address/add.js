//index.js
//获取应用实例
var tcity = require("../../utils/pcity.js");

var app = getApp()
Page({
    data: {
        provinces: [],
        province: "",
        citys: [],
        city: "",
        countys: [],
        county: '',
        value: [0, 0, 0],
        values: [0, 0, 0],
        condition: false,
        btnload: false,
        disabled: false
    },
    submitForm: function(e){
        var that = this;
        if(!e.detail.value.phone){
            wx.showModal({
                title: '提示',
                content:'请输入正确的联系电话',
                showCancel: false
            })
            return false;
        }
        if(!e.detail.value.name){
            wx.showModal({
                title: '提示',
                content:'请输入收货人姓名',
                showCancel: false
            })
            return false;
        }
        if(!e.detail.value.address){
            wx.showModal({
                title: '提示',
                content:'请输入详细地址',
                showCancel: false
            })
            return false;
        }
        if(!e.detail.value.post){
            wx.showModal({
                title: '提示',
                content:'请输入邮政编码,若不知请填写 000000',
                showCancel: false
            })
            return false;
        }
        this.setData({
            disabled: true,
            btnload: true
        });
        wx.showLoading({
            title:'保存数据',
            icon: 'loading',
            mask: true,
            success: function(){
                wx.request({
                    url: app.ajaxUrl.server_api_url + '/address/modify',
                    header: {"Authorization": "Bearer " + wx.getStorageSync('server_token')},
                    data: e.detail.value,
                    method: "POST",
                    success: function(res){
                        wx.hideLoading();
                        if(res.data.error && res.data.error != 0){
                            wx.showModal({
                                content: res.data.message,
                                showCancel: false,
                                success: function (et) {
                                    if (et.confirm) {
                                        that.setData({
                                            disabled: false,
                                            btnload: false
                                        });
                                    }
                                }
                            });
                        }else{
                            wx.redirectTo({url: '/pages/address/address'});
                        }
                    }
                })
            },
            fail: function(){
                that.setData({
                    disabled: false,
                    btnload: false
                });
            }
        })
    },
    bindChange: function(e) {
        //console.log(e);
        var val = e.detail.value
        var t = this.data.values;
        var cityData = this.data.cityData;

        if (val[0] != t[0]) {
            console.log('province no ');
            const citys = [];
            const countys = [];

            for (let i = 0; i < cityData[val[0]].sub.length; i++) {
                citys.push(cityData[val[0]].sub[i].name)
            }
            for (let i = 0; i < cityData[val[0]].sub[0].sub.length; i++) {
                countys.push(cityData[val[0]].sub[0].sub[i].name)
            }

            this.setData({
                province: this.data.provinces[val[0]],
                city: cityData[val[0]].sub[0].name,
                citys: citys,
                county: cityData[val[0]].sub[0].sub[0].name,
                countys: countys,
                values: val,
                value: [val[0], 0, 0]
            })

            return;
        }
        if (val[1] != t[1]) {
            console.log('city no');
            const countys = [];

            for (let i = 0; i < cityData[val[0]].sub[val[1]].sub.length; i++) {
                countys.push(cityData[val[0]].sub[val[1]].sub[i].name)
            }

            this.setData({
                city: this.data.citys[val[1]],
                county: cityData[val[0]].sub[val[1]].sub[0].name,
                countys: countys,
                values: val,
                value: [val[0], val[1], 0]
            })
            return;
        }
        if (val[2] != t[2]) {
            console.log('county no');
            this.setData({
                county: this.data.countys[val[2]],
                values: val
            })
            return;
        }


    },
    open: function() {
        this.setData({
            condition: !this.data.condition,
            focus: false
        })
    },
    onLoad: function(e) {
        var that = this;
        this.setData({
            btn_do_hanld: !e.id ? '添加新地址' : '修改地址'
        })
        console.log(e.id);
        if(e.id){
            wx.request({
                url: app.ajaxUrl.server_api_url + '/get-address',
                header: {"Authorization": "Bearer " + wx.getStorageSync('server_token')},
                data: {'id': e.id},
                method: "POST",
                success: function(res){
                    that.setData({
                        name: res.data.user_address.name,
                        address: res.data.user_address.address,
                        phone: res.data.user_address.phone,
                        post: res.data.user_address.post,
                        province: res.data.user_address.province,
                        city: res.data.user_address.city,
                        county: res.data.user_address.area,
                        addressid: res.data.user_address.id
                    });
                    console.log(res.data.user_address);
                }
            })
        }
        var that = this;
        tcity.init(that);
        var cityData = that.data.cityData;

        const provinces = [];
        const citys = [];
        const countys = [];

        for (let i = 0; i < cityData.length; i++) {
            provinces.push(cityData[i].name);
        }
        for (let i = 0; i < cityData[0].sub.length; i++) {
            citys.push(cityData[0].sub[i].name)
        }
        for (let i = 0; i < cityData[0].sub[0].sub.length; i++) {
            countys.push(cityData[0].sub[0].sub[i].name)
        }

        that.setData({
            'provinces': provinces,
            'citys': citys,
            'countys': countys,
            'province': cityData[0].name,
            'city': cityData[0].sub[0].name,
            'county': cityData[0].sub[0].sub[0].name
        })
        console.log('初始化完成');


    }
})